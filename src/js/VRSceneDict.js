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

  this.initFromVrScene = function(vrScene) {
    this.vrScene = vrScene;
    this.dict = {};
    this.dict.name = vrScene.name;
    this.dict.photoObjects=[];
    this.dict.textObjects=[];
    this.dict.jumpObjects=[];

    for(i = 0;i < vrScene.photoObjects.length; i++) {
      this.dict.photoObjects.push(this.initFromScenePhoto(vrScene.photoObjects[i]));
    }
    for(i = 0;i < vrScene.textObjects.length; i++) {
      this.dict.textObjects.push(this.initFromText(vrScene.textObjects[i]));
    }
    for(i = 0;i < vrScene.jumpObjects.length; i++) {
      this.dict.jumpObjects.push(this.initFromJump(vrScene.jumpObjects[i]));
    }
  }

  this.initFromTextureDescription = function(textureDescription) {
    var dict = {};
    dict.src = textureDescription.textureSource;
    dict.metaSource = textureDescription.metaSource;
    dict.isStereo = textureDescription.isStereo;
    dict.sphereFOV = textureDescription.sphereFOV;
    dict.sphereCentre = textureDescription.sphereCentre;
    dict.U_l = textureDescription.U_l;
    dict.V_l = textureDescription.V_l;
    dict.U_r = textureDescription.U_r;
    dict.V_r = textureDescription.V_r;
    dict.plane = textureDescription.plane;
    return dict;
  }

  this.initFromTextOptions = function(textOptions) {
    var dict = {};
    dict.align = textOptions.align;
    dict.fontface = textOptions.fontface;
    dict.fontsize = textOptions.fontsize;
    dict.borderThickness = textOptions.borderthickness;
    dict.borderColor = textOptions.bordercolor;
    dict.backgroundColor = textOptions.backgroundcolor;
    dict.textColor = textOptions.textcolor;
    return dict;
  }

  this.initFromScenePhoto = function(scenePhoto) {
    var photo = {};
    photo.textureDescription = this.initFromTextureDescription(scenePhoto.textureDescription);
    return photo;
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
    photo.textureDescription.V_l = [0.5,1];
    photo.textureDescription.U_r = [0.5,0];
    photo.textureDescription.V_r = [1,1];
    return photo;
  }

  this.initFromText = function(vrText) {
    var text = {};
    text.textureDescription = this.initFromTextureDescription(vrText.textureDescription);
    text.textOptions = this.initFromTextOptions(vrText.textOptions);
    text.message = vrText.message;
    return text;
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

  this.initFromJump = function(vrJump) {
    var jump = {};
    jump.textureDescription = this.initFromTextureDescription(vrJump.textureDescription);
    jump.textOptions = this.initFromTextOptions(vrJump.textOptions);
    jump.jumpTo = vrJump.jumpTo;
    jump.jumpText = vrJump.jumpText;
    return jump;
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

module.exports = VRSceneDict;
