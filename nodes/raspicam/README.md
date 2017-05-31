# node-red-raspicam

A [Node-RED](http://nodered.org) node to take a single or a series of photos using the Raspberry Pi Camera.

## Install

Run the following command in your Node-RED install or home directory (typically ~/.node-red).

``` javascript
    npm install node-red-raspicam
```

## Usage

The node can be run in two modes, Single or Timelapse.

### Single Mode

In single mode the node will capture a single image and save the file to disk. A message will be sent to both outputs.

### Timelapse Mode

In timelapse mode a series of photos will be taken and saved to disk. A file pattern should be specified in the filename to allow for each image to have a different name. E.g. "img-%04d.jpg" will produce files named img-0000.jpg, img-0001.jpg, img-0002.jpg etc.)

The "delay" property is used to set the pause (in secs) between each capture and the "duration" property sets the time for entire process (in secs).

### Output messages

A message will be sent to the first output everytime a new image is captured and a message sent to the second when all the images have been captured.

