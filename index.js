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
app.post('/video/transcode', (req, res) => {
  if (!fs.existsSync('upload')) {
    fs.mkdirSync('upload');
  }
  const time = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  const path = `upload/output-${rand}-${time}.mp4`;
  ffmpeg(req.files.video.tempFilePath)
    .saveToFile(path)
    .on('error', (error) => {
      console.log(error);
      removeTemps(req.files.video.tempFilePath);
      res.status(500).end();
    })
    .on('end', () => {
      removeTemps(req.files.video.tempFilePath);
      res.json({ path: `http://localhost:4000/${path}` });
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
  console.log(req.files);
  console.log(req.files.video.tempFilePath);
  ffmpeg(req.files.video.tempFilePath)
    .seekInput(3.0)
    .seekOutput(2.0)
    .saveToFile('output010.mp4')
    .on('error', () => {
      removeTemps(req.files.video.tempFilePath);
    })
    .on('end', () => {
      removeTemps(req.files.video.tempFilePath);
      console.log('End...');
    });
  res.send('video submitted');
});

const removeTemps = (tempFilePath) => {
  fs.unlink(path.resolve(tempFilePath), () => {
    console.log('Temp file removed: ' + tempFilePath);
  });
};
app.listen(4000, () => {
  console.log('Server listening on port: 4000');
});
