// package imports
const Sequelize = require("sequelize");

// local imports
const Criteria = require("../models").Criteria;
const Users = require("../models").User;
const Property = require("../models").Property;
const Pairing = require("../models").Pairing;

// imports initialization
const Op = Sequelize.Op;


exports.countTenantsPage = (req, res, next) => {
    Pairing.findAll({
        where: {
            "$property.user_id$": {
                [Op.eq]: req.session.userId
            },
        },
        include: [{
            model: Property,
            as: 'property',
            include: [{
                model: Users,
                as: 'user',
            }]
        }, ],
    })
    .then(pairings => {
        const uniqueTenants = [...new Map(pairings.map(item => [item.tenant_id, item])).values()];
        res.render("dashboards/landlords/landlord_tenant_values", {
            pairings: uniqueTenants
        });
    })
    .catch(error => {
        req.flash("error", "Server error, try again!");
        res.redirect("back");
    });
}

exports.compactibleTenantPage = (req, res, next) => {
    Pairing.findAll({
        where: {
            [Op.and]: [{
                "$property.user_id$": {
                    [Op.eq]: req.session.userId
                },
            }, {
               "$user.role_id$": 3
            }],

            
        },
        include: [{
            model: Property,
            as: 'property',
            include: [{
                model: Users,
                as: 'user',
            }]
        }, 
        {
            model: Users,
            as: 'user'
        }
     ],
    })
    .then(pairings => {
        const uniqueTenants = [...new Map(pairings.map(item => [item.tenant_id, item])).values()];
        res.render("dashboards/landlords/landlord_tenants", {
            tenants: uniqueTenants
        });
    })
    .catch(error => {
        req.flash("error", "Server error, try again!");
        res.redirect("back");
    });
}

exports.compactibleExecTenantPage = (req, res, next) => {
    Pairing.findAll({
        where: {
            [Op.and]: [{
                "$property.user_id$": {
                    [Op.eq]: req.session.userId
                },
            }, {
               "$user.role_id$": 5
            }],

            
        },
        include: [{
            model: Property,
            as: 'property',
            include: [{
                model: Users,
                as: 'user',
            }]
        }, 
        {
            model: Users,
            as: 'user'
        }
     ],
    })
    .then(pairings => {
        const uniqueTenants = [...new Map(pairings.map(item => [item.tenant_id, item])).values()];
        res.render("dashboards/landlords/landlord_tenants", {
            tenants: uniqueTenants
        });
    })
    .catch(error => {
        req.flash("error", "Server error, try again!");
        res.redirect("back");
    });
}