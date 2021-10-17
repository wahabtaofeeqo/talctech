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
const Property = require("../../models").Property;
const RentProperty = require("../../models").RentProperty;
const Payment = require("../../models").Payment;

//
const Joi = require('joi');
const registerSchema = Joi.object({

})

const initSession = (req) => {
    req.session.email = req.body.email;
    req.session.phone = req.body.phone;
    req.session.name  = req.body.name;  
    req.session.paymentReason = 'Registration';                            
}

exports.home = async (req, res) => {

	const properties = await Property.findAll({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			}
		},
		limit: 5
	})

	const pairings = await Pairing.findAll({
        where: {
            "$property.user_id$": {
                [Op.eq]: req.session.user.id
            },
        },
        include: [
        	{
            	model: Property,
            	as: 'property',

	            include: [
	            	{
	                	model: User,
	                	as: 'user',
	            	}
	        	]
        	}, 
        ],
    });

	res.render('dashboards/landlords/index', { 
		layout: 'layouts/landlord',
		user: req.session.user,
		properties: properties,
		tenants: pairings
	})
}

exports.paired = async (req, res) => {

	const pairings = await Pairing.findAll({
        where: {
            "$property.user_id$": {
                [Op.eq]: req.session.user.id
            },
        },
        include: [
        	{
            	model: Property,
            	as: 'property',

	            include: [
	            	{
	                	model: User,
	                	as: 'user',
	            	}
	        	]
        	}, 
        ],
    });


    res.render('dashboards/landlords/paired', { 
		layout: 'layouts/landlord',
		user: req.session.user,
		pairings: pairings
	})
}

exports.properties = async (req, res) => {

	const properties = await Property.findAll({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			}
		},
	})

	res.render('dashboards/landlords/properties', { 
		layout: 'layouts/landlord',
		user: req.session.user,
		properties: properties
	})
}

exports.addProperty = async (req, res) => {

	// Check number of properties
	const properties = await Property.findAll({
	 	where: {
	 		user_id: {
	 			[Op.eq]: req.session.user.id
	 		}
	 	}
	});

	res.render('dashboards/landlords/addProperty', {
		layout: 'layouts/landlord',
		user: req.session.user,
		isFree: (properties.length >= 6) ? false: true,
		edit: false
	})
}

exports.editProperty = async (req, res) => {

	const property = await Property.findOne({
        where: {
            id: {
                [Op.eq]: req.params.id
            }
        }
    });

    if(property) {
    	res.render('dashboards/landlords/addProperty', {
			layout: 'layouts/landlord',
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

	const payments = await Payment.findAll({
		where: {
			user_id: {
                [Op.eq]: req.session.user.id
            }
		}
	});

	res.render('dashboards/landlords/payments', {
		layout: 'layouts/landlord',
		payments: payments,
		user: req.session.user || null
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

	 	// Check number of properties
	 	const properties = await Property.findAll({
	 		where: {
	 			user_id: {
	 				[Op.eq]: req.session.user.id
	 			}
	 		}
	 	});


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
	    let active = (properties.length >= 6) ? false : true;

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
	        active,
	        image_side,
	        image_rear
	    });

	    if(create) {

	    	const options = {
	            images: [
	            	`./public/uploads/properties/${image_front}`,
	                `./public/uploads/properties/${image_side}`,
	                `./public/uploads/properties/${image_rear}`
	            ],
	            width: 800,
	            height: 500,
	            quality: 100
	        };

	        await resizeOptimizeImages(options);
	        if(properties.length >= 6) {
	        	req.session.paymentReason = 'Property';
	        	req.session.property = create;

	        	res.redirect('/payment');
	        }

	        req.flash('success', "Property added successfully");
	        res.redirect("/landlord/properties");
	    }
	    else {
	    	req.flash('warning', "Property not added");
	        res.redirect("back");
	    }
	});	
}

exports.updateProperty = async (req, res) => {

}

exports.register = async (req, res) => {
	try {

		let landlord = null;
		let user = await User.findOne({
	        where: {
	            email: {
	                [Op.eq]: req.body.email
	            }
	        }
	    });

	    if(user) {

	    	landlord = await Landlord.findOne({
	    		where: {
	    			landlord_id: {
	    				[Op.eq]: user.id
	    			}
	    		}
	    	})

	    	if(landlord) {
	    		res.json({
                    error: true,
                    message: 'The email has been used for Landlord Account'
                });
	    	}
	    }
	    else {
	    	user = await User.create({
		    	name: req.body.name,
		        email: req.body.email,
		        phone: req.body.phone,
		        password: bcrypt.hashSync(req.body.password, 10),
		        role_id: 2
		    });
	    }

	    if(landlord == null) {
	    	landlord = await Landlord.create({
	    		landlord_id: user.id,
	            tenant_employment: req.body.employment,
	            tenant_income: req.body.income,
	            professionals: req.body.professional,
	            preference: req.body.preference,
	            smoker: req.body.smoke,
	            drinker: req.body.drink,
	            electricity: req.body.electricity
	    	})

	    	if(!user.email_verified) {
               try{
               	  let message = 'Thank you for signing up with TalcTech.'; 
                   message += 'You have one more step to go to complete the process.';
                   message +=  'Please click the link below to verify your email;'
                   message += `<a href="${req.protocol + '://' + req.headers.host + '/verify?email=' + user.email}">Verify</a>`;

                   emailService.sendMail(req.body.email, message);
               }
               catch(e) {
               	
               }
            }

	    	req.session.userRole = 2;
    		initSession(req);
    		res.json({
				error: false,
				message: 'Account created successfully',
				redirect: '/pay'
			})
	    }
	}
	catch(e) {
		res.json({
			error: true,
			stack: e,
			message: 'Error occur. Please try again'
		})
	}
}