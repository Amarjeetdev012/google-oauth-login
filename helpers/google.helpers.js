import fs from 'fs';
import { google } from 'googleapis';

export const uploadFiles = async (req, res) => {
  try {
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });
    const response = await drive.files.create({
      requestBody: {
        name: 'testimage.png',
        mimeType: 'image/jpg',
      },
      media: {
        mimeType: 'image/jpg',
        body: fs.createReadStream(filePath),
      },
    });
    console.log(response.data);
  } catch (error) {
    console.log('error', error.message);
  }
};
