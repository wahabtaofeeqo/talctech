// package imports
const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
// imports initialization
const Op = Sequelize.Op;



exports.viewUser = (req, res, next) => {
    Users.findOne({
        where: {
            id: {
                [Op.eq]: req.params.id
            }
        }
    })
    .then(user => {
        if(user) {
            res.render("dashboards/common/view_user", {
                user: user
            });
        } else {
            res.status(404).render('base/404');
        }
    })
    .catch(error => {
        res.redirect("/home");
    });
}

exports.upGradeTenant = (req, res, next) => {
    Users.update({
        role_id: 5
    }, {
        where: {
            id: {
                [Op.eq]: req.session.userId
            }
        }
    })
    .then(user => {
        req.session.userRole = user.role_id;
        req.flash("success", "account upgraded successfully!");
        res.redirect("back");
    })
    .catch(error => {
        req.flash("error", "Server error, try again!");
        res.redirect("back");
    });
}