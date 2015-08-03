import path from 'path';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import browserSync from 'browser-sync';

const port = process.env.PORT || 8000;
let started = false;

function startBrowserSync() {

  if (started) return;
  started = true;

  const bs = browserSync.create();

  bs.init({
    notify: true,
    open: false,
    proxy: 'localhost:' + port,
    files: [ './source/js/*.js', './source/**/*.html', './source/**/*.yaml' ]
  });

  gulp.watch('./source/css/**/*.scss').on('change', () => {

    bs.reload('*.css');

  });


}

export default function() {

  return nodemon({
    script: 'index.js',
    ext: 'js',
    watch: false,
    env: { 'NODE_ENV': 'local' }
  }).on('start', startBrowserSync);

}
