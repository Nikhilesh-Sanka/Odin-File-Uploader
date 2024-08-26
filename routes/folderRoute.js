const { Router } = require("express");
const queries = require("../queries.js");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./uploads`);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${req.body["filename"]}-${req.query["folderId"]}-${file.originalname}`
    );
  },
});
const upload = multer({ storage: storage });

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const folderId = req.query["folderId"];
  const folder = await queries.getFolder(folderId);
  const isFolderOpen = true;
  res.render("index", { user: req.user, isFolderOpen, folder });
});

// creating the file //
router.get("/createFile", async (req, res) => {
  let isFileBeingCreated = true;
  const folder = await queries.getFolder(req.query["folderId"]);
  res.render("index", { user: req.user, folder, isFileBeingCreated });
});

const validateInputs = [
  body("filename").trim().notEmpty().withMessage("filename cannot be empty"),
  body("filename").custom(async (value, { req }) => {
    const processedValue = value.toLowerCase();
    const processedFolderId = parseInt(req.query["folderId"]);
    const result = await prisma.file.findFirst({
      where: {
        name: processedValue,
        folderId: processedFolderId,
      },
    });
    if (result) throw new Error("filename already exists");
    return true;
  }),
];

router.post(
  "/createFile",
  upload.single("file"),
  validateInputs,
  async (req, res, next) => {
    let errors = validationResult(req).errors;
    console.log(errors);
    if (errors.length !== 0) {
      const result = await queries.getFolder(req.query["folderId"]);
      res.render("index", {
        isFileBeingCreated: true,
        user: req.user,
        folder: result,
        addFileErrors: errors,
      });
      fs.unlink(`${req.file.path}`, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            console.error("file does not exist");
          } else {
            console.error("it's a error");
          }
        }
      });
    } else {
      next();
    }
  },
  async (req, res) => {
    await queries.addFile(
      req.body["filename"],
      req.query["folderId"],
      req.file.path
    );
    res.redirect(`/folder?folderId=${req.query["folderId"]}`);
  }
);
//creating the file //

//downloading the file//
router.get("/downloadFile", async (req, res) => {
  let file = await queries.getFile(req.query["fileId"]);
  res.download(file.path);
});
//downloading the file//

//deleting the file//
router.get("/deleteFile", async (req, res) => {
  const file = await queries.deleteFile(req.query["fileId"]);
  res.redirect(`/folder?folderId=${file.folderId}`);
});
//deleting the file//

module.exports = router;
