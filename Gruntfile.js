module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        js_dir: "src",
        project_dir: ".",
        clean: [
            "build"
        ],
        concat: {
            "options": {"separator": ";"},
            "build": {
                "src": require("./config/js.json"),
                "dest": "build/debug/js/fm-js-all.js"
            }
        },
        uglify: {
            files: {
                src: "build/debug/js/fm-js-all.js",
                dest: "build/production/js/fm-js-all.js"
            }
        },
        copy: {
           main: {
                files: [
                    {
                        expand: true,
                        src: require("./config/resources.json"),
                        dest: 'build/debug',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        src: require("./config/resources.json"),
                        dest: 'build/production',
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['clean', 'concat', 'uglify','copy']);
};

