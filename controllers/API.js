const { Op } = require("sequelize");
const moment = require('moment');
const axios = require('axios');

// Models
const User = require("../models").User;
const Pairing = require("../models").Pairing;
const Criteria = require("../models").Criteria;
const Tenant = require("../models").TenantTerm;
const Landlord = require("../models").LandlordTerm;
const PairCounter = require("../models").PairCounter;
const Request = require("../models").Request;
const Property = require("../models").Property;
const Survey = require("../models").Survey;
const Booking = require("../models").Booking;
const RentProperty = require("../models").RentProperty;

// Services
const emailService = require("../services/EmailService");

// Header
const header = {
    headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + process.env.RAVE_SECRET_KEY
    }
}

const incrementCount = async (landlordCount, tenantCount, landlordID, tenantID) => {

	// Landlord
	if(landlordCount) {
		await PairCounter.update({count: landlordCount.count + 1}, {
			where: {
				id: {
					[Op.eq]: landlordCount.id
				}
			}
		})
	}
	else {
		await PairCounter.create({
			user_id: landlordID,
			count: 1,
			dated: moment().format('YYYY-MM-DD')
		});
	}

	// Tenant
	if(tenantCount) {
		await PairCounter.update({count: tenantCount.count + 1}, {
			where: {
				id: {
					[Op.eq]: tenantCount.id
				}
			}
		})
	}
	else {
		await PairCounter.create({
			user_id: tenantID,
			count: 1,
			dated: moment().format('YYYY-MM-DD')
		});
	}
}


// Paring
exports.pair = async (req, res) => {

	const tenantID = req.body.tenantId;
	const landlordID = req.body.landlordId;

	const tenant = await Tenant.findOne({
		where: {
			id: {
				[Op.eq]: tenantID
			}
		},
		include: {
			model: User,
			as: 'user'
		}
	});

	const landlord = await Landlord.findOne({
		where: {
			id: {
				[Op.eq]: landlordID
			}
		},
		include: {
			model: User,
			as: 'user'
		}
	})

	if(tenant) {
		if(landlord) {

			const today = moment().format('YYYY-MM-DD');
			// Get landlord pair count for the Day
			const lc = await PairCounter.findOne({
				where: {
					user_id: {
						[Op.eq]: landlord.user.id
					},
					dated: {
						[Op.eq]: today
					}
				}
			})

			if(lc && lc.count >= 2) {
				res.json({
					error: true,
					message: 'This Landlord has been paired Twice Today'
				})
			}

			// Get Tenant pair count for the Day
			const tc = await PairCounter.findOne({
				where: {
					user_id: {
						[Op.eq]: tenant.user.id
					},
					dated: {
						[Op.eq]: today
					}
				}
			})

			if(tc && tc.count >= 2) {
				res.json({
					error: true,
					message: 'This Tenant has been paired Twice Today'
				})
			}

			const check = await Pairing.findOne({
				tenant_id: tenant.user.id,
				landlord_id: landlord.user.id,
			})

			if(check) {
				res.json({
					error: true,
					message: 'Landlord has previously been paired with this Tenant'
				})
			}

			// // Pair them
			const p = await Pairing.create({
				tenant_id: tenant.id,
				landlord_id: landlord.id,
				property_id: null
			});

			//
			await incrementCount(lc, tc, landlord.user.id, tenant.user.id);

			await emailService.sendMail(tenant.user.email);
			await emailService.sendMail(landlord.user.email, '');

			res.json({
				error: false,
				message: 'Tenant has been successfully paired with Landlord'
			});
		}
		else {
			res.json({
				error: true,
				message: 'Landlord ID not recognized'
			})
		}
	}
	else {
		res.json({
			error: true,
			message: 'Tenant ID not recognized'
		})
	}
}
// End Paring


// Upgrade Account
const cancelSubscription = async (req, res, id) => {
	
	const url = 'https://api.flutterwave.com/v3/subscriptions/' + id + '/cancel';
	axios.put(url, {}, header)
		.then(response => {
			if(response.data.status == 'success') {

				// Redirec to payment route
				req.session.paymentReason = 'Upgrade';
				res.json({
					error: false,
					message: 'Subscription Canceled'
				})
			}
			else {
				res.json({
					error: true,
					message: 'Could not cancel current Subscription'
				})
			}
		})
		.catch(e => {
			res.json({
				error: true,
				message: e.message
			})
		})
}

exports.upgrade = async (req, res) => {

	axios.get('https://api.flutterwave.com/v3/subscriptions', header)
        .then(async (response) => {

        	for(let i = 0; i < response.data.data.length; i++) {
        		let item = response.data.data[i];
            	if(item.customer.customer_email == req.session.user.email) {
            		cancelSubscription(req, res, item.id)
					break;
            	}
        	}
        })
        .catch(e => {
            res.json({
            	error: true,
            	message: e.message
            })
        });
}


