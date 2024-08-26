const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const queries = require("../queries.js");
const passport = require("../passport.js");

const router = Router();

router.get("/", (req, res) => {
  const user = req.user;
  res.render("index", { user });
});

// signing up //
router.get("/sign-up", (req, res) => {
  res.render("signUpForm", { username: "" });
});
const validateInputs = [
  body("username").trim().notEmpty().withMessage("username cannot be empty"),
  body("username")
    .optional({ checkFalsy: true })
    .custom(async (value) => {
      let processedValue = value.toLowerCase();
      let result = await prisma.user.findUnique({
        where: {
          name: processedValue,
        },
      });
      if (result) throw new Error("username already exists");
      return true;
    }),
  body("password").trim().notEmpty().withMessage("password cannot be empty"),
  body("password")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (req.body["confirm-password"] === value) return true;
      throw new Error("password and confirm-password fields are not matching");
    }),
];
router.post(
  "/sign-up",
  validateInputs,
  async (req, res, next) => {
    let errors = validationResult(req).errors;
    if (errors.length === 0) {
      await queries.addUser(req.body["username"], req.body["password"]);
      next();
    } else {
      res.render("signUpForm", { errors, username: req.body["username"] });
    }
  },
  passport.authenticate("local", { successRedirect: "/" })
);
//signing up//

//logging in//
router.get("/log-in", (req, res) => {
  let loginFailed = req.query["loginFailed"] === "true" ? true : false;
  res.render("logInForm", { loginFailed });
});
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in?loginFailed=true",
  })
);
//logging in//

module.exports = router;
