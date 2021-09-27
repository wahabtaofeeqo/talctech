const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const resizeOptimizeImages = require('resize-optimize-images');

// Models
const User = require("../../models").User;
const Tenant = require("../../models").TenantTerm;
const Landlord = require("../../models").LandlordTerm;
const Pairing = require("../../models").Pairing;
const RentProperty = require("../../models").RentProperty;
const Payment = require("../../models").Payment;
const Renter = require("../../models").Renter;

const initSession = (req) => {
    req.session.email = req.body.email;
    req.session.phone = req.body.phone;
    req.session.name  = req.body.name;  
    req.session.paymentReason = 'Registration';                            
}

exports.addProperty = async (req, res) => {
	res.render('dashboards/renters/addProperty', {
		layout: 'layouts/renter',
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
    	res.render('dashboards/renters/addProperty', {
			layout: 'layouts/renter',
			user: req.session.user || null,
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
	const payments = await Payment.findAll({
		where: {
			user_id: {
                [Op.eq]: req.session.userId
            }
		}
	});

	res.render('dashboards/renters/payments', {
		layout: 'layouts/renter',
		payments: payments,
		user: req.session.user || null
	});
}

// constants
const storage = multer
    .diskStorage({
        destination: "./public/uploads/shortproperties/",
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

		// if(req.files.image_front == "" || req.files.image_front == null || req.files.image_front == undefined) {
	 //        req.flash('warning', "Enter front image");
	 //        res.redirect("back");
	 //    }

        if((req.files.image_front == "" || req.files.image_front == null) && req.body.front == "") {
            req.flash('warning', "Upload front image OR select from the Default");
            res.redirect("back");
        } 

        const side = (req.files.image_side) ? req.files.image_side[0].filename : req.body.side;
        const rear = (req.files.image_rear) ? req.files.image_rear[0].filename : req.body.rear;
        const front = (req.files.image_front) ? req.files.image_front[0].filename : req.body.front;

		// Prep
		let user_id = req.session.userId;
	    let property_type = req.body.property;
	    let offer_type = req.body.offer;
	    let price = req.body.price;
	    let city = req.body.city;
	    let neighbourhood = req.body.neighbourhood;
	    let bedrooms = req.body.bedrooms;
	    let bathrooms = req.body.bathrooms;
	    let image_front = front;
        let image_side = side;
        let image_rear = rear;

	    // Save
	    const create = await RentProperty.create({
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

	    	const options = {
	            images: [
	            	`./public/uploads/shortproperties/${image_front}`,
	                `./public/uploads/shortproperties/${image_side}`,
	                `./public/uploads/shortproperties/${image_rear}`
	            ],
	            width: 800,
	            height: 500,
	            quality: 100
	        };

	        await resizeOptimizeImages(options);

	        req.flash('success', "Property added successfully");
	        res.redirect("/renter/properties");
	    }
	    else {
	    	req.flash('warning', "Property not added");
	        res.redirect("back");
	    }
	});	
}

exports.updateProperty = async (req, res) => {

}

exports.properties = async (req, res) => {
	RentProperty.findAll({
        where: {
            user_id: {
                [Op.eq]: req.session.userId
            }
        }
    })
    .then(properties => {
        res.render("dashboards/renters/properties", {
        	layout: 'layouts/renter',
        	user: req.session.user || null,
            properties: properties
        });
    })
    .catch(error => {
        req.flash('error', "Server error!");
        res.redirect("back");
    });
}

exports.home = async (req, res) => {

    const properties = await RentProperty.findAll({
        where: {
            user_id: {
                [Op.eq]: req.session.user.id
            }
        },
        limit: 5
    });

	res.render('dashboards/renters/index', { 
		layout: 'layouts/renter',
		edit: false,
        properties
	})
}

exports.register = async (req, res) => {

	let user = await User.findOne({
        where: {
            email: {
                [Op.eq]: req.body.email
            }
        }
    });

    if(user) {
    	res.json({
			error: true,
			message: 'Email has already been taken'
		})
    }

    user = await User.create({
    	name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 10),
        role_id: 4,
        status: true
    });

    if(user) {
    	const tenant = await Renter.create({
    		user_id: user.id,
            tenant_employment: req.body.employed,
            tenant_income: req.body.income,
            professionals: req.body.professional,
            smoker: req.body.smoker,
            drinker: req.body.drinker,
            electricity: req.body.electricity
    	})

    	if(tenant) {
    		req.session.userRole = 4;
    		// initSession(req);
    		res.json({
				error: false,
				message: 'Account created successfully',
                redirect: '/login'
			})
    	}
    	else {
    		res.json({
				error: true,
				message: 'Error occur. Please try again'
			})
    	}
    }
    else {
    	res.json({
			error: true,
			message: 'Account was not created'
		})
    }
}