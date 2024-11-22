const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify'); // Add gulp-uglify for JS minification

// JavaScript task
gulp.task('js', function() {
    return gulp.src('src/js/script.js')
        .pipe(uglify()) // Minify JavaScript
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/js'));
});

// CSS task
gulp.task('css', function() {
    return gulp.src('src/css/styles.css')
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'));
});

// Watch task
gulp.task('watch', function() {
    gulp.watch('src/js/script.js', gulp.series('js'));
    gulp.watch('src/css/styles.css', gulp.series('css'));
});

// Default task
gulp.task('default', gulp.series(gulp.parallel('js', 'css'), 'watch'));
