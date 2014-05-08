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
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    jscoverage: {
      options: {
        inputDirectory: 'lib',
        outputDirectory: 'lib-cov'
      }
    },
    mochaTest: {
      dot: {
        options: {
          reporter: 'dot',
          timeout: 5000
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
  grunt.registerTask('default', ['clean', 'jscoverage', 'mochaTest:dot', 'jshint:all']);

  grunt.registerTask('test-cov', 'run mocha html-cov reporter to coverage.html', function() {
    process.env.POMELO_COV = 1;
    grunt.task.run(['mochaTest:coverage']);
  });
};