const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const resizeOptimizeImages = require('resize-optimize-images');


// Models
const User = require("../models").User;
const Property = require("../models").Property;
const RentProperty = require("../models").RentProperty;

exports.propertyDetails = async (req, res) => {

	property = await Property.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		},
		include: {
			model: User,
			as: 'user'
		}
	});

	res.render('base/property', {
		user: req.session.user,
		property: property,
		isShortTerms: false,
	});
}

exports.shortTermsPropertyDetails = async (req, res) => {
	property = await RentProperty.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		},
		include: {
			model: User,
			as: 'user'
		}
	});

	res.render('base/property', {
		user: req.session.user,
		property: property,
		isShortTerms: true,
	});
}

exports.dashboard = async (req, res) => {

	if(req.session.user.role_id == 3 || req.session.user.role_id == 5) {
		res.redirect('/tenant');
	}
	else if(req.session.user.role_id == 4) {
		res.redirect('/renter');
	}
	else if(req.session.user.role_id == 1) {
		res.redirect('/admin');
	}
	else {
		res.redirect("/home");
	}
}

exports.prepVideo = async (req, res) => {
	res.send('Soon');
}