import express from 'express';
import { upload } from '../helpers/multer.helpers.js';
import {
  deleteFile,
  downloadFile,
  listFile,
  uploadFile,
} from '../controller/google.controller.js';
const router = express.Router();

router.get('/auth/google/logout', (req, res) => {
  return res.render('logout');
});

router.post('/auth/google/upload', upload, uploadFile);
router.get('/auth/google/list', listFile);
router.post('/auth/google/delete', deleteFile);
router.post('/auth/google/download', downloadFile)

export default router;
