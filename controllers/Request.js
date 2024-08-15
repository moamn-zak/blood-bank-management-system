const Request = require('../models/Request');
const BloodRequests = require('../models/bloodrequests');
const BloodInventory = require('../models/Inventory');
const CenterInventory = require('../models/centerinventory');
const BloodCenter = require('../models/BloodCenter');

const path = require('path');
const fs = require('fs');
const User = require('../models/User');


const { sendNotification } = require('./firebaseService');

// Create a new request
// exports.createRequest = async (req, res, next) =>
// {
//     try
//     {
//         const { type, itemType, centerId, quantity } = req.body;

//         if (req.userType === 'User' && type !== 'Blood Donation')
//         {
//             if (!req.file)
//             {
//                 throw new Error('No image provided.');
//             }
//         }
//         if (type === 'Blood Donation')
//         {
//             const user = await User.findById(req.userId);

//             const lastDonationDate = new Date(user.lastDonationDate);
//             const currentDate = new Date();
//             const diffTime = Math.abs(currentDate - lastDonationDate);
//             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//             if (diffDays < 50)
//             {
//                 return res.status(400).json({ message: 'You cannot donate blood now because it has not been 50 days since your last donation.' });
//             }

//         }
//         const imageUrl = req.file ? '/images/' + req.file.filename : undefined;
//         const request = new Request({
//             type,
//             itemType,
//             quantity,
//             image: imageUrl,
//         });
//         // حفظ الطلب في قاعدة البيانات
//         await request.save();

//         // إنشاء سجل في جدول BloodRequests باستخدام معرفات العناصر المرتبطة
//         const bloodRequest = new BloodRequests({
//             request: request._id, // استخدم معرف الطلب الجديد
//             centerId: centerId,
//             requesterId: req.userId,
//             onModel: req.userType,// هنا قد تحتاج لتحديد معرف المشفى من الطلب إذا كان المستخدم مشفى
//         });
//         await bloodRequest.save();
//         const center = BloodCenter.findById(centerId);
//         sendNotification(center.fcmToken, 'Request Arrived', `An ${type} Request arrived.`)



//         res.status(201).json({ message: 'Request created successfully', request });
//     } catch (error)
//     {
//         next(error); // Pass the error to the global error handler
//     }
// };


exports.createRequest = async (req, res, next) =>
{
    try
    {
        const { type, itemType, centerId, quantity } = req.body;

        if (req.userType === 'User' && type !== 'Blood Donation')
        {
            if (!req.file)
            {
                throw new Error('No image provided.');
            }
        }

        if (type === 'Blood Donation')
        {
            const user = await User.findById(req.userId);

            const lastDonationDate = new Date(user.lastDonationDate);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - lastDonationDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 50)
            {
                return res.status(400).json({ message: 'You cannot donate blood now because it has not been 50 days since your last donation.' });
            }
        }

        const imageUrl = req.file ? '/images/' + req.file.filename : undefined;
        const request = new Request({
            type,
            itemType,
            quantity,
            image: imageUrl,
        });

        // حفظ الطلب في قاعدة البيانات
        await request.save();

        // إنشاء سجل في جدول BloodRequests باستخدام معرفات العناصر المرتبطة
        const bloodRequest = new BloodRequests({
            request: request._id, // استخدم معرف الطلب الجديد
            centerId: centerId,
            requesterId: req.userId,
            onModel: req.userType, // هنا قد تحتاج لتحديد معرف المشفى من الطلب إذا كان المستخدم مشفى
        });
        await bloodRequest.save();

        // العثور على مركز الدم وإرسال الإشعار
        const center = await BloodCenter.findById(centerId);

        if (center && center.fcmToken)
        {
            sendNotification(center.fcmToken, 'Request Arrived', `An ${type} Request arrived.`);
        } else
        {
            console.warn(`No fcmToken found for center with ID ${centerId}`);
        }

        res.status(201).json({ message: 'Request created successfully', request });
    } catch (error)
    {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العالمي
    }
};







