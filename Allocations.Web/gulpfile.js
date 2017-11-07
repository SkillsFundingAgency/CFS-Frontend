/// <binding BeforeBuild='sass, copy-assets' />
"use strict";

var lodash = require("lodash"),
    gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    sass = require("gulp-sass"),
    uglify = require("gulp-uglify");

var paths = {
    webroot: "./wwwroot/"
};

paths.js = paths.webroot + "assets/js/**/*.js";
paths.minJs = paths.webroot + "assets/js/**/*.min.js";
paths.css = paths.webroot + "assets/css/**/*.css";
paths.minCss = paths.webroot + "assets/css/**/*.min.css";
paths.concatJsDest = paths.webroot + "assetsjs/main.min.js";
paths.concatCssDest = paths.webroot + "assets/css/main.min.css";

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

/// <binding BeforeBuild='copy-assets' />
"use strict";

var _ = require('lodash'),
    gulp = require('gulp');

gulp.task('copy-assets', function () {
    var assets = {
        js: [
            './node_modules/bootstrap/dist/js/bootstrap.js',
            './node_modules/jquery/dist/jquery.min.js'
        ],
        css: ['./node_modules/bootstrap/dist/css/bootstrap.css'],
        fonts: ['./node_modules/bootstrap/dist/fonts/*.*'],
    };
    _(assets).forEach(function (assets, type) {
        gulp.src(assets).pipe(gulp.dest('./wwwroot/assets/libs/' + type));
    });
});