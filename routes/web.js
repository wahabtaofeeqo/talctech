const express = require('express');
const flash = require("express-flash-messages");
const passport = require("passport");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const axios = require('axios');

// imports initialization
const router = express.Router();

// controlllers
const parameters = require("../config/params");
const HomeController = require("../controllers/HomeController");
const AuthController = require("../controllers/AuthController");
const CriteriaController = require("../controllers/CriteriaController");
const DashboardController = require("../controllers/DashboardController");
const PropertyController = require("../controllers/PropertyController");
const BaseController = require("../controllers/BaseController");
const AdminController = require("../controllers/AdminController");
const RequestController = require("../controllers/RequestController");
const RentPropertyController = require("../controllers/RentPropertyController");
const ChatController = require("../controllers/ChatController");
const TenantController = require("../controllers/TenantController"); 
const LandlordController = require("../controllers/LandlordController");
const mainController = require("../controllers/MainController");
const paymentController = require("../controllers/PaymentController");
const testController = require("../controllers/TestController");

// middlewares
const AuthMiddleware = require("../middlewares/auth_middleware");

// middlewares
router.use(passport.initialize());
router.use(passport.session());
router.use(cookieParser());

router.use(cookieSession({
    name: parameters.SESSION_NAME,
    keys: [parameters.SESSION_SECRET, parameters.SESSION_SECRET]
}));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

router.use(flash());

