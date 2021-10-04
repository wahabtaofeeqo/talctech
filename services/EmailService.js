const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
	    user: process.env.EMAIL_USERNAME, // generated ethereal user
	    pass: process.env.EMAIL_PASSWORD // generated ethereal password
	},
});

exports.sendMail = async (email, message, subject = 'Talctech Rentals') => {
	try {
		let info = await transporter.sendMail({
		    from: process.env.EMAIL_FROM, // sender address
		    to: email, // list of receivers
		    subject: subject, // Subject line
		    html: message
		});
	}
	catch(e) {
		console.log("Error: " + e.message)
	}
}