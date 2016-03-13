VRUISceneList = function() {
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

module.exports = VRUISceneList;
