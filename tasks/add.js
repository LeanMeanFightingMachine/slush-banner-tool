import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import yargs from 'yargs';
import gulpif from 'gulp-if';
import file from 'gulp-file';
import gutil from 'gulp-util';
import merge from 'merge-stream';


function getVariant(template) {

  return `---
config:
  template: ${template}
  align: top-left
`;

}
function getTemplate() {

  return `<div class="layout">

</div>`;

}
function getCSS() {

  return `html, body {
  margin: 0;
  padding: 0;
  border: none;
}

body {
  font: normal 300 16px/24px "Helvetica Neue", Helvetica, Arial, serif;
}`;

}
function getJS() {

  return `var domready = require('domready');

domready(function() {


});`;

}


export default function(cb) {

  let template;
  let js;
  let css;
  let variant;

  const { argv } = yargs
    .usage('Usage: gulp add [options]')
    .alias('v', 'variant').nargs('v', 1).describe('v', 'Set the variant name').demand(1)
    .alias('t', 'template').nargs('t', 1).describe('t', 'Set the template for your variant').demand(1)
    .alias('h', 'help').describe('h', 'Show this help info')
    .demand(['t'])
    .example('gulp add -v cat -t 300x250', 'Add a new variant "cat" using the template "300x250"')
    .example('gulp add -t 640x480', 'Create a new template named "640x480"');


  if (argv.help) {

    console.log(yargs.help());
    return cb();

  }

  if (argv.variant) {

    try {

      fs.accessSync(`./source/variants/${argv.variant}.yaml`);

    } catch(err) {

    const content = getVariant(argv.template);
    variant = file(`${argv.variant}.yaml`, content, { src: true })
                    .pipe(gulp.dest('./source/variants'));

    }

  }

  try {

    fs.accessSync(`./source/template/${argv.template}.html`);

  } catch(err) {

    template = file(`${argv.template}.html`, getTemplate(), { src: true })
                    .pipe(gulp.dest('./source/template'));
    js = file(`${argv.template}.js`, getJS(), { src: true })
                    .pipe(gulp.dest('./source/js'));
    css = file(`${argv.template}.scss`, getCSS(), { src: true })
                    .pipe(gulp.dest('./source/css'));

  }

  if (!template && !variant) return cb();

  if (!template && variant) return variant;

  if (template && !variant) return merge(template, js, css);

  return merge(template, js, css, variant);

}
