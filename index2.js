const ffmpeg = require("fluent-ffmpeg");

ffmpeg("./video2.MOV")
    .seekInput(3.0)
    .seekOutput(2.0)
    .saveToFile("output009.mp4");

// ffmpeg()
//   .input("./painting.MOV")
//   .outputOptions("-filter:v crop=1080:1080:0:0")
//   .save("output003.mp4");

// ffmpeg()
//     .input("./fruit.MOV")
//     .size("608x?")
//     .aspect("1:1")
//     .output("out5.mp4")
//     .run();

// const fluent = require('fluent-ffmpeg');

// const executeFfmpeg = args => {
//     let command = fluent().output(' '); // pass "Invalid output" validation
//     command._outputs[0].isFile = false; // disable adding "-y" argument
//     command._outputs[0].target = ""; // bypass "Unable to find a suitable output format for ' '"
//     command._global.get = () => { // append custom arguments
//         return typeof args === "string" ? args.split(' ') : args;
//     };
//     return command;
// };

// // executeFfmpeg('-i painting.MOV -filter:v crop=1080:1080:0:0 -pix_fmt yuv420p out001.mp4')
// executeFfmpeg('-i fruit.MOV -filter:v crop=1080:1080:0:0 -pix_fmt yuv420p out001.mp4')
//     .on('start', commandLine => console.log('start', commandLine))
//     .on('codecData', codecData => console.log('codecData', codecData))
//     .on('error', error => console.log('error', error))
//     .on('stderr', stderr => console.log('stderr', stderr))
//     .run();
