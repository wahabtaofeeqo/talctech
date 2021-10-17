const Sequelize = require("sequelize");
const Criteria = require("../models").Criteria;
const User = require('../models').User;

// imports initialization
const Op = Sequelize.Op;

exports.redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
}

exports.redirectAdminLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else if (req.session.userRole != '1') {
        res.redirect("/");
    } else {
        next();
    }
}

exports.redirectLandlordLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else if (req.session.userRole != '2') {
        res.redirect("/");
    } else {
        next();
    }
}

exports.redirectTenantLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/");
    } else if (req.session.userRole == 3 || req.session.userRole == 5) {
        console.log("the error is from here");
        next();
    } else {
        res.redirect("/");
    }
}


exports.redirectCriteria = (req, res, next) => {
    // if userrole == 3, 
    if (req.session.userRole == '3' || req.session.userRole == '5') {
        Criteria.findOne({
                where: {
                    user_id: {
                        [Op.eq]: req.session.userId
                    }
                },
            })
            .then(criteria => {
                if (criteria) {
                    next();
                } else {
                    req.flash('success', "Registered user, Enter Criteria!");
                    res.redirect("/criteria");
                }
            })
            .catch(error => {
                req.flash('error', "Something went wrong!");
                res.redirect("/login");
            });
    } else {
        next();
    }
}


exports.admin = async (req, res, next) => {

    if(req.session && req.session.admin) {
        const admin = await User.findOne({
            where: {
                email: {
                    [Op.eq]: req.session.email
                },
                role_id: {
                    [Op.eq]: 1
                }
            }
        });

        (admin) ? next() : res.redirect('/admin/login');
    }
    else {
        res.redirect('/admin/login');
    }
}

exports.tenant = async (req, res, next) => {

    if(req.session.user) {
        const tenant = await User.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.user.id
                }
            }
        });

        if(tenant) {
            if(tenant.role_id == 5 || tenant.role_id == 3)
                next();
            else
                res.redirect('/login');
        }
        else
            res.redirect('/login');
    }
    else {
        res.redirect('/login');
    }
}

exports.renter = async (req, res, next) => {

    if(req.session.user) {
        const user = await User.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.user.id
                }
            }
        });

        (user && user.role_id == 4) ? next() : res.redirect('/login');
    }
    else {
        res.redirect('/login');
    }
}

exports.landlord = async (req, res, next) => {

    if(req.session.user) {
        const user = await User.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.user.id
                }
            }
        });

        (user && user.role_id == 2) ? next() : res.redirect('/login');
    }
    else {
        res.redirect('/login');
    }
}

exports.api = async (req, res, next) => {

    if(req.session && req.session.userRole) {
        const user = await User.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        });

        (user) ? next() : res.status(402);
    }
    else {
        res.status(402)
    }
}