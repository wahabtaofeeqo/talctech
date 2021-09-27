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
const Request = require("../../models").Request;
const Survey = require("../../models").Survey;
const Booking = require("../../models").Booking;


exports.fetchMatchedLandlord = async (req, res) => {

	const tenantID = req.params.id;
	const tenant = await Tenant.findOne({
		where: {
			tenant_id: {
				[Op.eq]: tenantID
			}
		},
		include: {
			model: User,
			as: 'user'
		}
	});


	if(tenant) {
		const landlords = await Landlord.findAll({
			where: {
				tenant_income: {
					[Op.lte]: tenant.income
				},
				professionals: {
					[Op.eq]: tenant.employed
				}
			},
			include: {
				model: User,
				as: 'user'
			}
		})

		res.render('dashboards/admin/matched', {
			layout: 'layouts/adm',
			landlords: landlords,
			tenant: tenant
		})
	}
}

exports.pairing = async (req, res) => {
	
	const tenants = await User.findAll({
		role_id: 3
	});

	res.render("dashboards/admin/pairing", { 
		tenants: tenants, 
		title: 'Available Tenants', 
		layout: 'layouts/adm' });
}

exports.home = async (req, res) => {

	const users = await User.count();
	const tenants = await Tenant.count();
	const landlords = await Landlord.count();
	const propertiesCount = await Property.count();

	const properties = await Property.findAll({
		limit: 10
	});

	res.render('dashboards/admin/index', { 
		layout: 'layouts/adm',
		user: req.session.user,
		totalUser: users,
		totalLandlord: landlords,
		totalTenant: tenants,
		totalProperty: propertiesCount,
		properties: properties,
	})
}

exports.users = async (req, res) => {

	const users = await User.findAll({
		where: {
			status: {
				[Op.eq]: req.params.status
			}
		}
	});

	res.render('dashboards/admin/users', { 
		layout: 'layouts/adm',
		user: req.session.user,
		users: users,
		status: req.params.status,
		title: (req.params.status == 1) ? 'Active users' : 'Inactive Users'
	})
}


exports.tenants = async (req, res) => {

	const tenants = await User.findAll({
		where: {
			role_id: {
				[Op.or]: [3, 5]
			},
		}
	});

	res.render('dashboards/admin/tenants', { 
		layout: 'layouts/adm',
		user: req.session.user,
		tenants: tenants,
		title: 'Tenants'
	})
}


exports.landlords = async (req, res) => {

	const landlords = await User.findAll({
		where: {
			role_id: {
				[Op.eq]: 2
			}
		}
	});

	res.render('dashboards/admin/landlords', { 
		layout: 'layouts/adm',
		user: req.session.user,
		landlords: landlords,
		title: 'Landlord'
	})
}

exports.properties = async (req, res) => {

	const properties = await Property.findAll({});

	res.render('dashboards/admin/properties', { 
		layout: 'layouts/adm',
		user: req.session.user,
		properties: properties,
		title: 'Properties',
		type: 'normal'
	})
}

exports.shortProperties = async (req, res) => {

	const properties = await RentProperty.findAll({});

	res.render('dashboards/admin/properties', { 
		layout: 'layouts/adm',
		user: req.session.user,
		properties: properties,
		title: 'Short Terms Properties',
		type: 'short'
	})
}

exports.addProperty = async (req, res) => {
	res.render('dashboards/admin/addProperty', {
		layout: 'layouts/adm',
		user: req.session.user || null,
		edit: false
	})
}

exports.editProperty = async (req, res) => {

	const property = await RentProperty.findOne({
        where: {
            id: {
                [Op.eq]: req.params.id
            }
        }
    });

    if(property) {
    	res.render('dashboards/admin/addProperty', {
			layout: 'layouts/adm',
			user: req.session.user,
			edit: true,
			property: property
		})
    }
    else {
    	req.flash('error', "Invalid property!");
        res.status(404).render('base/404');
    }
}

exports.payments = async (req, res) => {
	
	const payments = [];

	res.render('dashboards/admin/payments', {
		layout: 'layouts/adm',
		payments: payments,
		user: req.session.user
	});
}

// constants
const storage = multer
    .diskStorage({
        destination: "./public/uploads/properties/",
        filename: async function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        },
    });

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|JPEG|JPG|PNG|GIF/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Images only!"));
    }
}

// init upload 
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields([{
        name: 'image_front'
    },
    {
        name: 'image_side'
    },
    {
        name: 'image_rear'
    }
]);

