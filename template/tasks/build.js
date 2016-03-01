import fs from 'fs';
import del from 'del';
import gulp from 'gulp';
import path from 'path';
import yaml from 'yamljs';
import Map from 'es6-map';
import sass from 'node-sass';
import gutil from 'gulp-util';
import through from 'through2';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import concatStream from 'concat-stream';
import browserify from 'browserify';
import {Promise} from 'es6-promise';
import Minimize from 'minimize';
import Handlebars from 'handlebars';
import archiver from 'archiver';
import filesize from 'filesize';
import imagemin from 'imagemin';

import { createBackupGif } from "./gif";

const MATCH_IMG = /(\.{1,2}\/)?(img\/[\w\s-\/]+\.(png|jpg|jpeg|gif|svg))/g;
const MATCH_INLINE = /<(script|link).*[href|src]=["|'](.*)["|'].*inline.*>/g;
const MATCH_FONTS = /(fonts\/[\w\-\/]+\.(?:eot|woff|ttf|svg))/g;

const templates = new Map();
const scripts = new Map();
const styles = new Map();


function getIndex(name = 'server/index') {

  if (templates.has(name)) return templates.get(name);

  const file = path.join(__dirname, '..', 'source', name) + '.html';
  templates.set(name, Handlebars.compile(fs.readFileSync(file, 'utf8')));
  return templates.get(name);

}


function registerPartial(name) {

  let partial;

  if (templates.has(name)) {

    partial = templates.get(name);

  } else {

    const file = path.join(__dirname, '..', 'source/template', name) + '.html';
    // templates.set(name, Handlebars.compile(fs.readFileSync(file, 'utf8')));
    templates.set(name, fs.readFileSync(file, 'utf8'));
    partial = templates.get(name);

  }

  Handlebars.unregisterPartial('template');
  Handlebars.registerPartial('template', partial);

  return partial;

}


function loadScript(name) {

  return new Promise((resolve, reject) => {

    if (scripts.has(name)) return resolve(scripts.get(name));

    const b = browserify();
    b.add(path.join(__dirname, '..', 'source', name));
    b.transform({ global: true }, 'uglifyify');
    b.bundle((err, buffer) => {

      scripts.set(name, buffer.toString());
      resolve(scripts.get(name));

    });

  });

}


function loadStyle(name) {

  return new Promise((resolve, reject) => {

    if (styles.has(name)) return resolve(styles.get(name));

    const scssName = name.replace(/\.css$/g, '.scss');
    const file = path.join(__dirname, '..', 'source', scssName);
    const outputStyle = 'compressed';

    sass.render({ file, outputStyle }, (err, result) => {

      const css = postcss()
        .use(autoprefixer({ browsers: ['last 2 versions', 'ie 9'] }))
        .process(result.css.toString()).css;


      styles.set(name, err ? err.toString() : css);
      resolve(styles.get(name));

    });

  });

}


function loadAsset(type, name) {

  return type === 'script' ? loadScript(name) : loadStyle(name);

}


function loadImages(html) {

  let match = MATCH_IMG.exec(html);
  let complete = false;
  let tempImages = [];
  let images = [];

  return new Promise((resolve, reject) => {

    while (match !== null) {

      const absolute = path.join(__dirname, '..', 'source', match[2]);
      const relative = match[2];

      try {

        const { size } = fs.statSync(absolute);

        tempImages.push({ absolute, relative, size });


      } catch(err) {}

      match = MATCH_IMG.exec(html);

    }

    tempImages.forEach(function(image, index){

      new imagemin()
        .src(image.absolute)
        .use(imagemin.jpegtran({progressive: true}))
        .run(function(err, files){

          let file = files[0];
          const size = file.contents.byteLength;

          images.push({ file, relative: image.relative, size });

          if (images.length === tempImages.length) {
            resolve(images);
          }

        })

    })

  });

}

function getFonts(html) {

  let matches = MATCH_FONTS.exec(html);
  let fonts = []

  while (matches !== null) {

    const absolute = path.join(__dirname, '..', 'source', matches[0]);
    const relative = matches[0];

    try {

      const { size } = fs.statSync(absolute);
      fonts.push({absolute, relative, size});

    } catch(err) {}

    matches = MATCH_FONTS.exec(html);

  }

  return fonts;

}


function parseVariants() {

  return through.obj(function(file, enc, cb) {

    const fileName = path.basename(file.path, '.yaml');

    gutil.log(`${gutil.colors.cyan(fileName)}: Building...`);

    const data = yaml.parse(file.contents.toString());
    const template = getIndex();
    const promises = [];
    const partial = registerPartial(data.config.template);

    data.config.hideNav = true;

    let contents = template(data);
    let match = MATCH_INLINE.exec(contents);
    let totalSize = 0;

    while (match !== null) {

      promises.push(loadAsset(match[1], match[2]));

      match = MATCH_INLINE.exec(contents);

    }

    Promise.all(promises).then(() => {

      const minimize = new Minimize();
      const archive = archiver.create('zip');
      const html = contents.replace(MATCH_INLINE, (match, type, value) => {

        if (type === 'script') return `<script>${scripts.get(value)}</script>`;

        return `<style>${styles.get(value)}</style>`;

      });

      minimize.parse(html, (err, htmlData) => {

        totalSize += Buffer.byteLength(htmlData, 'utf8');

        getFonts(html).forEach((font) => {

          totalSize += font.size;
          archive.file(font.absolute, {name: font.relative});

        })

        archive.append(new Buffer(htmlData), {
          name: path.basename(file.path, '.yaml') + '.html'
        });

        loadImages(html).then(function(imageBuffers){

          imageBuffers.forEach(function(image){

            totalSize += image.size;
            archive.append(image.file.contents, {name: image.relative});

          });

          createBackupGif(data, fileName).then(function(gif){

            if (gif) {

              totalSize += gif.size;
              archive.append(gif.file, {name: gif.name});

            }

            archive.pipe(concatStream((htmlData) => {

              this.push(new gutil.File({
                cwd: file.cwd,
                base: file.base,
                path: path.join(file.base, fileName) + '.zip',
                contents: htmlData
              }));

              gutil.log(`${gutil.colors.cyan(fileName)}: ${filesize(totalSize)}`);

              cb();

            }));

            archive.finalize();

          }.bind(this));


        }.bind(this))

      });

    });

  });

}


export default function() {

  del.sync([path.join('./build', '**/**')]);

  return gulp.src(['./source/variants/*.yaml'])
    .pipe(parseVariants())
    .pipe(gulp.dest('./build'))

}
