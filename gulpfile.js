var path = require('path')
var gulp = require('gulp')
var del = require('del')
var plumber = require('gulp-plumber')
var stylus = require('gulp-stylus')
var autoprefixer = require('gulp-autoprefixer')
var rename = require('gulp-rename')
var spriter = require('gulp-css-spriter')
var pug = require('gulp-pug')
var inject = require('gulp-inject')
var through = require('through2')
var browserSync = require('browser-sync')
var cleanCSS = require('gulp-clean-css')
var reload = browserSync.reload

gulp.task('clean', function (cb) {
  return del([
    'dist/**/*'
  ], cb)
})

gulp.task('stylus:common', function () {
  return gulp.src('src/stylus/common/index.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(rename('common.css'))
    .pipe(cleanCSS({
      format: 'beautify',
      level: 2
    }))
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

gulp.task('stylus:app', function () {
  return gulp.src('src/stylus/app/*.styl')
  .pipe(plumber())
  .pipe(stylus())
  .pipe(cleanCSS({
    format: 'beautify',
    level: 2
  }))
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

gulp.task('stylus', ['stylus:common', 'stylus:app'])

gulp.task('sprite', function () {
  return gulp.src('dist/css/*.css')
    .pipe(spriter({
      'spriteSheet': 'dist/img/spritesheet.png',
      'pathToSpriteSheetFromCSS': '../img/spritesheet.png'
    }))
    .pipe(gulp.dest('dist/css'))
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
  var stream = gulp.src('dist/*.html')
    .pipe(inject(gulp.src([
      'dist/vendor/**/*',
      'dist/css/common.css'
    ], {
      read: false
    }), {
      relative: true
    }))
    // https://github.com/klei/gulp-inject/issues/80
    .pipe(through.obj(function (file, enc, cb) {
      var filename = file.relative.split('.')[0]
      var filepath = 'dist/css/' + filename + '.css'
      console.log('creating pipe for ' + filename)
      stream = stream.pipe(inject(gulp.src(filepath, {
        read: false
      }), {
        name: 'single',
        relative: true
      }))
      this.push(file)
      cb();
    }))
  return stream.pipe(gulp.dest('dist'))
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