exports.saveProperty = async (req, res) => {

	upload(req, res, async (e) => {
		if(e) {
			req.flash('error', "Check images and try again!");
            res.redirect("back");
		}

		if(req.files.image_front == "" || req.files.image_front == null || req.files.image_front == undefined) {
	        req.flash('warning', "Enter front image");
	        res.redirect("back");
	    }

		// Prep
		let user_id = req.session.userId;
	    let property_type = req.body.property;
	    let offer_type = req.body.offer;
	    let price = req.body.price;
	    let city = req.body.city;
	    let neighbourhood = req.body.neighbourhood;
	    let bedrooms = req.body.bedrooms;
	    let bathrooms = req.body.bathrooms;
	    let image_front = req.files.image_front[0].filename;
	    let image_side = req.files.image_side[0].filename;
	    let image_rear = req.files.image_rear[0].filename;

	    // Save
	    const create = await Property.create({
	        user_id,
	        property_type,
	        offer_type,
	        price,
	        city,
	        neighbourhood,
	        bedrooms,
	        bathrooms,
	        image_front,
	        image_side,
	        image_rear
	    });

	    if(create) {

	    	// const options = {
	     //        images: [
	     //        	`./public/uploads/shortproperties/${image_front}`,
	     //            `./public/uploads/shortproperties/${image_side}`,
	     //            `./public/uploads/shortproperties/${image_rear}`
	     //        ],
	     //        width: 800,
	     //        height: 500,
	     //        quality: 100
	     //    };

	     //    await resizeOptimizeImages(options);

	     console.log('hello WOrld');

	        req.flash('success', "Property added successfully");
	        res.redirect("back");
	    }
	    else {
	    	req.flash('warning', "Property not added");
	        res.redirect("back");
	    }
	});	
}

exports.updateProperty = async (req, res) => {

}

exports.uploadPropertyForm = async (req, res) => {
	res.render('dashboards/admin/uploadProperty', {
		layout: 'layouts/adm',
		user: req.session.user,
		request: null
	})
}

exports.uploadProperty = async (req, res) => {

	if(req.file) {

		const video = await PropertyVideo.create({
			name: req.body.name,
			description: req.body.description,
			filename: req.file.filename,
			user_id: req.body.tenant_id, // if Specified
			request_id: req.body.request_id
		});

		if(req.body.request_id) {
			// Update request status
			await Request.update({
				status: true
			},
			{
				where: {
					id: {
						[Op.eq]: req.body.request_id
					}
				}
			})
		}

		req.flash('success', 'Video uploaded successfully');
		res.redirect('back');
	}
	else {
		req.flash('warning', 'Please select a video to upload');
		res.redirect('back');
	}
}

exports.uploadProperties = async (req, res) => {

	const properties = await PropertyVideo.findAll({});
	res.render('dashboards/admin/uploaded', {
		layout: 'layouts/adm',
		user: req.session.user,
		videos: properties
	})
}

exports.requests = async (req, res) => {

	const requests = await Request.findAll({
		where: {
			status: {
				[Op.eq]: req.params.status
			}
		},
		include: {
			model: User,
			as: 'user',
		}
	});

	res.render('dashboards/admin/requests', {
		layout: 'layouts/adm',
		user: req.session.user,
		requests: requests,
		status: req.params.status
	})
}

exports.addReply = async (req, res) => {

	const request = await Request.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		},
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: Property,
				as: 'property'
			}
		]
	});

	res.render('dashboards/admin/uploadProperty', {
		layout: 'layouts/adm',
		user: req.session.user,
		request: request
	})
}


exports.bookings = async (req, res) => {

	const bookings = await Booking.findAll({
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: RentProperty,
				as: 'property'
			}
		]
	});

	res.render('dashboards/admin/bookings', {
		layout: 'layouts/adm',
		user: req.session.user,
		bookings: bookings
	})
}


exports.surveys = async (req, res) => {

	const surveys = await Survey.findAll({
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: RentProperty,
				as: 'property',
			}
		]
	});

	res.render('dashboards/admin/surveys', {
		layout: 'layouts/adm',
		user: req.session.user,
		surveys: surveys
	})
}

exports.survey = async (req, res) => {

	const survey = await Survey.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		},
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: RentProperty,
				as: 'property',
			}
		]
	});

	if(survey) {
		res.render('dashboards/admin/survey', {
			layout: 'layouts/adm',
			user: req.session.user,
			survey: survey
		})
	}
	else {
		req.flash('warning', 'Survey ID not recognized');
		res.redirect('back');
	}
}