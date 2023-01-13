var express = require("express");
var router = express.Router();
var fs = require("fs");
const multer = require("multer");

router.get("/*", async function (req, res, next) {
  const filePath = "files" + req.path;
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("not found");
  }
  if (fs.statSync(filePath).isFile()) {
    res.download(filePath);
  }
  if (!fs.statSync(filePath).isFile()) {
    const { orderBy, orderByDirection, filterByName } = req.query;
    const files = [];
    // filter dir files by name
    fs.readdirSync(filePath).forEach((file) => {
      let stats = fs.statSync(`${filePath}/${file}`);
      let fileObj;
      if (!fs.statSync(`${filePath}/${file}`).isFile()) {
        fileObj = { name: `${file}/`, ...stats };
      } else {
        fileObj = { name: `${file}`, ...stats };
      }
      if (filterByName && file.includes(filterByName)) {
        files.push({
          fileName: fileObj.name,
          size: fileObj.size,
          lastModified: fileObj.mtimeMs,
        });
      }
      if (!filterByName) {
        files.push({
          fileName: fileObj.name,
          size: fileObj.size,
          lastModified: fileObj.mtimeMs,
        });
      }
    });
    let key;
    switch (orderBy) {
      case "size":
        key = "size";
        break;
      case "lastModified":
        key = "lastModified";
        break;
      case "fileName":
        key = "fileName";
        break;
    }
    // sort by direction
    files.sort((a, b) => {
      if (orderByDirection === "Descending") {
        if (key === "fileName") {
          return a[key] > b[key] ? -1 : 1;
        }
        return a[key] - b[key];
      }
      if (orderByDirection === "Asending") {
        if (key === "fileName") {
          return a[key] > b[key] ? 1 : -1;
        }
        return b[key] - a[key];
      }
    });

    return res.status(200).send({
      isDirectory: true,
      files: files.map((f) => {
        return f.fileName;
      }),
    });
  }
});

router.post("/*", async function (req, res, next) {
  const targetDir = "files" + req.originalUrl.replace(req.baseUrl, "");
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }
    if (fs.statSync(targetDir).isFile()) {
      cb(new Error("it's not file path"));
    }
    if (fs.existsSync(`${targetDir}/${file.originalname}`)) {
      cb(new Error("file existed"));
    } else {
      cb(null, true);
    }
  }
  const upload = multer({ storage, fileFilter }).single("file");
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    return res.status(200).send("file saved");
  });
});

router.patch("/*", async function (req, res, next) {
  const targetDir = "files" + req.originalUrl.replace(req.baseUrl, "");
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (fs.statSync(targetDir).isFile()) {
      cb(new Error("it's not file path"));
    }
    if (fs.existsSync(`${targetDir}/${file.originalname}`)) {
      cb(null, true);
    } else {
      cb(new Error("file not found"));
    }
  }
  const upload = multer({ storage, fileFilter }).single("file");
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    return res.status(200).send("file saved");
  });
});

router.delete("/*", async function (req, res, next) {
  const filePath = "files" + req.originalUrl.replace(req.baseUrl, "");
  if (fs.existsSync(filePath)) {
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
      fs.unlink(filePathe, (err) => {
        if (err) {
          throw err;
        }
      });
    } else {
      fs.rmSync(filePath, { recursive: true });
    }
    return res.status(200).send("delted");
  } else {
    return res.status(404).send("not found");
  }
});

module.exports = router;
