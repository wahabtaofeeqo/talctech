// package imports
const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
const parameters = require("../config/params");

// imports initialization
const Op = Sequelize.Op;

exports.homepage = (req, res, next) => {

    if (req.session.userRole == 1) {
        res.render("dashboards/admin/admin_home");
    } 
    else if (req.session.userRole == 2) {
        res.render("dashboards/landlords/home");
    } 
    else if (req.session.userRole == 3 || req.session.userRole == 5) {
        res.render("dashboards/tenants/tenant_home");
    } 
    else if (req.session.userRole == 4) {
        res.render("dashboards/renters/renters_home");
    } 
    else {
        res.redirect("/");
    }
}

exports.profilePage = (req, res, next) => {
    Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        })
        .then(user => {
            if (user) {
                res.render("dashboards/tenants/tenant_profile", {
                    user: user,
                    edit: false
                });
            } else {
                req.flash('error', "Server error");
                res.redirect("home");
            }

        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("home");
        });
}

exports.editprofilePage = (req, res, next) => {
    Users.findOne({
            where: {
                id: {
                    [Op.eq]: req.session.userId
                }
            }
        })
        .then(user => {
            if (user) {
                res.render("dashboards/tenants/tenant_profile", {
                    user: user,
                    edit: true
                });
            } else {
                req.flash('error', "Invalid User");
                res.redirect("/");
            }
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("/");
        });
}

exports.passwordPage = (req, res, next) => {
    if (req.session.userRole == 1) {
        res.render("dashboards/admin/admin_password");
    } else if (req.session.userRole == 2) {
        res.render("dashboards/landlords/landlord_password");
    } else if (req.session.userRole == 3 || req.session.userRole == 5) {
        res.render("dashboards/tenants/tenant_password");
    } else if (req.session.userRole == 4) {
        res.render("dashboards/renters/renters_password");
    } else {
        res.redirect("/");
    }
}