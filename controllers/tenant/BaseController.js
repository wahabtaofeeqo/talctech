const { Op } = require("sequelize");
const moment = require('moment');
const bcrypt = require("bcrypt");

// Models
const User = require("../../models").User;
const Tenant = require("../../models").TenantTerm;
const Landlord = require("../../models").LandlordTerm;
const Pairing = require("../../models").Pairing;
const Property = require("../../models").Property;
const RentProperty = require("../../models").RentProperty;
const Payment = require("../../models").Payment;
const Criteria = require("../../models").Criteria;
const PairCounter = require("../../models").PairCounter;
const Request = require("../../models").Request;
const PropertyVideo = require("../../models").PropertyVideo;
const Booking = require("../../models").Booking;


// Email Service
const emailService = require("../../services/EmailService");

const initSession = (req) => {
    req.session.email = req.body.email;
    req.session.phone = req.body.phone;
    req.session.name  = req.body.name;  
    req.session.paymentReason = 'Registration';                            
}


exports.paired = async (req, res) => {

	const landlords = await Pairing.findAll({
		where: {
			tenant_id: {
				[Op.eq]: req.session.userId
			},
		},
		include: {
			model: Property,
			as: 'property',
			include: {
				model: User,
				as: 'user'
			}
		}
	});

	res.render("dashboards/tenants/paired", { 
		landlords: landlords, 
		title: 'Properties Landlords',
		user: req.session.user, 
		layout: 'layouts/tenant' 
	});
}

exports.home = async (req, res) => {

	const booking = Booking.findOne({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			}
		}
	});

	const properties = await Property.findAll({
		limit: 4
	});

	res.render('dashboards/tenants/index', { 
		layout: 'layouts/tenant',
		user: req.session.user,
		properties: properties,
	})
}

exports.properties = async (req, res) => {

	const properties = await Property.findAll({
		limit: 6
	});

	res.render('dashboards/tenants/properties', { 
		layout: 'layouts/tenant',
		user: req.session.user,
		properties: properties,
		title: 'Properties',
		type: 'normal'
	})
}

exports.shortProperties = async (req, res) => {

	const properties = await RentProperty.findAll({
		limit: 6
	});

	res.render('dashboards/tenants/properties', { 
		layout: 'layouts/tenant',
		user: req.session.user,
		properties: properties,
		title: 'Short Terms Properties',
		type: 'short'
	})
}

exports.payments = async (req, res) => {
	const payments = await Payment.findAll({
		where: {
			user_id: {
                [Op.eq]: req.session.userId
            }
		}
	});

	res.render('dashboards/tenants/payments', {
		layout: 'layouts/tenant',
		payments: payments,
		user: req.session.user
	});
}

const pairMatchingProperties = async (user, criteria) => {

	const properties = await Property.findAll({
		where: {
			property_type: criteria.property_type,
			offer_type: criteria.offer_type,
			neighbourhood: criteria.neighbourhood,
			city: criteria.city
		},
		include: {
			model: User,
			as: 'user'
		}
	});

	let paired = 0;
	let pairCount = null;

	// Add to pairing of the day
	for(let i = 0; i < properties.length; i++) {
		const item = properties[i];


		// Check if the property has not been paired
		let isPaired = await Pairing.findOne({
			where: {
				tenant_id: user.id,
				property_id: item.id
			}
		});

		if(!isPaired) {

			await Pairing.create({
				tenant_id: user.id,
				property_id: item.id,
			})

			paired++;

			// Notify
			emailService.sendMail(item.user.email, 'You have been paired with a new Tenant');
			emailService.sendMail(req.user.email, 'You have been paired with a new Landlord');

			pairCount = await PairCounter.findOne({
				where: {
					user_id: user.id,
					dated: moment().format('YYYY-MM-DD')
				}
			});

			if(pairCount) {
				await pairCount.update({
					count: pairCount.count + 1
				},
				{
					where: {
						id: pairCount.id
					}
				})
			}
			else {
				await PairCounter.create({
					user_id: user.id,
					count: 1,
					dated: moment().format('YYYY-MM-DD')
				});
			}
		}

		// Stop looping if we have paired twice
		if(paired >= 2)
			break;
	}
}

