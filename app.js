require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const methodOverride = require('method-override');

const connectDB = require('./server/config/db');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');

const cors = require('cors');

const path = require('path');

// Serve static React files from the public directory


const app = express();
const PORT = 5000||process.env.PORT;

connectDB();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from this origin (frontend)
    credentials: true
}));

app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}));



//Engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
// In your Express server (app.js or server.js)



// Your existing routes...
