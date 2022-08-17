const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const cors = require("cors");

app.use(cors({ origin: "*" }));
app.use("/upload", express.static("upload"))

app.use(
  fileUpload({
    tempFileDir: "./temp",
    useTempFiles: true,
  })
);
let count = 200;
app.post("/video/transcode", (req, res) => {
  console.log(req.files);
  console.log(req.files.video.tempFilePath);
  const path = `upload/output${count}.mp4`
  ffmpeg(req.files.video.tempFilePath)
    .saveToFile(path)
    .on("error", () => {
      removeTemps(req.files.video.tempFilePath);
    })
    .on("end", () => {
      removeTemps(req.files.video.tempFilePath);
      console.log("End...");
      res.json({path : `http://localhost:4000/${path}`});
    });
    count++;
});

app.post("/video/crop", (req, res) => {
  console.log(req.files);
  console.log(req.files.video.tempFilePath);
  ffmpeg(req.files.video.tempFilePath)
    .outputOptions("-filter:v crop=1080:1080:0:0")
    .saveToFile("output007.mp4")
    .on("error", () => {
      removeTemps(req.files.video.tempFilePath);
    })
    .on("end", () => {
      removeTemps(req.files.video.tempFilePath);
      console.log("End...");
    });
  res.send("video submitted");
});

app.post("/video/trim", (req, res) => {
  console.log(req.files);
  console.log(req.files.video.tempFilePath);
  ffmpeg(req.files.video.tempFilePath)
    .seekInput(3.0)
    .seekOutput(2.0)
    .saveToFile("output010.mp4")
    .on("error", () => {
      removeTemps(req.files.video.tempFilePath);
    })
    .on("end", () => {
      removeTemps(req.files.video.tempFilePath);
      console.log("End...");
    });
  res.send("video submitted");
});

const removeTemps = (tempFilePath) => {
  fs.unlink(path.resolve(tempFilePath), () => {
    console.log("Temp file removed: " + tempFilePath);
  });
};
app.listen(4000, () => {
  console.log("Server listening on port: 4000");
});
