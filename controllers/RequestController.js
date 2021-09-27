const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// local imports
const Users = require("../models").User;
const Requests = require("../models").Request;
const Property = require("../models").Property;
const parameters = require("../config/params");

// imports initialization
const Op = Sequelize.Op;

const storage = multer
    .diskStorage({
        destination: "./public/uploads/requests/",
        filename: async function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        },
    });


// init upload 
const upload = multer({
    storage: storage,
}).fields([{
    name: 'asset'
}]);

exports.execRequestPage = (req, res, next) => {
    Requests.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [{
                    model: Users,
                    as: 'user'
                },
                {
                    model: Property,
                    as: 'property',
                    include: [{
                        model: Users,
                        as: 'user'
                    }]
                },
            ]
        })
        .then(requests => {
            res.render("dashboards/executive/new_requests", {
                requests: requests
            });
        })
        .catch(error => {
            req.flash("error", "Server error!" + error);
            res.redirect('/home');
        });
}

exports.execNewRequestPage = (req, res, next) => {
    Requests.findAll({
            where: {
                [Op.and]: [{
                        status: {
                            [Op.eq]: 0
                        }
                    },
                    {
                        user_id: {
                            [Op.eq]: req.session.userId
                        }
                    }
                ],
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [{
                    model: Users,
                    as: 'user'
                },
                {
                    model: Property,
                    as: 'property',
                    include: [{
                        model: Users,
                        as: 'user'
                    }]
                },
            ]
        })
        .then(requests => {
            res.render("dashboards/executive/new_requests", {
                requests: requests
            });
        })
        .catch(error => {
            req.flash("error", "Server error!" + error);
            res.redirect('/home');
        });
}

exports.execOldRequestPage = (req, res, next) => {
    Requests.findAll({
            where: {
                [Op.and]: [{
                        status: {
                            [Op.eq]: 1
                        }
                    },
                    {
                        user_id: {
                            [Op.eq]: req.session.userId
                        }
                    }
                ],
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [{
                    model: Users,
                    as: 'user'
                },
                {
                    model: Property,
                    as: 'property',
                    include: [{
                        model: Users,
                        as: 'user'
                    }]
                },
            ]
        })
        .then(requests => {
            res.render("dashboards/executive/new_requests", {
                requests: requests
            });
        })
        .catch(error => {
            req.flash("error", "Server error!" + error);
            res.redirect('/home');
        });
}

exports.executiveSendingRequests = (req, res, next) => {
    const {
        user,
        property
    } = req.body;
    if (!user || !property) {
        req.flash('warning', "Invalid request");
        res.redirect("back");
    } else {
        Users.findOne({
                where: {
                    id: {
                        [Op.eq]: user
                    }
                }
            })
            .then(foundUser => {
                if (foundUser) {
                    Property.findOne({
                            wherewhere: {
                                id: {
                                    [Op.eq]: property
                                }
                            }
                        })
                        .then(foundProperty => {
                            if (foundProperty) {
                                Requests.create({
                                        user_id: user,
                                        property_id: property
                                    })
                                    .then(request => {
                                        req.flash('success', "Request created successfully");
                                        res.redirect("back");
                                    })
                                    .catch(error => {
                                        req.flash('error', "Server error");
                                        res.redirect("back");
                                    });
                            } else {
                                req.flash('warning', "Invalid request");
                                res.redirect("back");
                            }
                        })
                        .catch(error => {
                            req.flash('error', "Server error");
                            res.redirect("back");
                        });
                } else {
                    req.flash('warning', "Invalid request");
                    res.redirect("back");
                }
            })
            .catch(error => {
                req.flash('error', "Server error");
                res.redirect("back");
            });
    }
}


exports.executiveRequests = (req, res, next) => {
    Requests.findAll({
            where: {
                status: {
                    [Op.eq]: 0
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [{
                    model: Users,
                    as: 'user'
                },
                {
                    model: Property,
                    as: 'property',
                    include: [{
                        model: Users,
                        as: 'user'
                    }]
                },
            ]
        })
        .then(requests => {
            res.render("dashboards/admin/new_requests", {
                requests: requests,
            });
        })
        .catch(error => {
            res.status(404).render('base/404');
        });
}

exports.answeredExecutiveRequests = (req, res, next) => {
    Requests.findAll({
            where: {
                status: {
                    [Op.eq]: 1
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [{
                    model: Users,
                    as: 'user'
                },
                {
                    model: Property,
                    as: 'property',
                    include: [{
                        model: Users,
                        as: 'user'
                    }]
                },
            ]
        })
        .then(requests => {
            res.render("dashboards/admin/old_requests", {
                requests: requests,
            });
        })
        .catch(error => {
            res.status(404).render('base/404');
        });
}

exports.requestVideoPage = (req, res, next) => {
    const requestId = req.params.id;
    console.log(requestId);
    Requests.findOne({
            where: {
                id: {
                    [Op.eq]: requestId
                }
            },
            include: [{
                model: Users,
                as: 'user'
            }],
        })
        .then(request => {
            if (request) {
                res.render("dashboards/admin/upload_request_video", {
                    request: request
                });
            } else {
                res.status(404).render('base/404');
            }
        })
        .catch(error => {
            res.status(404).render('base/404');
        });
}

exports.sendVideoToMail = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            req.flash('error', "Check file and try again");
            res.redirect("back");
        } else {
            const {
                email,
                message,
                id
            } = req.body;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: parameters.GMAIL_EMAIL,
                    pass: parameters.GMAIL_PASSWORD
                }
            });

            let mailOptions = {
                from: parameters.APP_NAME,
                to: "godspowerj7@gmail.com", // email
                subject: `[${parameters.APP_NAME}] Property Request`,
                text: message,
                attachments: [{
                    filename: req.files.asset[0].filename,
                    path: req.files.asset[0].path
                }]
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    req.flash('error', "Mail sending failed");
                    res.redirect("back");
                } else {
                    // set status of requests to 1
                    Requests.update({
                            status: 1
                        }, {
                            where: {
                                id: {
                                    [Op.eq]: id
                                }
                            }
                        })
                        .then(response => {
                            fs.unlink(req.files.asset[0].path, function (err) {
                                if (err) {
                                    req.flash('error', "Mail sent but file could not be deleted");
                                    res.redirect("back");
                                } else {
                                    req.flash('success', "Mail sent successfully");
                                    res.redirect("/newrequests");
                                }
                            });
                        })
                        .catch(error => {
                            req.flash('error', "Mail sent but file could not be deleted");
                            res.redirect("back");
                        });
                }
            });
        }
    });
}