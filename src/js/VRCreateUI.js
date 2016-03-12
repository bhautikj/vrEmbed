var VRScene = require('./VRScene.js');

var NumberSlider = function() {
  var self=this;
  this.sliderElement = null;
  this.textElement = null;
  this.callback = null;

  this.sliderMove = function() {
    self.textElement.value = self.sliderElement.value;
  }

  this.inputStateChange = function() {
    self.textElement.value = self.sliderElement.value;
    self.callback();
  }

  this.textChange = function() {
    if (parseFloat(self.textElement.value) < parseFloat(self.sliderElement.min) ||
        parseFloat(self.textElement.value) > parseFloat(self.sliderElement.max)) {
      self.textElement.value = self.sliderElement.value;
      return;
    }

    self.sliderElement.value = self.textElement.value;
    self.callback();
  }

  this.set = function(value) {
    self.sliderElement.value = value;
    self.textElement.value = value;
  }

  this.get = function() {
    return self.sliderElement.value;
  }

  this.init = function(slider, text, defaultValue, callback) {
    this.sliderElement = slider;
    this.textElement = text;
    this.set(defaultValue);
    this.callback = callback;

    this.sliderElement.oninput = this.sliderMove;
    this.sliderElement.onchange = this.inputStateChange;
    this.textElement.onchange = this.textChange;
  }
}

VRAccordionUI = function() {
  var self = this;
  this.bar=null;
  this.button = null;
  this.container = null;
  this.shown = false;
  this.accordionManager = false;
  this.name = null;

  this.totalHide = function(doit) {
    self.container.hidden = doit;
    self.bar.hidden = doit;
  }

  this.show = function(show) {
    self.shown = show;
    if (show == false) {
      self.container.hidden = true;
      self.button.innerHTML = "+";
    } else {
      self.container.hidden = false;
      self.button.innerHTML = "-";
    }
  }

  this.toggle = function() {
    self.accordionManager.toggle(self.name);
  }

  this.init = function(manager, name) {
    this.name = name;
    this.accordionManager = manager;
    this.container = document.getElementById(name);
    this.button = document.getElementById(name+"_button");
    this.bar = document.getElementById(name+"_bar");
    this.button.onclick = this.toggle;
    this.show(false);
  }
}

VRAccordionStacker = function() {
  var self = this;
  this.accordions = [];
  this.active = null;

  this.add = function(name) {
    var accordion = new VRAccordionUI();
    accordion.init(self, name);
    self.accordions.push([name,accordion]);
  }

  this.showNamed = function(name) {
    // hide everything except named
    for (i = 0; i < self.accordions.length; i++) {
      if (name == self.accordions[i][0]) {
        self.active = name;
        self.accordions[i][1].show(true);
      } else {
        self.accordions[i][1].show(false);
      }
    }
  }

  this.toggle = function(name) {
    // cant turn self off - quit!
    if (self.active == name)
      return;
    self.showNamed(name);
  }

  this.totalHide = function(name, doit) {
    for (i = 0; i < self.accordions.length; i++) {
      if (name == self.accordions[i][0]) {
        self.accordions[i][1].totalHide(doit);
        return;
      }
    }
  }
}


