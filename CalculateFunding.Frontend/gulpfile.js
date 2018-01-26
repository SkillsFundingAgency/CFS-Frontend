/// <binding BeforeBuild='copy-assets, sass' ProjectOpened='watch-sass, ts:watch' />

"use strict";

var lodash = require("lodash"),
    gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    sass = require("gulp-sass"),
    uglify = require("gulp-uglify");

var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var merge = require('merge2');

var paths = {
    webroot: "./wwwroot/"
};

paths.js = paths.webroot + "assets/js/**/*.js";
paths.minJs = paths.webroot + "assets/js/**/*.min.js";
paths.css = paths.webroot + "assets/css/**/*.css";
paths.minCss = paths.webroot + "assets/css/**/*.min.css";
paths.concatJsDest = paths.webroot + "assetsjs/main.min.js";
paths.concatCssDest = paths.webroot + "assets/css/main.min.css";
paths.tsSource = "Scripts/*.ts"

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);

gulp.task("sass", function () {
    return gulp.src('wwwroot/assets/scss/main.scss')
        .pipe(sass({
            includePaths: [
                'node_modules/govuk_frontend_toolkit/stylesheets', // 1
                'node_modules/govuk-elements-sass/public/sass'     // 2
            ]
        }).on('error', sass.logError))
        .pipe(gulp.dest('wwwroot/assets/css'));
});

gulp.task('watch-sass', function () {
    gulp.watch('wwwroot/assets/scss/*.scss', ['sass']);
});

gulp.task('copy-assets', function () {
    var assets = {
        js: [
            './node_modules/bootstrap/dist/js/bootstrap.js',
            './node_modules/summernote/dist/summernote.min.js',
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/ace-builds/src-noconflict/ace.js',
            './node_modules/ace-builds/src-noconflict/mode-csharp.js',
            './node_modules/ace-builds/src-noconflict/mode-gherkin.js',
            './node_modules/ace-builds/src-noconflict/mode-vbscript.js',
            './node_modules/ace-builBds/src-noconflict/theme-twilight.js',
            './node_modules/ace-builds/src-noconflict/keybinding-emacs.js',
            './node_modules/ace-builds/src-noconflict/keybinding-vim.js',
            './node_modules/ace-builds/src-noconflict/ext-language_tools.js',
            './node_modules/ace-builds/src-noconflict/snippets/csharp.js',
            './node_modules/ace-builds/src-noconflict/snippets/gherkin.js',
            './node_modules/ace-builds/src-noconflict/snippets/vbscript.js',
            './node_modules/knockout/build/output/knockout-latest.js',
            './node_modules/knockout/build/output/knockout-latest.debug.js'


        ],
        css: [
            './node_modules/bootstrap/dist/css/bootstrap.css',
            './node_modules/summernote/dist/summernote.css',
            './node_modules/summernote/dist/**/*.woff',
            './node_modules/summernote/dist/**/*.eot',
            './node_modules/summernote/dist/**/*.ttf',
        ],
        fonts: [
            './node_modules/bootstrap/dist/fonts/*.*'
        ]
    };
    lodash(assets).forEach(function (assets, type) {
        gulp.src(assets).pipe(gulp.dest('./wwwroot/assets/libs/' + type));
    });

    var monacoSource = "./node_modules/monaco-editor/min/vs";
    var monacoSourceFiles = [
        "loader.js",
        "base/worker/workerMain.js",
        "basic-languages/src/vb.js",
        "editor/editor.main.js",
        "editor/editor.main.css",
        "editor/editor.main.nls.js",
        "editor/standalone/browser/quickOpen/symbol-sprite.svg"
    ];

    monacoSourceFiles.forEach(function (value) {
        var filePath = monacoSource + "/" + value;
        var relativePathIndex = value.lastIndexOf("/");
        var relativePath = "";
        if (relativePathIndex > 0) {
            relativePath = "/" + value.substring(0, relativePathIndex);
        }

        var destinationPath = "./wwwroot/assets/libs/js/monaco/vs" + relativePath;

        console.log(destinationPath);

        gulp.src(filePath).pipe(gulp.dest(destinationPath));
    });
});

gulp.task('ts:watch', function () {
    gulp.watch(paths.tsSource, ['ts:builddev']);
});

gulp.task("ts:builddev", function () {

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init()) // This means sourcemaps will be generated
        .pipe(tsProject());

    return tsResult
        .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
        .pipe(gulp.dest('wwwroot/js'));
});

gulp.task("ts:release", function () {

    var tsResult = tsProject.src()
        .pipe(tsProject())
        .pipe(uglify());

    return tsResult
        .pipe(gulp.dest('wwwroot/js'));
});