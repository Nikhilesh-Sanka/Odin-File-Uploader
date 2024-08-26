const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const queries = require("../queries.js");

const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req, res) => {
  const folderId = parseInt(req.query["folderId"]);
  const result = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });
  res.render("index", {
    isFolderBeingEdited: true,
    user: req.user,
    folder: result,
  });
});

const validateInputs = [
  body("folder-name")
    .trim()
    .notEmpty()
    .withMessage("folder name cannot be empty"),
  body("folder-name").custom(async (value, { req }) => {
    const processedFolderName = value.toLowerCase();
    const result = await prisma.folder.findFirst({
      where: {
        name: processedFolderName,
        userId: req.user.id,
      },
    });
    const folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(req.query["folderId"]),
      },
    });
    req.folder = folder;
    if (result) {
      if (result.name === folder.name) {
        console.log("1");
        return true;
      }
      throw new Error("folder name already exists");
    } else {
      console.log("3");
      return true;
    }
  }),
];

router.post("/", validateInputs, async (req, res) => {
  const errors = validationResult(req).errors;
  if (errors.length === 0) {
    await queries.editFolder(req.body["folder-name"], req.folder.id);
    res.redirect("/");
  } else {
    res.render("index", {
      user: req.user,
      isFolderBeingEdited: true,
      folder: req.folder,
      editFolderErrors: errors,
    });
  }
});

module.exports = router;
