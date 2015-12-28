var StoryParser = require('./VRParser.js');
var VRURLParser = require('./VRURLParser.js');

var domReady = require('../js-ext/domready.js')

var URLParserFactory = (function () {
  var instance;

  function createInstance() {
      window.VRURLPARSER_INIT = true;
      var vrURLParser = new VRURLParser();
      return vrURLParser;
  }

  return {
      getInstance: function () {
          if (!instance) {
              instance = createInstance();
          }
          return instance;
      }
  };
})();

var StoryParserFactory = (function () {
  var instance;

  function createInstance() {
      window.VRSTORYPARSER_INIT = true;
      var storyParser = new StoryParser();

      function onResize() {
        storyParser.onResize();
      }

      function initSystem(){
        storyParser.parseDocXML(document.body);
      }

      window.addEventListener('resize', onResize, false);
      domReady(initSystem);

      return storyParser;
  }

  return {
      getInstance: function () {
          if (!instance) {
              instance = createInstance();
          }
          return instance;
      }
  };
})();


if (!window.VRURLPARSER_INIT){
  var urlParser = URLParserFactory.getInstance();
  urlParser.init();
  if (urlParser.isEditor == true){
    window.stop();
    document.body.innerHTML = "";

    window.VRSTORYPARSER_INIT = true;
    var storyParser = new StoryParser();

    function onResize() {
      storyParser.onResize();
    }

    window.addEventListener('resize', onResize, false);

    storyParser.initFromURLSource(urlParser.scenePhoto);

    return;
  }
}

if (window.VRSTORYPARSER_INIT)
  return;

var storyParser = StoryParserFactory.getInstance();
