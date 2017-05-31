"use strict"
const spawn = require('child_process').spawn
const fs = require('fs')
const Writable = require('stream').Writable
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

        var raspicam_process = null

        class MsgStream extends Writable {
            constructor(options) {
                super(options);
            }
            _write(chunk, encoding, callback) {
                callback()
            }
        }

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
                            if (this[currentValue.name + "type"] == "msg") {
                                parameters.push(msg[this[currentValue.name]])
                            } else {
                                if (currentValue.type == 'number') {
                                    parameters.push(parseInt(this[currentValue.name]))
                                } else {
                                    if (currentValue.name == 'output') {
                                        if (this.output == "-") {
                                            parameters.push("-")
                                        } else {
                                            var pathStr = (this.pathtype == "str") ? this.path : msg[this.path]
                                            var filename = (this.filenametype == "str") ? this.filename : msg[this.filename]
                                            parameters.push(pathStr + filename)
                                        }
                                    } else {
                                        parameters.push(this[currentValue.name])
                                    }
                                }
                            }
                        }
                    }
                }
            })
            parameters.push("--nopreview")
            RED.log.info("Raspicam: parameters for spawned process: " + JSON.stringify(parameters))
            return parameters
        }

        var buildParamsPreview = (msg) => {
            let parameters = []
            raspistill_def.params.forEach((currentValue, index, array) => {
                if (currentValue.active && msg[currentValue.name]) {
                    if (currentValue.name == "timelapse" || currentValue.name == "output" || currentValue.name == "timeout") {
                        // If in single mode, do not output a timelapse parameter
                    } else {
                        if (currentValue.type == "boolean") {
                            if (msg[currentValue.name] == true) {
                                parameters.push(currentValue.alias)
                            }
                        } else {
                            parameters.push(currentValue.alias)
                            if (currentValue.type == 'number') {
                                parameters.push(parseInt(msg[currentValue.name]))
                            } else {
                                if (currentValue.name == 'output') {
                                    parameters.push("-")
                                }
                            }
                        }
                    }
                }
            })
            parameters.push("--nopreview")
            parameters.push("--output")
            parameters.push("-")
            parameters.push("--timeout")
            parameters.push(100)
            RED.log.debug("raspicam: preview parameters for child process:" + JSON.stringify(parameters))
            return parameters
        }

        this.on('close', (callback) => {
            raspicam_process.kill("SIGTERM", 1880)
            callback()
        })

        this.on('input', (msg) => {
            RED.log.info(`Raspicam: Input Message: ` + JSON.stringify(msg))

            if (this.output == "-") {
                msg.payload = new MsgStream()
            } else {
                var pathStr = (this.pathtype == "str") ? this.path : msg[this.path]
                if (!fs.existsSync(pathStr)) {
                    fs.mkdirSync(pathStr)
                    this.framestart = 0
                }
                if (this.framestart == "") {
                    let files = fs.readdirSync(pathStr)
                    let framestart = 0
                    files.forEach((element, index) => {
                        var frame = parseInt(element.replace(/[^0-9\.]/g, ''))
                        if (frame > framestart) {
                            framestart = frame
                        }
                    })
                    if (framestart > 0) {
                        this.framestart = framestart + 1
                    }
                }
            }
            RED.log.info(`Raspicam: Starting capture`)
            this.status({ fill: "green", shape: "dot", text: "Active" });
            raspicam_process = spawn(raspistill_def.command.name, buildParams(msg))
            var currentFile;
            var dataStr = ""

            raspicam_process.stdout.on('data', (data) => {
                //msg.payload.write(data)
                RED.log.debug(`Raspicam sending ` + data.length + " bytes")
            })

            raspicam_process.stdout.on('end', (data) => {
                msg.payload = currentFile
                RED.log.info(`Raspicam sending end `)
                this.send([msg, null])
            })

            raspicam_process.stderr.on('data', (data) => {
                if (this.output == "-") { // output image direct to msg.payload
                    if (msg.payload) {
                    }
                    //msg.payload.write(data)
                } else {
                    dataStr = dataStr + data.toString()
                    while (dataStr.indexOf('\n') > -1) {
                        if (dataStr.startsWith("Opening output file ")) {
                            currentFile = dataStr.substr(20, dataStr.indexOf('\n') - 20)
                            RED.log.debug(`stderr raspicam setting current: ${currentFile}`)
                        }
                        if (dataStr.startsWith("Finished capture ")) {
                            var outmsg = msg
                            outmsg.payload = currentFile
                            if (this.timelapse !== "") {
                                this.send([outmsg, null])
                            }
                            RED.log.debug(`stderr raspicam finished capture of ${currentFile}`)
                        }
                        dataStr = dataStr.substr(dataStr.indexOf("\n") + 1)
                    }
                }
            })

            raspicam_process.on('close', (code, signal) => {
                switch (code) {
                    case null:
                        RED.log.warn(`Raspicam: process exited with signal ${signal}`)
                        raspicam_process = null
                        return
                    case 0:
                        RED.log.debug(`Raspicam: process exited with code: ${code} signal: ${signal}`)
                        break
                    case 64:
                        RED.log.error(`Raspicam: code ${code}` + " Bad command line parameter")
                        break
                    case 70:
                        RED.log.error(`Raspicam: code ${code}` + " Software or camera error")
                        break
                    case 130:
                        RED.log.error(`Raspicam: code ${code}` + " Application terminated by Ctrl-C")
                        break
                    default:
                        RED.log.error(`Raspicam: Process exited with code: ${code} signal: ${signal}`)
                }
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
                    msg.payload = currentFile
                }
                this.send([null, msg])
                this.status({ fill: "yellow", shape: "dot", text: "Idle" })
                raspicam_process = null
            })

            raspicam_process.on('disconnect', () => {
                console.log("Raspicam disconnected")
            })

            raspicam_process.on('error', (err) => {
                console.log("Raspicam error:" + JSON.stringify(err))
            })

            raspicam_process.on('exit', (code, signal) => {
                console.log("Raspicam exit code:" + code + " signal: " + signal)
            })
        })

        RED.httpAdmin.get("/raspicam/image-preview", (req, res) => {
            let reqUrl = url.parse(req.url, true)

            var message = {}
            for (var prop in reqUrl.query) {
                if (prop.startsWith("node-input-")) {
                    message[prop.substr(11)] = reqUrl.query[prop]
                }
            }

            var raspicam = spawn(raspistill_def.command.name, buildParamsPreview(message))

            raspicam.stdout.on('data', (data) => {
                if (!res.headersSent) {
                    res.writeHead(200, {
                        'Content-Type': 'image/jpeg',
                        'Transfer-Encoding': 'chunked'
                    })
                }
                res.write(data)
            })

            raspicam.stderr.on('data', (data) => {
                res.status(500)
                res.end(data)
            })

            raspicam.on('close', (code) => {
                if (!res.headerSent) {
                    res.status(500)
                    res.end(code)
                }
            })
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

        this.status({ fill: "yellow", shape: "dot", text: "Idle" })

    }
    RED.nodes.registerType("raspicam", Raspicam)
}

