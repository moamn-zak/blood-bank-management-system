const express = require('express');
const { body } = require('express-validator');


const authMiddleware = require('../middleware/isAuth');


const adminController = require('../controllers/Admin');
const centerController = require('../controllers/BloodCenter');
const hospitalController = require('../controllers/Hospital');
const firebasecontroller = require('../controllers/firebaseService');


const centervalidation = [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required').withMessage('Phone must be '),
    body('location').trim().optional({ nullable: true }).notEmpty().withMessage('Location must be'),
    body('workingHours').trim().optional({ nullable: true }).isString().withMessage('Working hours must be a string'),
    body('additionalInfo').trim().optional({ nullable: true }).isString().withMessage('Additional info must be a string')
];

const hospitalvalidation = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required').withMessage('Phone must be numeric')
];

const router = express.Router();

//  التسجيل وتسجيل الدخول للمدير

router.post('/signup', adminController.signup);
router.post('/login', adminController.login);



//  إنشاء حساب المركز
router.post('/createCenterAccount', centervalidation, authMiddleware, centerController.createCenterAccount);


router.put('/updateCenterInfo/:centerId', authMiddleware, centerController.updateCenterInfo)

router.delete('/deletebloodcenter/:centerId', authMiddleware, centerController.deletebloodcenter)

//  إنشاء حساب المستشفى
router.post('/createHospitalAccount', hospitalvalidation, authMiddleware, hospitalController.createHospitalAccount);

router.put('/updateHospitalInfo/:hospitalId', authMiddleware, hospitalController.updateHospitalInfo);

router.delete('/deletehospital/:hospitalId', authMiddleware, hospitalController.deletehospital)

//  استرجاع كل مراكز الدم
router.get('/getAllBloodCenters', centerController.getAllBloodCenters);


//  استرجاع كل المشافي
router.get('/getAllHospitals', hospitalController.getAllHospitals);


router.post('/brodcastNotification', authMiddleware, firebasecontroller.brodcastNotification)

module.exports = router;


