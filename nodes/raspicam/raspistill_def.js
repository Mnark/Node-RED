raspistill_def = {
    command: {
        name: "raspistill",
        version: "1.3.11"
    },
    params: [
        { name: 'width', alias: '--width', type: 'number', active: true, default: 640, desc: 'Set image width <size>' },
        { name: 'height', alias: '--height', type: 'number', active: true, default: 480, desc: 'Set image height <size>' },
        { name: 'quality', alias: '--quality', type: 'number', active: true, default: 90, desc: 'Set jpeg quality <0 to 100>' },
        { name: 'raw', alias: '--raw', type: 'boolean', active: false, default: false, desc: 'Add raw bayer data to jpeg metadata' },
        { name: 'output', alias: '--output', type: 'text', active: true, default: "", desc: "Output filename <filename> (to write to stdout use '-o-').If not specified no file is saved" },
        { name: 'latest', alias: '--latest', type: 'boolean', active: true, true: 0, desc: 'Link latest complete image to filename <filename>' },
        { name: 'verbose', alias: '--verbose', type: 'boolean', active: true, default: false, desc: 'Output verbose information during run' },
        { name: 'timeout', alias: '--timeout', type: 'number', active: true, default: 0, desc: 'Time(inms)beforetakespictureandshutsdown(ifnotspecifiedsetto5s)' },
        { name: 'thumb', alias: '--thumb', type: 'number', active: false, desc: 'Setthumbnailparameters(x,y,quality)ornone' },
        { name: 'demo', alias: '--demo', type: 'number', active: false, desc: 'Runademomode(cyclethroughrangeofcameraoptions,nocapture)' },
        { name: 'encoding', alias: '--encoding', type: 'number', active: false, desc: 'Encodingtouseforoutputfile(jpg,bmp,gif,png)' },
        { name: 'exif', alias: '--exif', type: 'number', active: false, desc: "EXIFtagtoapplytocaptures(formatas'key=value')ornone" },
        { name: 'timelapse', alias: '--timelapse', type: 'number', active: true, default: "", desc: 'Timelapse mode. Takes a picture every <t>ms.%d==framenumber(Try,-o img_%04d.jpg)' },
        { name: 'fullpreview', alias: '--fullpreview', type: 'number', active: false, desc: 'Runthepreviewusingthestillcaptureresolution(mayreducepreviewfps)' },
        { name: 'keypress', alias: '--keypress', type: 'number', active: false, desc: 'WaitbetweencapturesforaENTER,XthenENTERtoexit' },
        { name: 'signal', alias: '--signal', type: 'number', active: false, desc: 'WaitbetweencapturesforaSIGUSR1orSIGUSR2fromanotherprocess' },
        { name: 'gl', alias: '--gl', type: 'number', active: false, desc: 'Drawpreviewtotextureinsteadofusingvideorendercomponent' },
        { name: 'glcapture', alias: '--glcapture', type: 'number', active: false, desc: 'CapturetheGLframe-bufferinsteadofthecameraimage' },
        { name: 'settings', alias: '--settings', type: 'number', active: false, desc: 'Retrievecamerasettingsandwritetostdout' },
        { name: 'camselect', alias: '--camselect', type: 'number', active: false, desc: 'Selectcamera<number>.Default0' },
        { name: 'burst', alias: '--burst', type: 'number', active: false, desc: "Enable'burstcapturemode'" },
        { name: 'mode', alias: '--mode', type: 'number', active: false, desc: 'Forcesensormode.0=auto.Seedocsforothermodesavailable' },
        { name: 'datetime', alias: '--datetime', type: 'number', active: false, desc: 'Replaceoutputpattern(%d)withDateTime(MonthDayHourMinSec)' },
        { name: 'timestamp', alias: '--timestamp', type: 'number', active: false, default: '', desc: 'Replac eoutput pattern (%d) withunixtimestamp(secondssince1970)' },
        { name: 'framestart', alias: '--framestart', type: 'number', active: true, default: 0, desc: 'Starting frame number in output pattern (%d)' },
        { name: 'restart', alias: '--restart', type: 'number', active: false, desc: 'JPEGRestartinterval(defaultof0fornone)' },
        { name: 'preview', alias: '--preview', type: 'number', active: false, desc: "Previewwindowsettings<'x,y,w,h;>" },
        { name: 'fullscreen', alias: '--fullscreen', type: 'number', active: false, desc: 'Fullscreenpreviewmode' },
        { name: 'opacity', alias: '--opacity', type: 'number', active: false, desc: 'Previewwindowopacity(0-255)' },
        { name: 'nopreview', alias: '--nopreview', type: 'number', active: false, desc: 'Donotdisplayapreviewwindow' },
        { name: 'sharpness', alias: '--sharpness', type: 'number', active: true, default: "", min: -100, max: 100, desc: 'Set image contrast (-100 - 100)' },
        { name: 'contrast', alias: '--contrast', type: 'number', active: true, default: "", min: -100, max: 100, desc: 'Sets the contrast of the image. 0 is the default' },
        { name: 'brightness', alias: '--brightness', type: 'number', active: true, default: "", min: 0, max: 100, desc: 'Set image brightness (0 - 100)' },
        { name: 'saturation', alias: '--saturation', type: 'number', active: true, default: "", min: -100, max: 100, desc: 'Set image saturation (-100 - 100)' },
        { name: 'iso', alias: '--ISO', type: 'number', active: true, default: "", min: 0, max: 800, desc: 'Set capture ISO (100 - 800)' },
        { name: 'vstab', alias: '--vstab', type: 'boolean', active: true, desc: 'Turn on video stabilisation' },
        { name: 'ev', alias: '--ev', type: 'number', active: true, default: "", min: -10, max: 10, desc: 'Set EV compensation - steps of 1/6 stop' },
        { name: 'exposure', alias: '--exposure', type: 'select', active: false, default: "", desc: 'Set exposure mode' },
        { name: 'awb', alias: '--awb', type: 'number', active: false, desc: 'SetAWBmode(seeNotes)' },
        { name: 'imxfx', alias: '--imxfx', type: 'number', active: false, desc: 'Setimageeffect(seeNotes)' },
        { name: 'colfx', alias: '--colfx', type: 'number', active: false, desc: 'Setcoloureffect(U,V)' },
        { name: 'metering', alias: '--metering', type: 'number', active: false, desc: 'Setmeteringmode(seeNotes)' },
        { name: 'rotation', alias: '--rotation', type: 'number', active: false, desc: 'Setimagerotation(0-359)' },
        { name: 'hflip', alias: '--hflip', type: 'number', active: false, desc: 'Sethorizontalflip' },
        { name: 'vflip', alias: '--vflip', type: 'number', active: false, desc: 'Setverticalflip' },
        { name: 'roi', alias: '--roi', type: 'number', active: false, desc: 'Setregionofinterest(x,y,w,dasnormalisedcoordinates[0.0-1.0])' },
        { name: 'shutter', alias: '--shutter', type: 'number', active: false, desc: 'Setshutterspeedinmicroseconds' },
        { name: 'awbgains', alias: '--awbgains', type: 'number', active: false, desc: 'SetAWBgains-AWBmodemustbeoff' },
        { name: 'drc', alias: '--drc', type: 'number', active: false, desc: 'SetDRCLevel(seeNotes)' },
        { name: 'stats', alias: '--stats', type: 'number', active: false, desc: 'Forcerecomputationofstatisticsonstillscapturepass' },
        { name: 'annotate', alias: '--annotate', type: 'number', active: true, default: "", desc: 'Enable/Set annotate flags or text' },
        { name: 'stereo', alias: '--stereo', type: 'number', active: false, desc: 'Selectstereoscopicmode' },
        { name: 'decimate', alias: '--decimate', type: 'number', active: false, desc: 'Halfwidth/heightofstereoimage' },
        { name: 'threedswap', alias: '--3dswap', type: 'number', active: false, desc: 'Swapcameraorderforstereoscopic' },
        { name: 'annotateex', alias: '--annotateex', type: 'number', active: false, desc: 'Setextraannotationparameters(textsize,textcolour(hexYUV),bgcolour(hexYUV))' },
        { name: 'glscene', alias: '--glscene', type: 'number', active: false, desc: 'GLscenesquare,teapot,mirror,yuv,sobel,vcsm_square' },
        { name: 'glwin', alias: '--glwin', type: 'number', active: false, desc: "GLwindowsettings<'x,y,w,h'>" }
    ]
}
if (typeof module !== "undefined") {
    module.exports = raspistill_def
}