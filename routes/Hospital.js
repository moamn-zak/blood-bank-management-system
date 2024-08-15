const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/isAuth');


const hospitalController = require('../controllers/Hospital');
const requestController = require('../controllers/Request');
const centerController = require('../controllers/BloodCenter');




// Route for hospital login
router.post('/loginHospital', hospitalController.loginHospital);

router.post('/request', authMiddleware, requestController.createRequest);

router.get('/getrequest/:status', authMiddleware, requestController.getRequest);

router.get('/getprofile', authMiddleware, hospitalController.getprofile);

router.get('/getAllHospitals', hospitalController.getAllHospitals);

router.post('/searchOnCity', centerController.searchOnCity)


module.exports = router;
