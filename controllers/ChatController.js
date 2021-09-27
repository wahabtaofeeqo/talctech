// package imports
const Sequelize = require("sequelize");

// local imports
const Users = require("../models").User;
const Property = require("../models").Property;
const Pairings = require("../models").Pairing;
const Chats = require("../models").Chat;
// imports initialization
const Op = Sequelize.Op;


exports.chatPage = (req, res, next) => {
    let propertyId = req.params.id;
    Chats.update({
            read_status: 1
        }, {
            where: {
                [Op.and]: [{
                        read_status: {
                            [Op.eq]: 0
                        }
                    },
                    {
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        property_id: {
                            [Op.eq]: propertyId
                        }
                    }
                ]
            }
        })
        .then(chatupdated => {
            Property.findOne({
                where: {
                    id: {
                        [Op.eq]: propertyId
                    }
                }
            })
            .then(property => {
                if (property) {
                    Chats.findAll({
                            where: {
                                [Op.or]: [{
                                        [Op.and]: [{
                                            sender_id: {
                                                [Op.eq]: req.session.userId
                                            }
                                        }, {
                                            property_id: {
                                                [Op.eq]: propertyId
                                            }
                                        }],
                                    },
                                    {
                                        [Op.and]: [{
                                            receiver_id: {
                                                [Op.eq]: req.session.userId
                                            }
                                        }, {
                                            property_id: {
                                                [Op.eq]: propertyId
                                            }
                                        }],
                                    }
                                ]
                            },
                            order: [
                                ['createdAt', 'ASC'],
                            ],
                            include: [{
                                    model: Users,
                                    as: 'receiver'
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
                        .then(chats => {
                            res.render("dashboards/common/chat_page", {
                                chats: chats,
                                property: property,
                                receiver_id: ""
                            });
                        })
                        .catch(error => {
                            req.flash("error", "Server error, try again!");
                            res.redirect("/home");
                        });
                } else {
                    res.status(404).render('base/404');
                }
            })
            .catch(error => {
                req.flash("error", "Server error, try again!");
                res.redirect("/home");
            });
        })
        .catch(error => {
            res.redirect("/home");
        });
}

exports.landlordChatPage = (req, res, next) => {
    let propertyId = req.params.id;
    let userId = req.params.userId;
    Chats.update({
            read_status: 1
        }, {
            where: {
                [Op.and]: [{
                        read_status: {
                            [Op.eq]: 0
                        }
                    },
                    {
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        property_id: {
                            [Op.eq]: propertyId
                        }
                    }
                ]
            }
        })
        .then(chatupdated => {
            Property.findOne({
                    where: {
                        id: {
                            [Op.eq]: propertyId
                        }
                    }
                })
                .then(property => {
                    if (property) {
                        Chats.findAll({
                                where: {
                                    [Op.or]: [{
                                            [Op.and]: [{
                                                    sender_id: {
                                                        [Op.eq]: req.session.userId
                                                    }
                                                },
                                                {
                                                    property_id: {
                                                        [Op.eq]: propertyId
                                                    }
                                                },
                                                {
                                                    receiver_id: {
                                                        [Op.eq]: userId
                                                    }
                                                }
                                            ],
                                        },
                                        {
                                            [Op.and]: [{
                                                    receiver_id: {
                                                        [Op.eq]: req.session.userId
                                                    }
                                                },
                                                {
                                                    property_id: {
                                                        [Op.eq]: propertyId
                                                    }
                                                },
                                                {
                                                    sender_id: {
                                                        [Op.eq]: userId
                                                    }
                                                }
                                            ],
                                        }
                                    ]
                                },
                                order: [
                                    ['createdAt', 'ASC'],
                                ],
                                include: [{
                                        model: Users,
                                        as: 'receiver'
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
                            .then(chats => {
                                res.render("dashboards/common/chat_page", {
                                    chats: chats,
                                    property: property,
                                    receiver_id: userId,
                                });
                            })
                            .catch(error => {
                                req.flash("error", "Server error, try again!");
                                res.redirect("/home");
                            });
                    } else {
                        res.status(404).render('base/404');
                    }
                })
                .catch(error => {
                    req.flash("error", "Server error, try again!");
                    res.redirect("/home");
                });
        })
        .catch(error => {
            res.redirect("/home");
        });
}

exports.propertyChatsPage = (req, res, next) => {
    if (req.session.userRole == '2') {
        Pairings.findAll({
                where: {
                    [Op.or]: [{
                        "$property.user_id$": {
                            [Op.eq]: req.session.userId
                        }
                    }]
                },
                order: [
                    ['createdAt', 'ASC'],
                ],
                include: [{
                        model: Property,
                        as: 'property',
                        include: [{
                                model: Users,
                                as: 'user'
                            },
                            {
                                model: Chats,
                                as: 'chat',
                                required: false,
                                where: {
                                    [Op.and]: [{
                                            receiver_id: {
                                                [Op.eq]: req.session.userId
                                            }
                                        },
                                        {
                                            read_status: {
                                                [Op.eq]: 0
                                            }
                                        },
                                        {
                                            property_id: {
                                                [Op.eq]: Sequelize.col('property.id')
                                            }
                                        },
                                        {
                                            sender_id: {
                                                [Op.eq]: Sequelize.col('pairing.tenant_id')
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        model: Users,
                        as: 'user'
                    }
                ]
            })
            .then(pairings => {
                console.log(pairings);
                res.render("dashboards/common/property_pairings_chat", {
                    pairings: pairings
                });
            })
            .catch(error => {
                console.log(error);
                res.redirect("/home");
            });
    } else {
        Pairings.findAll({
                where: {
                    [Op.or]: [{
                            tenant_id: {
                                [Op.eq]: req.session.userId
                            }
                        },
                        {
                            "$property.user_id$": {
                                [Op.eq]: req.session.userId
                            }
                        }
                    ]
                },
                order: [
                    ['createdAt', 'ASC'],
                ],
                include: [{
                        model: Property,
                        as: 'property',
                        include: [{
                                model: Users,
                                as: 'user'
                            },
                            {
                                model: Chats,
                                as: 'chat',
                                required: false,
                                where: {
                                    [Op.and]: [{
                                            receiver_id: {
                                                [Op.eq]: req.session.userId
                                            }
                                        },
                                        {
                                            read_status: {
                                                [Op.eq]: 0
                                            }
                                        },
                                        {
                                            property_id: {
                                                [Op.eq]: Sequelize.col('property.id')
                                            }
                                        },
                                        {
                                            sender_id: {
                                                [Op.eq]: Sequelize.col('property.user_id')
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        model: Users,
                        as: 'user'
                    }
                ]
            })
            .then(pairings => {
                res.render("dashboards/common/property_pairings_chat", {
                    pairings: pairings
                });
            })
            .catch(error => {
                res.redirect("/home");
            });
    }

}

exports.unreadMessage = (req, res, next) => {
    Chats.findAll({
            where: {
                [Op.and]: [{
                        receiver_id: {
                            [Op.eq]: req.session.userId
                        }
                    },
                    {
                        read_status: {
                            [Op.eq]: 0
                        }
                    }
                ],
            },
            order: [
                ['createdAt', 'ASC'],
            ],
            include: [{
                model: Users,
                as: 'sender'
            }]
        })
        .then(unreadChats => {
            res.locals.unread_messages = unreadChats;
            next();
        })
        .catch(error => {
            console.log(error);
        });
}