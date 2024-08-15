const firebase = require('firebase-admin');
const path = require('path');

const User = require('../models/User');
const Admin = require('../models/Admin');


//const serviceAccount = require(path.resolve('C:\\Users\\----\\Desktop\\----\\firebase\\--------'));

// firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
// });

exports.sendNotification = (token, title, body) =>
{
    const message = {
        notification: {
            title: title,
            body: body,
        }
    };

    firebase.messaging().sendToDevice(token, message)
        .then((response) =>
        {
            console.log('Successfully sent message:', response);
        })
        .catch((error) =>
        {
            console.log('Error sending message:', error);
        });
};




exports.brodcastNotification = async (req, res, next) =>
{

    const { title, message } = req.body;
    try
    {
        // التحقق من أن المستخدم هو مدير
        const isAdmin = await Admin.findById(req.userId);
        if (!isAdmin)
        {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }
        const users = await User.find();

        users.forEach(user =>
        {
            this.sendNotification(user.fcmToken, title, message);
        });
        res.status(200).json({ message: 'Notification send successfully' });
    }
    catch (error)
    {
        next(error);
    }
};

