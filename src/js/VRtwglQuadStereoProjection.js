VRtwglQuad = require('./VRtwglQuad.js');
VRRenderModes = require('./VRRenderModes.js');
twgl = require('../js-ext/twgl-full.js');

var vs = "attribute vec4 position;\n"+
"void main() {\n"+
"  gl_Position = position;\n"+
"}\n";

var fsTest = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  gl_FragColor = vec4(uv.x, uv.y,0.0,1.0);\n"+
"}\n"

var fsFull360180 = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
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
"  gl_FragColor = texture2D(textureSource, lonLat);\n"+
"}\n"

var fsRenderDisplay = "precision mediump float;\n"+
"#define PI 3.141592653589793\n"+
"uniform vec2 resolution;\n"+
"uniform sampler2D textureSource;\n"+
"uniform mat4 transform;\n"+
"uniform int renderMode;\n"+
"uniform vec2 fovParams;\n"+
"void main(void) {\n"+
"  //normalize uv so it is between 0 and 1\n"+
"  vec2 uv = gl_FragCoord.xy / resolution;\n"+
"  uv.y = (1. - uv.y);\n"+
"  bool leftImg=false;\n"+
"  vec2 fov = fovParams;\n"+
"  if (renderMode == 1) {\n"+
"    if (uv.x<0.5) { \n"+
"      uv.x *= 2.; \n"+
"      leftImg=true; }\n"+
"    else {\n"+
"      uv.x = 2.*(uv.x - .5);\n"+
"    }\n"+
"    fov.y *= 2.;\n"+
"  }\n"+
"  //constrain to FOV\n"+
"  uv.x = 0.5+fov.x*(uv.x-0.5);\n"+
"  uv.y = 0.5+fov.y*(uv.y-0.5);\n"+
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
"  // vanilla monocular render\n"+
"  if (renderMode == 0) {\n"+
"    lonLat.y *= 0.5;\n"+
"    gl_FragColor = texture2D(textureSource, lonLat);\n"+
"  } else if (renderMode == 1) {\n"+
"    if (leftImg == true) {\n"+
"      lonLat.y *= 0.5;\n"+
"      gl_FragColor = texture2D(textureSource, lonLat);\n"+
"    } else {\n"+
"      lonLat.y = 0.5 + lonLat.y*0.5;\n"+
"      gl_FragColor = texture2D(textureSource, lonLat);\n"+
"    }\n"+
"  } else if (renderMode == 2) {\n"+
"    // anaglyph render\n"+
"    vec4 colorL, colorR;\n"+
"    colorL = texture2D(textureSource, vec2(lonLat.x, lonLat.y*0.5));\n"+
"    colorR = texture2D(textureSource, vec2(lonLat.x, 0.5+lonLat.y*0.5));\n"+
"    gl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;\n"+
"  }\n"+
"}\n"

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
"}\n"

