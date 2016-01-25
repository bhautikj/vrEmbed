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
  this.buttonLeft.addEventListener('click', this.onClickLeft_.bind(this));
  this.buttonMiddle.addEventListener('click', this.onClickMiddle_.bind(this));
  this.buttonRight.addEventListener('click', this.onClickRight_.bind(this));
  this.buttonOptions.addEventListener('click', this.onClickOptions_.bind(this));

  this.buttonLeftClick.prototype = new function () {};
  this.buttonMiddleClick.prototype = new function () {};
  this.buttonRightClick.prototype = new function () {};
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

VRStateToggler.prototype.createMiddleButton = function() {
  this.buttonMiddle = document.createElement('img');
  var s = this.buttonMiddle.style;
  s.position = 'absolute';
  s.bottom = '5px';
  s.left = 0;
  s.right = 0;
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
  // Prevent button from being dragged.
  this.buttonMiddle.draggable = false;
  this.buttonMiddle.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

VRStateToggler.prototype.createOptionsButton = function() {
  this.buttonOptions = document.createElement('img');
  var s = this.buttonOptions.style;
  s.position = 'absolute';
  s.top = '5px';
  s.left = 0;
  s.right = 5;
  s.marginLeft = 'auto';
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
  // Prevent button from being dragged.
  this.buttonOptions.draggable = false;
  this.buttonOptions.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

VRStateToggler.prototype.createLeftButton = function() {
  this.buttonLeft = document.createElement('img');
  var s = this.buttonLeft.style;
  s.position = 'absolute';
  s.bottom = '5px';
  s.left = 0;
  s.right = 5;
  s.marginLeft = 'auto';
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
  // Prevent button from being dragged.
  this.buttonLeft.draggable = false;
  this.buttonLeft.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

VRStateToggler.prototype.createRightButton = function() {
  this.buttonRight = document.createElement('img');
  var s = this.buttonRight.style;
  s.position = 'absolute';
  s.bottom = '5px';
  s.left = 5;
  s.right = 0;
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
  // Prevent button from being dragged.
  this.buttonRight.draggable = false;
  this.buttonRight.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
}

VRStateToggler.prototype.createButtons = function() {
  this.createMiddleButton();
  this.createLeftButton();
  this.createRightButton();
  this.createOptionsButton();
};

VRStateToggler.prototype.onClickLeft_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.buttonLeftClick();
//   this.emit('clickLeft');
}

VRStateToggler.prototype.onClickMiddle_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.buttonMiddleClick();
//   this.emit('clickMiddle');
}

VRStateToggler.prototype.onClickRight_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.buttonRightClick();
//   this.emit('clickRight');
}

VRStateToggler.prototype.onClickOptions_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.buttonOptionsClick();
//   this.emit('clickRight');
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

  if (this.isStereo) {
    this.setupButton(this.buttonOptions, this.logoSettings, 'settings', true);

    switch (state) {
      case VRStates.FULLSCREEN:
        this.setupButton(this.buttonLeft, "", "", false);
        this.setupButton(this.buttonMiddle, this.logoWindowed, 'Windowed mode', true);
        this.setupButton(this.buttonRight, "", "", false);
        break;
      case VRStates.WINDOWED:
      this.setupButton(this.buttonLeft, "", "", false);
        this.setupButton(this.buttonMiddle, this.logoFullscreen, 'Fullscreen mode', true);
        this.setupButton(this.buttonRight, "", "", false);
        break;
    }
  } else {
    this.setupButton(this.buttonOptions, this.logoSettings, 'settings', true);

    switch (state) {
      case VRStates.FULLSCREEN:
        this.setupButton(this.buttonLeft, "", "", false);
        this.setupButton(this.buttonMiddle, this.logoWindowed, 'Windowed mode', true);
        this.setupButton(this.buttonRight, "", "", false);
        break;
      case VRStates.WINDOWED:
      this.setupButton(this.buttonLeft, "", "", false);
        this.setupButton(this.buttonMiddle, this.logoFullscreen, 'Fullscreen mode', true);
        this.setupButton(this.buttonRight, "", "", false);
        break;
    }
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
    case this.logoFullscreen:
      this.setState(VRStates.FULLSCREEN);
      break;
    case this.logoWindowed:
      this.setState(VRStates.WINDOWED);
      break;
  }
};


VRStateToggler.prototype.buttonLeftClick = function() {
  this.stateChange(this.buttonLeft.src);
};
VRStateToggler.prototype.buttonMiddleClick = function() {
  this.stateChange(this.buttonMiddle.src);
};

VRStateToggler.prototype.buttonRightClick = function() {
  this.stateChange(this.buttonRight.src);
};

VRStateToggler.prototype.buttonOptionsClick = function() {
  this.vrStory.showOptions();
};

module.exports = VRStateToggler;
