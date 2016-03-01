var spawn = require('child_process').spawn,
    gutil = require('gulp-util');

import gif from "gifencoder";
import pngFileStream from "png-file-stream";
import fs from "fs";

import gulp from 'gulp';
import del from 'del';
import through from 'through2';
import yaml from 'yamljs';

const url = "http://localhost:3000/preview/";
const output = "./tasks/gif-temp/";
const filename = "backup.gif";


export function createBackupGif(data, fileName) {

  return new Promise((resolve, reject) => {

    const size = data.config.variant;
    const sizeSplit = size.split("x");
    const encoder = new gif(sizeSplit[0], sizeSplit[1])

    if (!data.config.gif || !data.config.gif.cues || !data.config.gif.selector) {

      gutil.log(`${gutil.colors.cyan(fileName)}: Skipping GIF Generation. Missing all or part of config`);

      return resolve(false);

    }

    const gifCues = data.config.gif.cues;
    const gifSelector = data.config.gif.selector;
    const gifDelay = data.config.gif.delay || 4000;
    const gifRepeat = data.config.gif.repeat || 0;
    const gifQuality = data.config.gif.quality || 10;

    var estimate = (gifCues[gifCues.length-1] + 500) / 1000;
    gutil.log(`${gutil.colors.cyan(fileName)}: Generating Gif. Estimated Time: ${gutil.colors.cyan(estimate)}s`);

    var tests = [
      './tasks/gif-casper.js',
      "--path="+url+size+".html",
      "--selector="+gifSelector,
      "--output="+output,
      "--cap="+gifCues
    ];

    var casperChild = spawn('casperjs', ['test'].concat(tests));

    casperChild.stdout.on('data', function (data) {

        // Remove comment to debug any casper issues
        //gutil.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n

    });

    casperChild.on('close', function (code) {
        var success = code === 0; // Will be 1 in the event of failure

        var final = output+filename;

        var createWriteStream = fs.createWriteStream(final);

        pngFileStream(output+"*.png")
          .pipe(encoder.createWriteStream({ repeat: gifRepeat, delay: gifDelay, quality: gifQuality}))
          .pipe(createWriteStream);

        createWriteStream.on("close", function(){

          fs.readFile(final, function(err, file){

            var res = {
              name: filename,
              size: fs.statSync(final).size,
              file: file
            }

            del.sync(output+'**/**');

            resolve(res);

          })

        });

    });


  })

}