VRSceneDict = function() {
  this.dict = null;
  this.vrScene = null;

  this.init = function() {
    this.vrScene = new VRScene();
    this.dict = {};
    this.dict.photoObjects=[];
    this.dict.textObjects=[];
    this.dict.jumpObjects=[];
    this.dict.name = "";
  }

  this.initPhoto = function() {
    var photo ={};
    photo.textureDescription = {};
    photo.textureDescription.src="http://vrembed.org/src/assets/vrEmbedLogo.png";
    photo.textureDescription.isStereo = false;
    photo.textureDescription.plane = false;
    photo.textureDescription.sphereFOV = [60,60];
    photo.textureDescription.sphereCentre = [0,0];
    photo.textureDescription.U_l = [0,0];
    photo.textureDescription.V_l = [1,0.5];
    photo.textureDescription.U_r = [0,0.5];
    photo.textureDescription.V_r = [1,1];
    return photo;
  }

  this.initText = function() {
    var text ={};
    text.message = "Placeholder text";
    text.textureDescription = {};
    text.textureDescription.src="";
    text.textureDescription.isStereo = false;
    text.textureDescription.plane = false;
    text.textureDescription.sphereFOV = [60,40];
    text.textureDescription.sphereCentre = [0,0];
    text.textOptions = {};
    text.textOptions.align = 'center';
    text.textOptions.fontface = 'Arial';
    text.textOptions.fontsize = '72';
    text.textOptions.borderthickness = '12';
    text.textOptions.bordercolor = '#FFFFFF';
    text.textOptions.backgroundcolor = '#000000';
    text.textOptions.textcolor = '#FFFFFF';
    return text;
  }

  this.initJump = function() {
    var jump ={};
    jump.jumpTo = "";
    jump.jumpText = "Jump text";
    jump.textureDescription = {};
    jump.textureDescription.src="";
    jump.textureDescription.isStereo = false;
    jump.textureDescription.plane = false;
    jump.textureDescription.sphereFOV = [60,40];
    jump.textureDescription.sphereCentre = [30,-30];
    jump.textOptions = {};
    jump.textOptions.align = 'center';
    jump.textOptions.fontface = 'Arial';
    jump.textOptions.fontsize = '72';
    jump.textOptions.borderthickness = '12';
    jump.textOptions.bordercolor = '#FFFFFF';
    jump.textOptions.backgroundcolor = '#000000';
    jump.textOptions.textcolor = '#FFFFFF';
    return jump;
  }

  this.addPhoto = function() {
    var photo = this.initPhoto();
    this.dict.photoObjects.push(photo);
  }

  this.removePhoto = function(idx) {
    this.dict.photoObjects.splice(idx,1);
  }

  this.addText = function() {
    var text = this.initText();
    this.dict.textObjects.push(text);
  }

  this.removeText = function(idx) {
    this.dict.textObjects.splice(idx,1);
  }

  this.addJump = function() {
    var jump = this.initJump();
    this.dict.jumpObjects.push(jump);
  }

  this.removeJump = function(idx) {
    this.dict.jumpObjects.splice(idx,1);
  }
}

VRSceneList = function() {
  this.scenes = [];
  this.sceneIdx = -1;

  this.init = function() {
    this.addScene();
    this.sceneIdx = 0;
  }

  this.addScene = function() {
    var sceneDict = new VRSceneDict();
    sceneDict.init();
    this.scenes.push(sceneDict);
  }

  this.getScene = function(idx) {
    return this.scenes[idx];
  }

  this.removeScene = function(idx) {
    if (this.scenes.length>1)
      this.scenes.splice(idx,1);
  }
}

