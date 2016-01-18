
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
runTestBuffer = function() {
  VRtwglQuadTestBuffer = require('./VRtwglQuadTestBuffer.js');

  console.log("INIT");
  var twglTestElements=document.getElementsByTagName("twglTest");
  for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
    console.log("FOUND");
    var twglTestElement = twglTestElements[twglTestIt];
    var vrTwglQuadTest = new VRtwglQuadTestBuffer();
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

    var texArray = [];
    var texDescA = new VRTextureDescription();
    texDescA.textureSource = 'src/assets/rheingauer_dom.jpg';
    texDescA.isStereo = false;
    texDescA.sphereFOV = [360,180];
    texDescA.sphereCentre = [0,0];
    texDescA.U_l = [0.,0.];
    texDescA.V_l = [1.,1.];
    texDescA.U_r = [0.,0.];
    texDescA.V_r = [1.,1.];
    texArray.push(texDescA);

    var texDescB = new VRTextureDescription();
    texDescB.textureSource='src/assets/stereograph_b.jpg';
    texDescB.isStereo = true;
    texDescB.sphereFOV = [90,90];
    texDescB.sphereCentre = [0,0];
    texDescB.U_l = [0.,0.];
    texDescB.V_l = [.5,1.];
    texDescB.U_r = [.5,0.];
    texDescB.V_r = [1.,1.];
    texArray.push(texDescB);

    var texDescC = new VRTextureDescription();
    texDescC.textureSource='src/assets/stereograph_b.jpg';
    texDescC.isStereo = true;
    texDescC.sphereFOV = [90,90];
    texDescC.sphereCentre = [90,0];
    texDescC.U_l = [0.,0.];
    texDescC.V_l = [.5,1.];
    texDescC.U_r = [.5,0.];
    texDescC.V_r = [1.,1.];
    // texArray.push(texDescC);

    vrtwglQuadStereoProjection.loadTextures(texArray);

    vrtwglQuadStereoProjection.resize();
    window.addEventListener('resize', vrtwglQuadStereoProjection.resize, false);
    vrtwglQuadStereoProjection.anim();
  }
}


//runTestBuffer();
runTest();
//runTestStereographic();
