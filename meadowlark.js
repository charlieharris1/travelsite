//  this is the projects entry point (aka app file)
var express = require('express');

var app = express();
// set up handlebars view engine. This creates a view engine and configures Express to use it by default. 
var handlebars = require('express-handlebars').create({ defaultLayout:'main' }); // default layout main means that unless you specify, this layout will be used for any view.

var fortunes = [
	"Conquer your feats or they will conquer you.",
	"Rivers need springs.",
	"Do not fear what you don't know",
	"You will have a pleasant suprise",
	"Whenever possible keep it simple",
];

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// function is invoked when the route is mapped
// allows me to override the port by setting the environment variable before the server is started.
app.set('port', process.env.PORT || 3000);
// add in the static middleware
// the static middleware has the same effect as creating a route for each static file you want to deliver that renders a file and returns it to the client. 
app.use(express.static(__dirname + '/public'));

// route
app.get('/', function (req, res){ // req = request object and res = response object
	res.render('home')
});

// about
app.get('/about', function (req, res){ // get is one of a number of HTTP verbs. GET and POST are the most common. 
	var randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)];
	res.render('about', { fortune: randomFortune });
});

// custom 404 page
app.use(function(req, res){ // app.use is a sort of catch all handler for anything that didn't match a route.
	res.status(404);
	res.render('404');
});

//custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
		res.status(500);
		res.render('500');
})

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get ('port') + ': press Ctrl-C to terminate');
});
