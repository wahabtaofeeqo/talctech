// package imports
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
const Payment = require('../models').Payment;
const LandlordTerms = require("../models").LandlordTerm;
const TenantTerms = require("../models").TenantTerm;

const parameters = require("../config/params");

// Validator
const Joi = require('joi');

// imports initialization
const Op = Sequelize.Op;

//
const axios = require('axios');

// Email Service
const emailService = require("../services/EmailService");

const digits_only = string => [...string].every(c => '+0123456789'.includes(c));

// Session Data for new user 
// payment reference
const initSession = (req) => {
    req.session.email = req.body.email;
    req.session.phone = req.body.phone;
    req.session.name  = req.body.name;  
    req.session.paymentReason = 'Registration';
    req.session.user = req.body                              
}

exports.makePayment = async (req, res, next) => {

    let plan;
    let fee;

    if(req.session.userRole == 3) {
        fee = process.env.TENANT_FEE;
        plan = process.env.TENANT_PLAN_CODE;
    }

    if(req.session.userRole == 4) {
        fee = process.env.RENTER_FEE;
        plan = process.env.RENTER_PLAN_CODE;
    }

    if(req.session.userRole == 2) {
        fee = process.env.LANDLORD_FEE;
        plan = process.env.LANDLORD_PLAN_CODE;
    }

    const post = {
        tx_ref: 'talctech-tx-' + Math.random().toString(36).substr(2, 5),
        amount: fee,
        currency: 'NGN',
        redirect_url: req.protocol + '://' + req.headers.host + '/payment-redirect',
        payment_options: 'card',
        payment_plan: plan,
        customer: {
            name: req.session.name,
            email: req.session.email,
            phonenumber: req.session.phone
        },
        customizations: {
            title: 'Account Creation Fee',
            destination: '',
            logo: req.protocol + '://' + req.headers.host + '/assets/img/logo.jpg'
        }
    }

    const header = {
        headers: {
            Authorization: 'Bearer ' + process.env.RAVE_SECRET_KEY
        }
    }

    axios.post('https://api.flutterwave.com/v3/payments', post, header)
        .then(response => {
            console.log(response);
            if(response.data.status) {
                res.redirect(response.data.data.link);
            }
        })
        .catch(e => {
            req.flash('warning', "Payment could not initialized");
            res.redirect("back");
        });
}

exports.login = async (req, res, next) => {

    const { email, password } = req.body;

    try {
        const user = await Users.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        });

        if(user) {
            if(user.status) {
                if (bcrypt.compareSync(password, user.password)) {
                    if(user.role_id == 1) {
                        req.flash('warning', "Login not allowed!");
                        res.redirect("back");
                    }
                    else {
                        if(user.suspended) {
                            req.flash('warning', "Your account has been suspended");
                            res.redirect("back");
                        }
                        else {
                            req.session.userId = user.id;
                            req.session.email = user.email;
                            req.session.userRole = user.role_id;
                            req.session.user = user;
                            
                            if(user.role_id == 5 || user.role_id == 3) {
                                res.redirect("/tenant");
                            }
                            else if(user.role_id = 2) {
                                res.redirect("/landlord");
                            }
                            else if(user.role_id == 4) {
                                res.redirect("/renter");
                            }
                            else {
                                res.redirect("/admin");
                            }
                        }
                    }
                }
                else {
                    req.flash('warning', "Invalid credentials");
                    res.redirect("back");
                }
            }
            else {
                req.flash('warning', "You account has not been activated. Make payment!");
                res.redirect("back");
            }
        }
        else {
            req.flash('warning', "Invalid credentials");
            res.redirect("back");
        }
    }
    catch(e) {
        req.flash('warning', "Invalid credentials");
        res.redirect("back");
    }
}

