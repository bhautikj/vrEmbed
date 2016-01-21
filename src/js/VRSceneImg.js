var VRTextureDescription = require('./VRTextureDescription.js');

VRSceneImg = function() {
  this.sceneImg = null;
  this.textureDescription = null;
  this.isStereo = false;

  this.parseSphereParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.sphereFOV = [arr[0].trim(), arr[1].trim()];
    this.textureDescription.sphereCentre = [arr[2].trim(), arr[3].trim()];
  };

  this.parseTexParams = function(str) {
    var arr = str.split(",");
    this.textureDescription.U_l = [arr[0].trim(), arr[1].trim()];
    this.textureDescription.V_l = [arr[2].trim(), arr[3].trim()];
    this.textureDescription.U_r = [arr[4].trim(), arr[5].trim()];
    this.textureDescription.V_r = [arr[6].trim(), arr[7].trim()];
  };

  this.init = function(sceneImg) {
    this.sceneImg = sceneImg;
    this.textureDescription = new VRTextureDescription();

    this.textureDescription.textureSource = this.sceneImg.getAttribute("src");
    if (this.textureDescription.textureSource  == null){
      //TODO: throw exception
      this.textureDescription = null;
      return;
    }
    this.textureDescription.metaSource = "";
    this.parseSphereParams(this.sceneImg.getAttribute("sphereParams"));
    this.textureDescription.isStereo = this.sceneImg.getAttribute("isStereo");
    if (this.textureDescription.isStereo.toLowerCase()=="true")
      this.isStereo = true;
    if (this.textureDescription.isStereo == "true")
      this.parseTexParams(this.sceneImg.getAttribute("texParams"));
  };
};

module.exports = VRSceneImg;
