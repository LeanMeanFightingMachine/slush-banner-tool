var gulp = require('gulp');
var install = require('gulp-install');
var template = require('gulp-template');
var conflict = require('gulp-conflict');
var rename = require('gulp-rename');
var inquirer = require('inquirer');
var slug = require('slug');
var exec = require('child_process').execSync;
var path = require('path');

var questions = [
  {
    name: 'banner',
    message: 'Banner\'s name?',
    validate: isEmpty
  },
  {
    name: 'client',
    message: 'Client\'s name?',
    validate: isEmpty
  },
  {
    name: 'moveon',
    message: 'Continue?',
    type: 'confirm'
  }
];

function isEmpty(answer) {

  return answer.replace(/ /g, '') !== '';

};

function getAuthor() {

  var stdout = exec('git config user.name && git config user.email', { encoding: 'utf8' }).split('\n');
  return stdout[ 0 ] + ' <' + stdout[ 1 ] + '>';

}

function getShortName(answers) {

  var client = answers.client.toLowerCase();
  var banner = answers.banner.toLowerCase();
  return slug(client) + '_' + slug(banner);

}

gulp.task('default', function (done) {

  inquirer.prompt(questions, function (answers) {

    var paths = [path.join(__dirname, '/template/**')];

    if (!answers.moveon) {

      return done();

    }

    answers.author = getAuthor();
    answers.shortName = getShortName(answers);

    gulp.src(paths, { dot: true })
      .pipe(template(answers, {
        interpolate: /<%=([\s\S]+?)%>/g
      }))
      .on('error', console.error.bind(console))
      .pipe(conflict('./'))
      .pipe(gulp.dest('./'))
      .pipe(install())
      .on('end', done)
      .resume();

  });

});
