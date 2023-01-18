import { google } from 'googleapis';
import User from '../models/user.js';
import { unlink } from 'node:fs';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_API_FOLDER_ID = process.env.GOOGLE_FOLDER_ID;

export const uploadFile = async (req, res) => {
  if (!req.session.passport) {
    return res.render('error');
  }
  let file = req.file;
  let token = '';
  let user = await User.findById(req.user._id).select({
    accessToken: 1,
    _id: 0,
  });
  if (user) {
    token = user.accessToken;
  } else {
    token = req.user.accessToken;
  }
  const OAuth2Client = new google.auth.OAuth2();
  OAuth2Client.setCredentials({
    access_token: token,
  });
  const path = file.path;
  console.log(file)
  const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });
  const fileMetadata = {
    name: file.originalname,
    parents: [GOOGLE_API_FOLDER_ID],
  };
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(path),
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
        unlink(path, (err) => {
          if (err) throw err;
          console.log(`${path} was deleted`);
        });
        res.render('successResponse', { fileData: req.file.originalname });
      }
    }
  );
};

export const listFile = async (req, res) => {
  console.log('hello');
  let token = '';
  let user = await User.findById(req.user._id).select({
    accessToken: 1,
    _id: 0,
  });
  if (user) {
    token = user.accessToken;
  } else {
    token = req.user.accessToken;
  }
  const OAuth2Client = new google.auth.OAuth2();
  OAuth2Client.setCredentials({
    access_token: token,
  });
  const drive = google.drive({
    version: 'v3',
    auth: OAuth2Client,
  });
  const response = await drive.files.list(
    {
      corpora: 'drive',
      driveId: GOOGLE_API_FOLDER_ID,
      supportsAllDrives: true,
    },
    (err, file) => {
      if (err) {
        console.log('error', err);
      } else {
        console.log('req', req);
        res.render('listResponse', { fileData: req.file.originalname });
      }
    }
  );
};
