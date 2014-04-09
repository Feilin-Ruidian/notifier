var express = require('express');
var config = require('../config');
var db = require('../source/db')(config);

var app = express();

var cors = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-Revision, Content-Type');

	next();
};

app.configure(function(){
	app.set('port', process.env.PORT || 3031);
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(cors);
	app.use(express.methodOverride());
	app.use(app.router);
});

function checkAccessToken(req, res, next) {
	var accessToken = req.query.access_token;

	if (!accessToken) {
		return res.send(401, {message: 'access_token is missing'});
	}

	if (accessToken !== config.accessToken) {
		return res.send(401, {message: 'access_token is wrong'});
	}

	next();
}

app.post('/api/events', checkAccessToken, function (req, res) {
	db.events.save(req.body, function (err, event) {
		if (err) {
			return res.send(500, {message: 'failed to save event'});
		}

		res.send(201);
	});
});

app.listen(app.get('port'), function () {
	console.log('notify server started, port: ' + app.get('port') + ' env: ' + process.env.NODE_ENV || 'development');
});