exports.getRequest = async (req, res, next) =>
{
    try
    {
        let requests;
        let status = req.params.status;
        let model = req.params.model;
        // تعيين الحالة إلى قيمة فارغة إذا لم يتم تمرير قيمة لها
        if (status !== 'Pending' && status !== 'Accepted' && status !== 'Rejected' && status !== 'Received')
        {
            status = '';
        }
        if (model !== 'User' && model !== 'Hospital')
        {
            model = '';
        }
        if (model && status)
        {
            // استعراض الطلبات بناءً على نموذج وحالة
            requests = await BloodRequests.find({ onModel: model, centerId: req.userId })
                .populate({
                    path: 'request',
                    match: { status: status }
                })
                .populate('requesterId', 'name');
        }
        else if (model)
        {
            // استعراض الطلبات بناءً على نموذج فقط
            requests = await BloodRequests.find({ onModel: model, centerId: req.userId })
                .populate('request')
                .populate('requesterId', 'name')
        } else if (status)
        {
            // استعراض الطلبات بناءً على حالة فقط
            if (req.userType === 'User' || req.userType === 'Hospital')
            {
                requests = await BloodRequests.find({ requesterId: req.userId })
                    .populate({
                        path: 'request',
                        match: { status: status }
                    })
                    .populate('centerId', 'name');
            } else
            {
                requests = await BloodRequests.find({ centerId: req.userId })
                    .populate({
                        path: 'request',
                        match: { status: status }
                    })
                    .populate('requesterId', 'name');
            }
        } else
        {
            // استعراض جميع الطلبات
            if (req.userType === 'User' || req.userType === 'Hospital')
            {
                requests = await BloodRequests.find({ requesterId: req.userId })
                    .populate('request')
                    .populate('centerId', 'name');
            } else
            {
                requests = await BloodRequests.find({ centerId: req.userId })
                    .populate('request')
                    .populate('requesterId', 'name');
            }
        }
        // تصفية النتائج لإزالة المستندات التي تحتوي على 'request' فارغة
        if (status)
        {
            requests = requests.filter(request => request.request !== null);
        }
        // التحقق مما إذا كانت هناك طلبات موجودة
        if (!requests || requests.length === 0)
        {
            return res.status(404).json({ message: 'Ther is no requests.' });
        }
        res.status(200).json(requests);
    } catch (error)
    {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العام
    }
};







