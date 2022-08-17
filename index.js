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
  if (!fs.existsSync('upload/thumbnail')) {
    fs.mkdirSync('upload/thumbnail');
  }
  const fileName = getFileName();
  const path = `upload/${fileName}`;
  const thumbnailImageName = fileName.replace('.mp4', '.jpeg');
  const thumbnailImagePath = `upload/thumbnail/${fileName.replace(
    '.mp4',
    '.jpeg'
  )}`;
  ffmpeg(req.files.video.tempFilePath)
    .screenshot({
      count: 1,
      timestamps: [0],
      filename: thumbnailImageName,
      folder: 'upload/thumbnail',
    })
    .saveToFile(path)
    .on('error', (error) => {
      console.log(error);
      removeTemps(req.files.video.tempFilePath);
      res.status(500).end();
    })
    .on('end', () => {
      removeTemps(req.files.video.tempFilePath);
      res.json({
        path: `http://localhost:4000/${path}`,
        thumbnailImageUrl: `http://localhost:4000/${thumbnailImagePath}`,
        fileName,
      });
      console.log('End...');
    });
});

app.post('/video/crop', (req, res) => {
  console.log(req.files);
  console.log(req.files.video.tempFilePath);
  ffmpeg(req.files.video.tempFilePath)
    .outputOptions('-filter:v crop=1080:1080:0:0')
    .saveToFile('output007.mp4')
    .on('error', () => {
      removeTemps(req.files.video.tempFilePath);
    })
    .on('end', () => {
      removeTemps(req.files.video.tempFilePath);
      console.log('End...');
    });
  res.send('video submitted');
});

app.post('/video/trim', (req, res) => {
  const [start, end] = req.body.range;
  const path = `upload/${req.body.fileName}`;
  const newFileName = getFileName('trim-');
  const newpath = `upload/${newFileName}`;
  ffmpeg(path)
    .seekInput(Number(start).toFixed(2))
    .seekOutput(Number(end).toFixed(2))
    .saveToFile(newpath)
    .on('error', (error) => {
      removeTemps(newpath);
      console.log(error);
    })
    .on('end', () => {
      removeTemps(path);
      console.log('End...');
      res.json({
        path: `http://localhost:4000/${newpath}`,
        fileName: newFileName,
      });
    });
});

const removeTemps = (tempFilePath) => {
  fs.unlink(path.resolve(tempFilePath), () => {
    console.log('Temp file removed: ' + tempFilePath);
  });
};
app.listen(4000, () => {
  console.log('Server listening on port: 4000');
});