VRCreateUI = function() {
  var self=this;
  this.firstRun = true;
  this.storyManager = null;

  this.photoIdx = 0;
  this.sceneIdx = 0;
  this.sceneList = new VRSceneList();
  this.sceneSelect = null;
  this.sceneName = null;
  this.elementSelect = null;

  this.imageURL = null;
  this.imagePreviewCanvas = null;
  this.hfovNumberSlider = null;
  this.vfovNumberSlider = null;
  this.xposNumberSlider = null;
  this.yposNumberSlider = null;
  this.isPlane = null;
  this.isStereo = null;
  this.leftStereoParamU = null;
  this.rightStereoParamU = null;
  this.leftStereoParamV = null;
  this.rightStereoParamV = null;

  this.textMessage = null;
  this.jumpTo = null;
  this.jumpText = null;
  this.fontAlign = null;
  this.fontFace = null;
  this.fontSize = null;
  this.borderThickness = null;
  this.borderColor = null;
  this.backgroundColor = null;
  this.textColor = null;

  this.accordionStacker = null;
  this.oneImage = null;
  this.modeOneImage = null;
  this.modeNewStory = null;
  this.existingStory = null;
  this.modeExistingStory = null;

  this.getStory = function() {
    if (self.storyManager.storyList != [])
      return this.storyManager.storyList[0];
    else
      return null;
  }

  this.setPanelVisibility = function() {
    // hide everything
    if (self.elementSelect.value == "") {
      self.showImageOptions(false);
      self.showOptionsPosition(false);
      self.showOptionsPosition3D(false);
      self.showOptionsPlanar(false);
      self.showOptionsText(false);
      self.showOptionsJump(false);
      self.showOptionsTextCommon(false);
      return;
    }

    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    if (type == "photo") {
      self.showImageOptions(true);
      self.showOptionsPosition(true);
      self.showOptionsPosition3D(true);
      self.showOptionsPlanar(true);
      self.showStereoOptions(self.isStereo.checked);
      self.showOptionsText(false);
      self.showOptionsJump(false);
      self.showOptionsTextCommon(false);
    } else if (type == "text") {
      self.showImageOptions(false);
      self.showOptionsPosition(true);
      self.showOptionsPosition3D(false);
      self.showOptionsPlanar(true);
      self.showOptionsText(true);
      self.showOptionsJump(false);
      self.showOptionsTextCommon(true);
    } else if (type == "jump") {
      self.showImageOptions(false);
      self.showOptionsPosition(true);
      self.showOptionsPosition3D(false);
      self.showOptionsPlanar(true);
      self.showOptionsText(false);
      self.showOptionsJump(true);
      self.showOptionsTextCommon(true);
    }
  }


  this.showImageOptions = function(doit) {
    document.getElementById("options_image_load").hidden = !doit;
  }

  this.showOptionsPosition = function(doit) {
    document.getElementById("options_position").hidden = !doit;
  }

  this.showOptionsPosition3D = function(doit) {
    document.getElementById("options_position_3d").hidden = !doit;
  }

  this.showOptionsPlanar = function(doit) {
    document.getElementById("options_planar").hidden = !doit;
  }

  this.showOptionsText = function(doit) {
    document.getElementById("options_text").hidden = !doit;
  }

  this.showOptionsTextCommon = function(doit) {
    document.getElementById("options_text_common").hidden = !doit;
  }

  this.showOptionsJump = function(doit) {
    document.getElementById("options_jump").hidden = !doit;
  }

  this.showStereoOptions = function(doit) {
    var ele = document.getElementById("options_stereo");
    if (doit) {
      ele.hidden = false;
    } else {
      ele.hidden = true;
    }
  }

  this.inputStateChange = function() {
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

    var scene = self.sceneList.scenes[self.sceneSelect.value];

    // push from gui to dict
    if (type == "photo") {
      var photo = scene.dict.photoObjects[idx];
      var hfov = parseFloat(self.hfovNumberSlider.get());
      var vfov = parseFloat(self.vfovNumberSlider.get());
      var xpos = parseFloat(self.xposNumberSlider.get());
      var ypos = parseFloat(self.yposNumberSlider.get());

      photo.textureDescription.sphereFOV[0] = hfov;
      photo.textureDescription.sphereFOV[1] = vfov;
      photo.textureDescription.sphereCentre[0] = xpos;
      photo.textureDescription.sphereCentre[1] = ypos;
      photo.textureDescription.src = self.imageURL.value;
      photo.textureDescription.plane = self.isPlane.checked;
      photo.textureDescription.isStereo = self.isStereo.checked;

      var leftStereoU = self.leftStereoParamU.value.split(',');
      photo.textureDescription.U_l = [leftStereoU[0], leftStereoU[1]];
      var leftStereoV = self.leftStereoParamV.value.split(',');
      photo.textureDescription.V_l = [leftStereoV[0], leftStereoV[1]];

      var rightStereoU = self.rightStereoParamU.value.split(',');
      photo.textureDescription.U_r = [rightStereoU[0], rightStereoU[1]];
      var rightStereoV = self.rightStereoParamV.value.split(',');
      photo.textureDescription.V_r = [rightStereoV[0], rightStereoV[1]];

      self.updateImagePreview();
    } else if (type == "text") {
      var text = scene.dict.textObjects[idx];
      var hfov = parseFloat(self.hfovNumberSlider.get());
      var vfov = parseFloat(self.vfovNumberSlider.get());
      var xpos = parseFloat(self.xposNumberSlider.get());
      var ypos = parseFloat(self.yposNumberSlider.get());

      text.textureDescription.sphereFOV[0] = hfov;
      text.textureDescription.sphereFOV[1] = vfov;
      text.textureDescription.sphereCentre[0] = xpos;
      text.textureDescription.sphereCentre[1] = ypos;
      text.textureDescription.plane = self.isPlane.checked;

      text.message = self.textMessage.value;

      text.textOptions.align = self.fontAlign.value;
      text.textOptions.fontface = self.fontFace.value;
      text.textOptions.fontsize = self.fontSize.value;
      text.textOptions.borderthickness = self.borderThickness.value;
      text.textOptions.bordercolor = self.borderColor.value;
      text.textOptions.backgroundcolor = self.backgroundColor.value;
      text.textOptions.textcolor = self.textColor.value;
    } else if (type == "jump") {
      var jump = scene.dict.jumpObjects[idx];
      var hfov = parseFloat(self.hfovNumberSlider.get());
      var vfov = parseFloat(self.vfovNumberSlider.get());
      var xpos = parseFloat(self.xposNumberSlider.get());
      var ypos = parseFloat(self.yposNumberSlider.get());

      jump.textureDescription.sphereFOV[0] = hfov;
      jump.textureDescription.sphereFOV[1] = vfov;
      jump.textureDescription.sphereCentre[0] = xpos;
      jump.textureDescription.sphereCentre[1] = ypos;
      jump.textureDescription.plane = self.isPlane.checked;
      jump.jumpTo = self.jumpTo.value;
      jump.jumpText = self.jumpText.value;

      jump.textOptions.align = self.fontAlign.value;
      jump.textOptions.fontface = self.fontFace.value;
      jump.textOptions.fontsize = self.fontSize.value;
      jump.textOptions.borderthickness = self.borderThickness.value;
      jump.textOptions.bordercolor = self.borderColor.value;
      jump.textOptions.backgroundcolor = self.backgroundColor.value;
      jump.textOptions.textcolor = self.textColor.value;
    }
    self.setPanelVisibility();
    self.pushFromDictToRender();
  }

  this.updateImagePreview = function() {
    var txSize = 1024;

    var ctx = self.imagePreviewCanvas.getContext('2d');
    ctx.clearRect(0, 0, txSize, txSize);

    var ctxWidth = ctx.canvas.clientWidth;
    var ctxHeight = ctx.canvas.clientHeight;
    var imWidth = self.imagePreview.width;
    var imHeight = self.imagePreview.height;
    var ctxAspect = ctxWidth/ctxHeight;
    var imAspect = imWidth/imHeight;

    var x,y,w,h;
    if (imAspect>ctxAspect) {
      w = txSize;
      h = w*ctxAspect;
    } else if (ctxAspect>1. && imAspect>1.) {
      h = txSize;
      w = h/ctxAspect;
    } else if (imAspect<ctxAspect) {
      h = txSize;
      w = h/ctxAspect;
    } else {
      w = txSize;
      h = w*ctxAspect;
    }

    x=txSize*0.5 - 0.5*w;
    y=txSize*0.5 - 0.5*h;

    if (!self.isStereo.checked) {
      //draw background image
      ctx.drawImage(self.imagePreview, x,y,w,h);
    } else {
      ctx.globalAlpha = 0.5;
      ctx.drawImage(self.imagePreview, x,y,w,h);
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = 'rgba(0,0,0,1.0)';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 4;
      ctx.moveTo(x,y);
      ctx.lineTo(x+w,y);
      ctx.moveTo(x,y+0.5*h);
      ctx.lineTo(x+w,y+0.5*h);
      ctx.moveTo(x,y+h);
      ctx.lineTo(x+w,y+h);
      ctx.moveTo(x,y);
      ctx.lineTo(x,y+h);
      ctx.moveTo(x+0.5*w,y);
      ctx.lineTo(x+0.5*w,y+h);
      ctx.moveTo(x+w,y);
      ctx.lineTo(x+w,y+h);
      ctx.stroke();

      ctx.font = "32px Arial";
      ctx.fillText("(0,0)",x,y+32);
      ctx.fillText("(0,0.5)",x,y+0.5*h-32);
      ctx.fillText("(0,1)",x,y+h-32);
      ctx.fillText("(0.5,0)",x+0.5*w-96,y+32);
      ctx.fillText("(0.5,0.5)",x+0.5*w-116,y+0.5*h-32);
      ctx.fillText("(0.5,1)",x+0.5*w-96,y+h-32);
      ctx.fillText("(1,0)",x+w-72,y+32);
      ctx.fillText("(1,0.5)",x+w-96,y+0.5*h-32);
      ctx.fillText("(1,1)",x+w-72,y+h-32);

      ctx.lineWidth = 1;
      ctx.font = "Bold 64px Arial";
      var leftStereoU = self.leftStereoParamU.value.split(',');
      var leftStereoV = self.leftStereoParamV.value.split(',');
      U = [x+(leftStereoU[0]*w), y+(leftStereoU[1]*h)];
      V = [x+(leftStereoV[0]*w), y+(leftStereoV[1]*h)];
      ctx.fillStyle   = 'rgba(255,0,0,0.5)';
      ctx.strokeStyle = 'rgba(255,0,0,0.5)';
      ctx.fillRect(U[0],U[1],V[0]-U[0],V[1]-U[1]);
      ctx.stroke();
      ctx.fillStyle   = 'rgba(255,0,0,1.0)';
      ctx.strokeStyle = 'rgba(255,0,0,1.0)';
      ctx.fillText("Left",U[0],U[1]+64);

      var rightStereoU = self.rightStereoParamU.value.split(',');
      var rightStereoV = self.rightStereoParamV.value.split(',');
      U = [x+(rightStereoU[0]*w), y+(rightStereoU[1]*h)];
      V = [x+(rightStereoV[0]*w), y+(rightStereoV[1]*h)];
      ctx.fillStyle   = 'rgba(0,0,255,0.5)';
      ctx.strokeStyle = 'rgba(0,0,255,0.5)';
      ctx.fillRect(U[0],U[1],V[0]-U[0],V[1]-U[1]);
      ctx.stroke();
      ctx.fillStyle   = 'rgba(0,0,255,1.0)';
      ctx.strokeStyle = 'rgba(0,0,255,1.0)';
      ctx.fillText("Right",U[0],U[1]+64);
    }
  }

  this.loadImage = function() {
    self.imagePreview.onload = self.updateImagePreview;
    self.inputStateChange();
    var imgURL = self.imageURL.value;
    self.imagePreview.src = imgURL;
  }

  this.updateSceneListDropdown = function() {
    self.sceneSelect.innerHTML = "";
    for (i = 0; i < self.sceneList.scenes.length; i++) {
      var scene = self.sceneList.scenes[i];
      var opt = document.createElement('option');
      opt.value = i;
      if (scene.dict.name != "")
        opt.innerHTML = scene.dict.name;
      else
        opt.innerHTML = i;
      self.sceneSelect.appendChild(opt);
    }
  }

  this.populateGUIFromSceneDict = function(idx) {
    self.sceneSelect.value = idx;
    self.elementSelect.innerHTML = "";
    var scene = self.sceneList.scenes[idx];
    this.sceneName.value = scene.dict.name;
    for (i = 0; i < scene.dict.photoObjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = "photo_" + i;
      opt.innerHTML = "Image " + (i+1);
      self.elementSelect.appendChild(opt);
    }
    for (i = 0; i < scene.dict.textObjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = "text_" + i;
      opt.innerHTML = "Text " + (i+1);
      self.elementSelect.appendChild(opt);
    }
    for (i = 0; i < scene.dict.jumpObjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = "jump_" + i;
      opt.innerHTML = "Jump " + (i+1);
      self.elementSelect.appendChild(opt);
    }
    self.pushFromDictToRender();
  }


  this.pushFromGUIToDict = function() {
    self.sceneList.scenes[self.sceneSelect.value].dict.name = self.sceneName.value;
    self.updateSceneListDropdown();
    self.pushFromDictToRender();
  }

  this.addImage = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addPhoto();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "photo_" + (scene.dict.photoObjects.length - 1);
    self.selectElement();
    self.accordionStacker.showNamed("setup_scene_object");
  }

  this.addText = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addText();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "text_" + (scene.dict.textObjects.length - 1);
    self.selectElement();
    self.accordionStacker.showNamed("setup_scene_object");
  }

  this.addJump = function() {
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addJump();
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "jump_" + (scene.dict.jumpObjects.length - 1);
    self.selectElement();
    self.accordionStacker.showNamed("setup_scene_object");
  }

  this.removeElement = function() {
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

    var scene = self.sceneList.scenes[self.sceneSelect.value];
    if (type == "photo") {
      scene.removePhoto(idx);
    } else if (type == "text") {
      scene.removeText(idx);
    } else if (type == "jump") {
      scene.removeJump(idx);
    }

    self.populateGUIFromSceneDict(self.sceneSelect.value);
  }

  this.pushFromDictToRender = function() {
    if (self.getStory()==null)
      return;
    self.getStory().sceneList = [];
    for (i = 0; i < self.sceneList.scenes.length; i++) {
      self.getStory().sceneList.push(self.sceneList.scenes[i].vrScene);
    }

    console.log("pushFromDictToRender");

    var scene = self.sceneList.scenes[self.sceneSelect.value];
    self.getStory().sceneList[self.sceneSelect.value].initDict(scene.dict);
    self.getStory().setupScene(self.sceneSelect.value);

    self.updateShare();
  }

  this.selectElement = function() {
    self.setPanelVisibility();
    if (self.elementSelect.value == "")
      return;
    var selectorVals = self.elementSelect.value.split("_");
    var type = selectorVals[0];
    var idx = selectorVals[1];

    var scene = self.sceneList.scenes[self.sceneSelect.value];
    // push from dict to gui
    if (type == "photo") {
      var photo = scene.dict.photoObjects[idx];
      self.hfovNumberSlider.set(photo.textureDescription.sphereFOV[0]);
      self.vfovNumberSlider.set(photo.textureDescription.sphereFOV[1]);
      self.xposNumberSlider.set(photo.textureDescription.sphereCentre[0]);
      self.yposNumberSlider.set(photo.textureDescription.sphereCentre[1]);
      self.imageURL.value = photo.textureDescription.src;
      self.isPlane.checked = photo.textureDescription.plane;
      self.isStereo.checked = photo.textureDescription.isStereo;
      self.leftStereoParamU.value = photo.textureDescription.U_l[0] + "," +
                                    photo.textureDescription.U_l[1];
      self.leftStereoParamV.value = photo.textureDescription.V_l[0] + "," +
                                    photo.textureDescription.V_l[1];
      self.rightStereoParamU.value = photo.textureDescription.U_r[0] + "," +
                                    photo.textureDescription.U_r[1];
      self.rightStereoParamV.value = photo.textureDescription.V_r[0] + "," +
                                    photo.textureDescription.V_r[1];
      self.loadImage();
    } else if (type =="text"){
      var text = scene.dict.textObjects[idx];
      self.hfovNumberSlider.set(text.textureDescription.sphereFOV[0]);
      self.vfovNumberSlider.set(text.textureDescription.sphereFOV[1]);
      self.xposNumberSlider.set(text.textureDescription.sphereCentre[0]);
      self.yposNumberSlider.set(text.textureDescription.sphereCentre[1]);
      self.isPlane.checked = text.textureDescription.plane;
      self.textMessage.value = text.message;

      self.fontAlign.value = text.textOptions.align;
      self.fontFace.value = text.textOptions.fontface;
      self.fontSize.value = text.textOptions.fontsize;
      self.borderThickness.value = text.textOptions.borderthickness;
      self.borderColor.value = text.textOptions.bordercolor;
      self.backgroundColor.value = text.textOptions.backgroundcolor;
      self.textColor.value = text.textOptions.textcolor;

    } else if (type=="jump"){
      var jump = scene.dict.jumpObjects[idx];
      self.hfovNumberSlider.set(jump.textureDescription.sphereFOV[0]);
      self.vfovNumberSlider.set(jump.textureDescription.sphereFOV[1]);
      self.xposNumberSlider.set(jump.textureDescription.sphereCentre[0]);
      self.yposNumberSlider.set(jump.textureDescription.sphereCentre[1]);
      self.isPlane.checked = jump.textureDescription.plane;
      self.jumpTo.value = jump.jumpTo;
      self.jumpText.value = jump.jumpText;

      self.fontAlign.value = jump.textOptions.align;
      self.fontFace.value = jump.textOptions.fontface;
      self.fontSize.value = jump.textOptions.fontsize;
      self.borderThickness.value = jump.textOptions.borderthickness;
      self.borderColor.value = jump.textOptions.bordercolor;
      self.backgroundColor.value = jump.textOptions.backgroundcolor;
      self.textColor.value = jump.textOptions.textcolor;
    }
  }

  this.sceneSelectChange = function() {
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.selectElement();
  }

  this.addScene = function() {
    self.sceneList.addScene();
    self.updateSceneListDropdown();
    self.populateGUIFromSceneDict(self.sceneSelect.length - 1);
  }

  this.removeScene = function() {
    self.sceneList.removeScene();
    self.updateSceneListDropdown();
  }

  this.stackerEditQuick = function() {
    self.accordionStacker.totalHide("mode_pick", true);
    self.accordionStacker.totalHide("manage_scenes", true);
    self.accordionStacker.totalHide("manage_scene_objects", true);
    self.accordionStacker.totalHide("setup_scene_object", false);
    self.accordionStacker.totalHide("preview_dummy", false);
    self.accordionStacker.totalHide("export", false);
    self.accordionStacker.showNamed("setup_scene_object");
  }

  this.stackerEditFull = function() {
    self.accordionStacker.totalHide("mode_pick", true);
    self.accordionStacker.totalHide("manage_scenes", false);
    self.accordionStacker.totalHide("manage_scene_objects", false);
    self.accordionStacker.totalHide("setup_scene_object", false);
    self.accordionStacker.totalHide("preview_dummy", false);
    self.accordionStacker.totalHide("export", false);
    self.accordionStacker.showNamed("manage_scenes");
  }

  this.stackerInit = function() {
    self.accordionStacker.totalHide("manage_scenes", true);
    self.accordionStacker.totalHide("manage_scene_objects", true);
    self.accordionStacker.totalHide("setup_scene_object", true);
    self.accordionStacker.totalHide("preview_dummy", true);
    self.accordionStacker.totalHide("export", true);
  }

  this.tryModeOneImage = function() {
    if (self.oneImage.value == "") {
      return;
    }

    // setup scene with one image
    var scene = self.sceneList.scenes[self.sceneSelect.value];
    scene.addPhoto();
    scene.dict.photoObjects[0].textureDescription.src = self.oneImage.value;
    self.populateGUIFromSceneDict(self.sceneSelect.value);
    self.elementSelect.value = "photo_" + (scene.dict.photoObjects.length - 1);
    self.selectElement();

    self.stackerEditQuick();
  }

  this.tryModeNewStory = function() {
    self.stackerEditFull();
  }

  this.tryModeExistingStory = function() {
    if (self.existingStory.value == "") {
      return;
    }


    self.stackerEditFull();
  }

  this.updateShare = function() {
    var shareCodes = self.getStory().getShareCodes();
    var url = shareCodes[0];
    var embedCode = shareCodes[1];
    if (self.getStory().isSinglePhotoStory()) {
      document.getElementById('singleShare').hidden = false;
      var twitterURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Check out my #vrEmbed ") + url;
      var facebookURL = "https://www.facebook.com/sharer/sharer.php?u=" + url;
      var gplusURL = "https://plus.google.com/share?url=" + url;
      var redditURL = "http://www.reddit.com/submit?url=" + url;

      document.getElementById('shareURL').href = decodeURIComponent(url);
      document.getElementById('shareTwitter').href = twitterURL;
      document.getElementById('shareFacebook').href = facebookURL;
      document.getElementById('shareGplus').href = gplusURL;
      document.getElementById('shareReddit').href = redditURL;
    } else {
      document.getElementById('singleShare').hidden = true;
    }

    document.getElementById('shareEmbedCode').value = embedCode;
  }

  this.showShare = function() {
    // self.getStory().vrOptions.options.showDialogShare(this.getShareCodes());
  };


  this.initObjectPanel = function() {
    this.imageURL = document.getElementById('imageURL');
    this.imagePreviewCanvas = document.getElementById('imagePreviewCanvas');
    var ctx = self.imagePreviewCanvas.getContext('2d');
    ctx.canvas.width  = 1024;
    ctx.canvas.height = 1024;
    this.imagePreview = new Image();
    this.imageURL.onchange = this.loadImage;
    this.imageURL.value = "";

    this.isPlane = document.getElementById('isPlane');
    this.isStereo = document.getElementById('isStereo');
    this.isPlane.onchange = this.inputStateChange;
    this.isStereo.onchange = this.inputStateChange;
    this.leftStereoParamU = document.getElementById('leftStereoParamU');
    this.leftStereoParamV = document.getElementById('leftStereoParamV');
    this.rightStereoParamU = document.getElementById('rightStereoParamU');
    this.rightStereoParamV = document.getElementById('rightStereoParamV');
    this.leftStereoParamU.onchange = this.inputStateChange;
    this.leftStereoParamV.onchange = this.inputStateChange;
    this.rightStereoParamU.onchange = this.inputStateChange;
    this.rightStereoParamV.onchange = this.inputStateChange;

    var loadButton = document.getElementById("loadImage");
    loadButton.onclick = this.loadImage;

    this.hfovNumberSlider = new NumberSlider();
    this.hfovNumberSlider.init(document.getElementById("hfov"),
                               document.getElementById("hfov_t"),
                               360,
                               this.inputStateChange);

    this.vfovNumberSlider = new NumberSlider();
    this.vfovNumberSlider.init(document.getElementById("vfov"),
                              document.getElementById("vfov_t"),
                              180,
                              this.inputStateChange);

    this.xposNumberSlider = new NumberSlider();
    this.xposNumberSlider.init(document.getElementById("xpos"),
                              document.getElementById("xpos_t"),
                              0,
                              this.inputStateChange);

    this.yposNumberSlider = new NumberSlider();
    this.yposNumberSlider.init(document.getElementById("ypos"),
                              document.getElementById("ypos_t"),
                              0,
                              this.inputStateChange);

    this.textMessage = document.getElementById('textMessage');
    this.textMessage.onchange = this.inputStateChange;

    this.jumpTo = document.getElementById('jumpTo');
    this.jumpTo.onchange = this.inputStateChange;
    this.jumpText = document.getElementById('jumpText');
    this.jumpText.onchange = this.inputStateChange;

    this.fontAlign = document.getElementById('fontAlign');
    this.fontAlign.onchange = this.inputStateChange;
    this.fontFace = document.getElementById('fontFace');
    this.fontFace.onchange = this.inputStateChange;
    this.fontSize = document.getElementById('fontSize');
    this.fontSize.onchange = this.inputStateChange;
    this.borderThickness = document.getElementById('borderThickness');
    this.borderThickness.onchange = this.inputStateChange;
    this.borderColor = document.getElementById('borderColor');
    this.borderColor.onchange = this.inputStateChange;
    this.backgroundColor = document.getElementById('backgroundColor');
    this.backgroundColor.onchange = this.inputStateChange;
    this.textColor = document.getElementById('textColor');
    this.textColor.onchange = this.inputStateChange;
  }

  this.init = function(vrStoryManager) {
    this.storyManager = vrStoryManager;

    // scene management
    this.sceneSelect = document.getElementById("sceneSelect");
    this.sceneName = document.getElementById("sceneName");
    this.elementSelect = document.getElementById("elementSelect");
    var addSceneButton = document.getElementById("addScene");
    addSceneButton.onclick = this.addScene;
    var removeSceneButton = document.getElementById("removeScene");
    removeSceneButton.onclick = this.removeScene;
    this.sceneSelect.onchange = this.sceneSelectChange;
    this.sceneName.onchange = this.pushFromGUIToDict;
    this.elementSelect.onchange = this.selectElement;

    var addImageButton = document.getElementById("addImage");
    var addTextButton = document.getElementById("addText");
    var addJumpButton = document.getElementById("addJump");
    var removeElementButton = document.getElementById("removeElement");
    addImageButton.onclick = this.addImage;
    addTextButton.onclick = this.addText;
    addJumpButton.onclick = this.addJump;
    removeElementButton.onclick = this.removeElement;

    this.oneImage = document.getElementById("oneImage");
    this.modeOneImage = document.getElementById("modeOneImage");
    this.modeNewStory = document.getElementById("modeNewStory");
    this.existingStory = document.getElementById("existingStory");
    this.modeExistingStory = document.getElementById("modeExistingStory");
    modeOneImage.onclick = this.tryModeOneImage;
    modeNewStory.onclick = this.tryModeNewStory;
    modeExistingStory.onclick = this.tryModeExistingStory;
    this.oneImage.value = "http://vrembed.org/src/assets/vrEmbedLogo.png";

    this.initObjectPanel();

    this.sceneList.init();
    this.updateSceneListDropdown();
    this.sceneSelect.value = 0;
    this.sceneSelectChange();
    this.setPanelVisibility();

    this.accordionStacker = new VRAccordionStacker();
    this.accordionStacker.add("mode_pick");
    this.accordionStacker.add("manage_scenes");
    this.accordionStacker.add("manage_scene_objects");
    this.accordionStacker.add("setup_scene_object");
    this.accordionStacker.add("preview_dummy");
    this.accordionStacker.add("export");
    this.accordionStacker.showNamed("mode_pick");

    this.stackerInit();
  }
}

module.exports = VRCreateUI;
