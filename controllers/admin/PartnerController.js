const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const resizeOptimizeImages = require('resize-optimize-images');

// Models
const User = require("../../models").User;
const Tenant = require("../../models").TenantTerm;
const Landlord = require("../../models").LandlordTerm;
const Property = require("../../models").Property;
const Pairing = require("../../models").Pairing;
const Payment = require("../../models").Payment;
const RentProperty = require("../../models").RentProperty;
const PropertyVideo = require("../../models").PropertyVideo;
const Partner = require('../../models').Partner;



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

exports.partners = async (req, res) => {

	const partners = await Partner.findAll({});
	res.render('dashboards/admin/partners', {
		layout: 'layouts/adm',
		user: req.session.user,
		partners: partners
	})
}

exports.addPartner = async (req, res) => {
	res.render('dashboards/admin/addPartner', {
		layout: 'layouts/adm',
		user: req.session.user,
	})
}

exports.savePartner = async (req, res) => {

	const file = req.file;
	if(file) {

		await Partner.create({
			name: req.body.name,
			description: req.body.description,
			logo: file.filename
		});

		req.flash('success', "Partner has been added successfully");
	    res.redirect("back");
	}
	else {
		req.flash('warning', "Please select Partner Logo");
	    res.redirect("back");
	}
}