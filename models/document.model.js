import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  filetype: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model('Document', documentSchema);

export default Document;