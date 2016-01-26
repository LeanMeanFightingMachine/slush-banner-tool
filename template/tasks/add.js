import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import yargs from 'yargs';
import gulpif from 'gulp-if';
import file from 'gulp-file';
import gutil from 'gulp-util';
import merge from 'merge-stream';


function getVariant(template, profileId) {

  return `---
config:
  template: ${template}
  align: top-left
<% if (dynamic) { %>
<% if (platform === 'doubleclick') { %>profileId: ${profileId}<% } %>
dynamic:
  - field1
  - Exit_URL
<% } %>
`;

}
function getTemplate() {

  return `<div class="layout" size="{{size.width}}x{{size.height}}">
    <% if (dynamic) { %>
      <div id="{{dynamic.[0]}}"></div>
    <% } %>
</div>`;

}
function getCSS() {

  return `/* set global box-sizing */
  html {
    box-sizing: border-box;
  }

  * {
    &, &:before, &:after {
      box-sizing: inherit;
    }
  }

  html, body {
  margin: 0;
  padding: 0;
  border: none;
}

body {
  font: normal 300 16px/24px "Helvetica Neue", Helvetica, Arial, serif;
}
<% if (platform === 'doubleclick') { %>
.layout {
  border: 1px solid grey;
  display: none;

  &[loaded] {
    display: block;
  }
}
<% } %>
`;

}
function getJS() {

  return `var domready = require('domready');

domready(function() {
  <% if (dynamic) { %>
  var variant = window.variant;
  var dynamic = variant.dynamic;
  <% if (platform === 'doubleclick') { %>
  var elements = [];

  var devContent = [
    'This is field 1',
    {Url: 'http://mcsaatchi.com/'}
  ];

  politeInit = function() {

  	getDynamic();

  }

  getElement = function (el) {

    var ref = document.getElementById(el);
    elements.push(ref);

  }

  getDynamic = function() {

    // TODO - \`Profile\` should match the element name of the dynamic content feed uploaded to Doubleclick

    var devDynamicContent = {};
    devDynamicContent.Profile = [{}];

    dynamic.map(function (field, i) {

      getElement(field);

      devDynamicContent.Profile[0][field] = devContent[i];

    });

    Enabler.setDevDynamicContent(devDynamicContent);

  	setDynamic();

  }

  setDynamic = function() {

    elements.map(function (el, i) {

      if (el) {
        el.innerHTML = dynamicContent.Profile[0][el.id];
      }

    });

    renderBanner();

  }

  renderBanner = function() {

    var layout = document.querySelector('.layout');
    var Exit_URL = dynamicContent.Profile[0]['Exit_URL'].Url;

    layout.setAttribute("loaded", "true");

    layout.addEventListener('click', function (e) {

      Enabler.exitOverride('HTML5_Background_Clickthrough', Exit_URL);

    }, false);

  }
  <% } %>
  <% } %>
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

      let profileId = argv.profileid || 1234567;

      const content = getVariant(argv.template, profileId);
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
