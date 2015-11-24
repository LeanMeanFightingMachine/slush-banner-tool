var fs = require('fs');
var path = require('path');
var yaml = require('yamljs');
var sass = require('node-sass');
var express = require('express');
var cons = require('consolidate');
var morgan = require('morgan');
var groupBy = require('group-by');
var Handlebars = require('handlebars');
var mapFiles = require('map-files');
var postcss = require('postcss');
var prefix = require('postcss-selector-prefix');
var bodyParser = require('body-parser');
var browserify = require('browserify-middleware');


// start express and the server
var app = express();


// set the template engine
app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views', __dirname + '/source/template');


// express configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// morgan logger
app.use(morgan('tiny'));


// the javascript files
app.use('/js', browserify('./source/js'));


app.use('/index.js', express.static(path.join(__dirname, './source/server/index.js')));


// images
app.use(['/img', '/preview/img', '/preview/:path/img', '/css/img'], express.static('./source/img'));


// css files
app.use('/css/:file', function(req, res) {

  var file = path.basename(req.params.file, '.css') + '.scss';

  sass.render({
    file: path.join(__dirname, 'source/css', file) },
    function(err, result) {

      if (err) return res.send(err.toString());

      var css = postcss()
          .use(prefix('.mc-banner-preview'))
          .process(result.css.toString()).css;

      res.header('Content-type', 'text/css');
      res.send(css);

  });

});


// index css file
app.get('/index.css', function(req, res) {

  sass.render({
    file: path.join(__dirname, 'source/server/index.scss'),
    outputStyle: 'compressed' },
    function(err, result) {

      if (err) return res.send(err.toString());

      res.header('Content-type', 'text/css');
      res.send(result.css.toString());

  });

});


// preview files
app.get('/preview/:variant', function(req, res) {

  var variant = req.params.variant.replace(/\.html$/g, '');
  var hideNav = req.query.hasOwnProperty('hide-nav');
  var template;

  try {

    var file = path.join(__dirname, 'source/variants', variant + '.yaml');
    var doc = yaml.load(file);

  } catch (err) {

    res.render('../server/variant-not-found', { variant: variant });

  }

  if (doc) {

    template = path.join(app.get('views'), doc.config.template) + '.html';
    doc.partials = { template: '../template/' + doc.config.template };
    doc.config.listOfTemplates = getFiles(doc.config.template, variant);
    doc.config.includeIndexFiles = true;
    doc.config.hideNav = hideNav;
    doc.config.align = doc.config.align || 'top-left';
    doc.config.spacing = hideNav ? 'naked' : 'padded';

    fs.access(template, function(err) {

      res.render(err ? '../server/template-not-found' : '../server/index', doc);

    });

  }

});


// html files
app.get(['/', '/preview'], function(req, res) {

  const files = getFiles();
  res.render(files ? '../server/index' : '../server/empty', {
    config: { files: getFiles(), includeIndexFiles: true }
  });

});


function getFiles(group, variant) {

  var files = mapFiles(path.join(__dirname, 'source/variants', '**/*.yaml'), {
    read: function(fp) { return yaml.load(fp); }
  });

  files = Object.keys(files).map(function(key) {
    files[key].config.fileName = key;
    files[key].config.active = variant === key;
    return files[key];

  });

  if (!files.length) return null;

  files = groupBy(files, 'config.template');

  return group ? files[group] : files;

}



// create a server on the given port
app.listen(process.env.PORT || 8000, function() {

  console.log('[server] start');

});
