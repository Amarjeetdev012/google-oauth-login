import express from 'express';
import { upload } from '../helpers/multer.helpers.js';
import { listFile, uploadFile } from '../controller/google.controller.js';
const router = express.Router();

router.get('/auth/google/logout', (req, res) => {
  return res.render('logout');
});

router.post('/auth/google/upload', upload, uploadFile);
router.get('/auth/google/list', listFile)

export default router;
