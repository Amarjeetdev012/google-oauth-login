import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { connectDatabase } from './database/mongoose.database.js';
import session from 'express-session';
import cookieParser from 'cookie-parser'
import router from './config/passport.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cookieParser())
const PORT = process.env.PORT;
app.use(
  session({
    secret: 'secret message',
    resave: false,
    saveUninitialized: true,
  })
);
connectDatabase();
app.use(passport.initialize());
app.use(passport.session());
app.use('/', router);

app.listen(PORT, console.log(`listening at ${PORT}`));
