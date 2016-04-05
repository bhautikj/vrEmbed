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

var VRStoryManager = require('./VRStoryManager.js');
var VRStory = require('./VRStory.js');

StoryParser = function () {
  this.storyManager = VRStoryManager;
  this.storyManager.init();

  this.parseDocXML = function(topElement) {
    // parse full-fledged stories
    var stories=topElement.getElementsByTagName("story");
    for(storyit = 0;storyit < stories.length; storyit++) {
      var story = stories[storyit];
      var vrStory = new VRStory();
      vrStory.initStory(story, this.storyManager);
      this.storyManager.addStory(vrStory);
    }

    // parse vr embed photos
    var vrEmbedPhotos=topElement.getElementsByClassName("vrEmbedPhoto");
    for(vrEmbedPhotosIt = 0;vrEmbedPhotosIt < vrEmbedPhotos.length; vrEmbedPhotosIt++) {
      var vrEmbedPhoto = vrEmbedPhotos[vrEmbedPhotosIt];
      var vrStory = new VRStory();
      vrStory.initVrEmbedPhoto(vrEmbedPhoto, this.storyManager);
      this.storyManager.addStory(vrStory);
    }
  };

  this.onResize = function() {
    this.storyManager.onResize();
  };
};

module.exports = StoryParser;
