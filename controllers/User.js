const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');




const User = require('../models/User');

// تسجيل حساب مستخدم جديد
exports.signup = async (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return next(errors.array());
    }

    try
    {
        const { email, password, name, dateOfBirth, gender, phone, address, bloodType, lastDonationDate, weight, medicalInfo } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail)
        {
            const error = new Error('Account already exists with this email.');
            error.statusCode = 400; // Bad request
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name, dateOfBirth, gender, phone, address, bloodType, lastDonationDate, weight, medicalInfo });
        await user.save();
        res.status(201).json({ message: 'Account created successfully.' });
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};



// تسجيل دخول المستخدم
exports.login = async (req, res, next) =>
{
    try
    {
        const { email, password, fcmtoken } = req.body;
        const user = await User.findOne({ email });
        if (!user)
        {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
        {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (!fcmtoken)
        {
            return res.status(401).json({ message: 'Fcmtoken required.' });
        }
        const token = jwt.sign({ Id: user._id.toString(), Type: 'User' }, 'blood', { expiresIn: '30d' });

        user.fcmToken = fcmtoken;
        const account = await user.save()
        res.status(200).json({ message: 'Login successful.', token: token, account: account });
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};

exports.getprofile = async (req, res, next) =>
{
    try
    {
        const profile = await User.findById(req.userId);
        if (!profile)
        {
            const error = new Error('Account not found.');
            error.statusCode = 404;
            throw error;

        }
        res.status(200).json({ profile: profile });
    } catch (error)
    {
        next(error);
    }
};


//بعد التعديل 
exports.updateAccount = async (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({ errors: errors.array() });
    }

    try
    {
        const { email, name, dateOfBirth, gender, phone, address, bloodType, lastDonationDate, weight, medicalInfo } = req.body;
        const userId = req.userId; // قم بالحصول على معرف المستخدم من الطلب

        const updateData = {};
        if (email)
        {
            const existingEmail = await User.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== userId)
            {
                return res.status(400).json({ message: 'Account already exists with this email.' });
            }
            updateData.email = email;
        }
        if (name) updateData.name = name;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (gender) updateData.gender = gender;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (bloodType) updateData.bloodType = bloodType;
        if (lastDonationDate) updateData.lastDonationDate = lastDonationDate;
        if (weight) updateData.weight = weight;
        if (medicalInfo) updateData.medicalInfo = medicalInfo;

        // قم بتحديث المعلومات الخاصة بالمستخدم
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.status(200).json({ message: 'Account updated successfully.', user: updatedUser });
    } catch (error)
    {
        next(error); // قم بتمرير الخطأ إلى معالج الأخطاء العام
    }
};


exports.deleteuser = async (req, res, next) =>
{

    try
    {
        const userId = req.userId; // قم بالحصول على معرف المستخدم من الطلب

        // قم بتحديث المعلومات الخاصة بالمستخدم
        const user = await User.findByIdAndDelete(userId);
        if (!user) res.status(404).json({ message: 'Account not found.' });

        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (error)
    {
        res.status(400).json({ message: error.message });
        next(error); // قم بتمرير الخطأ إلى معالج الأخطاء العام
    }
};

exports.getAllUsers = async (req, res, next) =>
{
    try
    {
        const user = await User.find();
        res.status(200).json(user);
    } catch (error)
    {
        next(error);
    }
};


