var StoryParser = require('./VRParser.js');
var domReady = require('../js-ext/domready.js')

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

if (window.VRSTORYPARSER_INIT)
  return;

var storyParser = StoryParserFactory.getInstance();