exports.pairedProperties = async (req, res) => {

	// Find pairing for Today
	const pairCount = await PairCounter.findOne({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			},
			dated: {
				[Op.eq]: moment().format('YYYY-MM-DD')
			}
		}
	});

	// Get Criteria
	const criteria = await Criteria.findOne({
		where: {
			user_id: {
				[Op.eq]: req.session.userId
			}
		}
	});

	if(criteria) {

		// Process Pairing for Today
		if(pairCount && pairCount.count < 2) {
			await pairMatchingProperties(req.session.user, criteria);
		}

		// Get Paired Properties
		const properties = await Pairing.findAll({
			where: {
				tenant_id: req.session.userId,
				property_id: {
					[Op.ne]: null
				}
			},
			include: {
				model: Property,
				as: 'property'
			}
		})

		res.render('dashboards/tenants/properties', { 
			layout: 'layouts/tenant',
			user: req.session.user,
			properties: properties,
			title: 'Paired Properties',
			type: ''
		});
	}
	else {
		res.render('dashboards/tenants/properties', { 
			layout: 'layouts/tenant',
			user: req.session.user,
			properties: [],
			message: 'Criteria not set',
			title: 'Paired Properties',
			type: ''
		});
	}
}

exports.addCriteria = async (req, res) => {

}

exports.editCriteria = async (req, res) => {

	const criteria = await Criteria.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		}
	});

	if(criteria) {
		res.render('dashboards/tenants/addCriteria', { 
			layout: 'layouts/tenant',
			user: req.session.user,
			criteria: criteria,
			title: 'criteria',
		})
	}
	else {
		req.flash('warning', 'Criteria ID not recognized');
		res.redirect('back');
	}
}

exports.updateCriteria = async (req, res) => {

}

exports.criterias = async (req, res) => {

	const criteria = await Criteria.findOne({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			}
		}
	});

	res.render('dashboards/tenants/criterias', { 
		layout: 'layouts/tenant',
		user: req.session.user,
		criteria: criteria,
		title: 'criteria',
	})
}

exports.requestView = async (req, res) => {

	const property = await Property.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		},
	})

	if(property) {

	}
	else {
		res.redirect('/404');
	}
}

exports.requests = async (req, res) => {

	const requests = await Request.findAll({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			}
		},
		include: {
			model: Property,
			as: 'property'
		}
	});

	res.render('dashboards/tenants/requests', { 
		layout: 'layouts/tenant',
		user: req.session.user,
		requests: requests,
		title: 'Requests',
	})
}

exports.requestResponse = async (req, res) => {

	const response = await PropertyVideo.findOne({
		where: {
			request_id: {
				[Op.eq]: req.params.id
			}
		}
	})

	if(response) {
		res.render('dashboards/tenants/request', { 
			layout: 'layouts/tenant',
			user: req.session.user,
			response: response,
			title: 'Request Response',
		})
	}
	else {
		req.flash('warning', 'No Response Found for this Request');
		res.redirect('back');
	}
}


exports.bookings = async (req, res) => {

	const bookings = await Booking.findAll({
		where: {
			user_id: {
				[Op.eq]: req.session.user.id
			}
		},
		include: {
			model: RentProperty,
			as: 'property'
		}
	})

	if(bookings) {
		res.render('dashboards/tenants/bookings', { 
			layout: 'layouts/tenant',
			user: req.session.user,
			bookings: bookings,
			title: 'Bookings',
		})
	}
	else {
		req.flash('warning', 'No Bookings');
		res.redirect('back');
	}
}

exports.survey = async (req, res) => {

	const booking = await Booking.findOne({
		where: {
			id: {
				[Op.eq]: req.params.id
			}
		},
		include: {
			model: RentProperty,
			as: 'property'
		}
	})

	res.render('dashboards/tenants/survey', { 
		layout: 'layouts/tenant',
		user: req.session.user,
		booking: booking,
		title: '',
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
        role_id: 3
    });

    if(user) {
    	const tenant = await Tenant.create({
    		tenant_id: user.id,
            tenant_employment: req.body.employment,
            tenant_income: req.body.income,
            professionals: req.body.professional,
            smoker: req.body.smoke,
            drinker: req.body.drink,
            electricity: req.body.electricity
    	})

    	if(tenant) {
    		req.session.userRole = 3;
    		initSession(req);
    		res.json({
				error: false,
				message: 'Account created successfully',
				redirect: '/pay'
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