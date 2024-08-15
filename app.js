const express = require('express');
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const path = require("path")
const multer = require("multer");



const adminRoutes = require('./routes/Admin');
const userRoutes = require('./routes/User');
const centerRoutes = require('./routes/BloodCenter');
const hospitalRoutes = require('./routes/Hospital');



const app = express();


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        cb(null, 'images');
    },
    filename: (req, file, cb) =>
    {
        const date = Date.now() + '-' + Math.round(Math.random() * 1E9); // جزء من الوقت الحالي + رقم عشوائي لضمان فرادة الاسم
        cb(null, date + '_' + file.originalname.replace(/ /g, "_"));
    }
});

const fileFilter = (req, file, cb) =>
{
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg')
    {
        cb(null, true);
    } else
    {
        cb(null, false);
    }
};

app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // تصحيح هنا
    next();
});



app.use(bodyparser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));


app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/center', centerRoutes);
app.use('/hospital', hospitalRoutes);


app.use((error, req, res, next) =>
{
    console.log(error);
    const status = error.statusCode || 500;
    let message = error.message;

    // Check if the error has an array of errors
    if (error.array)
    {
        // Format the errors array
        const errorsArray = error.array();
        message = { errors: errorsArray.map(err => ({ message: err.msg })) };
    }

    res.status(status).json({ message: message });
});


mongoose.connect('mongodb+srv://ibrazamil:ibrazamil@cluster0.ixzvkhf.mongodb.net/Hope?retryWrites=true&w=majority&appName=Cluster0')
    .then(() =>
    {
        app.listen(8080, () =>
        {
            console.log('Server is running on port 8080');
            console.log('Connected to MongoDB Atlas');
        });


    }).catch(err => { console.log(err.message); });
