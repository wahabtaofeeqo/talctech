const multer = require("multer");
const path = require("path");
const Sequelize = require("sequelize");
const resizeOptimizeImages = require('resize-optimize-images');

// local imports
const RentProperty = require("../models").RentProperty;
const Users = require("../models").User;
// imports initialization
const Op = Sequelize.Op;

// constants
const storage = multer
    .diskStorage({
        destination: "./public/uploads/shortproperties/",
        filename: async function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        },
    });

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|JPEG|JPG|PNG|GIF/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Images only!"));
    }
}

// init upload 
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields([{
        name: 'image_front'
    },
    {
        name: 'image_side'
    },
    {
        name: 'image_rear'
    }
]);

exports.allShortTermRent = (req, res, next) => {
    RentProperty.findAll({
            where: {
                deletedAt: {
                    [Op.eq]: null
                }
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            include: [{
                model: Users,
                as: 'user'
            }]
        })
        .then(properties => {
            res.render("dashboards/common/shortproperties", {
                properties: properties
            });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/home");
        });
}

exports.addRentPropertyPage = (req, res, next) => {
    res.render("dashboards/renters/add_renters", {
        edit: false
    });
}

exports.updateRentPropertyPage = (req, res, next) => {
    RentProperty.findOne({
            where: {
                id: {
                    [Op.eq]: req.params.id
                }
            }
        })
        .then(property => {
            if (property) {
                res.render("dashboards/renters/add_renters", {
                    property: property,
                    edit: true
                });
            } else {
                req.flash('error', "Invalid property!");
                res.status(404).render('base/404');
            }

        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/home");
        });
}

exports.rentalProperties = (req, res, next) => {
    RentProperty.findAll({
            where: {
                user_id: {
                    [Op.eq]: req.session.userId
                }
            }
        })
        .then(properties => {
            res.render("dashboards/renters/view_renters", {
                properties: properties
            });
        })
        .catch(error => {
            req.flash('error', "Server error!");
            res.redirect("/home");
        });
}

exports.postShortTermProperty = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            req.flash('error', "Check images and try again!");
            res.redirect("back");
        } else {
            const {
                property,
                offer,
                price,
                city,
                neighbourhood,
                bedrooms,
                bathrooms
            } = req.body;


            if (!property || !offer || !price || !city || !neighbourhood || !bedrooms ||
                !bathrooms) {
                req.flash('warning', "Enter all fields");
                res.redirect("back");
            } else if (req.files.image_front == "" || req.files.image_front == null || req.files.image_front == undefined) {
                req.flash('warning', "Enter front image");
                res.redirect("back");
            } else if (req.files.image_side == "" || req.files.image_side == null || req.files.image_side == undefined) {
                req.flash('warning', "Enter side image");
                res.redirect("back");
            } else if (req.files.image_rear == "" || req.files.image_rear == null || req.files.image_rear == undefined) {
                req.flash('warning', "Enter rear image");
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
                let image_front = req.files.image_front[0].filename;
                let image_side = req.files.image_side[0].filename;
                let image_rear = req.files.image_rear[0].filename;
                RentProperty.create({
                        user_id,
                        property_type,
                        offer_type,
                        price,
                        city,
                        neighbourhood,
                        bedrooms,
                        bathrooms,
                        image_front,
                        image_side,
                        image_rear
                    })
                    .then(response => {
                        (async () => {
                            // Set the options.
                            const options = {
                                images: [
                                    `./public/uploads/shortproperties/${image_front}`,
                                    `./public/uploads/shortproperties/${image_side}`,
                                    `./public/uploads/shortproperties/${image_rear}`
                                ],
                                width: 800,
                                height: 500,
                                quality: 100
                            };
                            // Run the module.
                            await resizeOptimizeImages(options)
                                .then(resized => {
                                    req.flash('success', "Property added successfully");
                                    res.redirect("back");
                                })
                                .catch(error => {
                                    req.flash('warning', "Server error. Property uploaded but not resized");
                                    res.redirect("back");
                                });
                        })();
                    })
                    .catch(error => {
                        req.flash('error', "Something went wrong, try again!");
                        res.redirect("back");
                    });
            }
        }
    });
}

exports.postUpdateProperty = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            req.flash('error', "Check images and try again!");
            res.redirect("back");
        } else {
            const {
                id,
                property,
                offer,
                price,
                city,
                neighbourhood,
                bedrooms,
                bathrooms
            } = req.body;


            if (!property || !offer || !price || !city || !neighbourhood || !bedrooms ||
                !bathrooms) {
                req.flash('warning', "Enter all fields");
                res.redirect("back");
            } else if (req.files.image_front == "" || req.files.image_front == null || req.files.image_front == undefined) {
                req.flash('warning', "Enter front image");
                res.redirect("back");
            } else if (req.files.image_side == "" || req.files.image_side == null || req.files.image_side == undefined) {
                req.flash('warning', "Enter side image");
                res.redirect("back");
            } else if (req.files.image_rear == "" || req.files.image_rear == null || req.files.image_rear == undefined) {
                req.flash('warning', "Enter rear image");
                res.redirect("back");
            } else {
                let property_type = req.body.property;
                let offer_type = req.body.offer;
                let price = req.body.price;
                let city = req.body.city;
                let neighbourhood = req.body.neighbourhood;
                let bedrooms = req.body.bedrooms;
                let bathrooms = req.body.bathrooms;
                let image_front = req.files.image_front[0].filename;
                let image_side = req.files.image_side[0].filename;
                let image_rear = req.files.image_rear[0].filename;
                RentProperty.findOne({
                        where: {
                            id: {
                                [Op.eq]: id
                            }
                        }
                    })
                    .then(property => {
                        if (property) {
                            RentProperty.update({
                                    property_type: property_type,
                                    offer_type: offer_type,
                                    price: price,
                                    city: city,
                                    neighbourhood: neighbourhood,
                                    bedrooms: bedrooms,
                                    bathrooms: bathrooms,
                                    image_front: image_front,
                                    image_side: image_side,
                                    image_rear: image_rear,
                                }, {
                                    where: {
                                        id: {
                                            [Op.eq]: id
                                        }
                                    }
                                })
                                .then(updated => {
                                    (async () => {
                                        // Set the options.
                                        const options = {
                                            images: [
                                                `./public/uploads/shortproperties/${image_front}`,
                                                `./public/uploads/shortproperties/${image_side}`,
                                                `./public/uploads/shortproperties/${image_rear}`
                                            ],
                                            width: 800,
                                            height: 500,
                                            quality: 100
                                        };
                                        // Run the module.
                                        await resizeOptimizeImages(options)
                                            .then(resized => {
                                                req.flash('success', "Property updated successfully");
                                                res.redirect("back");
                                            })
                                            .catch(error => {
                                                req.flash('warning', "Server error. Property uploaded but not resized");
                                                res.redirect("back");
                                            });
                                    })();
                                })
                                .catch(error => {
                                    req.flash('error', "Server Error, try again!");
                                    res.redirect("back");
                                });
                        } else {
                            req.flash('error', "Invalid Package");
                            res.redirect("/home");
                        }
                    })
                    .catch(error => {
                        req.flash('error', "Server Error, try again!");
                        res.redirect("back");
                    });
            }
        }
    });
}