// ensuring when users logout they can't go back with back button
router.use(function (req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

router.use(function (req, res, next) {
    res.locals.user_roles = req.session.userRole;
    res.locals.session_id = req.session.userId;
    next();
});

// unread messages middlewares
router.use(ChatController.unreadMessage);

//
router.get("/", BaseController.index);
router.get("/login", BaseController.login);
router.post("/login", AuthController.login);
router.get("/signup", BaseController.register);
router.post("/signup", AuthController.register);
router.get("/criteria", BaseController.criteria);
router.post("/set-criteria", CriteriaController.addCriteria);
router.get("/reset", BaseController.reset);
router.post("/logout", AuthController.logout);
router.get("/about", BaseController.about);
router.get("/contact", BaseController.contact);
router.get("/feature", BaseController.feature);
router.get("/rentals", BaseController.rentals);
router.get("/terms", BaseController.terms);
router.get("/verify", AuthController.verify);
router.get("/home", [AuthMiddleware.redirectLogin, AuthMiddleware.redirectCriteria], HomeController.homepage);

// admin
router.get("/activeusers", AuthMiddleware.redirectAdminLogin, AdminController.activeUsers);
router.post("/activeusers", AuthMiddleware.redirectAdminLogin, AdminController.deleteUsers);
router.get("/deletedusers", AuthMiddleware.redirectAdminLogin, AdminController.deletedUsers);
router.post("/deletedusers", AuthMiddleware.redirectAdminLogin, AdminController.restoreUsers);
router.get("/activeproperties", AuthMiddleware.redirectAdminLogin, PropertyController.adminViewProperties);
router.post("/deleteproperties", AuthMiddleware.redirectAdminLogin, AdminController.deleteProperty);
router.get("/deletedproperties", AuthMiddleware.redirectAdminLogin, PropertyController.adminViewDeletedProperties);
router.post("/restoreproperty", AuthMiddleware.redirectAdminLogin, AdminController.restoreProperty);
router.get("/newrequests", AuthMiddleware.redirectAdminLogin, RequestController.executiveRequests);
router.get("/answeredrequests", AuthMiddleware.redirectAdminLogin, RequestController.answeredExecutiveRequests);
router.post("/sendassets", AuthMiddleware.redirectAdminLogin, RequestController.sendVideoToMail);

// landlords
router.get("/add-properties", AuthMiddleware.redirectLandlordLogin, PropertyController.addProperties);
router.post("/add-properties", AuthMiddleware.redirectLandlordLogin, PropertyController.postProperty);
router.get("/viewproperty", AuthMiddleware.redirectLandlordLogin, PropertyController.landlordViewProperties);
router.post("/updateproperty", AuthMiddleware.redirectLandlordLogin, PropertyController.postUpdateProperty);

// tenants
router.get("/profile", [AuthMiddleware.redirectLogin, AuthMiddleware.redirectCriteria], HomeController.profilePage);
router.get("/editprofile", [AuthMiddleware.redirectLogin, AuthMiddleware.redirectCriteria], HomeController.editprofilePage);
router.post("/editprofile", [AuthMiddleware.redirectLogin, AuthMiddleware.redirectCriteria], AuthController.updateProfile);
router.get("/password", [AuthMiddleware.redirectLogin, AuthMiddleware.redirectCriteria], HomeController.passwordPage);
router.post("/password", [AuthMiddleware.redirectLogin, AuthMiddleware.redirectCriteria], AuthController.changePassword);
router.get("/criterias", [AuthMiddleware.redirectTenantLogin, AuthMiddleware.redirectCriteria], CriteriaController.tenantCriteria);
router.post("/criterias", [AuthMiddleware.redirectTenantLogin, AuthMiddleware.redirectCriteria], CriteriaController.updateUserCriteria);
router.get("/property", [AuthMiddleware.redirectTenantLogin, AuthMiddleware.redirectCriteria], PropertyController.userProperties);

// short term renters
router.get("/shortproperty", RentPropertyController.addRentPropertyPage);
router.post("/shortproperty", RentPropertyController.postShortTermProperty);
router.get("/viewrentals", RentPropertyController.rentalProperties);
router.post("/editrental", RentPropertyController.postUpdateProperty);

// executive tenants
//router.get("/execrequest", RequestController.execNewRequestPage);
router.get("/execrequest", RequestController.execRequestPage);
router.get("/execoldrequest", RequestController.execOldRequestPage);
router.post("/execrequest", RequestController.executiveSendingRequests);

// common section
router.get("/shortproperties", RentPropertyController.allShortTermRent);
router.get("/propertychats", ChatController.propertyChatsPage);

// tenants
router.get("/landords/count", TenantController.tenantValue);
router.get("/landlords/pairings", TenantController.pairedLandlords);
router.post("/upgrade/tenant", DashboardController.upGradeTenant);

// landlord
router.get("/tenants/count", LandlordController.countTenantsPage);
router.get("/tenants/pairings", LandlordController.compactibleTenantPage);
router.get("/exectenants/pairings", LandlordController.compactibleExecTenantPage);

// admin
router.get("/requestvideo/:id", AuthMiddleware.redirectAdminLogin, RequestController.requestVideoPage);

// landlords
router.get("/editproperties/:id", AuthMiddleware.redirectLogin, PropertyController.editProperties);

// renters
router.get("/editrentals/:id", RentPropertyController.updateRentPropertyPage);

// common but a landlord cannot view this page
router.get("/chat/:id", ChatController.chatPage);
router.get("/userprofile/:id", DashboardController.viewUser);

// landlord
router.get("/chat/:id/:userId", ChatController.landlordChatPage);

// Routes
router.get('/properties/:id', mainController.propertyDetails);
router.get('/booking/:id', mainController.shortTermsPropertyDetails);
router.get('/dashboard', mainController.dashboard);

// Book
router.get('/book/:id', paymentController.book);

// Video
router.get('/properties/videos/:id', mainController.prepVideo);

// payments
router.get('/pay', AuthController.makePayment);
router.get('/payment', paymentController.payment);

router.get('/payment/landord', paymentController.landlord);
router.get('/payment/executive', paymentController.executive);
router.get('/payment-redirect', paymentController.paymentResponse);
router.get('/payment-failure', paymentController.paymentFailure);

router.get('/test/email', testController.email);

module.exports = router;