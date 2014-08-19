module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      files: ["Gruntfile.js", "js/*.js", "test/**/*.js"],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ["<%= jshint.files %>"],
      tasks: ["jshint"]
    },
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: "*"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-connect");

  grunt.registerTask("dev", ["connect:server", "watch"]);


};

