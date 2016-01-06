VRtwglQuadTest = require('./VRtwglQuadTest.js');

console.log("INIT");
var twglTestElements=document.getElementsByTagName("twglTest");
for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
  console.log("FOUND");
  var twglTestElement = twglTestElements[twglTestIt];
  var vrTwglQuadTest = new VRtwglQuadTest();
  vrTwglQuadTest.init(twglTestElement);
  vrTwglQuadTest.resize();
  window.addEventListener('resize', vrTwglQuadTest.resize, false);
  vrTwglQuadTest.anim();
}
