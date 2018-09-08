module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // 任务名称，需依据插件的说明来写
        clean: ["tmp", "litetmp"],
        concat: {
            // 子任务名称，这名称随你起
            dev: {
                // 可选的配置參数
                options: {
                    banner: '/*!\n * <%= pkg.name %> - JS for Debug\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n * qq:93749937 | Licence: helojo\n */\n'
                },
                // 源文件路径
                src: [
                    'tmp/**/*.js'
                    //'../mergeLibs/*.js'
                ],
                // 执行任务后生成的目标文件
                dest: '../wxGameLib/bin/wxGameLib/wxGameLib.js'
            },
            // 子任务名称，这名称随你起
            dev5: {
                // 可选的配置參数
                options: {
                    banner: '/*!\n * <%= pkg.name %> - JS for Debug\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n * qq:93749937 | Licence: helojo\n */\n'
                },
                // 源文件路径
                src: [
                    'tmp/**/*.js'
                    //'../mergeLibs/*.js'
                ],
                // 执行任务后生成的目标文件
                dest: '../wxGameLib/bin/wxGameLib/wxGameLib.min.js'
            },
            dev2: {
                // 可选的配置參数
                options: {
                    banner: '/*!\n * <%= pkg.name %> - d.ts for Description\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n * qq:93749937 | Licence: helojo\n */\n'
                },
                // 源文件路径
                src: [
                    'tmp/**/*.d.ts'
                ],
                // 执行任务后生成的目标文件
                dest: '../wxGameLib/bin/wxGameLib/wxGameLib.d.ts'
            },
            dev3: {
                // 可选的配置參数
                options: {
                    banner: '/*!\n * <%= pkg.name %> - JS for Debug\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n * qq:93749937 | Licence: helojo\n */\n'
                },
                // 源文件路径
                src: [
                    'litetmp/**/*.js'
                ],
                // 执行任务后生成的目标文件
                dest: '../wxGameLib/bin/wxGameLib/wxGameLib_lite.js'
            },
            dev4: {
                // 可选的配置參数
                options: {
                    banner: '/*!\n * <%= pkg.name %> - d.ts for Description\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n * qq:93749937 | Licence: helojo\n */\n'
                },
                // 源文件路径
                src: [
                    'litetmp/**/*.d.ts'
                ],
                // 执行任务后生成的目标文件
                dest: '../wxGameLib/bin/wxGameLib/wxGameLib_lite.d.ts'
            }
        },
        uglify: {
            prod: {
                options: {
                    banner: '/*!\n * <%= pkg.name %> - compressed JS\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n *  qq:93749937 | Licence: helojo\n */\n'
                },
                files: {
                    '../../libsrc/uniLib/bin/uniLib/uniLib.min.js': ['<%= concat.dev.dest %>']
                }
            },
            lite: {
                options: {
                    banner: '/*!\n * <%= pkg.name %> - compressed JS\n * @licence <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n *  qq:93749937 | Licence: helojo\n */\n'
                },
                files: {
                    '../../libsrc/uniLib/bin/uniLib_lite/uniLib_lite.min.js': ['<%= concat.dev3.dest %>']
                }
            }
        },
        watch: {
            files: ['src/**/*.ts'],
            tasks: ['ts']
        },
        ts: {
            base: {
                src: ['Pmd/*.ts', '3party/**/*.ts', 'common/**/*.ts', 'src/**/*.ts'],
                dest: 'tmp',
                options: {
                    // module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    base_path: 'common',
                    comments: true, //生成注释
                    sourceMap: false,
                    declaration: true,
                    lib: [
                        "es5",
                        "dom",
                        "es2015.promise"
                    ]
                }
            },
            lite: {
                src: [
                ],
                dest: 'litetmp',
                options: {
                    // module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    base_path: 'src',
                    sourceMap: false,
                    declaration: true,
                    lib: [
                        "es5",
                        "dom",
                        "es2015.promise"
                    ]
                }
            }
        },
        jsObfuscate: {
            base: {
                options: {
                    concurrency: 2,
                    keepLinefeeds: false,
                    keepIndentations: false,
                    encodeStrings: true,
                    encodeNumbers: true,
                    moveStrings: true,
                    replaceNames: true,
                    variableExclusions: ['^_get_', '^_set_', '^_mtd_']
                },
                files: {
                    '../../libsrc/uniLib/bin/uniLib/uniLib.js': [
                        '../../libsrc/uniLib/bin/uniLib/uniLib.js'
                    ]
                }
            }
        }
    });

    // 加载要使用的插件
    grunt.loadNpmTasks('grunt-ts');
    // grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('js-obfuscator');
    // 注冊任务
    //grunt.registerTask('default', ['typescript:base', 'concat:dev', 'concat:dev2', /*"jsObfuscate:base",*/ "uglify:prod", "clean"]);
    grunt.registerTask('default', ['ts:base', 'concat:dev', 'concat:dev2', 'concat:dev5', /*"jsObfuscate:base",*/ "uglify:prod", "clean"]);
    grunt.registerTask('lite', ['ts:lite', 'concat:dev3', 'concat:dev4', "uglify:lite", "clean"]);

};