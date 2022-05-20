const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const expressStaticGzip = require("express-static-gzip");
const history = require("connect-history-api-fallback");
const logger = require("morgan");
const multer = require("multer");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017");
const workerSchema = mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  position: String,
  //_id: Number hex
  fileName: String,
});
const Worker = mongoose.model("Workers", workerSchema);

const app = express();
app.use(logger("dev"));

app.use(
  bodyParser.urlencoded(
    { extended: false },
    { limit: "100kb" },
    { parameterLimit: 1000 }
  )
);
app.use(bodyParser.json({ limit: "100kb" }));
app.use(bodyParser.text({ limit: "100kb" }));
app.use(bodyParser.raw({ limit: "100kb" }));

app.use(
  history({
    rewrites: [
      {
        from: /^\/workersList\/*$/,
        to: function (context) {
          return context.parsedUrl.path;
        },
      },
    ],
  })
);
app.use(
  expressStaticGzip(path.join(__dirname, "prerendered"), {
    enableBrotli: true,
  })
);
app.use(express.static(path.resolve(__dirname, "usersData/usersFiles/photos")));

app.post("/pushworker", function (req, res) {
  const worker = new Worker();

  const uploadPhoto = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "usersData/usersFiles/photos");
      },
      filename: (req, file, cb) => {
        cb(null, worker._id.toString() + path.extname(file.originalname));
      },
    }),
    limits: {
      fieldNameSize: 100,
      fieldSize: 8 * 1024,
      fields: 128,
      fileSize: 8 * 1024 * 1024,
      parts: 128,
      headerPairs: 128,
    },
    fileFilter: (req, file, cb) => {
      if (
        !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
          file.mimetype
        )
      ) {
        cb(null, false);
        return cb(new Error("Invalid file Extension"));
      }
      cb(null, true);
    },
  }).single("photo");

  uploadPhoto(req, res, (err) => {
    if (err) {
      res.status(400).send(err.message);
      return 0;
    }

    worker.overwrite({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      fileName: req.file?.filename,
    });
    worker.save();
    res.status(200).end();
  });
});

app.get("/workersList", function (req, res) {
  let fromIndex = req.query.fromIndex || 0;
  let count = req.query.count || 0;
  Worker.find()
    .sort({ name: 1 })
    .skip(fromIndex)
    .limit(count)
    .then((data) =>
      res.send(
        data.map((obj) => {
          return {
            name: obj.name,
            email: obj.email,
            phone: obj.email,
            position: obj.position,
            fileName: obj.fileName,
          };
        })
      )
    );
});

module.exports = app;
