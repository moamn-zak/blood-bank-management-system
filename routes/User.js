const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authMiddleware = require('../middleware/isAuth');

const userController = require('../controllers/User');
const requestController = require('../controllers/Request');
const centerController = require('../controllers/BloodCenter');


const uservalidation = [
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('dateOfBirth').trim().notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format'),
    body('gender').trim().notEmpty().withMessage('Gender is required').isIn(['Male', 'Female']).withMessage('Invalid gender'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('bloodType').trim().notEmpty().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Blood type is Invalid'),
    body('weight').trim().notEmpty().withMessage('Weight is required').isNumeric().withMessage('Weight must be numeric'),
    body('medicalInfo').trim().optional({ nullable: true }).isString().withMessage('Medical info must be a string')
];

//  تسجيل حساب المستخدم
router.post('/signup', uservalidation, userController.signup);

router.post('/login', userController.login);

router.post('/request', authMiddleware, requestController.createRequest);

router.get('/getrequest/:status', authMiddleware, requestController.getRequest);

router.put('/updateRequest/:up', authMiddleware, requestController.updateRequestById);

router.delete('/deleteuser', authMiddleware, userController.deleteuser);

router.get('/getprofile', authMiddleware, userController.getprofile);

router.get('/getallusers', userController.getAllUsers);

router.post('/searchOnCity', centerController.searchOnCity)


module.exports = router;
