var domready = require('domready');

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

    // TODO - `Profile` should match the element name of the dynamic content feed uploaded to Doubleclick

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
});
