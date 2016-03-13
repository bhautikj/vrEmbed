
VRStoryDict = function(){
  this.init = function(storyString) {
    var tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = storyString;

    var stories=tmpDiv.getElementsByTagName("story");
    for(storyit = 0;storyit < stories.length; storyit++) {
      var story = stories[storyit];
      console.log(story.innerHTML);
      // var vrStory = new VRStory();
      // vrStory.initStory(story, this.storyManager);
      // this.storyManager.addStory(vrStory);
    }
    document.removeElement(tmpDiv);
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
