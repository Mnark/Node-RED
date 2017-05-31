"use strict"
const spawn = require('child_process').spawn
const fs = require('fs')
const Writable = require('stream').Writable
const url = require('url')
const ffmpeg_def = require('./ffmpeg_def.js')

module.exports = function (RED) {
    function Ffmpeg(config) {
        RED.nodes.createNode(this, config)
        var ffmpeg_process
        ffmpeg_def.params.forEach((param) => {
            if (param.active) {
                this[param.name] = config[param.name]
                this[param.name + "type"] = config[param.name + "type"]
            }
        })

        var buildParams = (msg) => {
            let parameters = []
            ffmpeg_def.params.forEach((currentValue, index, array) => {
                if (this.hasOwnProperty(currentValue.name) && currentValue.active && this[currentValue.name] !== "" && currentValue.alias !== "") {
                    if (currentValue.type == "boolean") {
                        if (this[currentValue.name] == true) {
                            parameters.push(currentValue.alias)
                        }
                    } else {

                        if (currentValue.name == "infile") {
                            parameters.push(currentValue.alias)
                            let p = (this.inpathtype == "str") ? this.inpath : msg[this.inpath]
                            let f = (this.infiletype == "str") ? this.infile : msg[this.infile]
                            parameters.push(p + f)
                        } else {
                            if (currentValue.name == "outfile") {
                                let p = (this.outpathtype == "str") ? this.outpath : msg[this.outpath]
                                let f = (this.outfiletype == "str") ? this.outfile : msg[this.outfile]
                                parameters.push(p + f)
                            } else {
                                parameters.push(currentValue.alias)
                                if (this[currentValue.name + "type"] == "msg") {
                                    parameters.push(msg[this[currentValue.name]])
                                } else {
                                    if (currentValue.type == 'number') {
                                        parameters.push(parseInt(this[currentValue.name]))
                                    } else {

                                        parameters.push(this[currentValue.name])
                                    }
                                }
                            }
                        }
                    }
                }
            })
            RED.log.info("Ffmpeg: parameters for spawned process: " + JSON.stringify(parameters))
            return parameters
        }

        this.on('close', (callback) => {
            ffmpeg_process.kill("SIGTERM", 1880)
            callback()
        })

        this.on('input', (msg) => {
            RED.log.info(`Ffmpeg: Input Message: ` + JSON.stringify(msg))

            var pathStr = (this.outpathtype == "str") ? this.outpath : msg[this.outpath]
            if (!fs.existsSync(pathStr)) {
                fs.mkdirSync(pathStr)
            }

            RED.log.info(`Ffmpeg: Starting process`)
            this.status({ fill: "green", shape: "dot", text: "Active" });
            console.log("Ffmpeg parameters :" + JSON.stringify(buildParams(msg)))
            ffmpeg_process = spawn(ffmpeg_def.command.name, buildParams(msg))
            var currentFile;
            var dataStr = ""

            ffmpeg_process.stdout.on('data', (data) => {
                msg.payload.write(data)
                RED.log.debug(`Ffmpeg sending ` + data.length + " bytes")
            })

            ffmpeg_process.stdout.on('end', (data) => {
                //msg.payload.end(data)
                RED.log.info(`Ffmpeg sending end `)
            })

            ffmpeg_process.stderr.on('data', (data) => {
                if (this.output == "-") { // output image direct to msg.payload
                    if (msg.payload) {

                    }
                    //msg.payload.write(data)
                } else {
                    dataStr = dataStr + data.toString()
                    while (dataStr.indexOf('\n') > -1) {
                        if (dataStr.startsWith("Opening output file ")) {
                            currentFile = dataStr.substr(20)
                            RED.log.debug(`stderr Ffmpeg setting current: ${currentFile}`)
                        }
                        if (dataStr.startsWith("Finished capture ")) {
                            var outmsg = msg
                            outmsg.payload = currentFile
                            setTimeout((outmsg) => {
                                this.send([outmsg, null])
                            }, 5000, outmsg) //Give ffmpeg time to save the image to disk
                            RED.log.debug(`stderr Ffmpeg finished capture of ${currentFile}`)
                        }
                        //console.log("discarding: " + dataStr.substr(0, dataStr.indexOf("\n") + 1))
                        dataStr = dataStr.substr(dataStr.indexOf("\n") + 1)
                    }
                }
            })

            ffmpeg_process.on('close', (code, signal) => {
                switch (code) {
                    case null:
                        RED.log.warn(`Ffmpeg: process exited with signal ${signal}`)
                        break
                    case 0:
                        RED.log.debug(`Ffmpeg: process exited with code: ${code} signal: ${signal}`)
                        break
                    case 64:
                        RED.log.error(`Ffmpeg: code ${code}` + " Bad command line parameter")
                        break
                    case 70:
                        RED.log.error(`Ffmpeg: code ${code}` + " Software or camera error")
                        break
                    case 130:
                        RED.log.error(`Ffmpeg: code ${code}` + " Application terminated by Ctrl-C")
                        break
                    default:
                        RED.log.error(`Ffmpeg: Process exited with code: ${code} signal: ${signal}`)
                }
                let p = (this.outpathtype == "str") ? this.outpath : msg[this.outpath]
                let f = (this.outfiletype == "str") ? this.outfile : msg[this.outfile]
                msg.payload = p + f
                msg.filename = p + f
                if (!msg.ffmpeg) {
                    msg.ffmpeg = {}
                }

                if (this.output == "-") {
                    msg.ffmpeg.outputmode = "stream"
                } else {
                    msg.ffmpeg.filename = p + f
                }

                this.send(msg)
                this.status({ fill: "yellow", shape: "dot", text: "Idle" })
                ffmpeg_process = null
            })
    })
    this.status({ fill: "yellow", shape: "dot", text: "Idle" })
}

RED.httpAdmin.get("/ffmpeg/ffmpeg_def.js", (req, res) => {
    var readStream = fs.createReadStream(__dirname + "/ffmpeg_def.js")
    if (readStream) {
        res.status(200)
        res.setHeader('Content-Type', 'application/javascript')
        readStream.pipe(res);
    } else {
        res.send(404)
    }
})

RED.nodes.registerType("ffmpeg", Ffmpeg)
}

