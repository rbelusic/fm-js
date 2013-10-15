module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        js_dir: "src",
        project_dir: ".",
        clean: [
            "build","doc/generated","release"
        ],
        concat: {
            "options": {"separator": "\n"},
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
            resources: {
                files: [
                    {
                        expand: true,
                        src: require("./config/resources.json"),
                        dest: 'build/debug',
                        filter: 'isFile'
                    }
                ]
            }
        },
        exec: {
            mkreleasedir: {
                command: "mkdir -p release/gh-pages/releases && cp -r doc release/gh-pages/apidoc"
            },
            run_jsdoc2: {
              command: 'node node_modules/jsdoc-toolkit/ -r=99 src/ -t=node_modules/jsdoc-toolkit/templates/jsdoc -d=doc/generated',
              stdout: true
            }
        },
        compress: {
            release: {
                options: {
                    archive: 'release/gh-pages/releases/fm-js-latest.zip'
                },
                files: [
                    {src: ['build/**','doc'], dest: 'fm-js'}
                ]
            }
        },
        shell: {
            ghpagesclone: {
                command: 'git clone -b gh-pages https://github.com/rbelusic/fm-js.git release/gh-pages'
            }
        },
        git_deploy: {
            relzip: {
                options: {
                    url: 'https://github.com/rbelusic/fm-js.git',
                    branch: 'gh-pages'
                },
                src: 'release/gh-pages',
                message: "Travis build"
            },
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-git-deploy');
    grunt.loadNpmTasks('grunt-shell');



    grunt.registerTask('build', ['clean','concat', 'uglify','copy:resources']);
    grunt.registerTask('apidoc', ['exec:run_jsdoc2']);
    grunt.registerTask('publish', [
        'shell:ghpagesclone', 'exec:mkreleasedir', 'compress:release',
        'git_deploy:relzip'
    ]);
 

    grunt.registerTask('default', ['build', 'apidoc']);
    grunt.registerTask('travis', ['default', 'publish']);
};

