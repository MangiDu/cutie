var gulp = require('gulp')
var plumber = require('gulp-plumber')
var stylus = require('gulp-stylus')
var rename = require('gulp-rename')
var browserSync = require('browser-sync')
var reload = browserSync.reload

gulp.task('stylus', function () {
  gulp.src('./src/stylus/index.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(rename('pt.css'))
    .pipe(gulp.dest('./src/css'))
    .pipe(reload({
      stream: true
    }))
})

gulp.task('serve', ['stylus'], function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    port: 8003
  })

  gulp.watch('*.html', {cwd: 'src'}, reload)
  gulp.watch('./src/stylus/*.styl', ['stylus'])
})
