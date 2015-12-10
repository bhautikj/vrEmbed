var StoryParser = require('./VRParser.js');

var StoryParserFactory = (function () {
  var instance;

  function createInstance() {
      window.VRSTORYPARSER_INIT = true;
      var storyParser = new StoryParser();
      storyParser.parseDocXML(document.body);

      function onResize() {
        storyParser.onResize();
      }

      window.addEventListener('resize', onResize, false);

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