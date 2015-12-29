var express = require('express');
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var credentials = require('./credentials.js');
var emailService = require('./lib/email');

var app = express();

// dummy function to get the current weather data
function getWeatherData(){
	return {
		locations: [
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)',
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)',
			},
		],
	};
}
// set up handlebars view engine
var handlebars = require('express3-handlebars').create({ // package that provides Handlesbars support for Express. 
    defaultLayout:'main', // when we created the view engine, we specified the name of the default layout
    helpers: { 
        section: function(name, options){ // section is a helper
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.disable('x-powered-by');
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

// app.use inserts middleware into the pipeline
app.use(express.static(__dirname + '/public'));

// set 'showTests' context property if the querystring contains test=1
app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && 
		req.query.test === '1';
	next();
});

// create middleware to inject the dummy wather data int res.locals.partials object
app.use(function(req, res, next){
	if(!res.locals.partials)
	res.locals.partials = {};
	res.locals.partials.weatherContext = getWeatherData(); // this sets the weatherContext to equal the dummy data we are passing in. 
	next();
});

// middleware to parse the URL-encoded body we will recive in the POST. Req.body is now available. 
app.use(require('body-parser').urlencoded({extend: true}));

// cookie-parser middleware
app.use(require('cookie-parser')(credentials.cookieSecret));

// express-session middleware
app.use(require('express-session')({
	resave: false, // forces session to be saved back to the store even if the request wasn't modified
	saveUninitialized: false, // setting this to true causes new sessions to be saved to the store, even if they haven't been modified (need to be false when you need to task  the users permission)
	secret: credentials.cookieSecret, // the key used to 
}));

// this middleware adds the flash object to the context if theres one in the session. 
app.use(function(req, res, next){
	// if there is a flash message, transfer it to the context then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
})

// by default, Express looks for views in the 'views' subdirectory and 'layouts' in 'views/layouts'
app.get('/', function(req, res) {
	res.render('home');
});

app.get('/newsletter', function(req, res){
	res.render('newsletter', { csrf: 'CSRF token goes here'});
});

app.post('/process', function(req, res){	
	if(req.xhr || req.accepts('json,html')==='json'){ // req.xhr is an express conveninece method which will be true if the request is an ajax request. Req.accepts will will try to determine the most appropriate response type to return. 
		// if there were an error we would send {error: 'error description'}
		res.send({success: true});
	} else {
		// if there were an error we would redirect to an error page
		res.redirect(303, '/thank-you');
	}
});

app.get('/headers', function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '/n';
	res.send(s);
});

app.get('/error', function(req, res) {
	res.render('error');
})
app.get('/thank-you', function(req, res){
	res.render('thank-you');
});

app.get('/about', function(req,res){
	res.render('about', { 
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js' 
	} );
});
app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res){
	res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});
app.get('/jquery-test', function(req, res){
	res.render('jquery-test');
});

// route handler for nursery rhyme page
app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});
// route handler for our AJAX call
app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});

app.get('/contest/vacation-photo', function(req, res){
    var now = new Date();
    res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.post('/cart/checkout', function(req, res){
	var cart = req.session.cart;
	if(!cart) next(new Error('Cart does not exist'));
	var name = req.body.name || '', 
		email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX))
		return res.next(new Error('Invalid email address.'));
	// assign random cart ID; normally we would use database id here
	cart.number = Math.random().toString().replace(/^0\.0*/, '');
	cart.billing = {
		name: name,
		email: email,
	};
	// Renders a view and sends the rendered HTML string to the client. A callback function is an optional parameter. If provided, the method returns both the possible error and rendered string. When an error occurs, the method invokes next(err) internally.
    res.render('email/cart-thank-you', 
    	{ layout: null, cart: cart }, function(err,html){
	        if( err ) console.log('error in email template');
	        emailService.send(cart.billing.email,
	        	'Thank you for booking your trip with Meadowlark Travel!',
	        	html);
	    }
    );
	/* This is the second time that res.render is called. Ordinarily you would call it once
	   becuase calling it twice will display only the results of the first call. 
	   However, in this instance we're circumventing the normal rendering process the first time we call it: notice that we provide a callback. 
	   Doing this prevents the results of the view being rendered in to the browser. The callback recives a rendered view view in the parameter html: all we need to do is take the rendered HTML and send the email.
	 */
	res.render('cart-thank-you', { cart: cart }); // this page is rendered once the email has been sent above.
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});
