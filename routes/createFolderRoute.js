const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const queries = require("../queries.js");

const prisma = new PrismaClient();

const router = Router();

router.get("/", (req, res) => {
  let user = req.user;
  let isFolderBeingAdded = true;
  res.render("index", { isFolderBeingAdded, user });
});

const validateInputs = [
  body("folder-name")
    .trim()
    .notEmpty()
    .withMessage("Folder name cannot be empty"),
  body("folder-name")
    .optional({ checkFalsy: true })
    .custom(async (value, { req }) => {
      const processedValue = value.toLowerCase();
      const result = await prisma.folder.findFirst({
        where: {
          name: processedValue,
          userId: req.user.id,
        },
      });
      if (result) throw new Error("folder already exists");
      return true;
    }),
];

router.post("/", validateInputs, async (req, res) => {
  const errors = validationResult(req).errors;
  if (errors.length === 0) {
    await queries.createFolder(req.body["folder-name"], req.user.id);
    res.redirect("/");
  } else {
    res.render("index", {
      user: req.user,
      isFolderBeingAdded: true,
      addFolderErrors: errors,
    });
  }
});

module.exports = router;
