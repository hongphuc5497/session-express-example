const express = require('express');
const app = express();
const session = require('express-session');
const fileStore = require('session-file-store')(session);
const path = require('path');
const bodyParser = require('body-parser');

const demoAdmin = {
	username: 'admin2',
	password: 'password',
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		name: 'session-id',
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		store: new fileStore(),
	})
);

const authMiddleware = (req, res, next) => {
	console.log(req.session);

	if (!req.session.user) {
		let authHeader = req.headers.authorization;

		let err = new Error('Not authenticated');
		err.status = 401;
		res.setHeader('WWW-Authenticate', 'Basic');
		next(err);

		let auth = Buffer.from(authHeader.split(' ')[1], 'base64')
			.toString()
			.split(':');
		console.log('🚀 ~ file: index.js ~ line 33 ~ authMiddleware ~ auth', auth);

		let username = auth[0];
		let password = auth[1];
		if (username === demoAdmin.username && password === demoAdmin.password) {
			req.session.user = demoAdmin.username;
			next();
		} else {
			let err = new Error('Not authenticated');
			err.status = 401;
			res.setHeader('WWW-Authenticate', 'Basic');
			next(err);
		}
	} else {
		if (req.session.user === demoAdmin.username) {
			next();
		} else {
			let err = new Error('Not authenticated');
			err.status = 401;
			res.setHeader('WWW-Authenticate', 'Basic');

			return next(err);
		}
	}
};

app.use(authMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('Server is running on port 3000');
});
