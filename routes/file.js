var express = require("express");
var router = express.Router();
var fs = require("fs");
const multer = require("multer");

router.get("/*", async function (req, res, next) {
  const filePath = "files" + req.path;
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }
  if (fs.statSync(filePath).isFile()) {
    return res.download(filePath);
  }
  const { orderBy, orderByDirection, filterByName } = req.query;
  // filter dir files by name
  const files = fs
    .readdirSync(filePath)
    .filter((file) => !filterByName || file.includes(filterByName))
    .map((file) => {
      const stats = fs.statSync(`${filePath}/${file}`);
      return {
        fileName: `${file}${stats.isFile() ? "" : "/"}`,
        size: stats.size,
        lastModified: stats.mtimeMs,
      };
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
  const orderByDirectionModifier = orderByDirection === "Descending" ? -1 : 1;
  files.sort((a, b) => {
    if (key === "fileName") {
      return (a[key] > b[key] ? 1 : -1) * orderByDirectionModifier;
    }
    return (b[key] - a[key]) * orderByDirectionModifier;
  });

  return res.status(200).send({
    isDirectory: true,
    files: files.map((f) => f.fileName),
  });
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
    if (fs.existsSync(`${targetDir}/${file.originalname}`)) {
      cb(new Error("File already existed"));
    } else {
      cb(null, true);
    }
  }
  const upload = multer({ storage, fileFilter }).single("file");
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    return res.status(200).send("File saved");
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
    if (fs.existsSync(`${targetDir}/${file.originalname}`)) {
      cb(null, true);
    } else {
      cb(new Error("file not found"));
    }
  }
  if (!fs.existsSync(targetDir)) {
    return res.status(400).send("Path not found");
  }
  const upload = multer({ storage, fileFilter }).single("file");
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    return res.status(200).send("File saved");
  });
});

router.delete("/*", async function (req, res, next) {
  const filePath = "files" + req.originalUrl.replace(req.baseUrl, "");
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  if (fs.statSync(filePath).isFile()) {
    fs.unlinkSync(filePath);
  } else {
    fs.rmSync(filePath, { recursive: true });
  }
  return res.status(200).send("Delted");
});

module.exports = router;
