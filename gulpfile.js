var gulp = require('gulp')
var del = require('del')
var plumber = require('gulp-plumber')
var stylus = require('gulp-stylus')
var autoprefixer = require('gulp-autoprefixer')
var rename = require('gulp-rename')
var pug = require('gulp-pug')
var inject = require('gulp-inject')
var browserSync = require('browser-sync')
var reload = browserSync.reload

gulp.task('clean', function (cb) {
  return del([
    'dist/**/*'
  ], cb)
})

gulp.task('stylus', function () {
  return gulp.src('src/stylus/index.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(rename('index.css'))
    .pipe(autoprefixer({
      browsers: [
        'last 7 versions',
        'not ie <= 8'
      ]
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({
      stream: true
    }))
})

gulp.task('pug', function () {
  return gulp.src('src/views/*.pug')
    .pipe(plumber())
    .pipe(pug({
      doctype: 'html',
      baseDir: 'src/views',
      pretty: true
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('copy:vendor', function () {
  return gulp.src('src/vendor/**/*')
    .pipe(gulp.dest('dist/vendor'))
})

gulp.task('copy:assets', function () {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest('dist/assets'))
})

gulp.task('copy', ['copy:vendor', 'copy:assets'])

gulp.task('inject', ['stylus', 'pug'], function () {
  return gulp.src('dist/*.html')
    .pipe(inject(gulp.src([
      'dist/vendor/**/*',
      'dist/css/*.css'
    ], {
      read: false
    }), {relative: true}))
    .pipe(gulp.dest('dist'))
})

gulp.task('compile', ['copy', 'stylus', 'pug', 'inject'])

gulp.task('serve', ['compile'], function() {
  browserSync({
    server: {
      baseDir: 'dist'
    },
    port: 8003
  })

  gulp.watch('*.html', {cwd: 'dist'}, reload)
  gulp.watch('src/stylus/**/*.styl', ['stylus'])
  gulp.watch('src/views/**/*.pug', ['pug', 'inject'])
  gulp.watch([
    'src/vendor/**/*.*',
    'src/assets/**/*.*'
  ], ['copy'])
})