VRtwglQuadStereoProjection = function() {
  var self = this;
  this.vrtwglQuad = null;
  this.vrtwglQuadFb = null;
  this.textureSet = [];
  this.fbRes = 2048;
  this.textureDescriptions = {};
  this.textures = [];
  this.fovX = 120;

  this.uniforms = {
    resolution:[0,0],
    fovParams:[0,0],
    textureSource:null,
    transform:twgl.m4.identity(),
    renderMode:VRRenderModes.STEREOSIDEBYSIDE
  };

  this.uniformsFb = {
    resolution:[this.fbRes,this.fbRes],
    textureSource:null,
    transform:twgl.m4.identity()
  };

  this.init = function(element){
    this.vrtwglQuad = new VRtwglQuad();
    this.vrtwglQuad.init(element, vs, fsRenderDisplay);

    this.vrtwglQuadFb = new VRtwglQuad();
    this.vrtwglQuadFb.initFramebuffer(this.fbRes, this.vrtwglQuad.glContext, vs, fsWindowed);
  }

  this.resize = function() {
    self.vrtwglQuad.resize();
  }

  this.render = function() {
    // var axisPitch = twgl.v3.create(0,0,1);
    // twgl.m4.axisRotate(this.uniforms.transform, axisPitch, 0.005, this.uniforms.transform);
    // var axisYaw = twgl.v3.create(0,1,0);
    // twgl.m4.axisRotate(this.uniforms.transform, axisYaw, 0.005, this.uniforms.transform);
    this.uniforms["resolution"] = [self.vrtwglQuad.canvas.clientWidth, self.vrtwglQuad.canvas.clientHeight];
    var aspect = self.vrtwglQuad.canvas.clientHeight/self.vrtwglQuad.canvas.clientWidth;
    this.uniforms["fovParams"] = [this.fovX/360.0, aspect*this.fovX/360.0];
    this.uniforms["textureSource"] = self.vrtwglQuadFb.getFramebufferTexture();

    self.vrtwglQuad.setUniforms(this.uniforms);
    self.vrtwglQuad.render();
  }

  this.renderFb = function() {
    self.vrtwglQuadFb.setUniforms(this.uniformsFb);
    self.vrtwglQuadFb.renderFramebuffer();
  }

  this.anim = function() {
    self.render();
    requestAnimationFrame(self.anim);
  }

  this.createOrientation = function(pitch, yaw) {
    var mat = twgl.m4.identity();
    var axisYaw = twgl.v3.create(0,1,0);
    twgl.m4.axisRotate(mat, axisYaw, yaw, mat);
    var axisPitch = twgl.v3.create(0,0,1);
    twgl.m4.axisRotate(mat, axisPitch, pitch, mat);
    return mat;
  }

  this.texturesLoaded = function(err, textures, sources) {
      //alert("TEXTURES LOADED");

      for (var key in self.textures) {
        if (self.textures.hasOwnProperty(key)) {
          var textureDesc = self.textureDescriptions[key];
          self.uniformsFb["textureSource"] = self.textures[key];
          self.uniformsFb["sphX"] = [0.5-0.5*(textureDesc.sphereFOV[0]/360.0),0.5-0.5*(textureDesc.sphereFOV[1]/180.0)];
          self.uniformsFb["sphYX"] = [(textureDesc.sphereFOV[0]/360.0),(textureDesc.sphereFOV[1]/180.0)];
          self.uniformsFb["transform"] = self.createOrientation(Math.PI*textureDesc.sphereCentre[0]/180.0, Math.PI*textureDesc.sphereCentre[1]/180.0);
          self.uniformsFb["uvL"] = [textureDesc.U_l[0],
                                    textureDesc.U_l[1],
                                    textureDesc.V_l[0]-textureDesc.U_l[0],
                                    textureDesc.V_l[1]-textureDesc.U_l[1]];
          self.uniformsFb["uvR"] = [textureDesc.U_r[0],
                                    textureDesc.U_r[1],
                                    textureDesc.V_r[0]-textureDesc.U_r[0],
                                    textureDesc.V_r[1]-textureDesc.U_r[1]];
          self.renderFb();
        }
      }
  }

  this.loadTextures = function (textureDescriptions) {
    var gl = self.vrtwglQuad.glContext;
    var texArray = [];
    for(texIt = 0;texIt < textureDescriptions.length; texIt++) {
      var texSpec = {
        min: gl.LINEAR,
        mag: gl.LINEAR,
        src: textureDescriptions[texIt].textureSource,
        crossOrigin: "", // either this or use twgl.setDefaults
      };
      texArray[texIt] = texSpec;
      this.textureDescriptions[texIt] = textureDescriptions[texIt];
    }

    var gl = self.vrtwglQuad.glContext;
    this.textures = twgl.createTextures(gl, texArray, this.texturesLoaded);
  }

}

module.exports = VRtwglQuadStereoProjection;
