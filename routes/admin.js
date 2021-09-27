const express = require('express');
const flash = require("express-flash-messages");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");

// Router
const router = express.Router();

// Models
const User = require("../models").User;
const Tenant = require('../models').TenantTerm;

// Validator
const Joi = require('joi');

//
const baseController = require('../controllers/admin/BaseController');
const partnerController = require('../controllers/admin/PartnerController');

//
const auth = require('../middlewares/auth_middleware');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './public/uploads/partners/')
	},
	filename: async (req, file, cb) => {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
	}
});

var uploader = multer({
	storage: storage,
});


router.get('/', auth.admin, (req, res) => {
	res.redirect('/admin/home');
});

router.get('/login', (req, res, next) => {
	if(req.session.admin)
		res.redirect('/home')

	res.render('dashboards/admin/login', { layout: 'layouts/admin' });
})

router.post('/login', async (req, res, next) => {

	const schema = Joi.object({
		email: Joi.string().required(),
		password: Joi.string().required()
	});

	const validator = schema.validate(req.body);
	if(validator.error) {
		req.flash('warning', validator.error.message)
		res.redirect('back');
	}

	const user = await User.findOne({
		where: {
			email: {
				[Op.eq]: req.body.email
			}
		}
	});

	if(user) {
		if (bcrypt.compareSync(req.body.password, user.password)) {

            if(user.role_id == 1) {
            	req.session.userId = user.id;
	            req.session.admin = true;
	            req.session.email = user.email;
	            req.session.userRole = user.role_id;

	            res.redirect("/admin"); 
            }
            else {
            	req.flash('warning', "Account not recognized");
            	res.redirect("back");
            } 
        }
        else {
            req.flash('warning', "Password not correct");
            res.redirect("back");
         }
	}
	
	req.flash('warning', 'Email not correct');
	res.redirect('back');
});

router.get('/home', auth.admin, baseController.home);
router.get('/pairing', auth.admin, baseController.pairing);
router.get('/tenants', auth.admin, baseController.tenants)
router.get('/landlords', auth.admin, baseController.landlords);
router.get('/users/:status', auth.admin, baseController.users);
router.get('/pairing/:id', auth.admin, baseController.fetchMatchedLandlord)

// Properties

const videoStorage = multer.diskStorage({
	destination: function (req, file, cb) {
	    cb(null, './public/uploads/videos')
	},
	filename: function (req, file, cb) {
	    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
	}
})

	
const videoUploader = multer({ storage: videoStorage });

router.get('/properties', auth.admin, baseController.properties);
router.get('/properties/create', auth.admin, baseController.addProperty);
router.post('/properties/create', auth.admin, baseController.saveProperty);
router.get('/properties/upload', auth.admin, baseController.uploadPropertyForm);
router.get('/properties/videos', auth.admin, baseController.uploadProperties);
router.post('/properties/upload', videoUploader.single('file'), baseController.uploadProperty);
router.get('/short-terms-properties', auth.admin, baseController.shortProperties);

// Requests
router.get('/requests/:status', auth.admin, baseController.requests);
router.get('/requests/:id/reply', auth.admin, baseController.addReply);

// Partners
router.get('/partners', auth.admin, partnerController.partners);
router.get('/add-partner', auth.admin, partnerController.addPartner);
router.post('/add-partner', uploader.single('logo'), partnerController.savePartner);

// Payments
router.get('/payments', auth.admin, baseController.payments)


// Bookings
router.get('/bookings', auth.admin, baseController.bookings);
router.get('/surveys', auth.admin, baseController.surveys);
router.get('/surveys/:id', auth.admin, baseController.survey);

module.exports = router;