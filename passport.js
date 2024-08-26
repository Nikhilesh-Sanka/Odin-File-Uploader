const passport = require("passport");
const LocalStrategy = require("passport-local");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let strategy = new LocalStrategy(async (username, password, done) => {
  try {
    let processedUsername = username.toLowerCase();
    let user = await prisma.user.findUnique({
      where: {
        name: processedUsername,
      },
    });
    if (user) {
      if (user.password === password) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect Password" });
      }
    }
    return done(null, false, { message: "Username does not exists" });
  } catch (err) {
    done(err);
  }
});

passport.use(strategy);

module.exports = passport;
