
// create a test quad from this element: <twglTest></twglTest>
runTest = function() {
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
}

// create a test quad from this element: <twglTest></twglTest>
runTestStereographic = function() {
  VRtwglQuadStereoProjection = require('./VRtwglQuadStereoProjection.js');
  VRTextureDescription = require('./VRTextureDescription.js');

  var twglTestElements=document.getElementsByTagName("twglTest");
  for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
    var twglTestElement = twglTestElements[twglTestIt];
    var vrtwglQuadStereoProjection = new VRtwglQuadStereoProjection();
    vrtwglQuadStereoProjection.init(twglTestElement);

    var texDesc = new VRTextureDescription();
    texDesc.textureSource='src/assets/rheingauer_dom.jpg';
    vrtwglQuadStereoProjection.setupProjection(texDesc);


    vrtwglQuadStereoProjection.resize();
    window.addEventListener('resize', vrtwglQuadStereoProjection.resize, false);
    vrtwglQuadStereoProjection.anim();
  }
}


//runTest();
runTestStereographic();
