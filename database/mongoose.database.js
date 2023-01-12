import mongoose from 'mongoose'

export const connectDatabase = () => {
    console.log('mongodb is connecting');
    mongoose
      .connect(
          process.env.MONGO_URI,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )
      .then(() => {
        console.log(`mongodb is connected`);
      })
      .catch((err) => {
        console.log(`${err}`);
      });
  };