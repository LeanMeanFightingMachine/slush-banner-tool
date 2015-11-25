import gulp from 'gulp';
import server from './tasks/server';
import build from './tasks/build';
import add from './tasks/add';
import clone from './tasks/clone';

gulp.task('default', server);

gulp.task('add', add);

gulp.task('build', build);

gulp.task('clone', clone);
