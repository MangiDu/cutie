var fs = require('fs')
var path = require('path')
var del = require('del')
var merge = require('merge2')
var lazypipe = require('lazypipe')

var gulp = require('gulp')
var plumber = require('gulp-plumber')
var cached = require('gulp-cached')
var remember = require('gulp-remember')
var pug = require('gulp-pug')
var stylus = require('gulp-stylus')
var autoprefixer = require('gulp-autoprefixer')
var cleanCSS = require('gulp-clean-css')
var spriter = require('gulp-css-spriter')
var inject = require('gulp-inject')

var browserSync = require('browser-sync').create()

// clean dist
gulp.task('clean', function (cb) {
  return del([
    'dist/**/*'
  ], cb)
})

// compile stylus
var compileStylus = lazypipe()
  .pipe(plumber)
  .pipe(stylus)
  .pipe(cleanCSS, {
    format: 'beautify',
    level: 2
  })
  .pipe(autoprefixer, {
    browsers: [
      'last 7 versions',
      'not ie <= 8'
    ]
  })

gulp.task('stylus:common', function () {
  return gulp.src('src/stylus/common/index.styl')
    .pipe(compileStylus())
    .pipe(gulp.dest('dist/css/common'))
})

gulp.task('stylus:app', function () {
  return gulp.src('src/stylus/app/*.styl')
    .pipe(cached('stylus:app'))
    .pipe(compileStylus())
    .pipe(remember('stylus:app'))
    .pipe(gulp.dest('dist/css/app'))
})

gulp.task('stylus', ['stylus:common', 'stylus:app'])

// compile pug
gulp.task('pug', function () {
  return gulp.src('src/views/*.pug')
    .pipe(cached('pug'))
    .pipe(plumber())
    .pipe(pug({
      doctype: 'html',
      baseDir: 'src/views',
      pretty: true
    }))
    .pipe(remember('pug'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
})

// copy static files
gulp.task('copy:vendor', function () {
  return gulp.src('src/vendor/**/*')
    .pipe(cached('copy:vendor'))
    .pipe(gulp.dest('dist/vendor'))
})

gulp.task('copy:assets', function () {
  return gulp.src('src/assets/**/*')
    .pipe(cached('copy:assets'))
    .pipe(gulp.dest('dist/assets'))
})

gulp.task('copy', ['copy:vendor', 'copy:assets'])

// inject style or script files into html
gulp.task('inject', ['stylus', 'pug', 'copy:vendor'], function () {
  var stms = []
  var pattern = /html/

  fs.readdirSync('dist').forEach(function(file) {
    filePath = 'dist/' + file
    var stat = fs.statSync(filePath)
    var nameArr = file.split('.')
    // 因为只取这一级，所以非目录就是文件了
    if (stat && !stat.isDirectory() && pattern.test(nameArr[1])) {
      // 取以前缀为名的样式文件
      var prefix = nameArr[0].split('-')[0]
      var cssPath = 'dist/css/app/' + prefix + '.css'
      var stm = gulp.src(filePath)
        .pipe(inject(gulp.src([
          'dist/vendor/**/*',
          'dist/css/common/index.css'
        ], {
          read: false
        }), {
          relative: true
        }))
        .pipe(inject(gulp.src(cssPath, {
          read: false
        }), {
          name: 'single',
          relative: true
        }))
      stms.push(stm)
    }
  })
  // 返回合并的stream并输出到指定目录
  return merge(stms).pipe(gulp.dest('dist'))
})

gulp.task('compile', ['copy', 'stylus', 'pug', 'inject'])


var reload = browserSync.reload
gulp.task('serve', ['compile'], function() {
  browserSync.init({
    server: './dist',
    port: 8003
  })

  gulp.watch('dist/*.html').on('change', reload)
  gulp.watch('dist/vendor/**/*').on('change', reload)
  gulp.watch('dist/assets/**/*').on('change', reload)

  gulp.watch('src/stylus/**/*.styl', ['inject'])
  gulp.watch('src/views/**/*.pug', ['inject'])
  gulp.watch([
    'src/vendor/**/*.*',
    'src/assets/**/*.*'
  ], ['copy'])
})

// 生成雪碧图
gulp.task('sprite', function () {
  return gulp.src('dist/css/common/*.css')
    .pipe(spriter({
      'spriteSheet': 'dist/assets/spritesheet.png',
      'pathToSpriteSheetFromCSS': '../../assets/spritesheet.png'
    }))
    .pipe(gulp.dest('dist/css/common'))
})
