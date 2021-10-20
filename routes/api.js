const express = require('express');
const flash = require("express-flash-messages");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Router
const router = express.Router();

//
const api = require('../controllers/API')
const auth = require('../middlewares/auth_middleware');
const authController = require('../controllers/AuthController');

router.post('/pair', auth.api, api.pair);
router.post('/logout', (req, res) => {
	req.session = null;
	res.json({
		error: false,
		message: 'logged out'
	})
});

router.post('/upgrade', api.upgrade);
router.post('/create-renter', api.createRenter);
router.post('/delete', api.deleteResource);
router.post('/add-criteria', api.addCriteria);
router.post('/update-criteria', api.updateCriteria);
router.post('/request-view', api.requestPropertyView);
router.post('/user-status', api.changeUserStatus);
router.post('/check-survey', api.checkSurvey);
router.post('/submit-survey', api.submitSurvey);
router.post('/login', authController.apiLogin);

module.exports = router;