const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/isAuth');

const centerController = require('../controllers/BloodCenter');
const requestController = require('../controllers/Request');

router.post('/login', centerController.loginCenter);

router.post('/addToInventory', authMiddleware, centerController.addToInventory);

router.get('/getInventory', authMiddleware, centerController.getInventory);

router.get('/getprofile', authMiddleware, centerController.getprofile);

router.get('/getrequest/:model/:status', authMiddleware, requestController.getRequest);

router.post('/handleRequest/:requestId', authMiddleware, requestController.handleRequest)

router.get('/getAllBloodCenters', centerController.getAllBloodCenters)

router.post('/searchRequest', requestController.sercheRequest);

router.post('/searchOnCity', centerController.searchOnCity)

module.exports = router;
