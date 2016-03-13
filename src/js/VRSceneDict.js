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

module.exports = VRSceneDict;
