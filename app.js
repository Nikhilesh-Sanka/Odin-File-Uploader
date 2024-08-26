const express = require("express");
const path = require("path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("./passport.js");

const prisma = new PrismaClient();

const app = express();

async function main() {
  // await prisma.file.deleteMany({});
  // let files = await prisma.file.findMany();
  // console.log(files);
}

main();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/static", express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes/indexRoute.js");
const createFolderRouter = require("./routes/createFolderRoute.js");
const editFolderRouter = require("./routes/editFolderRoute.js");
const folderRouter = require("./routes/folderRoute.js");
const deleteFolderRouter = require("./routes/deleteFolderRoute.js");

//encoding the request//
app.use("/sign-up", express.urlencoded({ extended: true }));
app.use("/log-in", express.urlencoded({ extended: true }));
app.use("/createFolder", express.urlencoded({ extended: true }));
app.use("/editFolder", express.urlencoded({ extended: true }));
//encoding the request//

app.use(
  session({
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
    },
    secret: "it's a secret",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 1 * 60 * 60 * 1000,
      dbRecordIdAsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());

// Serializing and deserializing the requests //
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        folders: true,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
// Serializing and deserializing the requests //

//Routes for the app //
app.use("/", indexRouter);
app.use("/createFolder", createFolderRouter);
app.use("/editFolder", editFolderRouter);
app.use("/deleteFolder", deleteFolderRouter);
app.use("/folder", folderRouter);
app.use("/log-out", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/");
    }
  });
});

app.listen(3000);
