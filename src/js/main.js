/**
  Copyright 2015 Bhautik J Joshi

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
**/

var StoryParser = require('./VRStoryParser.js');
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


//
// some google juice - for inferring what screen sizes/resolutions
// are using vrEmbed and what kind of legacy devices should be supported
//
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-73312245-1', 'auto');
ga('send', 'pageview');

var storyParser = StoryParserFactory.getInstance();
