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

var VRStates = require('./VRStates.js');
var VRLogos = require('./VRIcons.js');
var Emitter = require('../js-ext/emitter.js');

/**
 * VR state machine:
 *
 */
VRStateToggler = function() {
  this.vrStory = null;

  this.createButtons();
  this.buttonMiddle.addEventListener('click', this.onClickMiddle_.bind(this));
  this.buttonOptions.addEventListener('click', this.onClickOptions_.bind(this));

  this.buttonMiddleClick.prototype = new function () {};
  this.buttonOptionsClick.prototype = new function () {};

  this.logoCardboard = VRLogos.logoCardboard;
  this.logoFullscreen = VRLogos.logoFullscreen;
  this.logoWindowed = VRLogos.logoWindowed;
  this.logoSettings = VRLogos.logoSettings;
  this.logoVrEmbed = VRLogos.logoVrEmbed;
}

VRStateToggler.prototype = new Emitter();

VRStateToggler.prototype.setVRStory = function(vrStory) {
  this.vrStory = vrStory;
  this.isStereo = false;
};

var setupButtonStyleBase = function(s) {
  s.position = 'absolute';
  s.marginLeft = 'auto';
  s.marginRight = 'auto';
  s.width = '56px'
  s.height = '56px';
  s.backgroundSize = 'cover';
  s.backgroundColor = 'transparent';
  s.border = 0;
  s.userSelect = 'none';
  s.webkitUserSelect = 'none';
  s.MozUserSelect = 'none';
  s.cursor = 'pointer';
  s.opacity = '0.8';
}

VRStateToggler.prototype.createMiddleButton = function() {
  this.buttonMiddle = document.createElement('img');
  var s = this.buttonMiddle.style;
  setupButtonStyleBase(s);
  s.left = 0;
  s.right = 0;
  s.bottom = '5px';
  // Prevent button from being dragged.
  this.buttonMiddle.draggable = false;
  this.buttonMiddle.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

VRStateToggler.prototype.createOptionsButton = function() {
  this.buttonOptions = document.createElement('img');
  var s = this.buttonOptions.style;
  setupButtonStyleBase(s);
  s.left = 0;
  s.right = 5;
  s.top = '5px';
  // Prevent button from being dragged.
  this.buttonOptions.draggable = false;
  this.buttonOptions.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

VRStateToggler.prototype.createButtons = function() {
  this.createMiddleButton();
  this.createOptionsButton();
};


VRStateToggler.prototype.onClickMiddle_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.buttonMiddleClick();
}

VRStateToggler.prototype.onClickOptions_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.buttonOptionsClick();
}

VRStateToggler.prototype.setupButton = function(button, src, title, isVisible) {
  // Hack for Safari Mac/iOS to force relayout (svg-specific issue)
  // http://goo.gl/hjgR6r
  button.style.display = 'inline-block';
  button.offsetHeight;
  button.style.display = 'block';

  button.src = src;
  button.title = title;
  button.style.display = isVisible ? 'inline-block' : 'none';
};

VRStateToggler.prototype.configureStereo = function(isStereo) {
  this.isStereo = isStereo;
};

VRStateToggler.prototype.setButtonState = function(state) {

  switch (state) {
    case VRStates.FULLSCREEN:
      this.setupButton(this.buttonOptions, "", "", false);
      this.setupButton(this.buttonMiddle, this.logoWindowed, 'Windowed mode', true);
      break;
    case VRStates.WINDOWED:
      this.setupButton(this.buttonOptions, this.logoSettings, 'settings', true);
      this.setupButton(this.buttonMiddle, this.logoCardboard, 'Fullscreen mode', true);
      break;
  }
};

VRStateToggler.prototype.setState = function(state) {
  if (this.vrStory!= null){
    var stateChangeWorked = this.vrStory.setState(state);
    if (stateChangeWorked == false){
      console.log("STATE CHANGE FAIL");
      return;
    }
  } else {
    this.emit(state);
  }
  this.setButtonState(state);
};

VRStateToggler.prototype.stateChange = function(buttonSrc) {
  switch (buttonSrc) {
    case this.logoCardboard:
      this.setState(VRStates.FULLSCREEN);
      break;
    case this.logoWindowed:
      this.setState(VRStates.WINDOWED);
      break;
  }
};


VRStateToggler.prototype.buttonMiddleClick = function() {
  this.stateChange(this.buttonMiddle.src);
};

VRStateToggler.prototype.buttonOptionsClick = function() {
  this.vrStory.showOptions();
};

module.exports = VRStateToggler;
