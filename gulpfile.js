const gulp = require('gulp')
const copy = require('gulp-copy')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const sass = require('gulp-sass')(require('sass'))
const uglify = require('gulp-uglify')
const browserSync = require('browser-sync').create()

// Set up a task to process SCSS files
gulp.task('process-scss', function () {
  return gulp
    .src('app/assets/scss/**/*.scss')
    .pipe(sass({ 
      quietDeps: true, 
      includePaths: ['node_modules']
    }).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/assets/css'))
    .pipe(browserSync.stream())
})

gulp.task('copy-govuk-js', function () {
  return gulp
    .src('node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js')
    .pipe(copy('app/assets/js', { prefix: 3 }))
})

gulp.task('copy-dfefrontend-js', function () {
  return gulp
    .src('node_modules/dfe-frontend/dist/dfefrontend.js')
    .pipe(copy('app/assets/js', { prefix: 3 }))
})

// Set up a task to process JavaScript files
gulp.task(
  'process-js',
  gulp.series('copy-govuk-js', 'copy-dfefrontend-js', function () {
    return gulp
      .src('app/assets/js/**/*.js')
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('public/assets/js'))
      .pipe(browserSync.stream())
  }),
)

gulp.task('copy-assets', function () {
  return gulp
    .src(
      'node_modules/dfe-frontend/packages/assets/**/*.{jpg,jpeg,png,gif,svg}',
    )
    .pipe(copy('app/assets/images', { prefix: 6 }))
})

gulp.task('process-images-copy', async function () {
  return gulp
    .src('app/assets/images/**/*', {encoding: false})
    .pipe(gulp.dest('public/assets/images'))
})

gulp.task('process-files', async function () {
  return gulp
    .src('app/assets/files/**/*')
    .pipe(gulp.dest('public/assets/files'))
})

gulp.task('nunjucksRender', function () {
  return gulp
    .src('app/views/**/*.html')
    .pipe(
      nunjucksRender({
        path: ['app/views/'], // set the path to your templates here
      }),
    )
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.stream())
})

// Set up a task to start the server and watch files for changes
gulp.task('watch', function () {
  browserSync.init({
    proxy: 'http://node:3052',
    files: ['app/views/**/*.*'],
    reloadDelay: 1000,
    open: false
  })

  gulp.watch('app/assets/scss/**/*.scss', gulp.series('process-scss'))
  gulp.watch('app/assets/js/**/*.js', gulp.series('process-js'))
  gulp.watch('app/assets/images/**/*', gulp.series('process-images-copy'))
  gulp.watch(
    'node_modules/dfe-frontend/packages/assets/**/*.{jpg,jpeg,png,gif,svg}',
    gulp.series('copy-assets'),
  )
  gulp.watch(
    'node_modules/dfe-frontend/dist/dfefrontend.js',
    gulp.series('process-js'),
  )
  gulp.watch('app/**/*.*').on('change', browserSync.reload)
})


// Set up a build task to process assets
gulp.task(
  'build',
  gulp.series(
    'process-scss',
    'copy-assets',
    'process-files',
    'process-js',
    'process-images-copy',
  ),
)

// Set up a default task to process assets and start the watch task
gulp.task(
  'default',
  gulp.series(
    'build',
    'watch',
  ),
)
