const { Op } = require("sequelize");

// Models
const User = require("../models").User;
const Tenant = require("../models").TenantTerm;
const Landlord = require("../models").LandlordTerm;
const Property = require("../models").Property;
const Pairing = require("../models").Pairing;
const Payment = require("../models").Payment;
const RentProperty = require("../models").RentProperty;
const PropertyVideo = require("../models").PropertyVideo;
const Partner = require("../models").Partner;


exports.index = async (req, res, next) => {

    // // Prep
    let properties = [];
    let partners = [];
    let isShortTerms = false;
    const type = req.query.type;
    const kind = req.query.kind;
    
    try {
            
        if(type && kind) {
            if(kind == 1) {
                if(type == 1) {
                    properties = await Property.findAll({
                        where: {
                            offer_type: {
                                [Op.eq]: 'Rent'
                            }
                        },
                        include: {
                            model: User,
                            as: 'user'
                        },
                        limit: 9
                    });
                }
                else {
                    properties = await Property.findAll({
                        where: {
                            offer_type: {
                                [Op.eq]: 'Sell'
                            }
                        },
                        include: {
                            model: User,
                            as: 'user'
                        },
                        limit: 9
                    });
                }
            }
            else {
                properties = await RentProperty.findAll({
                    include: {
                        model: User,
                        as: 'user'
                    },
                    limit: 9
                });
    
                isShortTerms = true;
            }
            
        }
        else {
            properties = await Property.findAll({
                include: {
                    model: User,
                    as: 'user'
                },
                limit: 9
            });
        }
    
        partners = await Partner.findAll({});
    }
    catch(e) {
      
    }

    res.render("base/index", {
        user: req.session.user,
        properties: properties,
        partners: partners,
        isShortTerms
    });
}

exports.login = (req, res, next) => {
    res.render("auths/login", {
        user: req.session.user,
    });
}

exports.register = (req, res, next) => {
    res.render("auths/register", {
        user: req.session.user,
    });
}

exports.about = (req, res, next) => {
    res.render("base/about",  {
        user: req.session.user,
    });
}

exports.contact = (req, res, next) => {
    res.render("base/contact", {
        user: req.session.user,
    });
}

exports.feature = (req, res, next) => {
    res.render("base/feature");
}

exports.reset = (req, res, next) => {
    res.render("auths/reset", {
        user: req.session.user,
    });
}

exports.criteria = (req, res, next) => {
    res.render("auths/auth_criteria", {
        user: req.session.user,
    });
}

exports.rentals = async (req, res, next) => {
    
    let properties;
    
    try {
        
        properties = await RentProperty.findAll({
            include: {
                model: User,
                as: 'user'
            },
        });
    }
    catch(e) {
        
    }
    
    res.render("base/rentals", {
        properties: properties,
        user: req.session.user
    });
}

exports.terms = (req, res, next) => {
    res.render("base/terms", {
        user: req.session.user,
    });
}