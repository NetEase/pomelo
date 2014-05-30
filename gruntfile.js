'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks("grunt-jscoverage"); 
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  var src = ['test/manager/taskManager.js', 'test/filters/*.js', 
  'test/remote/*.js', 'test/service/*.js', 'test/util/*.js', 'test/*.js'];

  // Project configuration.
  grunt.initConfig({
    jscoverage: {
      options: {
        inputDirectory: 'lib',
        outputDirectory: 'lib-cov'
      }
    },
    mochaTest: {
       test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: src
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: src
      }
    },
    clean: {
      coverage: {
        src: ['lib-cov/']
      },
      "coverage.html" : {
        src: ['coverage.html']
      }
    },
    jshint: {
      all: ['lib/*']
    }
  });

  // Default task.
  grunt.registerTask('default', ['clean', 'jscoverage', 'mochaTest', 'jshint:all']);
};