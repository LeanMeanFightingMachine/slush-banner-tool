import gulp from 'gulp';
import yargs from 'yargs';
import rename from 'gulp-rename';

export default function(cb) {

  const { argv } = yargs
    .usage('Usage: gulp clone [options]')
    .alias('i', 'input').nargs('i', 1).describe('i', 'The variant source file you are cloning').demand(1)
    .alias('d', 'destination').nargs('d', 1).describe('d', 'The new variant file name').demand(1)
    .alias('h', 'help').describe('h', 'Show this help info')
    .demand(['d', 'i'])
    .example('gulp clone -i cat -d dog', 'Clone the "cat" variant with the name "dog"');


  if (argv.help) {

    console.log(yargs.help());
    return cb();

  }

  return gulp.src(`./source/variants/${argv.input}.yaml`)
    .pipe(rename(`${argv.destination}.yaml`))
    .pipe(gulp.dest('./source/variants/'))

}
