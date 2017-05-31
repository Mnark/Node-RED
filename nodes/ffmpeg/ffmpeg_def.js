ffmpeg_def = {
    command: {
        name: "ffmpeg",
    },
    //-r 24 -i /media/usb/Pictures/2017-05-24/img-%06d.jpg -s 640x480 -crf 20 -y -metadata title='View over the `port' /media/usb/Pictures/2017-05-24/timelapse.mp4
    params: [
        { name: 'overwrite', alias: '-y', type: 'boolean', active: true, default: "", desc: 'Overwrite output files' },
    
        { name: 'vframes', alias: '-vframes', type: 'number', active: true, default: "", desc: 'Set the number of video frames to output' },
        { name: 'framerate', alias: '-r', type: 'number', active: true, default: "", desc: 'set frame rate (Hz value, fraction or abbreviation)' },
        { name: 'framesize', alias: '-s', type: 'text', active: true, default: "", desc: 'set frame size (WxH or abbreviation)' },
        { name: 'aspect', alias: '-aspect', type: 'text', active: true, default: "", desc: 'set aspect ratio (4:3, 16:9 or 1.3333, 1.7777)' },

        { name: 'infile', alias: '-i', type: 'text', active: true, default: "", desc: 'Set the file or files' },
        { name: 'inpath', alias: '', type: 'text', active: true, default: "", desc: 'Set the input file path' },

        { name: 'metadate', alias: '-metadata', type: 'text', active: true, default: "", desc: 'Set meta data' },
        { name: 'crf', alias: '-crf', type: 'number', active: true, default: "", desc: 'Set the constant rate factor (0-51). Lower is better quality' },

        { name: 'outfile', alias: ' ', type: 'text', active: true, default: "", desc: 'Set the output file' },
        { name: 'outpath', alias: '', type: 'text', active: true, default: "", desc: 'Set the output path' },

    ]
}
if (typeof module !== "undefined") {
    module.exports = ffmpeg_def
}