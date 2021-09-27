// package imports
const Sequelize = require("sequelize");

// local imports
const Criteria = require("../models").Criteria;
const Users = require("../models").User;
const Property = require("../models").Property;
const Pairing = require("../models").Pairing;
const Tenant = require('../models').TenantTerm

// imports initialization
const Op = Sequelize.Op;


exports.tenantValue = (req, res) => {
    // get all pairings from my pairings table with a unique lanlord_id value
    // meannig all pairings with similar landlord_id should be fetched once
    Pairing.findAll({
            where: {
                tenant_id: {
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
            const uniqueLandlord = [...new Map(pairings.map(item => [item.property.user.id, item])).values()];
            res.render("dashboards/tenants/tenant_landlord_values", {
                pairings: uniqueLandlord
            })
        })
        .catch(error => {
            req.flash("error", "Server error, try again!");
            res.redirect("back");
        });
}

exports.pairedLandlords = async (req, res) => {
    // get all pairings from my pairings table with a unique lanlord_id value
    // meannig all pairings with similar landlord_id should be fetched once

    // const currentTenant = await Users.findOne({
    //     id: req.session.userId
    // });

    // const landlords = await Users.findAll({role_id: 3, });
    // res.send(currentTenant);

    Pairing.findAll({
            where: {
                tenant_id: {
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
            // get only a unique landord using pairings.property.user.
            const uniqueLandlord = [...new Map(pairings.map(item => [item.property.user_id, item])).values()];
            res.render("dashboards/tenants/tenant_landlords", {
                landlords: uniqueLandlord
            })
        })
        .catch(error => {
            req.flash("error", "Server error, try again!");
            res.redirect("back");
        });
}