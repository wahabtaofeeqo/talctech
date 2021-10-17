const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
	    user: process.env.EMAIL_USERNAME, // generated ethereal user
	    pass: process.env.EMAIL_PASSWORD // generated ethereal password
	},
});

// var transport = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "a1d9dcd558d94d",
//     pass: "7daf35b550709e"
//   }
// });


exports.sendMail = async (email, message, subject = 'Talctech Rentals') => {
	try {
		let info = await transport.sendMail({
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