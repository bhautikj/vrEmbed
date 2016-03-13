var VRSceneDict = require('./VRSceneDict.js');
var VRUISceneList = require('./VRUISceneList.js');

VRStoryDict = function(){
  this.init = function(storyString) {
    var tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = storyString;

    var stories=tmpDiv.getElementsByTagName("story");
    if (stories.length==0)
      return null;

    var vrSceneDicts = [];

    for(storyit = 0;storyit < stories.length; storyit++) {
      var storyElement = stories[storyit];
      var children = storyElement.childNodes;
      for(var i = 0, l=children.length; i<l; ++i) {
        var scene = children[i];
        if(scene.nodeType === 1) {
          if(scene.nodeName=="SCENE"){
            var vrScene = new VRScene();
            vrScene.init(scene);
            var vrSceneDict = new VRSceneDict();
            vrSceneDict.initFromVrScene(vrScene);
            vrSceneDicts.push(vrSceneDict);
          }
        }
      }
    }
    tmpDiv.remove();

    return vrSceneDicts;
  }
}
// var children = storyElement.childNodes;
// for(var i = 0, l=children.length; i<l; ++i) {
//   var scene = children[i];
//   if(scene.nodeType === 1) {
//     if(scene.nodeName=="SCENE"){
//       var vrScene = new VRScene();
//       vrScene.init(scene);
//       if (vrScene.isStereo)
//         this.isStereo = true;
//       this.sceneList.push(vrScene);
//       if (vrScene.name != "") {
//         this.namedSceneMap[vrScene.name] = this.sceneList.length - 1;
//       }
//     }
//   }
// }

module.exports = VRStoryDict;
