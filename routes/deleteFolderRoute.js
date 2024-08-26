const { Router } = require("express");
const queries = require("../queries.js");

const router = Router();

router.get("/", async (req, res) => {
  await queries.deleteFolder(req.query["folderId"]);
  res.redirect("/");
});

module.exports = router;
