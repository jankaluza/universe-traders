module.exports = function(grunt) {

  var pkgFile = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkgFile,
    clean: ['release', "docs"],
    uglify: {
      production: {
        files: {
          'release/js/ut.js': 'js/*.js'
        }
      }
    },
    copy: {
        production: {
            files: [
            {src:'bower_components/pixi.js/bin/pixi.js', dest:'release/js/pixi.js'},
            {src:'bower_components/radio/radio.min.js', dest:'release/js/radio.min.js'},
            {src:'resources/**', dest:'release/'},
            {src:'index_release.html', dest:'release/index.html'}
            ]
        }
    },
    yuidoc: {
        compile: {
            name: 'Universe Traders',
            description: 'Trade across the whole universe in your browser!',
            version: '0.1',
            url: 'http://universe-traders.org',
            options: {
                paths: 'js',
                themedir: 'docs_theme',
                outdir: 'docs'
            }
        }
    },
    nodeunit: {
        all: ['test/*_test.js']
    },
    jshint: {
        uses_defaults: ["js/*.js"],
        options: {
            browser: true,
            laxbreak: true
        }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', 'Default task', ['clean', 'uglify', 'copy', 'yuidoc']);
  grunt.registerTask('test', 'Test', ['nodeunit', 'jshint']);

};
