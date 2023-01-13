import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import express from 'express';
import { google } from 'googleapis';
import fs from 'fs';
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
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      console.log('refreshToken',refreshToken)
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
    ],accessType: 'offline'
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
  res.render('home', { name: req.user.displayName });
});

// const OAuth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URL
// );
// OAuth2Client.setCredentials({
//   access_token: process.env['GOOGLE_ACCESS_TOKEN'],
//   refresh_token: process.env['GOOGLE_REFRESH_TOKEN'],
//   expiry_date: true,
// });

router.post('/auth/google/upload', async (req, res) => {
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
    // access_token:
    //   'ya29.a0AX9GBdWrRE-ldWU5GMZn2kshx5DVsbG3kbE71gYVQTpJ0lI883dwx4fOauOAMougsQgdeCVV7FdxeEHjRg3RkYuiu1q3l3Mpw8Q0Alhp56MpsDulW3QW82yt4Mmtd13yg0EkroBY9rf_zEOx5bZN6KgTLpzrfzkaCgYKAeUSAQASFQHUCsbCDEBONWuKpXIP3xZzweNJXg0166',
  });
  const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });

  const fileMetadata = {
    name: files[0].originalname,
  };
  const media = {
    mimeType: files[0].mimetype,
    // body: fs.createReadStream(files[0].originalname),
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
        console.log(`File ID: ${file.data.id}`);
      }
    }
  );
  res.render('successResponse', { fileData: req.files[0].originalname });
});

export default router;