exports.sercheRequest = async (req, res, next) =>
{

    const requestNumber = req.body.requestNumber;
    try
    {
        const request = await Request.findOne({ requestNumber: requestNumber });
        if (!request)
        {
            const error = new Error('Request not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'get request successfully', request: request })
    } catch (error)
    {
        next(error);
    }

};





exports.handleRequest = async (req, res, next) =>
{
    try
    {
        const requestId = req.params.requestId;
        const action = req.body.action; // "accept", "reject", or "deliver"
        const arrivalDate = req.body.arrivalDate;
        const hndrequest = await BloodRequests.findOne({ request: requestId }).populate('request').populate('requesterId');
        if (!hndrequest.request)
        {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // التحقق من أن الطلب ينتمي إلى المستخدم الحالي
        if (hndrequest.centerId != req.userId)
        {
            return res.status(403).json({ message: 'Unauthorized access to this request.' });
        }

        // التحقق من الحالة الحالية للطلب
        if (action === 'receive' && hndrequest.request.status !== 'Accepted')
        {
            return res.status(400).json({ message: 'Request must be accepted first.' });
        }

        // تحديث حالة الطلب استنادًا إلى الإجراء المحدد
        if (action === 'receive' && hndrequest.request.type !== 'Blood Donation')
        {
            hndrequest.request.status = 'Received';
            hndrequest.request.arrivalDate = new Date().toISOString();
            // البحث عن مخزن المركز في جدول CenterInventory
            const centerInventory = await CenterInventory.findOne({ centerId: hndrequest.centerId });
            if (!centerInventory.inventoryId)
            {
                const error = new Error(`Blood inventory not found for center ID: ${hndrequest.centerId}`);
                error.statusCode = 404;
                throw error;
            } else
            {
                // العثور على مخزن المركز، و تحديثه مع العناصر الجديدة
                const existingInventory = await BloodInventory.findById(centerInventory.inventoryId);
                const item = hndrequest.request.itemType;
                // التحقق من وجود العنصر في المخزون الحالي
                const existingItem = existingInventory.items.find(existing => existing.type === item);
                if (existingItem)
                {
                    existingItem.quantity -= hndrequest.request.quantity;
                } else
                {
                    const error = new Error(`Blood type ${item.type} not found in inventory.`);
                    error.statusCode = 400;
                    throw error;
                }
                await hndrequest.request.save();
                await existingInventory.save();
                sendNotification(hndrequest.requesterId.fcmToken, 'Request Status', 'Your request has been Received.');
            }
        } else if (action === 'receive' && hndrequest.request.type === 'Blood Donation')
        {

            hndrequest.request.status = 'Received';
            hndrequest.request.arrivalDate = new Date().toISOString();
            hndrequest.requesterId.lastDonationDate = new Date().toISOString();

            // البحث عن مخزن المركز في جدول CenterInventory
            const centerInventory = await CenterInventory.findOne({ centerId: hndrequest.centerId });
            if (!centerInventory)
            {
                const error = new Error(`Blood inventory not found for center ID: ${hndrequest.centerId}`);
                error.statusCode = 404;
                throw error;
            } else
            {
                // العثور على مخزن المركز، و تحديثه مع العناصر الجديدة
                const existingInventory = await BloodInventory.findById(centerInventory.inventoryId);
                const item = hndrequest.requesterId.bloodType;
                // التحقق من وجود العنصر في المخزون الحالي
                const existingItem = existingInventory.items.find(existing => existing.type === item);
                if (existingItem)
                {
                    existingItem.quantity += 1;
                } else
                {
                    const error = new Error(`Blood type ${item.type} not found in inventory.`);
                    error.statusCode = 400;
                    throw error;
                }

                await hndrequest.request.save();
                await existingInventory.save();
                await hndrequest.requesterId.save();
                sendNotification(hndrequest.requesterId.fcmToken, 'Request Status', 'Thank you for Donation .')
            }
        }
        else if (action === 'accept')
        {
            hndrequest.request.status = 'Accepted';
            hndrequest.request.arrivalDate = arrivalDate;
            await hndrequest.request.save();
            sendNotification(hndrequest.requesterId.fcmToken, 'Request Status', 'Your request has been Accepted.')
        } else if (action === 'reject')
        {
            hndrequest.request.status = 'Rejected';
            hndrequest.request.arrivalDate = 'Your request rejected.';
            await hndrequest.request.save();
            sendNotification(hndrequest.requesterId.fcmToken, 'Request Status', 'Your request has been Rejected.')
        } else
        {
            return res.status(400).json({ message: 'Invalid action.' });
        }



        // إرجاع رسالة النجاح
        res.status(200).json({ message: 'Request handled successfully.' });
    } catch (error)
    {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العام
    }
};




// Update a request by ID
exports.updateRequestById = async (req, res, next) =>
{
    try
    {
        const id = req.params.up;
        const { type, itemType, quantity } = req.body;
        const updateData = {};

        let request = await Request.findOne({ _id: id });
        if (!request)
        {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status != "Pending")
        {
            return res.status(401).json({ message: 'You can not change requset .' });
        } else
        {
            let imageUrl = request.image;
            // imageUrl = req.file ? '/images/' + req.file.filename : undefined;
            if (req.file)
            {
                imageUrl = '/images/' + req.file.filename;
                updateData.image = imageUrl;
            }
            if (!imageUrl && req.userType !== "Hospital" && type !== 'Blood Donation')
            {
                const error = new Error('No file picked.');
                error.statusCode = 422;
                throw error;
            }
            if (request.image && imageUrl !== request.image && type !== 'Blood Donation')
            {
                clearImage(request.image);
            }
            if (type) updateData.type = type;
            if (itemType) updateData.itemType = itemType;
            if (quantity) updateData.quantity = quantity;

            request = await Request.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).json({ message: 'Request updated successfully.', request });
        }


    } catch (error)
    {
        next(error);
    }
};



const clearImage = filePath =>
{
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err => { if (err) { console.log(err) } }));
};

