const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

// تسجيل حساب مدير 
exports.signup = async (req, res, next) =>
{
    try
    {
        const { username, email, password } = req.body;

        // التحقق مما إذا كان المستخدم موجود بالفعل
        const existingEmail = await Admin.findOne({ email });
        if (existingEmail)
        {
            const error = new Error('Account already exists with this email.');
            error.statusCode = 400; // Bad request
            throw error;
        }

        // إنشاء كلمة المرور المشفرة
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء الحساب الإداري الجديد
        const admin = new Admin({ username, email, password: hashedPassword });
        await admin.save();

        res.status(201).json({ message: 'Admin account created successfully.' });
    } catch (error)
    {
        next(error); // إرسال الخطأ إلى معالج الأخطاء العام
    }
};


// تسجيل دخول المدير
exports.login = async (req, res) =>
{
    try
    {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin)
        {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch)
        {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // إنشاء JWT
        const token = jwt.sign({ email: admin.email, Id: admin._id.toString() }
            , 'blood', { expiresIn: '30d' }); // يمكن تعيين فترة صلاحية JWT هنا
        res.status(200).json({ message: 'Login successful.', token: token });
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};











