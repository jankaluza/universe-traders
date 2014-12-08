module.exports = function(grunt) {

  var pkgFile = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkgFile,
    clean: ['release'],
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
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', 'Default task', ['clean', 'uglify', 'copy']);

};
