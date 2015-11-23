import gulp from 'gulp';
import server from './tasks/server';
import build from './tasks/build';
import add from './tasks/add';

gulp.task('default', server);

gulp.task('add', add);

gulp.task('build', build);
