const emailService = require("../services/EmailService");


exports.email = async (req, res, next) => {

	try {
		await emailService.sendMail('taofeekolamilekan218@gmail.com', 'Hello World');
		res.send('Hello');
	}
	catch(e) {
		res.send(e.message);
	}

}