import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import User from '../models/user.js';

const route = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      console.log('first ======>>>>');
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      try {
        let user = await User.findOne({ googleId: profile.id });
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
  console.log('second ======>>>>');

  done(null, user.id); //save only user id in server
});

passport.deserializeUser((id, done) => {
  console.log('third ======>>>>');
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

route.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    accessType: 'offline',
    prompt: 'consent',
  })
);

route.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
  })
);

route.get('/auth/google/success', (req, res) => {
  console.log('four ======>>>>');

  if (!req.session.passport) {
    return res.render('error');
  }
  res.render('home', { name: req.user.displayName });
});

route.get('/auth/google/failure', (req, res) => {
  return res.render('error');
});

export default route;
