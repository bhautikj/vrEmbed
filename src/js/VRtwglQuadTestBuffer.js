VRtwglQuad = require('./VRtwglQuad.js');
VRCanvasFactory = require('./VRCanvasFactory.js');

var twgl = require('../js-ext/twgl-full.js');

var vsTex = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fsTex = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  gl_FragColor = texture2D(textureSource, uv);\n"+
"}\n";

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fs = "precision mediump float;\n"+
"uniform vec2 resolution;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  if (uv.x>0.5 && uv.y>0.5)\n"+
"    gl_FragColor = vec4( 0.0, 0.0, 1.0, 1.0 );\n"+
"  else\n"+
"    gl_FragColor = vec4( uv.x,uv.y, 0.0, 1.0 );\n"+
"}\n";

var fsWindowed = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"uniform vec2 sphX;\n"+
"uniform vec2 sphYX;\n"+
"uniform vec4 uvL;\n"+
"uniform vec4 uvR;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  bool leftImg=false;\n"+
"  if (uv.y<0.5) { \n"+
"    uv.y *= 2.; \n"+
"    leftImg=true; }\n"+
"  else {\n"+
"    uv.y = 2.*(uv.y - .5);\n"+
"  }\n"+
"  //map uv.x 0..1 to -PI..PI and uv.y 0..1 to -PI/2..PI/2\n"+
"  float lat = 0.5*PI*(2.*uv.y-1.0);\n"+
"  float lon = PI*(2.0*uv.x-1.0);\n"+
"  // map lat/lon to point on unit sphere\n"+
"  float r = cos(lat);\n"+
"  vec4 sphere_pnt = vec4(r*cos(lon), r*sin(lon), sin(lat), 1.0);\n"+
"  sphere_pnt *= transform;\n"+
"  // now map point in sphere back to lat/lon coords\n"+
"  float sphere_pnt_len = length(sphere_pnt);\n"+
"  sphere_pnt /= sphere_pnt_len;\n"+
"  vec2 lonLat = vec2(atan(sphere_pnt.y, sphere_pnt.x), asin(sphere_pnt.z));\n"+
"  // map back to 0..1\n"+
"  lonLat.x = (lonLat.x/(2.0*PI))+0.5;\n"+
"  lonLat.y = (lonLat.y/(.5*PI))+0.5;\n"+
"  vec2 testPt = (lonLat-sphX);\n"+
"  testPt = mod(testPt, 1.)/sphYX;\n"+
"  // bail out if we're out of drawable region\n"+
"  if (testPt.x<0. || testPt.x>1. || testPt.y<0. || testPt.y>1.){ discard; return;}\n"+
"  // now map to either left or right UV tex\n"+
"  vec2 uvX;\n"+
"  vec2 uvYX;\n"+
"  if (leftImg == true) {\n"+
"    uvX = uvL.xy;\n"+
"    uvYX = uvL.zw;\n"+
"  } else {\n"+
"    uvX = uvR.xy;\n"+
"    uvYX = uvR.zw;\n"+
"  }\n"+
"  vec2 texC = uvX + (testPt*uvYX);\n"+
"  gl_FragColor = texture2D(textureSource, texC);\n"+
"}\n";

VRtwglQuadTestBuffer = function() {
  var self = this;
  this.vrtwglQuad = null;
  this.vrtwglQuadFb = null;

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vsTex, fsTex);

    this.vrtwglQuadFb = new VRtwglQuad();
    this.vrtwglQuadFb.initFramebuffer(2048, this.vrtwglQuad.glContext, vs, fsWindowed);

    var gl = this.vrtwglQuad.glContext;
    this.canvasTex = VRCanvasFactory.createCanvasSpinner();
    this.canvasTex.init(gl);
    this.canvasAnim = 0.0;
    //this.glTex = twgl.createTexture(gl, {min: gl.LINEAR,mag: gl.LINEAR, src: 'rheingauer_dom.jpg'});
  }

  this.getContainer = function() {
    return this.vrtwglQuad.container;
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.createOrientation = function(pitch, yaw) {
    var mat = twgl.m4.identity();
    var axisYaw = twgl.v3.create(0,1,0);
    twgl.m4.axisRotate(mat, axisYaw, yaw, mat);
    var axisPitch = twgl.v3.create(0,0,1);
    twgl.m4.axisRotate(mat, axisPitch, pitch, mat);
    return mat;
  }

  this.getWindowedUniforms = function(vrCanvasTex, textureDesc) {
    this.canvasAnim += 0.01;
    this.canvasTex.update(this.canvasAnim);

    var uniformsFbGui = {
      resolution: [2048, 2048],
    }

    uniformsFbGui["textureSource"] = vrCanvasTex.glTex;
    uniformsFbGui["sphX"] = [0.5-0.5*(textureDesc.sphereFOV[0]/360.0),0.5-0.5*(textureDesc.sphereFOV[1]/180.0)];
    uniformsFbGui["sphYX"] = [(textureDesc.sphereFOV[0]/360.0),(textureDesc.sphereFOV[1]/180.0)];
    uniformsFbGui["transform"] = this.createOrientation(Math.PI*textureDesc.sphereCentre[0]/180.0, Math.PI*textureDesc.sphereCentre[1]/180.0);
    uniformsFbGui["uvL"] = [0,0,1,1];
    uniformsFbGui["uvR"] = [0,0,1,1];

    return uniformsFbGui;
  }

  this.render = function() {
    //var uniformsFb = {
    //  resolution: [2048, 2048]
    //};
    var uniformsFb = this.getWindowedUniforms(this.canvasTex, this.canvasTex.vrTextureDescription);

    self.vrtwglQuadFb.setUniforms(uniformsFb);
    self.vrtwglQuadFb.renderFramebuffer();

    // console.log("RES:" + self.vrtwglQuad.canvas.width + "," +self.vrtwglQuad.canvas.height)
    var uniforms = {
     resolution: [self.vrtwglQuad.canvas.width, self.vrtwglQuad.canvas.height],
     textureSource: self.vrtwglQuadFb.getFramebufferTexture()
    };

    self.vrtwglQuad.setUniforms(uniforms);
    self.vrtwglQuad.render();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

}

module.exports = VRtwglQuadTestBuffer;
