import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import yargs from 'yargs';
import gulpif from 'gulp-if';
import file from 'gulp-file';
import gutil from 'gulp-util';
import gtemplate from 'gulp-template';
import rename from 'gulp-rename';
import merge from 'merge-stream';

function createFile(src, dest, filename, data) {

  return gulp.src(src)
    .pipe(gtemplate(data))
    .pipe(rename({
      basename: filename
    }))
    .pipe(gulp.dest(dest));

}

function templateCss(argv) {

  const src = path.join(__dirname, 'templates', 'template.scss');
  const dest = './source/css';
  const filename = argv.template;

  return createFile(src, dest, filename, argv);

}

function templateHtml(argv) {

  const src = path.join(__dirname, 'templates', 'template.html');
  const dest = './source/template';
  const filename = argv.template;

  return createFile(src, dest, filename, argv);

}

function templateJs(argv) {

  const src = path.join(__dirname, 'templates', 'template.js');
  const dest = './source/js';
  const filename = argv.template;

  return createFile(src, dest, filename, argv);

}

function variantCss(argv) {

  const src = path.join(__dirname, 'templates', 'variant.scss');
  const dest = './source/css';
  const filename = argv.variant;

  return createFile(src, dest, filename, argv);

}

function variantYaml(argv) {

  const src = path.join(__dirname, 'templates', 'variant.yaml');
  const dest = './source/variants';
  const filename = argv.variant;

  return createFile(src, dest, filename, argv);

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
    .alias('p', 'profileid').nargs('v', 1).describe('v', 'Set the Doubleclick Profile ID for variant').demand(1)
    .alias('h', 'help').describe('h', 'Show this help info')
    .demand(['t'])
    .example('gulp add -v cat -t 300x250', 'Add a new variant "cat" using the template "300x250"')
    .example('gulp add -t 640x480', 'Create a new template named "640x480"')
    .example('gulp add -v cat -t 300x250 -p 1234567', 'Add a new variant with the Profile ID "1234567"');


  if (argv.help) {

    console.log(yargs.help());
    return cb();

  }

  if (argv.variant) {

    try {

      fs.accessSync(`./source/variants/${argv.variant}.yaml`);

    } catch(err) {

      <% if (platform === 'doubleclick') { %>
      if (typeof argv.profileid === 'undefined') argv.profileid = 1234567;
      <% } %>

      const variantyaml = variantYaml(argv);
      const variantcss = variantCss(argv);

      variant = merge(variantyaml, variantcss);

    }

  }

  try {

    fs.accessSync(`./source/template/${argv.template}.html`);

  } catch(err) {

    template = templateHtml(argv);
    js = templateJs(argv);
    css = templateCss(argv);

  }

  if (!template && !variant) return cb();

  if (!template && variant) return variant;

  if (template && !variant) return merge(template, js, css);

  return merge(template, js, css, variant);

}
