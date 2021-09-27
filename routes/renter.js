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
const baseController = require('../controllers/renter/BaseController');

//
const auth = require('../middlewares/auth_middleware');

router.get('/', auth.renter, baseController.home);
router.get('/register', baseController.register);
router.get('/properties', auth.renter, baseController.properties);
router.get('/add-property', auth.renter, baseController.addProperty);
router.post('/add-property', auth.renter, baseController.saveProperty);
router.get('/edit-property/:id', auth.renter, baseController.editProperty);
router.post('/edit-property', auth.renter, baseController.updateProperty);
router.get('/payments', auth.renter, baseController.payments);
router.post('/register', baseController.register);


module.exports = router;