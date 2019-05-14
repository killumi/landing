/* DEV PLUGINS------------------------------------------------------------------
 ---------------------------------------------------------------------------- */
const gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  pug = require('gulp-pug'),
  twig = require('gulp-twig'),
  babel = require('gulp-babel'),
  sass = require("gulp-sass"),
  prefix = require("gulp-autoprefixer"),
  minifyCss = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  sourcemaps = require("gulp-sourcemaps"),
  callback = require('gulp-callback'),
  clean = require('gulp-clean'),
  notify = require('gulp-notify'),
  browserSync = require('browser-sync'),
  compass = require('gulp-compass'),
  iconfont = require("gulp-iconfont"),
  iconfontCss = require("gulp-iconfont-css");

/* PRODUCTION PLUGINS ----------------------------------------------------------
 ---------------------------------------------------------------------------- */
const useref = require('gulp-useref'),
  wiredep = require('wiredep').stream,
  gulpif = require('gulp-if');

/* SOURCES --------------------------------------------------------------------
 ---------------------------------------------------------------------------- */
const sources = {
  html: {
    src: 'app/*.html',
    dist: 'build/'
  },
  vendor: {
    watch: 'app/vendor/**/*.*'
  },
  css: {
    dist: 'build/css',
  },
  js: {
    dist: 'build/js',
    watch: 'build/js/*.js',
    es6_watch: 'app/js/*.js'
  },
  twig: {
    src: 'app/twig/*.twig',
    watch: 'app/twig/**/*.twig',
    dist: 'build/'
  },
  sass: {
    src: 'app/sass/*.+(sass|scss)',
    watch: 'app/sass/**/*.+(sass|scss)',
    dist: 'app/sass'
  },
  bower: {src: 'app/bower_components'},
  images: {
    dist: 'build/images',
    watch: 'app/images/**/*.*'
  }
};

/* DEVELOPMENT GULP TASKS ------------------------------------------------------
 ---------------------------------------------------------------------------- */

/* Error Handler ---------------------------------------------------------------
 ---------------------------------------------------------------------------- */

const onError = function (err) {
  console.log(err);
  this.emit('end');
};

/* TWIG --------------------------------------------------------------------- */
gulp.task('twig', function () {
  gulp.src(sources.twig.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(twig({
      data: {
        benefits: [
          'Fast',
          'Flexible',
          'Secure'
        ]
      }
    }))
    .pipe(gulp.dest(sources.twig.dist))
    .pipe(browserSync.reload({stream: true}));

  return null;
});

/* COMPASS ------------------------------------------------------------------ */
gulp.task('compass', function () {
  gulp.src(sources.sass.watch)
    .pipe(plumber())
    .pipe(compass({
      sass: sources.sass.dist,
      css: sources.css.dist,
      js: sources.js.dist,
      image: 'app/images',
      generated_images_path: 'build/images',
      source: true
    }))
    .pipe(prefix({
      browsers: ['>0%'],
      cascade: false
    }))
    .pipe(gulp.dest(sources.css.dist))
    .pipe(browserSync.reload({stream: true}));
});

/* SASS --------------------------------------------------------------------- */
gulp.task('sass', ["compass"], function () {
  return gulp.src(sources.sass.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(prefix({
      browsers: ['>0%'],
      cascade: false
    }))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(sources.css.dist))
    .pipe(browserSync.reload({stream: true}));
  // .pipe(notify('SASS was compiled'));
});

gulp.task('es6', function () {
  return gulp.src(sources.js.es6_watch)
    .pipe(plumber())
    .pipe(babel({
      "presets": ["es2015"]
    }))
    .pipe(gulp.dest(sources.js.dist));
});

// icoFont
gulp.task('icofont', function (done) {
  var fontName = 'custom-svg-font';
  // var iconStream =

  return gulp.src(['app/svg-icons/*.svg'])
      .pipe(plumber())
      .pipe(iconfontCss({
        fontName: fontName,
        cssClass: 'svg-font',
        path: 'app/sass/mixins/_svg-icons-template.scss',
        targetPath: './css/' + fontName + '.css',
        fontPath: '../'
      }))
      .pipe(iconfont({
        fontName: fontName,
        normalize: true,
        fontHeight: 1000,
        formats: ['ttf', 'svg', 'eot', 'woff', 'woff2']
      }))
      .pipe(gulp.dest('build/fonts/' + fontName));
});

/* BOWER --------------------------------------------------------------------- */
gulp.task('bower', function () {
  gulp.src(sources.html.src)
    .pipe(wiredep({
      directory: sources.bower.src
    }))
    .pipe(gulp.dest('app'));
});

/* BROWSER SYNC -------------------------------------------------------------- */
gulp.task('browser-sync', function () {
  browserSync.init({
    server: "./build"
  });
});

/* PRODUCTION GULP TASKS ------------------------------------------------------
 ---------------------------------------------------------------------------- */

/* SFTP --------------------------------------------------------------------- */
gulp.task('sftp', function () {
  gulp.src("dist/**/*")
    .pipe(sftp({
      host: "",
      user: "",
      pass: "",
      remotePath: ""
    }));
});

/* CLEAN -------------------------------------------------------------------- */
gulp.task('clean', function () {
  gulp.src('dist', {read: false})
    .pipe(clean());
});

/* BUILD -------------------------------------------------------------------- */
gulp.task('build', ["clean"], function () {
  setTimeout(function () {
    gulp.start('build_dist');
    gulp.start('fonts');
    gulp.start('images');
    gulp.start('vendor');
    gulp.start('locale');
    gulp.start('icofont');
  }, 500);
});

gulp.task('build_dist', function () {
  gulp.src(sources.html.src)
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function () {
  gulp.src([
    'app/bower_components/uikit/fonts/**',
    'app/fonts/**'
  ])
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('vendor', function () {
  gulp.src([
    'app/vendor/**'
  ])
    .pipe(gulp.dest('build/vendor'));
});

gulp.task('locale', function () {
  gulp.src([
    'app/locale/**'
  ])
    .pipe(gulp.dest('dist/locale'));
});

gulp.task('images', function () {
  gulp.src([
    'app/images/**',
    '!app/images/icons',
    '!app/images/icons-2x',
    '!app/images/icons/**',
    '!app/images/icons-2x/**'
  ])
    .pipe(gulp.dest('build/images'));
});

/* DEFAULT AND GULP WATCHER ----------------------------------------------------
 ---------------------------------------------------------------------------- */
gulp.task('watch', function () {
  // gulp.watch('bower.json', ["bower"]);
  gulp.watch(sources.sass.watch, ['compass']);
  // gulp.watch(sources.pug.watch, ["pug"]);
  gulp.watch(sources.twig.watch, ["twig"]);
  gulp.watch(sources.vendor.watch, ["vendor"]);
  gulp.watch(sources.js.es6_watch, ['es6']);
  gulp.watch(sources.images.watch, ['images']);
  gulp.watch(sources.js.watch).on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'es6', 'twig', 'compass', 'images', 'fonts', 'vendor', 'watch']);