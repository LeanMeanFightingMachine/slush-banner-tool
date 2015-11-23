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
    name: 'moveon',
    message: 'Continue?',
    type: 'confirm'
  }
];

function isEmpty(answer) {

  return answer.replace(/ /g, '') !== '';

};

gulp.task('default', function (done) {

  inquirer.prompt(questions, function (answers) {

    var paths = [path.join(__dirname, '/template/**')];

    if (!answers.moveon) {

      return done();

    }

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