exports.register = async (req, res, next) => {

    const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
   
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let password = req.body.password;
    let role = req.body.role;

    if (!role) {
        req.flash('warning', "Please select account type");
        res.redirect("back");
    } else if (!name) {
        req.flash('warning', "Please enter name");
        res.redirect("back");
    } else if (!email) {
        req.flash('warning', "Please enter email");
        res.redirect("back");
    } else if (!phone) {
        req.flash('warning', "Please enter phone");
        res.redirect("back");
    } else if (!password) {
        req.flash('warning', "Please enter password");
        res.redirect("back");
    } else if (!email.match(mailformat)) {
        req.flash('warning', "Enter valid email address");
        res.redirect("back");
    } else if (!digits_only(phone)) {
        req.flash('warning', "Enter valid mobile phone");
        res.redirect("back");
    } else if (name.length < 5) {
        req.flash('warning', "Name must be greater than 4 letters");
        res.redirect("back");
    } else if (password.length < 6) {
        req.flash('warning', "Passwords must be greater than 5 letters");
        res.redirect("back");
    }

    Users.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        })
        .then((user) => {
            if (!user) {
                let name = req.body.name;
                let email = req.body.email;
                let phone = req.body.phone;
                let role_id = req.body.role;
                let password = bcrypt.hashSync(req.body.password, 10);

                Users.create({
                        name,
                        email,
                        phone,
                        password,
                        role_id
                    })
                    .then((response) => {
                        if (role_id == "2" || role_id == "4") {
                            LandlordTerms.create({
                                    landlord_id: response.id,
                                    tenant_employment: req.body.employment,
                                    tenant_income: req.body.income,
                                    professionals: req.body.professional,
                                    smoker: req.body.smoke,
                                    drinker: req.body.drink,
                                    electricity: req.body.electricity
                                })
                                .then(lanTerms => {
                                    req.flash('success', "Registration successful");
                                    initSession(req);
                                    res.redirect('/pay');
                                })
                                .catch(error => {
                                    req.flash('warning', "Something went wrong, but proceed anyway");
                                    res.redirect("/login");
                                });
                        } else {
                            TenantTerms.create({
                                    tenant_id: response.id,
                                    pets: req.body.pets,
                                    employed: req.body.employed,
                                    income: req.body.income,
                                    professional: req.body.professional,
                                    smoker: req.body.smoker,
                                    married: req.body.married,
                                    party: req.body.party,
                                    house_party: req.body.house_party,
                                    religious: req.body.religious,
                                    children: req.body.children,
                                    drinker: req.body.drinker,
                                    music_tv_level: req.body.music_tv_level,
                                    electricity: req.body.electricity,
                                })
                                .then(tenTerms => {
                                    req.flash('success', "Registration successful");
                                    initSession(req);
                                    res.redirect("/pay");
                                })
                                .catch(error => {
                                    req.flash('warning', "Something went wrong, but proceed anyway");
                                    res.redirect("/login");
                                });
                        }
                    })
                    .catch(error => {
                        req.flash('error', "Something went wrong try again");
                        res.redirect("back");
                    });
            } else {
                req.flash('warning', "Email already taken!");
                res.redirect("back");
            }
        })
        .catch(error => {
            req.flash('error', "Something went wrong try again");
            res.redirect("back");
        });
}

exports.logout = (req, res, next) => {
    req.session = null;
    res.redirect("/");
}

exports.updateProfile = (req, res, next) => {
    const {
        phone
    } = req.body;
    if (!phone) {
        req.flash('warning', "Please enter phone");
        res.redirect("back");
    } else if (!digits_only(phone) || phone.length < 11) {
        req.flash('warning', "Enter valid mobile phone");
        res.redirect("back");
    } else {
        Users.findOne({
                where: {
                    id: {
                        [Op.eq]: req.session.userId
                    }
                }
            })
            .then(user => {
                if (user) {
                    Users.update({
                            phone: phone
                        }, {
                            where: {
                                id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(updatedProfile => {
                            req.flash('success', "Profile updated successfully!");
                            res.redirect("/profile");
                        })
                        .catch(error => {
                            req.flash('error', "Server error");
                            res.redirect("back");
                        });
                }
            })
            .catch(error => {
                req.flash('error', "Server error");
                res.redirect("back");
            });
    }
}

exports.changePassword = (req, res, next) => {
    const {
        oldPassword,
        password,
        confirmPassord,
    } = req.body;
    // check if any of them are empty
    if (!oldPassword || !password || !confirmPassord) {
        req.flash('warning', "enter all fields");
        res.redirect("back");
    } else if (confirmPassord != password) {
        req.flash('warning', "passwords must match");
        res.redirect("back");
    } else if (confirmPassord.length < 6 || password.length < 6) {
        req.flash('warning', "passwords must be greater than 5 letters");
        res.redirect("back");
    } else {
        Users.findOne({
                where: {
                    id: {
                        [Op.eq]: req.session.userId
                    }
                }
            })
            .then(response => {
                if (bcrypt.compareSync(oldPassword, response.password)) {
                    // password correct
                    // update it then
                    let currentPassword = bcrypt.hashSync(password, 10);
                    Users.update({
                            password: currentPassword
                        }, {
                            where: {
                                id: {
                                    [Op.eq]: req.session.userId
                                }
                            }
                        })
                        .then(response => {
                            req.flash('success', "Password updated successfully");
                            res.redirect("back");
                        })
                        .catch(error => {
                            req.flash('error', "something went wrong");
                            res.redirect("back");
                        });
                } else {
                    req.flash('warning', "incorrect old password");
                    res.redirect("back");
                }
            })
            .catch(error => {
                req.flash('error', "something went wrong");
                res.redirect("back");
            });
    }
}

exports.test = async (req, res) => {
    await emailService.sendMail('taofeekolamilekan218@gmail.com', 'This is a Test Boss');
    res.send('hello World ');
}