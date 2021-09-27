// package imports
const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
const Property = require("../models").Property;

// imports initialization
const Op = Sequelize.Op;


exports.activeUsers = (req, res, next) => {

    Users.findAll({
            where: {
                role_id: {
                    [Op.ne]: 1
                }
            }
        })
        .then(users => {
            res.render("dashboards/admin/active_users", {
                users: users
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("/");
        });
}

exports.deletedUsers = (req, res, next) => {

    Users.findAll({
            where: {
                [Op.and]: [{
                        role_id: {
                            [Op.ne]: 1
                        }
                    },
                    {
                        deletedAt: {
                            [Op.ne]: null
                        }
                    },
                ],
            },
            paranoid: false,
        })
        .then(users => {
            res.render("dashboards/admin/deleted_users", {
                users: users
            });
        })
        .catch(error => {
            req.flash('error', "Server error");
            res.redirect("/");
        });
}

exports.deleteUsers = (req, res, next) => {
    Users.destroy({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "user deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}

exports.restoreUsers = (req, res, next) => {
    Users.restore({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "user restored successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}

exports.deleteProperty = (req, res, next) => {
    Property.destroy({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "property deleted successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}

exports.restoreProperty = (req, res, next) => {
    Property.restore({
            where: {
                id: {
                    [Op.eq]: req.body.id
                }
            }
        })
        .then(response => {
            req.flash('success', "property restored successfully");
            res.redirect("back");
        })
        .catch(error => {
            req.flash('error', "something went wrong");
            res.redirect("back");
        });
}