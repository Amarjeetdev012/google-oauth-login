import express from 'express';
import { upload } from '../helpers/multer.helpers.js';
import { uploadFile } from '../controller/google.controller.js';
const router = express.Router();

router.get('/auth/google/logout', (req, res) => {
  return res.render('logout');
});

router.post('/auth/google/upload', upload, uploadFile);

export default router;
