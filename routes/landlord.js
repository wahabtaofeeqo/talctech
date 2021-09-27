const express = require('express');
const flash = require("express-flash-messages");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Router
const router = express.Router();

// Models
const User = require("../models").User;
const Tenant = require('../models').TenantTerm;

// Validator
const Joi = require('joi');

//
const baseController = require('../controllers/landlord/BaseController');

//
const auth = require('../middlewares/auth_middleware');

router.get('/', auth.landlord, baseController.home);
router.get('/paired', auth.landlord, baseController.paired);
router.get('/properties', auth.landlord, baseController.properties);
router.get('/add-property', auth.landlord, baseController.addProperty);
router.post('/add-property', auth.landlord, baseController.saveProperty);
router.get('/edit-property/:id', auth.landlord, baseController.editProperty);
router.post('/edit-property', auth.landlord, baseController.updateProperty);
router.get('/payments', auth.landlord, baseController.payments);
router.post('/register', baseController.register);


module.exports = router;