const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');
const { validationResult } = require('express-validator');


// إنشاء حساب للمشفى
exports.createHospitalAccount = async (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return next(errors.array());
    }
    try
    {
        const isAdmin = Admin.findById(req.userId)
        if (!isAdmin)
        {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' })

        }

        const { name, address, phone, email } = req.body;

        const existingEmail = await Hospital.findOne({ email });
        if (existingEmail)
        {
            const error = new Error('Account already exists with this email.');
            error.statusCode = 400; // Bad request
            throw error;
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create new instance
        const hospital = new Hospital({ name, address, phone, email, password: hashedPassword });

        await hospital.save();
        res.status(201).json({ message: 'Hospital account created successfully.' });
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};





exports.loginHospital = async (req, res, next) =>
{
    try
    {
        const { email, password, fcmtoken } = req.body;
        const hospital = await Hospital.findOne({ email });
        if (!hospital)
        {
            return res.status(401).json({ message: 'Invalid email.' });
        }
        const passwordMatch = await bcrypt.compare(password, hospital.password);
        if (!passwordMatch)
        {
            return res.status(401).json({ message: 'Invalid password.' });
        }
        if (!fcmtoken)
        {
            return res.status(401).json({ message: 'Fcmtoken required.' });
        }
        // إنشاء JWT
        const token = jwt.sign({ Id: hospital._id, Type: 'Hospital' }, 'blood', { expiresIn: '30d' });
        hospital.fcmToken = fcmtoken;
        const user = await hospital.save()
        res.status(200).json({ message: 'Login successful.', token: token, account: user });
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};






// exports.updatHospitalInfo = async (req, res, next) =>
// {
//     const error = validationResult(req)
//     if (!error.isEmpty())
//     {
//         return next(error.array());
//     }
//     try
//     {
//         const isAdmin = Admin.findById(req.userId);
//         if (!isAdmin)
//         {
//             return next(error.array());
//         }
//         const hospitalId = req.params.hospitalId;
//         const { name, address, phone, email } = req.body;

//         const hospital = await Hospital.findById(hospitalId);
//         if (!hospital)
//         {
//             const error = new Error('hospital not found.');
//             error.statusCode = 404;
//             throw error;
//         }
//         const existingEmail = await Hospital.findOne({ email });
//         if (existingEmail)
//         {
//             const error = new Error('Account already exists with this email.');
//             error.statusCode = 400; // Bad request
//             throw error;
//         }

//         // تشفير كلمة المرور
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);

//         hospital.email = email;
//         hospital.password = hashedPassword;
//         hospital.name = name;
//         hospital.phone = phone;
//         hospital.address = address;

//         await hospital.save();
//         res.status(200).json({ message: 'Hospital information updated successfully.' });

//     } catch (error)
//     {
//         next(error);
//     }
// };


exports.updateHospitalInfo = async (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({ errors: errors.array() });
    }
    try
    {
        const isAdmin = await Admin.findById(req.userId);
        if (!isAdmin)
        {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }

        const hospitalId = req.params.hospitalId;
        const { name, address, phone, email, password } = req.body;



        // البحث عن المستشفى بمعرفه
        const hospital = await Hospital.findById(hospitalId);

        // التأكد من أن المستشفى موجود
        if (!hospital)
        {
            return res.status(404).json({ message: 'Hospital not found.' });
        }

        // تحديث المعلومات فقط إذا كانت الحقول موجودة في الطلب
        if (email && email !== hospital.email)
        {
            // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
            const existingEmail = await Hospital.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== hospitalId)
            {
                return res.status(400).json({ message: 'Account already exists with this email.' });
            }
            hospital.email = email;
        }
        if (password)
        {
            if (password.toString() !== hospital.password.toString())
            {
                const hashedPassword = await bcrypt.hash(password, 10);
                hospital.password = hashedPassword;
            }
        }

        if (name) hospital.name = name;
        if (phone) hospital.phone = phone;
        if (address) hospital.address = address;

        // حفظ التغييرات
        await hospital.save();


        res.status(200).json({ message: 'Hospital information updated successfully.', hospital: hospital });
    } catch (error)
    {
        next(error);
    }
};



exports.getprofile = async (req, res, next) =>
{
    try
    {
        const profile = await Hospital.findById(req.userId);
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

exports.deletehospital = async (req, res, next) =>
{
    try
    {
        const hospitalId = req.params.hospitalId; // استخراج معرف المركز من الطلب

        // البحث عن المركز بمعرفه
        const center = await Hospital.findByIdAndDelete(hospitalId);

        // التأكد من أن المركز موجود
        if (!center)
        {
            const error = new Error('Hospital not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: 'Hospital deleted successfully.' });

    } catch (error)
    {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العالمي
    }
};



// جلب كل المشافي
exports.getAllHospitals = async (req, res, next) =>
{
    try
    {
        const hospitals = await Hospital.find();
        res.status(200).json(hospitals);
    } catch (error)
    {
        next(error);
    }
};
