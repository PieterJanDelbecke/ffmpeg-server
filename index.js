const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use('/upload', express.static('upload'));

app.use(
  fileUpload({
    tempFileDir: './temp',
    useTempFiles: true,
    createParentPath: true,
  })
);
app.use(express.json());

const getFileName = (prefix) => {
  const time = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return `${prefix ?? ''}output-${rand}-${time}.mp4`;
};

app.post('/video/transcode', (req, res) => {
  if (!fs.existsSync('upload')) {
    fs.mkdirSync('upload');
  }
  if (!fs.existsSync('upload/screenshots')) {
    fs.mkdirSync('upload/screenshots');
  }
  const fileName = getFileName();
  const path = `upload/${fileName}`;
  const imageName = fileName.replace('.mp4', '.jpeg');
  const imagePath = `upload/screenshots/${fileName.replace('.mp4', '.jpeg')}`;
  const dd = ffmpeg(req.files.video.tempFilePath)
    .saveToFile(path)
    .screenshot({
      count: 1,
      timestamps: [0],
      filename: imageName,
      folder: 'upload/screenshots',
    })
    .on('error', (error) => {
      console.log(error);
      removeTemps(req.files.video.tempFilePath);
      res.status(500).end();
    })
    .on('end', () => {
      removeTemps(req.files.video.tempFilePath);
      if (res.headersSent) return;
      res
        .json({
          path: `http://localhost:4000/${path}`,
          imageUrl: `http://localhost:4000/${imagePath}`,
          fileName,
        })
        .end();
    });
});

app.post('/video/crop', (req, res) => {
  try {
    console.log("req.body: ",req.body)
    const { x, y, height, width} = req.body
    const path = `upload/${req.body.fileName}`;
    const newFileName = getFileName('crop-');
    const newpath = `upload/${newFileName}`;
    const imageName = newFileName.replace('.mp4', '.jpeg');
    const imagePath = `upload/screenshots/${newFileName.replace('.mp4', '.jpeg')}`;
    ffmpeg(path)
      .outputOptions(`-filter:v crop=${width}:${height}:${x}:${y}`)
      .saveToFile(newpath)
      .screenshot({
        count: 1,
        timestamps: [0],
        filename: imageName,
        folder: 'upload/screenshots',
      })
      .on('error', (error) => {
        removeTemps(newpath);
        console.log(error);
      })
      .on('end', (error) => {
        removeTemps(path);
        if (res.headersSent) return;
        res.json({
          path: `http://localhost:4000/${newpath}`,
          imageUrl: `http://localhost:4000/${imagePath}`,
          fileName: newFileName,
        });
      });
  } catch (error) {
    console.log(error);
  }
});

app.post('/video/trim', (req, res) => {
  try {
    const start = req.body.start;
    const duration = req.body.duration;
    const path = `upload/${req.body.fileName}`;
    const newFileName = getFileName('trim-');
    const newpath = `upload/${newFileName}`;
    const imageName = newFileName.replace('.mp4', '.jpeg');
    const imagePath = `upload/screenshots/${newFileName.replace('.mp4', '.jpeg')}`;
    ffmpeg(path)
      .seek(Number(start))
      .duration(Number(duration))
      .saveToFile(newpath)
      .screenshot({
        count: 1,
        timestamps: [0],
        filename: imageName,
        folder: 'upload/screenshots',
      })
      .on('error', (error) => {
        removeTemps(newpath);
        console.log(error);
      })
      .on('end', (error) => {
        removeTemps(path);
        if (res.headersSent) return;
        res.json({
          path: `http://localhost:4000/${newpath}`,
          imageUrl: `http://localhost:4000/${imagePath}`,
          fileName: newFileName,
        });
      });
  } catch (error) {
    console.log(error);
  }
});

const removeTemps = (tempFilePath) => {
  fs.unlink(path.resolve(tempFilePath), (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Temp file removed: ' + tempFilePath);
  });
};

app.listen(4000, () => {
  console.log('Server listening on port: 4000');
});
