VRtwglQuad = require('./VRtwglQuad.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fs = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  gl_FragColor = vec4( uv.x,uv.y, 0.0, 1.0 );\n"+
"}\n";

console.log("INIT");
var twglTestElements=document.getElementsByTagName("twglTest");
for(twglTestIt = 0;twglTestIt < twglTestElements.length; twglTestIt++) {
  console.log("FOUND");
  var twglTestElement = twglTestElements[twglTestIt];
  var vrTwglQuad = new VRtwglQuad();
  vrTwglQuad.init(twglTestElement, vs, fs);
  vrTwglQuad.resize();
  window.addEventListener('resize', vrTwglQuad.resize, false);
  vrTwglQuad.anim();
}
