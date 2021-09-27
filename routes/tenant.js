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
const baseController = require('../controllers/tenant/BaseController');

//
const auth = require('../middlewares/auth_middleware');

router.get('/', auth.tenant, baseController.home);
router.get('/paired', auth.tenant, baseController.paired);
router.get('/requests', auth.tenant, baseController.requests);
router.get('/bookings', auth.tenant, baseController.bookings);
router.get('/survey/:id', auth.tenant, baseController.survey);
router.get('/requests/:id', auth.tenant, baseController.requestResponse);
router.get('/payments', auth.tenant, baseController.payments);
router.get('/criterias', auth.tenant, baseController.criterias);
router.get('/criterias/:id', auth.tenant, baseController.editCriteria);
router.get('/add-criteria', auth.tenant, baseController.addCriteria);
router.get('/properties', auth.tenant, baseController.properties);
router.get('/paired-properties', auth.tenant, baseController.pairedProperties);
router.get('/short-terms-properties', auth.tenant, baseController.shortProperties);
router.post('/register', baseController.register);

module.exports = router;