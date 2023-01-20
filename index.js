import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { connectDatabase } from './database/mongoose.database.js';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import router from './routes/route.routes.js';
import route from './config/passport.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(cookieParser());

const PORT = process.env.PORT;

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  autoRemove: 'native',
});
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 69600 },
    store: store,
  })
);
connectDatabase();
app.use(passport.initialize());
app.use(passport.session());
app.use('/', router);
app.use('/', route);

app.listen(PORT, console.log(`listening at ${PORT}`));
