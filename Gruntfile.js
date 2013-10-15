module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        js_dir: "src",
        project_dir: ".",
        clean: [
            "build", "release"
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
                    },
                    {
                        expand: true,
                        src: require("./config/resources.json"),
                        dest: 'build/production',
                        filter: 'isFile'
                    }
                ]
            }
        },
        exec: {
            run_jsdoc2: {
                command: 'mkdir -p build && node node_modules/jsdoc-toolkit/ -r=99 src/ -t=node_modules/jsdoc-toolkit/templates/jsdoc -d=build/apidoc',
                stdout: true
            }
        },
        compress: {
            release: {
                options: {
                    archive: 'release/gh-pages/releases/fm-js-latest.zip'
                },
                files: [
                    {src: ['build/**'], dest: 'fm-js'}
                ]
            }
        },
        shell: {
            mk_release: {
                command: [
                    'git clone -b gh-pages https://github.com/rbelusic/fm-js.git release/gh-pages',
                    'export BCWD=$(cwd)',
                    'cd release/gh-pages',
                    'git checkout gh-pages',
                    'mkdir -p releases',
                    'cp -r $BCWD/build/apidoc .',
                    '## deplykeys',
                    'git config user.name "$GIT_NAME"',
                    'git config user.email "$GIT_EMAIL"',
                    'git config credential.helper "store --file=.git/credentials"',
                    'echo "https://$GH_TOKEN:@github.com" >.git/credentials',
                    'git add *',
                    'git commit -m "CI script build"',
                    '# git push',                    
                    'cd $BCWD'                 
                ].join('&&')
            }
        },
        git_deploy: {
            release: {
                options: {
                    url: 'https://github.com/rbelusic/fm-js.git',
                    branch: 'gh-pages'
                },
                src: 'release/gh-pages',
                message: "CI release build"
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



    grunt.registerTask('build', ['clean', 'concat', 'uglify', 'copy:resources']);
    grunt.registerTask('apidoc', ['exec:run_jsdoc2']);
    grunt.registerTask('publish', [
        'shell:mk_release', 'compress:release',
        'git_deploy:release'
    ]);


    grunt.registerTask('default', ['build', 'apidoc']);
    grunt.registerTask('ci', ['default', 'publish']);
};