// Upgrade Account
exports.createRenter = async (req, res) => {

	res.json({
		error: true,
		message: 'Could not upgrade Account'
	})
}


exports.deleteResource = async (req, res) => {

	const id = req.body.id;
	const type = req.body.type;

	if(type == 'user') {
		await User.destroy({
			where: {
				id: {
					[Op.eq]: id
				}
			}
		})
	}

	res.json({
		error: true,
		message: 'Resourse Delete successfully'
	})
}

exports.addCriteria = async (req, res) => {

	let user_id = req.session.userId;
    let property_type = req.body.property;
    let offer_type = req.body.offer;
    let price = req.body.price;
    let city = req.body.city;
    let neighbourhood = req.body.neighbourhood;
    let bedrooms = req.body.bedrooms;
    let bathrooms = req.body.bathrooms;

    const criteria = await Criteria.create({
        user_id,
        property_type,
        offer_type,
        price,
        city,
        neighbourhood,
        bedrooms,
        bathrooms
    });

    if(criteria) {
    	res.json({
    		error: false,
    		message: 'Criteria created successfully'
    	})
    }
    else {
    	res.json({
			error: true,
			message: 'Could not create Criteria. Please try again'
		})
    }
}


exports.updateCriteria = async (req, res) => {

	let user_id = req.session.userId;
    let property_type = req.body.property;
    let offer_type = req.body.offer;
    let price = req.body.price;
    let city = req.body.city;
    let neighbourhood = req.body.neighbourhood;
    let bedrooms = req.body.bedrooms;
    let bathrooms = req.body.bathrooms;

    const criteria = await Criteria.update({
        property_type,
        offer_type,
        price,
        city,
        neighbourhood,
        bedrooms,
        bathrooms
    },
    {
    	where: {
    		id: {
    			[Op.eq]: req.body.id
    		}
    	}
    });


    if(criteria) {
    	res.json({
    		error: false,
    		message: 'Criteria updated successfully'
    	})
    }
    else {
    	res.json({
			error: true,
			message: 'Could not update Criteria. Please try again'
		})
    }
}

exports.requestPropertyView = async (req, res) => {

	const id = req.body.id;

	//check if user have not requested before
	const property = await Property.findOne({
		where: {
			id: {
				[Op.eq]: id
			}
		}
	})

	if(property) {

		const check = await Request.findOne({
			where: {
				property_id: {
					[Op.eq]: id
				},
				user_id: {
					[Op.eq]: req.session.user.id
				}
			}
		})

		if(check) {
			res.json({
				error: true,
				message: 'You have Requested view before'
			})
		}
		else {
			await Request.create({
				user_id: req.session.user.id,
				property_id: id,
			})

			res.json({
				error: false,
				message: 'Requested sent successfully'
			})
		}
	}
	else {
		res.json({
			error: true,
			message: 'Property ID not recognized'
		})
	}
}

exports.changeUserStatus = async (req, res) => {

	const type = req.body.type;
	console.log(type);
	
	if(type == 'suspend') {
		await User.update({
			suspended: 1,
		},
		{
			where: {
				id: {
					[Op.eq]: req.body.id
				}
			}
		})
	}

	if(type == 'activate') {
		await User.update({
			status: 1,
		},
		{
			where: {
				id: {
					[Op.eq]: req.body.id
				}
			}
		})
	}

	res.json({
		error: false,
		message: 'User Staus updated successfully'
	})
}

exports.checkSurvey = async (req, res) => {

	const booking = await Booking.findOne({
		where: {
			id: {
				[Op.eq]: req.body.id
			}
		},
		include: {
			model: RentProperty,
			as: 'property'
		}
	})

	if(booking) {
		const survey = await Survey.findOne({
			where: {
				user_id: {
					[Op.eq]: req.session.user.id
				},
				property_id: booking.property.id
			}
		}) 

		if(survey) {
			res.json({
				status: false,
				message: 'You have taken survey on this already'
			})
		}
		else {
			res.json({
				status: true,
				message: 'Take survey'
			})
		}
	}
	else {
		res.json({
			status: false,
			message: 'Booking ID not recognized'
		})
	}
}

exports.submitSurvey = async (req, res) => {

	try {

		const check = await Survey.findOne({
			where: {
				user_id: {
					[Op.eq]: req.session.user.id
				},
				property_id: {
					[Op.eq]: req.body.property_id
				}
			}
		});

		if(!check) {
			const survey = await Survey.create({
				user_id: req.session.user.id,
				property_id: req.body.property_id,
				answer1: req.body.answer1,
				answer2: req.body.answer2,
				answer3: req.body.answer3,
				answer4: req.body.answer4
			});
		}
		
		res.json({
			error: false,
			message: 'Thanks for Submitting'
		})
	}
	catch(e) {
		res.json({
			error: true,
			message: e.message
		})
	}
}