'use strict';

module.exports = function(grunt) {
	
	grunt.initConfig({
		compass: {
		    dist: {
		      options: {
		        sassDir: 'src',
		        cssDir: 'public/css'
		      }
		    }
		}
	});

	grunt.loadNpmTasks("grunt-contrib-compass");
	
	grunt.registerTask("default",["compass"]);

};