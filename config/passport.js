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

router.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/drive', 'profile'],
}))

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
  let token = req.user.accessToken;
  const drive = google.drive({
    version: 'v3',
    auth: token,
  });

  const fileMetadata = {
    name: files[0].originalname,
  };
  const media = {
    mimeType: files[0].mimetype,
    // body: fs.createReadStream(files[0].originalname),
  };
  await drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: 'id',
    },
    (err, file) => {
      if (err) {
        console.log('error', err);
      } else {
        console.log(`File ID: ${file.data.id}`);
      }
    }
  );
});

export default router;
