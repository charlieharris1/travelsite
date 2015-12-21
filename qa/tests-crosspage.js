var Browser = require('zombie'),
	assert = require('chai').assert;

var browser;

suite('Cross-page tests', function(){
	// setup takes a function that will get executed by the test framework before each test is run. This is where we create a new browser instance for each test.
	setup(function(){
		browser = new Browser();
	});
	test('requesting a group rate quote from the Hood River tour page' + 'should populate the referrer field', function(done){
		var referrer = 'http://localhost:3000/tours/hood-river';	
		browser.visit(referrer, function(){ // browser.visit will actually load the page. When the page is loaded, the callback function will be invoked.
			browser.clickLink('.requestGroupRate', function(){ // this looks for a link with the class name of requestGroupRate and follows it.								
				assert(browser.field('referrer').value); // the browser.field method returns a DOM Element object which has a value property.		
					done();
			});
		});
	});
	test('requesting a group rate quote from the oregon coast tour page' + 'should populate the referrer field', function(done){
		var referrer = 'http://localhost:3000/tours/oregon-coast';
		browser.visit(referrer, function(){ 
			browser.clickLink('.requestGroupRate', function(){
				assert(browser.field('referrer').value === referrer);
					done();
			});
		});
	});
	test('requesting the group rate page directly should result' + 'in an empty referrer field', function(done){
		browser.visit('http://localhost:3000/tours/request-group-rate', function(){
			browser.clickLink('.requestGroupRate', function(){
				assert(browser.field('referrer').value === '');
					done();
			});
		});
	});
});