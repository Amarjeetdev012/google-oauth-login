import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import User from '../models/user.js';
const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/oauth2/redirect/google',
      scope: ['profile'],
      passReqToCallback: true,
    },
    async function verify(request, accessToken, refreshToken, profile, done) {
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        accessToken: accessToken,
      };
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (err) {
        console.error(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

router.get('/login', passport.authenticate('google'));

router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
  }),
  (req, res, next) => {
    res.redirect('/log');
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;
