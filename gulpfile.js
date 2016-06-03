// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
var notify = require('gulp-notify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify')
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync')

// Task
gulp.task('styles', function () {
  return gulp.src('src/styles/*.styl')
    .pipe(stylus())
    .pipe(concat('main.css'))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }));
})

gulp.task('scripts', function() {
  return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/assets/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function() {
    return del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img']);
});

gulp.task('build', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});



gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});


gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('src/styles/**/*.styl', ['build']);
  // Watch .js files
  gulp.watch('src/scripts/**/*.js', ['build']);
  // Watch image files
  gulp.watch('src/images/**/*', ['build']);
  // Create LiveReload server
  livereload.listen();
  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});
