const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const users = [{ userId: 1, name: "jonathan" }];

const JwtOption = {
  secretOrKey: "MY_PRIVATE_KEY",
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new JwtStrategy(JwtOption, async (payload, done) => {
    try {
      const user = users.find((el) => el.userId === payload.userId);

      if (!user) {
        return done(new Error("user not found"), false);
      }

      return done(null, { userId: user.userId });
    } catch (err) {
      console.log("sss", err);
      done(err, false);
    }
  })
);
