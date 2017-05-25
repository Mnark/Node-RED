"use strict"
const spawn = require('child_process').spawn
const fs = require('fs')
const url = require('url')
const raspistill_def = require('./raspistill_def.js')

module.exports = function (RED) {

    function Raspicam(config) {
        RED.nodes.createNode(this, config)
        raspistill_def.params.forEach((param) => {
            if (param.active) {
                this[param.name] = config[param.name]
                this[param.name + "type"] = config[param.name + "type"]
            }
        })
        this.filename = config.filename
        this.filenametype = config.filenametype || "str"
        this.path = config.path || ""
        this.pathtype = config.pathtype || "str"

        var buildParams = (msg) => {
            let parameters = []
            raspistill_def.params.forEach((currentValue, index, array) => {
                if (this.hasOwnProperty(currentValue.name) && currentValue.active && this[currentValue.name] !== "") {
                    if (currentValue.name == "timelapse" && this[currentValue.name + "type"] == "bool") {
                        // If in single mode, do not output a timelapse parameter
                    } else {
                        if (currentValue.type == "boolean") {
                            if (this[currentValue.name] == true) {
                                parameters.push(currentValue.alias)
                            }
                        } else {
                            parameters.push(currentValue.alias)
                            if (currentValue.type == 'number') {
                                parameters.push(parseInt(this[currentValue.name]))
                            } else {
                                if (currentValue.name == 'output') {
                                    var pathStr = (this.pathtype == "str") ? this.path : msg[this.path]
                                    var filename = (this.filenametype == "str") ? this.filename : msg[this.filename]
                                    parameters.push(pathStr + filename)
                                } else {
                                    parameters.push(this[currentValue.name])
                                }
                            }
                        }
                    }    
                }
            })
            RED.log.info("raspicam: parameters for child process:" + JSON.stringify(parameters))
            return parameters
        }

        this.on('input', (msg) => {
            var pathStr = (this.pathtype == "str") ? this.path : msg[this.path]
            if (!fs.existsSync(pathStr)) {
                fs.mkdirSync(pathStr)
            }

            var raspicam = spawn(raspistill_def.command.name, buildParams(msg))
            var currentFile;
            var dataStr = ""
            raspicam.stdout.on('data', (data) => {
                RED.log.info(`stdout raspicam setting current: ${data}`)
            })

            raspicam.stderr.on('data', (data) => {
                if (this.output == "-") {
                } else {
                    dataStr = dataStr + data.toString()
                    while (dataStr.indexOf('\n') > -1) {
                        if (dataStr.startsWith("Opening output file ")) {
                            currentFile = dataStr.substr(20)
                            RED.log.debug(`stderr raspicam setting current: ${currentFile}`)
                        }

                        if (dataStr.startsWith("Finished capture ")) {
                            /*                            if (!msg.raspicam) {
                                                msg.raspicam = {
                                                    images: [],
                                                    videos: []
                                                }
                                            }
                            msg.raspicam.images.push({ name: currentFile })*/
                            var outmsg = msg
                            outmsg.payload = currentFile
                            this.send([outmsg, null])
                            RED.log.debug(`stderr raspicam finished capture of ${currentFile}`)
                        }
                        //console.log("discarding: " + dataStr.substr(0, dataStr.indexOf("\n") + 1))
                        dataStr = dataStr.substr(dataStr.indexOf("\n") + 1)
                    }
                }

                //RED.log.info(`raspicam process returned message: ${data}`)
                //this.send([msg, null])
                //RED.log.info(`stderr raspicam process exited with code ${data}`)
            })

            raspicam.on('close', (code) => {
                if (code > 0) {
                    RED.log.error(`raspicam: Process exited with code ${code}`)
                    return
                }
                RED.log.debug(`raspicam: process exited with code ${code}`)
                if (!msg.raspicam) {
                    msg.raspicam = {}
                }
                if (this.timelapse > 0) {
                    if (!msg.raspicam.timelapse) {
                        msg.raspicam.timelapse = {}
                    }
                    if (this.output == "-") {
                        msg.raspicam.timelapse.outputmode = "stream"
                    } else {
                        msg.raspicam.timelapse.outputmode = "file"
                        msg.raspicam.timelapse.directory = this.path
                        msg.raspicam.timelapse.file_pattern = this.filename
                    }
                } else {
                    if (!msg.raspicam.image) {
                        msg.raspicam.image = {}
                    }
                    if (this.output == "-") {
                        msg.raspicam.image.outputmode = "stream"
                    } else {
                        msg.raspicam.image.outputmode = "file"
                        msg.raspicam.image.filename = this.output
                    }
                }
                this.send([null, msg])
            })
            console.log("called")
        })

        RED.httpAdmin.get("/raspicam/image-preview", (req, res) => {
            console.log("Preview Image requested")
            let reqUrl = url.parse(req.url, true)
            console.log("reqUrl: " + JSON.stringify(reqUrl))

            res.status(200)
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Content-Type', 'image/jpeg')
            res.send(JSON.stringify({

            }))
        })

        RED.httpAdmin.get("/raspicam/raspistill_def.js", (req, res) => {
            var readStream = fs.createReadStream(__dirname + "/raspistill_def.js")
            if (readStream) {
                res.status(200)
                res.setHeader('Content-Type', 'application/javascript')
                readStream.pipe(res);
            } else {
                res.send(404)
            }
        })
    }
    RED.nodes.registerType("raspicam", Raspicam)
}

