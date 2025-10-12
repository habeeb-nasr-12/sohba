import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import { ENV } from "./env.js";
import { generateUsername } from "../utils/auth.js";

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: ENV.GOOGLE_CLIENT_ID,
  clientSecret: ENV.GOOGLE_CLIENT_SECRET,
  callbackURL: `${ENV.API_BASE_URL}/api/auth/google/callback`,
  proxy: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with this email
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      username: await generateUniqueUsername(profile.emails[0].value),
      authProvider: 'google',
      isEmailVerified: true,
      profilePicture: profile.photos[0]?.value || ""
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    return done(error, null);
  }
}));

// Generate unique username
const generateUniqueUsername = async (email) => {
  let username = generateUsername(email);
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      isUnique = true;
    } else {
      username = generateUsername(email);
      attempts++;
    }
  }

  return username;
};

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
