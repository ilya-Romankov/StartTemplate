"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require("gulp-rename")
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const pug = require('gulp-pug');
const babel = require("gulp-babel");
const del = require("del");
const server = require("browser-sync").create();


gulp.task("css", function() {
  return gulp.src("src/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("js-compress", function () {
  return gulp.src(["src/js/*.js"])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(plumber())
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
});


gulp.task("images", function() {
  return gulp.src("src/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("src/img"));
});

gulp.task("sprite", function() {
  return gulp.src("src/img/icon-s-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task('pug', function() {
  return gulp.src("src/*.pug")
  .pipe(pug())
  .pipe(gulp.dest("build"));
});

gulp.task("html", function() {
  return gulp.src("src/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
      "src/fonts/**",
      "src/img/**"
    ], {
      base: "src"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("server", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("src/blocks/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("src/style.scss", gulp.series("css"));
  gulp.watch("src/js/*.js", gulp.series("js-compress", "refresh"));
  gulp.watch("src/img/icon-s-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("src/*.html", gulp.series("html", "refresh"));
  gulp.watch("src/*.html").on("change", server.reload);
  gulp.watch("src/*.pug", gulp.series("pug"));
  gulp.watch("src/blocks/**/*.pug", gulp.series("pug"));
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
});
gulp.task("build", gulp.series("clean", "copy", "css", "js-compress", "sprite", "html", "pug"));
gulp.task("start", gulp.series("build", "server"));
