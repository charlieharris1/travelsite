suite('Global Tests', function(){
	test('page has a valid title', function(){
		assert(document.title && document.title.match(/\S/) && 
			document.title.toUpperCase() !== 'TODO');
	});
});

// BDD = Behaviour-driven-development. This makes you think in a behavioral sense. 
// In BDD you describe components and their behaviours and the tests then verify them.

// TDD (test driven development). Here you describe suites of tests and tests within the suite. 
