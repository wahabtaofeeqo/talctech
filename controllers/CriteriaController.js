// package imports
const Sequelize = require("sequelize");

// local imports
const Criteria = require("../models").Criteria;
const Users = require("../models").User;
const Property = require("../models").Property;
const Pairing = require("../models").Pairing;

// imports initialization
const Op = Sequelize.Op;


exports.newCriteria = (req, res, next) => {
    res.render("auths/user_criteria");
}

exports.addCriteria = (req, res, next) => {
    const {
        property,
        offer,
        price,
        city,
        neighbourhood,
        bedrooms,
        bathrooms
    } = req.body;



    if (!property || !offer || !price || !city || !neighbourhood || !bedrooms || !bathrooms) {
        req.flash('warning', "Enter all fields");
        res.redirect("back");
    } else {
        let user_id = req.session.userId;
        let property_type = req.body.property;
        let offer_type = req.body.offer;
        let price = req.body.price;
        let city = req.body.city;
        let neighbourhood = req.body.neighbourhood;
        let bedrooms = req.body.bedrooms;
        let bathrooms = req.body.bathrooms;

        Criteria.create({
                user_id,
                property_type,
                offer_type,
                price,
                city,
                neighbourhood,
                bedrooms,
                bathrooms
            })
            .then(createdCriteria => {
                // look for all properties, with similar criteria
                // then add them to the users pairings
                Property.findAll({
                        where: {
                            property_type: {
                                [Op.eq]: req.body.property
                            },
                            offer_type: {
                                [Op.eq]: req.body.offer
                            },
                            city: {
                                [Op.eq]: req.body.city
                            },
                        }
                    })
                    .then(similarCriteria => {
                        similarCriteria.forEach(pairings => {
                            console.log(pairings.dataValues.id);
                            Pairing.create({
                                    tenant_id: req.session.userId,
                                    property_id: pairings.dataValues.id
                                })
                                .then(response => {
                                    req.flash('success', `User Criteria created successfully!`);
                                    res.redirect("/home");
                                })
                                .catch(error => {
                                    req.flash('error', `Something went wrong, try again!`);
                                    res.redirect("back");
                                });
                        });
                    })
                    .catch(error => {
                        req.flash('error', `Something went wrong, try again!`);
                        res.redirect("back");
                    });
            })
            .catch(error => {
                req.flash('error', `Something went wrong, try again!`);
                res.redirect("back");
            });
    }
}

exports.updateUserCriteria = (req, res, next) => {
    const {
        property,
        offer,
        price,
        city,
        neighbourhood,
        bedrooms,
        bathrooms
    } = req.body;



    if (!property || !offer || !price || !city || !neighbourhood || !bedrooms || !bathrooms) {
        req.flash('warning', "Enter all fields");
        res.redirect("back");
    } else {
        let user_id = req.session.userId;
        let property_type = req.body.property;
        let offer_type = req.body.offer;
        let price = req.body.price;
        let city = req.body.city;
        let neighbourhood = req.body.neighbourhood;
        let bedrooms = req.body.bedrooms;
        let bathrooms = req.body.bathrooms;

        Criteria.findOne({
                where: {
                    user_id: {
                        [Op.eq]: user_id
                    }
                }
            })
            .then(criteria => {
                if (criteria) {
                    // update the criteria
                    Criteria.update({
                        property_type: property_type,
                        offer_type: offer_type,
                        price: price,
                        city: city,
                        neighbourhood: neighbourhood,
                        bedrooms: bedrooms,
                        bathrooms: bathrooms,
                    },{
                            where: {
                                id: {
                                    [Op.eq]: criteria.id
                                }
                            }
                        })
                        .then(updatedCriteria => {
                            // update all users pairings by first deleting all previous ones
                            Pairing.destroy({
                                    where: {
                                        tenant_id: {
                                            [Op.eq]: req.session.userId
                                        }
                                    },
                                    force: true
                                })
                                .then(deletedPairings => {
                                    Property.findAll({
                                            where: {
                                                property_type: {
                                                    [Op.eq]: req.body.property
                                                },
                                                offer_type: {
                                                    [Op.eq]: req.body.offer
                                                },
                                                city: {
                                                    [Op.eq]: req.body.city
                                                },
                                            }
                                        })
                                        .then(similarCriteria => {
                                            if(similarCriteria.length > 0) {
                                                similarCriteria.forEach(pairings => {
                                                    Pairing.create({
                                                            tenant_id: req.session.userId,
                                                            property_id: pairings.dataValues.id
                                                        })
                                                        .then(response => {
                                                            req.flash('success', `User Criteria updated successfully!`);
                                                            res.redirect("back");
                                                        })
                                                        .catch(error => {
                                                            req.flash('error', `Something went wrong, try again!`);
                                                            res.redirect("back");
                                                        });
                                                });
                                            } else {
                                                req.flash('success', `Critera updated, but no pairings found, change and try again`);
                                                            res.redirect("back");
                                            }
                                        })
                                        .catch(error => {
                                            req.flash('error', `Something went wrong, try again!`);
                                            res.redirect("back");
                                        });
                                })
                                .catch(error => {
                                    req.flash('error', `Something went wrong, try again!`);
                                    res.redirect("back");
                                });
                        })
                        .catch(error => {
                            req.flash('error', `Something went wrong, try again!`);
                            res.redirect("back");
                        });
                } else {
                    req.flash('error', `Invalid criteria`);
                    res.redirect("/");
                }
            })
            .catch(error => {
                req.flash('error', `Something went wrong, try again!`);
                res.redirect("back");
            });
    }
}


exports.tenantCriteria = (req, res, next) => {
    Criteria.findOne({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            }
        })
        .then(criteria => {
            if (criteria) {
                res.render("dashboards/tenants/tenant_criteria", {
                    criteria: criteria
                });
            } else {
                res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', `Something went wrong, try again!`);
            res.redirect("back");
        });
}