import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import express from 'express';
import { google } from 'googleapis';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import User from '../models/user.js';
const router = express.Router();
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { token } from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
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
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    accessType: 'online',
    prompt: 'consent',
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
  })
);

router.get('/auth/google/success', (req, res) => {
  if (!req.session.passport) {
    return res.render('error');
  }
  res.render('home', { name: req.user.displayName });
});

router.post('/auth/google/upload', async (req, res) => {
  if (!req.session.passport) {
    return res.render('error');
  }
  let files = req.files;
  let token = '';
  let user = await User.findById(req.user._id).select({
    accessToken: 1,
    _id: 0,
  });
  if (user) {
    token = user.accessToken;
  } else {
    token = req.user.token;
  }
  const OAuth2Client = new google.auth.OAuth2();
  OAuth2Client.setCredentials({
    access_token: token,
  });

  const dirPath = path.join(__dirname, req.files[0].originalname);
  const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });
  const fileMetadata = {
    name: files[0].originalname,
  };
  const media = {
    mimeType: files[0].mimetype,
    body: fs.createReadStream(dirPath),
  };

  const response = await drive.files.create(
    {
      resource: fileMetadata,
      media: media,
    },
    (err, file) => {
      if (err) {
        console.log('error', err);
      } else {
        res.render('successResponse', { fileData: req.files[0].originalname });
      }
    }
  );
});

export default router;
