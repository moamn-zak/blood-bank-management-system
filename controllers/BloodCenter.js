const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


const Admin = require('../models/Admin');
const BloodInventory = require('../models/Inventory');
const BloodCenter = require('../models/BloodCenter');
const CenterInventory = require('../models/centerinventory');


// إنشاء حساب للمركز
exports.createCenterAccount = async (req, res, next) =>
{
    // التحقق من صحة المدخلات
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({ errors: errors.array() });
    }

    try
    {
        // التحقق من أن المستخدم هو مدير
        const isAdmin = await Admin.findById(req.userId);
        if (!isAdmin)
        {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }

        const { email, password, name, city, address, phone, location, workingHours, additionalInfo } = req.body;

        // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
        const existingEmail = await BloodCenter.findOne({ email });
        if (existingEmail)
        {
            return res.status(400).json({ message: 'Account already exists with this email.' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء كيان جديد لـ BloodCenter
        const bloodCenter = new BloodCenter({
            email,
            password: hashedPassword,
            name,
            city,
            address,
            phone,
            location,
            workingHours,
            additionalInfo
        });

        // حفظ الكيان الجديد
        const savedBloodCenter = await bloodCenter.save();

        // إنشاء المخزون الافتراضي للمركز
        const defaultInventoryData = [
            { type: 'A+', quantity: 0 },
            { type: 'A-', quantity: 0 },
            { type: 'B+', quantity: 0 },
            { type: 'B-', quantity: 0 },
            { type: 'AB+', quantity: 0 },
            { type: 'AB-', quantity: 0 },
            { type: 'O+', quantity: 0 },
            { type: 'O-', quantity: 0 },
            { type: 'Plasma', quantity: 0 },
            { type: 'Serum', quantity: 0 },
            { type: 'Platelets', quantity: 0 },
            { type: 'Clotting Factor', quantity: 0 },
            { type: 'various proteins', quantity: 0 }
        ];

        const defaultInventory = new BloodInventory({
            centerId: savedBloodCenter._id,
            items: defaultInventoryData
        });

        // حفظ المخزون الافتراضي
        const savedInventory = await defaultInventory.save();

        // إنشاء سجل في جدول CenterInventory
        const centerInventory = new CenterInventory({ centerId: savedBloodCenter._id, inventoryId: savedInventory._id });
        await centerInventory.save();

        // إرجاع رسالة النجاح
        res.status(201).json({
            message: 'Blood center account created successfully.',
            centerInventory,
            savedInventory,
            savedBloodCenter
        });
    } catch (error)
    {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العام
    }
};





// تسجيل دخول المركز
exports.loginCenter = async (req, res, next) =>
{
    try
    {

        const { email, password, fcmtoken } = req.body;
        // البحث عن المركز باستخدام البريد الإلكتروني
        const bloodCenter = await BloodCenter.findOne({ email });
        if (!bloodCenter)
        {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // التحقق من صحة كلمة المرور المقدمة
        const passwordMatch = await bcrypt.compare(password, bloodCenter.password);
        if (!passwordMatch)
        {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (!fcmtoken)
        {
            return res.status(401).json({ message: 'Fcmtoken required.' });
        }
        // إنشاء JWT
        const token = jwt.sign({ email: bloodCenter.email, Id: bloodCenter._id }, 'blood', { expiresIn: '30d' });
        // إرسال رد ناجح مع الـ JWT
        bloodCenter.fcmToken = fcmtoken;

        const user = await bloodCenter.save();

        res.status(200).json({ message: 'Login successful.', token: token, account: user });
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};





exports.updateCenterInfo = async (req, res, next) =>
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

        const centerId = req.params.centerId;
        const { email, password, name, city, address, phone, location, workingHours, additionalInfo } = req.body;

        const center = await BloodCenter.findById(centerId);

        if (!center)
        {
            return res.status(404).json({ message: 'Blood center not found.' });
        }

        if (email)
        {
            const existingEmail = await BloodCenter.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== centerId)
            {
                return res.status(400).json({ message: 'Account already exists with this email.' });
            }
            center.email = email;
        }

        if (password)
        {
            if (password.toString() !== center.password.toString())
            {
                const hashedPassword = await bcrypt.hash(password, 10);
                center.password = hashedPassword;
            }
        }

        if (name) center.name = name;
        if (city) center.city = city;
        if (address) center.address = address;
        if (phone) center.phone = phone;
        if (location) center.location = location;
        if (workingHours) center.workingHours = workingHours;
        if (additionalInfo) center.additionalInfo = additionalInfo;

        await center.save();

        res.status(200).json({ message: 'Blood center information updated successfully.', center });
    } catch (error)
    {
        next(error);
    }
};




exports.deletebloodcenter = async (req, res, next) =>
{
    try
    {
        const centerId = req.params.centerId; // استخراج معرف المركز من الطلب

        // البحث عن المركز بمعرفه
        const center = await BloodCenter.findByIdAndDelete(centerId);

        // التأكد من أن المركز موجود
        if (!center)
        {
            const error = new Error('Blood center not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: 'Blood center deleted successfully.' });

    } catch (error)
    {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العالمي
    }
};




exports.getprofile = async (req, res, next) =>
{
    try
    {
        const profile = await BloodCenter.findById(req.userId);
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

// جلب كل مراكز الدم
exports.getAllBloodCenters = async (req, res, next) =>
{
    try
    {
        const bloodCenters = await BloodCenter.find();
        res.status(200).json(bloodCenters);
    } catch (error)
    {
        next(error);
    }
};




//   اضافة مواد للمخزن
exports.addToInventory = async (req, res, next) =>
{
    try
    {
        // استخراج مصفوفة العناصر من الريكويست
        const items = req.body.items;

        // التحقق من وجود مصفوفة العناصر
        if (!items || !Array.isArray(items) || items.length === 0)
        {
            const error = new Error('Items array is missing or empty.');
            error.statusCode = 400;
            throw error;
        }

        // البحث عن مخزن المركز في جدول CenterInventory
        const centerInventory = await CenterInventory.findOne({ centerId: req.userId });

        if (!centerInventory)
        {
            const error = new Error(`Blood inventory not found for center ID: ${req.userId}`);
            error.statusCode = 404;
            throw error;
        } else
        {
            // العثور على مخزن المركز، و تحديثه مع العناصر الجديدة
            const existingInventory = await BloodInventory.findById(centerInventory.inventoryId);
            items.forEach(item =>
            {
                // التحقق من وجود العنصر في المخزون الحالي
                const existingItem = existingInventory.items.find(existing => existing.type === item.type);
                if (existingItem)
                {
                    existingItem.quantity = item.quantity;
                } else
                {
                    const error = new Error(`Blood type ${item.type} not found in inventory.`);
                    error.statusCode = 400;
                    throw error;
                }
            });
            await existingInventory.save();
        }

        // إرسال رد ناجح
        res.status(201).json({ message: 'Added to blood inventory successfully.' });
    } catch (error)
    {
        next(error); // إرسال الخطأ إلى معالج الأخطاء العام
    }
};




//  جلب معلومات المخزن  
exports.getInventory = async (req, res, next) =>
{
    try
    {
        const centerinventory = await CenterInventory.findOne({ centerId: req.userId });
        if (!centerinventory)
        {
            return res.status(404).json({ message: 'Blood inventory not found.' });
        }
        const inventoryId = centerinventory.inventoryId;
        const inventory = await BloodInventory.findById({ _id: inventoryId });
        res.status(200).json(inventory);
    } catch (error)
    {
        next(error); // Pass the error to the global error handler
    }
};




//  بحث عن المراكز حسب المدينة 
exports.searchOnCity = async (req, res, next) =>
{
    try
    {
        const city = req.body.city;
        const getcity = await BloodCenter.find({ city: city });
        if (!getcity)
        {
            const error = new Error('City Not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ message: 'Centers Found', getcity })
    } catch (error)
    {
        next(error);
    }
};
