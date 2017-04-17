var gulp = require('gulp')
var stylus = require('gulp-stylus')
var browserSync = require('browser-sync')
var reload = browserSync.reload

gulp.task('stylus', function () {
  gulp.src('./src/stylus/portal.styl')
    .pipe(stylus())
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
