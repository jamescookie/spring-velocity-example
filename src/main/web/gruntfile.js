var banner = '/* Copyright <%= pkg.author %>, <%= grunt.template.today("yyyy") %> */\n';

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            js: ['js/prod.min.js']
        },

        compass: {
            clear: {
                options: {
                    clean: true,
                    basePath: '.',
                    sassDir: './scss',
                    cssDir: './css'
                }
            },
            dev: {
                options: {
                    force: true,
                    basePath: '.',
                    sassDir: './scss',
                    cssDir: './css',
                    environment: 'prod',
                    sourcemap: true,
                    noLineComments: true
                }
            }
        },

        cssmin: {
            dev: {
                options: { banner: banner},
                files: {
                    'css/main.css': ['css/main.css']
                }
            }
        },

        concat: {
            options: { separator: ';' },
            dev: {
                src: ['js/main/*.js'],
                dest: 'js/prod.min.js'
            }
        },

        /*
         * ===== Debugging Specs =====
         * Step 1 - Install node-inspector using "npm install node-inspector -g" command
         * Step 2 - Start node inspector using "node_modules/node-inspector/bin/inspector.js --web-port=9090"
         * Step 3 - Run "grunt mochacli:all --testDebug=true"
         *
         * To run single/group of tests use --specPattern='<regular expression>' option
         */

        mochacli: {
            options: {
                ui: 'bdd',
                bail: true,
                'debug-brk': grunt.option('testDebug'),
                'grep': grunt.option('specPattern')
            },
            all: ['js/test/*.js']
        },

    });

    // Load Grunt plugins
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Tasks to test the js
    grunt.registerTask('test-app', ['concat:dev', 'mochacli']);

    // Tasks to regenerate spritesheet file and Sass
    grunt.registerTask('common', ['compass:dev', 'concat:dev', 'cssmin:dev', 'test-app']);

    // Default dev tasks
    grunt.registerTask('default', ['common']);
};