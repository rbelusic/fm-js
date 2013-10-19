module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        js_dir: "src",
        project_dir: ".",
        ci_branch: process.env.TRAVIS_BRANCH,
        gitinfo: {
        },
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
            },
            prepare_release: {
                command: 'bash bin/_prepare_release',
                stdout: true
            },
            commit_release: {
                command: 'bash bin/_commit_release',
                stdout: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-exec');
        
    grunt.registerTask(
        'create_releases_list',
        'Parse JSON table with releases and add new one.',
        function() {
            function getVersion() {
                var version = grunt.config('ci_branch');

                grunt.log.writeln("Version: " + version + "/ " + version.substring(1));

                if (!version || version.substring(0, 1) != 'v') {
                    grunt.log.error('This is not release tag. Abortiong ...');
                    return false;
                }
                var x = version.substring(1).split('.');
                var verArr = {
                    major: parseInt(x[0]) || -1,
                    minor: parseInt(x[1]) || -1,
                    fix: x[2] || ""
                };                
                if (verArr.major == -1 || verArr.minor == -1) {
                    grunt.log.error('This is not release tag. Abortiong (2) ...');
                    return false;
                }
                verArr.str = '' + verArr.major + "." + verArr.minor + "." + verArr.fix;
                verArr.filename = 'fm-js-' + verArr.str;
                
                verArr.date = new Date().getTime();
                verArr.relID = 
                    verArr.major * 10000000 + 
                    verArr.minor * 100000 +
                    (
                        verArr.fix.substring(0, 3) == 'rel' ? 
                        (parseInt(verArr.fix.substring(3)) || 0) * 1000 :
                        (
                        verArr.fix.substring(0, 2) == 'rc' ?
                        (parseInt(verArr.fix.substring(2)) || 0) * 10: (parseInt(verArr.fix) || 0)
                        )
                    )
                ;
                
                return verArr;
            }

            // get git branch name and parse version numbers
            var ver = getVersion();
            if (ver == false) {
                return false;
            }
            
            
            grunt.log.writeln('Version info: ' + JSON.stringify(ver));

            // load releases table
            var relarr = grunt.file.readJSON("release/gh-pages/data/releases.json");
            if (!relarr || relarr.constructor.toString().indexOf("Array") == -1) {
                relarr = []; 
            }
            grunt.log.writeln('Old release table: ' + JSON.stringify(relarr));
            relObjs = {};
            for (var rel in relarr) {
                relObjs[relarr[rel].relid] = relarr[rel];
            }
            grunt.log.writeln('Old release objects: ' + JSON.stringify(relObjs));

            //modify release table            
            if (ver.fix.substring(0, 3) == 'rel') {
                relObjs["99999999"] = {
                    version: "latest stable (recomended download)",
                    relid: 99999999,
                    link: "releases/" + ver.filename + ".zip",
                    doc: "apidoc/" + ver.filename + "/index.html",
                    deployed: rel.date
                };
            } else {
                relObjs["99999990"] = {
                    version: "latest unstable",
                    relid: 99999990,
                    link: "releases/" + ver.filename + ".zip",
                    doc: "apidoc/" + ver.filename + "/index.html",
                    deployed: rel.date
                };
            }
            relObjs['' + ver.relID] = {
                version: ver.str,
                relid: ver.relID,
                link: "releases/" + ver.filename + ".zip",
                doc: "apidoc/" + ver.filename + "/index.html",
                deployed: rel.date
            };
            grunt.log.writeln('New release objects: ' + JSON.stringify(relObjs));

            relarr = [];
            for (var rel in relObjs) {
                relarr.push(relObjs[rel]);
            }
            relarr.sort(function(a, b) {
                return b.relid - a.relid
            });

            // save release table back
            grunt.log.writeln('New release table: ' + JSON.stringify(relarr));
            //grunt.file.write('release/gh-pages/data/releases.json', JSON.stringify(relarr));

            return true;
        });


    grunt.registerTask('build', ['clean', 'concat', 'uglify', 'copy:resources']);
    grunt.registerTask('apidoc', ['exec:run_jsdoc2']);
    grunt.registerTask('publish', [
        'exec:prepare_release', 'create_releases_list','exec:commit_release'
    ]);

    grunt.registerTask('default', ['build', 'apidoc']);
    grunt.registerTask('ci', ['default', 'publish']);
};

