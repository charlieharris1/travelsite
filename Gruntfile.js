module.exports = function(grunt){
	// grunt relies on plugins. 
	// load plugin. This specifies the plugins that we will be using.
	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',
		// 'grunt-exec',
	].forEach(function(task){
		grunt.loadNpmTasks(task); // means that you dont have to type in loadNpmTasks over and over. 
	});

	// configure plugins. This section gets each plugin working properly
	grunt.initConfig({
		cafemocha: {
			all: { src: 'qa/tests-*.js', options: { ui: 'tdd' }, } // need to tell it where our tests are located. If you are mixing tdd and bdd you would have to separate the tests.
		},
		jshint: { // have to spefify  what Javascript files  should be linted. 
			app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'], 
			qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
		},
		// exec: {
		// 	linkchecker: { cmd: 'linkchecker http://localhost:3000' }
		// },
	});	

	// register tasks. This puts individual plugins in to named groups. 
	grunt.registerTask('default', ['cafemocha','jshint']); // default is a specially named task that will be run if you just type grunt. 
};