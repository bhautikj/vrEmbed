function viewportSize()
{
  var e = window, a = 'inner';
  if ( !( 'innerWidth' in window ) )
  {
    a = 'client';
    e = document.documentElement || document.body;
  }
  return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

var stereoScene = {
  'leftMat':0,
  'rightMat':0,
  'leftGeom':0,
  'leftObj':0,
  'rightGeom':0,
  'rightObj':0,
  'canvasWidth':2048,
  'canvasHeight':1024,
  'sceneType':'',
  'onRenderCallbacks':[],
  'addRenderCallback': function (cbFunc) {
    this.onRenderCallbacks.push(cbFunc);
  },
  'sceneSprites' : [],
  'scene' : 0,
  'windowWidth' : 0,
  'windowHeight' : 0,
  'updateSize' : function () {
    if ( this.windowWidth != window.innerWidth || this.windowHeight != window.innerHeight ) {

      this.windowWidth  = window.innerWidth;
      this.windowHeight = window.innerHeight;

      this.renderer.setSize ( this.windowWidth, this.windowHeight );
    }
  },
  'leftView' : 0,
  'rightView' : 0,
  'scene' : 0,
  'renderer' : 0,
  'container' : 0,
  'init': function (w, h, separation, sceneType) {
    this.container = document.getElementById( 'container' );

    
    this.leftView = {
          left: 0,
          bottom: 0,
          width: 0.5,
          height: 1.0,
          background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
          eye: [ 0, 0, 0 ],
          up: [ 0, 1, 0 ],
          fov: 75
        };
    this.rightView = { 
          left: 0.5,
          bottom: 0,
          width: 0.5,
          height: 1.0,
          background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
          eye: [ 2000, 0, 0 ],
          up: [ 0, 1, 0 ],
          fov: 75
        };

    this.leftView.camera = new THREE.PerspectiveCamera( this.leftView.fov, w / h, 1, 10000 );
    this.leftView.camera.position.x = this.leftView.eye[ 0 ];
    this.leftView.camera.position.y = this.leftView.eye[ 1 ];
    this.leftView.camera.position.z = this.leftView.eye[ 2 ];
    this.leftView.camera.up.x = this.leftView.up[ 0 ];
    this.leftView.camera.up.y = this.leftView.up[ 1 ];
    this.leftView.camera.up.z = this.leftView.up[ 2 ];
    //left cam sep
    this.leftView.camera.lookAt(new THREE.Vector3(-1*separation, 0, -1));

    this.rightView.camera = new THREE.PerspectiveCamera( this.rightView.fov, w / h, 1, 10000 );
    this.rightView.camera.position.x = this.rightView.eye[ 0 ];
    this.rightView.camera.position.y = this.rightView.eye[ 1 ];
    this.rightView.camera.position.z = this.rightView.eye[ 2 ];
    this.rightView.camera.up.x = this.rightView.up[ 0 ];
    this.rightView.camera.up.y = this.rightView.up[ 1 ];
    this.rightView.camera.up.z = this.rightView.up[ 2 ];
    //right cam sep
    this.rightView.camera.lookAt(new THREE.Vector3(-1*separation, 0, -1));

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.container.appendChild( this.renderer.domElement );

    this.sceneType = sceneType;
    if (this.sceneType == 'sphere'){
      this.canvasWidth=2048;
      this.canvasHeight=1024;
    } else if(this.sceneType == 'cube') {
      this.canvasWidth=1024;
      this.canvasHeight=3072;
    }
    
    // set up scene
    this.setupMaterials();
    
    if (this.sceneType == 'sphere'){
      this.setupGeomSphere();
    } else if(this.sceneType == 'cube') {
      this.setupGeomCube();
    }
    this.setupScene();
  },
  
  'setupMaterials' : function() {
    //[panorama image texture]
    this.leftMat = new THREE.MeshBasicMaterial();
    this.rightMat = new THREE.MeshBasicMaterial();
    this.leftCanvas = document.createElement('canvas');
    this.leftCanvas.width  = this.canvasWidth;
    this.leftCanvas.height = this.canvasHeight;
    this.rightCanvas = document.createElement('canvas');
    this.rightCanvas.width  = this.canvasWidth;
    this.rightCanvas.height = this.canvasHeight;
  },
  
  'setupGeomCube' : function() {
    this.leftGeom = THREE.CubeGeometry(500, 500, 500);
    this.rightGeom = new THREE.CubeGeometry(500, 500, 500);
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeTranslation(2000,0,0));

    //     Geom cube tex map; numbers in paren are texC array indexes
    //     (0,1)
    //     ^
    //     |  (09)---(10)---(11)
    //     |   | Front |Left |
    //     |  (06)---(07)---(08)
    //     |   | Back |Right |
    //     V  (03)---(04)---(05)
    //     |   | Top  |Bottom|
    //     |  (00)---(01)---(02)
    //     |
    //     (0,0)----U-------->(0,1)
    //     
    //     Single face:
    //     0-2  first face:  0,1,2
    //     |/|  second face: 1,3,2
    //     1-3
    
    var texC = [new THREE.Vector2(0.0, 0.0),
                 new THREE.Vector2(0.5, 0.0),
                 new THREE.Vector2(1.0, 0.0),
                 new THREE.Vector2(0.0, 0.3333333),
                 new THREE.Vector2(0.5, 0.3333333),
                 new THREE.Vector2(1.0, 0.3333333),
                 new THREE.Vector2(0.0, 0.6666666),
                 new THREE.Vector2(0.5, 0.6666666),
                 new THREE.Vector2(1.0, 0.6666666),
                 new THREE.Vector2(0.0, 1.0),
                 new THREE.Vector2(0.5, 1.0),
                 new THREE.Vector2(1.0, 1.0)];
                 
    this.leftGeom.faceVertexUvs[0] = [];
    //right
    this.leftGeom.faceVertexUvs[0][2] = [ texC[10], texC[7], texC[11] ];
    this.leftGeom.faceVertexUvs[0][3] = [ texC[7], texC[8], texC[11] ];
    //left
    this.leftGeom.faceVertexUvs[0][0] = [ texC[7], texC[4], texC[8] ];
    this.leftGeom.faceVertexUvs[0][1] = [ texC[4], texC[5], texC[8] ];
    //top
    this.leftGeom.faceVertexUvs[0][4] = [ texC[3], texC[0], texC[4] ];
    this.leftGeom.faceVertexUvs[0][5] = [ texC[0], texC[1], texC[4] ];
    //bottom
    this.leftGeom.faceVertexUvs[0][6] = [ texC[4], texC[1], texC[5] ];
    this.leftGeom.faceVertexUvs[0][7] = [ texC[1], texC[2], texC[5] ];
    //front
    this.leftGeom.faceVertexUvs[0][10] = [ texC[6], texC[3], texC[7] ];
    this.leftGeom.faceVertexUvs[0][11] = [ texC[3], texC[4], texC[7] ];
    //back
    this.leftGeom.faceVertexUvs[0][8] = [ texC[9], texC[6], texC[10] ];
    this.leftGeom.faceVertexUvs[0][9] = [ texC[6], texC[7], texC[10] ];

    this.rightGeom.faceVertexUvs[0] = [];
    //right
    this.rightGeom.faceVertexUvs[0][2] = [ texC[10], texC[7], texC[11] ];
    this.rightGeom.faceVertexUvs[0][3] = [ texC[7], texC[8], texC[11] ];
    //left
    this.rightGeom.faceVertexUvs[0][0] = [ texC[7], texC[4], texC[8] ];
    this.rightGeom.faceVertexUvs[0][1] = [ texC[4], texC[5], texC[8] ];
    //top
    this.rightGeom.faceVertexUvs[0][4] = [ texC[3], texC[0], texC[4] ];
    this.rightGeom.faceVertexUvs[0][5] = [ texC[0], texC[1], texC[4] ];
    //bottom
    this.rightGeom.faceVertexUvs[0][6] = [ texC[4], texC[1], texC[5] ];
    this.rightGeom.faceVertexUvs[0][7] = [ texC[1], texC[2], texC[5] ];
    //front
    this.rightGeom.faceVertexUvs[0][10] = [ texC[6], texC[3], texC[7] ];
    this.rightGeom.faceVertexUvs[0][11] = [ texC[3], texC[4], texC[7] ];
    //back
    this.rightGeom.faceVertexUvs[0][8] = [ texC[9], texC[6], texC[10] ];
    this.rightGeom.faceVertexUvs[0][9] = [ texC[6], texC[7], texC[10] ];   
  },
  
  'setupGeomSphere' : function() {
    //[panorama space matched with the style of panorama image]
    //var geom = new THREE.SphereGeometry(
    //    500, 64, 32, 0, 2*Math.PI, 0, 0.5*Math.PI); // dome type
    //var geom = new THREE.CylinderGeometry(500, 500, 500, 64); // tube type
    this.leftGeom = new THREE.SphereGeometry(500, 32, 32); // sphere type
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.leftGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI*0.5));

    this.rightGeom = new THREE.SphereGeometry(500, 32, 32); // sphere type
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
    this.rightGeom.applyMatrix(new THREE.Matrix4().makeTranslation(2000,0,0));
  },
  
  'setupScene' : function() {
    //[create leftScene]
    this.leftObj = new THREE.Mesh(this.leftGeom, this.leftMat);
    this.scene.add(this.leftObj);

    //[create rightScene]
    this.rightObj = new THREE.Mesh(this.rightGeom, this.rightMat);
    this.scene.add(this.rightObj);    
  },
  
  'render': function() {
    this.updateSize();


    view = this.leftView;
    camera = view.camera;

    var left   = Math.floor( this.windowWidth  * view.left );
    var bottom = Math.floor( this.windowHeight * view.bottom );
    var width  = Math.floor( this.windowWidth  * view.width );
    var height = Math.floor( this.windowHeight * view.height );
    this.renderer.setViewport( left, bottom, width, height );
    this.renderer.setScissor( left, bottom, width, height );
    this.renderer.enableScissorTest ( true );
    this.renderer.setClearColor( view.background );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    this.renderer.render( this.scene, camera );
    
    this.leftToRightSprites();
    
    view = this.rightView;
    camera = view.camera;

    var left   = Math.floor( this.windowWidth  * view.left );
    var bottom = Math.floor( this.windowHeight * view.bottom );
    var width  = Math.floor( this.windowWidth  * view.width );
    var height = Math.floor( this.windowHeight * view.height );
    this.renderer.setViewport( left, bottom, width, height );
    this.renderer.setScissor( left, bottom, width, height );
    this.renderer.enableScissorTest ( true );
    this.renderer.setClearColor( view.background );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    this.renderer.render( this.scene, camera );

    this.rightToLeftSprites();
    
    var arrayLength = this.onRenderCallbacks.length;
    for (var i = 0; i < arrayLength; i++) {
      this.onRenderCallbacks[i]();
    }
  },
   
  'replaceTexture' : function (scene) {
        var leftContext = this.leftCanvas.getContext('2d');
        leftContext.clearRect(0, 0, stereoScene.canvasWidth, stereoScene.canvasHeight);
        // canvas contents will be used for a texture
        var leftTex = new THREE.Texture(this.leftCanvas);
        stereoScene.leftMat.map = leftTex;
        
        // load an image
        var leftImg = new Image();
        leftImg.src = scene.images.left;
        // after the image is loaded, this function executes
        leftImg.onload = function()
        {
          //var srcWidth = parseInt(leftImg.width);
          //var srcHeight = parseInt(leftImg.height);  
          
          var destWidth = stereoScene.canvasWidth*scene.fov.left.w/360.0;
          var destHeight = stereoScene.canvasHeight*scene.fov.left.h/180.0;
          var originX = stereoScene.canvasWidth*0.5 - 0.5*destWidth;
          var originY = stereoScene.canvasHeight*0.5 - 0.5*destHeight;
          
          leftContext.drawImage(leftImg, originX, originY, destWidth, destHeight);
          leftTex.needsUpdate = true;
          stereoScene.leftMat.map.needsUpdate = true; // important for replacing textures
        };  
            
        //var leftMaterial = new THREE.MeshBasicMaterial( {map: leftTex, side:THREE.DoubleSide} );
        //leftMaterial.transparent = true;
        
        var rightContext = this.rightCanvas.getContext('2d');
        rightContext.clearRect(0, 0, stereoScene.canvasWidth, stereoScene.canvasHeight);
        // canvas contents will be used for a texture
        var rightTex = new THREE.Texture(this.rightCanvas);
        stereoScene.rightMat.map = rightTex;
        
        // load an image
        var rightImg = new Image();
        rightImg.src = scene.images.right;
        // after the image is loaded, this function executes
        rightImg.onload = function()
        {
          //var srcWidth = parseInt(rightImg.width);
          //var srcHeight = parseInt(rightImg.height);  
          
          var destWidth = stereoScene.canvasWidth*scene.fov.right.w/360.0;
          var destHeight = stereoScene.canvasHeight*scene.fov.right.h/180.0;
          var originX = stereoScene.canvasWidth*0.5 - 0.5*destWidth;
          var originY = stereoScene.canvasHeight*0.5 - 0.5*destHeight;
          
          rightContext.drawImage(rightImg, originX, originY, destWidth, destHeight);
          rightTex.needsUpdate = true;
          stereoScene.rightMat.map.needsUpdate = true; // important for replacing textures
        };  
            
        //var rightMaterial = new THREE.MeshBasicMaterial( {map: rightTex, side:THREE.DoubleSide} );
        //rightMaterial.transparent = true;
    },
    'addSprite' : function(sprite) {
      this.sceneSprites.push(sprite);
      this.scene.add(sprite);
    },
    'leftToRightSprites' : function () {
      var arrayLength = this.sceneSprites.length;
      for (var i = 0; i < arrayLength; i++) {
        this.sceneSprites[i].applyMatrix(new THREE.Matrix4().makeTranslation(2000,0,0));
      }
    },
    'rightToLeftSprites' : function () {
      var arrayLength = this.sceneSprites.length;
      for (var i = 0; i < arrayLength; i++) {
        this.sceneSprites[i].applyMatrix(new THREE.Matrix4().makeTranslation(-2000,0,0));
      }
    }

};

// [left + right Camera rotation by mouse]
var mouseController = {
  'lon': 0,
  'lat': 0,
  'r2d' : 180 / Math.PI,
  'lastGyroExecution' : 0,
  'gui' : null,
  'setGUI' : function(gui) {
    mouseController.gui = gui;
  },
  'gyroMouse' : function (ev) {
    var mx = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
    var my = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;
    mouseController.lat = Math.min(Math.max(-Math.PI / 2, mouseController.lat - my * 0.01), Math.PI / 2);
    mouseController.lon = mouseController.lon - mx * 0.01;
    var rotm = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(mouseController.lat, mouseController.lon, 0, "YXZ"));
    stereoScene.leftView.camera.quaternion.copy(rotm);
    stereoScene.rightView.camera.quaternion.copy(rotm);
    
    var eulerRot = new THREE.Euler().setFromQuaternion(rotm, "YXZ");
      //document.getElementById("log").innerHTML = "x=" + eulerRot.x*gyroSensor.r2d  +", y=" + eulerRot.y*gyroSensor.r2d + ", z=" + eulerRot.z*gyroSensor.r2d;
    var now = Date.now();
    if (now - mouseController.lastGyroExecution < 17) 
      return; // ~60Hz

    mouseController.lastGyroExecution = now;
    
    var x = eulerRot.x*mouseController.r2d;
    var y = eulerRot.y*mouseController.r2d*-1.0;
    
    if (mouseController.gui!=null) {
      mouseController.gui.moveEvent(x,y);
    }
  }, 
  'init' : function() {
    this.lat=0;
    this.lon=0;
    //don't allow mouse control for right
    stereoScene.container.addEventListener("mousedown", function (ev) {
        stereoScene.container.addEventListener("mousemove", mouseController.gyroMouse, false);
    }, false);
    stereoScene.container.addEventListener("mouseup", function (ev) {
        stereoScene.container.removeEventListener("mousemove", mouseController.gyroMouse, false);
    }, false);
  }
}

var getScreenOrientation = function () {
    // W3C DeviceOrientation Event Specification (Draft)
    if (window.screen.orientation) return window.screen.orientation.angle;
    // Safari
    if (typeof window.orientation === "number") return window.orientation;
    // workaround for android firefox
    if (window.screen.mozOrientation) return {
        "portrait-primary": 0,
        "portrait-secondary": 180,
        "landscape-primary": 90,
        "landscape-secondary": 270,
    }[window.screen.mozOrientation];
    // otherwise
    return 0;
};

var gyroSensor = {
  // [leftView.camera rotation by direct gyro sensor angles on tablets]
  // see: http://mdn.io/Detecting_device_orientation
  // (work on android firefox and iOS Safari)
  'eyem' : new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
  'd2r' : Math.PI / 180,
  'r2d' : 180 / Math.PI,
  'lastGyroExecution' : 0,
  'pitch' : 0,
  'yaw' : 0,
  'roll':0,
  'initAlpha':0,
  'initRun':10,
  'gui':null,
  'setGUI' : function(gui) {
    gyroSensor.gui = gui;
  },
  'resetOrientation': function(alpha) { 
     gyroSensor.initAlpha = alpha;
  },
  'gyroFunc' : function (ev) {
      // center censor
      if (gyroSensor.initRun>0)
      {
        gyroSensor.resetOrientation(ev.alpha);
        gyroSensor.initRun = gyroSensor.initRun - 1;
      }
    
      ev.preventDefault();
      var angle = getScreenOrientation();
      var alpha;
      alpha = ev.alpha - gyroSensor.initAlpha || 0;
      var beta = ev.beta || 0;
      var gamma = ev.gamma || 0;
      if (alpha === 0 && beta === 0 && gamma === 0) return;
      
      // on android chrome: bug as beta may become NaN
      // device rot axis order Z-X-Y as alpha, beta, gamma
      // portrait mode Z=rear->front(screen), X=left->right, Y=near->far(cam)
      // => map Z-X-Y to 3D world axes as:
      // - portrait  => y-x-z
      // - landscape => y-z-x
      // on ios we're not looking at 0,0; this fixes that
      //
      // x==pitch (down:0 centre:-90 up: -180)
      // y==roll (ccw90:-90 centre:0 cw90: 90)
      // z==yaw (left:90 centre:0 right:270)
      // document.getElementById("log").innerHTML = "y=" + ev.beta  +", x=" + ev.gamma + ", z=" + (ev.alpha+viewFix) + ", o=" + angle;
      
      var rotType = (angle === 0 || angle === 180) ? "YXZ" : "YZX";
      var viewFix = 90;
      
      if (angle == 0 || angle == 180) {
        viewFix = 0;
      }
              
      var rotm = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(beta * gyroSensor.d2r, (alpha+viewFix) * gyroSensor.d2r, -gamma * gyroSensor.d2r, rotType));
      var devm = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, -angle * gyroSensor.d2r, 0));
      rotm.multiply(devm).multiply(gyroSensor.eyem); //rot = (rot x dev) x eye
      stereoScene.leftView.camera.quaternion.copy(rotm);
      stereoScene.rightView.camera.quaternion.copy(rotm);

      // x==pitch (down:-90 centre:0 up: 90)
      // y==yaw (left:90 centre:0 right:-90)
      var eulerRot = new THREE.Euler().setFromQuaternion(rotm, rotType);
      //document.getElementById("log").innerHTML = "x=" + eulerRot.x*gyroSensor.r2d  +", y=" + eulerRot.y*gyroSensor.r2d + ", z=" + eulerRot.z*gyroSensor.r2d;
      gyroSensor.pitch=eulerRot.x*gyroSensor.r2d;
      gyroSensor.yaw=eulerRot.y*gyroSensor.r2d*-1.0;
      gyroSensor.roll=ev.beta;

      var now = Date.now();
      if (now - gyroSensor.lastGyroExecution < 17) 
        return; // ~60Hz

      gyroSensor.lastGyroExecution = now;
      gyroSensor.eventProcess(ev);

    },
    'init' : function() {
      window.addEventListener("deviceorientation", gyroSensor.gyroFunc, false);
    },
    'eventProcess' : function(ev) {
      if (gyroSensor.gui!=null) {
        gyroSensor.gui.moveEvent(gyroSensor.pitch, gyroSensor.yaw);
      }
    }
    
};

var highPassFilter = {
  'buffer' : [],
  'outputBuffer' : [],
  'pos' : 0,
  'len' : 0,
  'alpha' : 0.0,
  'init' : function(bufferSize, timeInterval, timeConstantRC) {
    this.len = bufferSize;
    this.alpha = timeConstantRC / (timeConstantRC + timeInterval);
    for (var i = 0; i < this.len; i++){
      this.buffer[i] = 0;
      this.outputBuffer[i] = 0;
    }
  },
  'pushVal' : function(value) {
    this.buffer[this.pos] = value;
    this.pos = (this.pos + 1)%this.len;
    this.updateFilter();
  },
  'updateFilter' : function() {
    this.outputBuffer[0] = this.buffer[this.pos];
    for (var i = 1; i < this.len; i++) {
      var ofs = (this.pos + i)%this.len;
      var ofsminusone = (this.pos + i - 1)%this.len;
      this.outputBuffer[i] = this.alpha * (this.outputBuffer[i-1] + this.buffer[ofs] - this.buffer[ofsminusone]);
    }
  },
  'getValue' : function(index) {
    return this.buffer[(this.pos + index)%this.len];
  },
  'getFirstValue' : function() {
    return this.outputBuffer[this.len-1];
  },
  'getOutputBufferString' : function() {
    var output='';
    for (var i = 0; i < this.len; i++) {
      output += this.outputBuffer[i].toFixed(2) + " ";
    }
    return output;
  },
  'getInputBufferString' : function() {
    var output='';
    for (var i = 0; i < this.len; i++) {
      output += this.buffer[(this.pos+i)%this.len].toFixed(2) + " ";
    }
    return output;
  },  
};

var accSensor = {
  'lastExecution' : 0,
  'dampedX' : 0, 
  'dampedY' : 0, 
  'dampedZ' : 0,
  'eventX' : {value: 0, timeOutConter: 0},
  'eventY' : {value: 0, timeOutConter: 0},
  'eventZ' : {value: 0, timeOutConter: 0},
  'highPassFilter' : Object.create(highPassFilter),
  'eventCounter' : 0,
  'eventTimeout' : 10,
  'evType' : 0,
  'prev': {x:0, y:0, z:0},
  'accFunc' : function (ev) {
    var now = Date.now();
    if (now - accSensor.lastExecution < 17) 
      return; // ~60Hz
    accSensor.lastExecution = now;

    
    var diffx = ev.acceleration.x - accSensor.prev.x;
    var diffy = ev.acceleration.y - accSensor.prev.y;
    var diffz = ev.acceleration.z - accSensor.prev.z;
    
    var diffsq = Math.sqrt(diffx*diffx + diffy*diffy + diffz*diffz);
    
    accSensor.prev.x=ev.acceleration.x; 
    accSensor.prev.y=ev.acceleration.y; 
    accSensor.prev.z=ev.acceleration.z; 

    this.highPassFilter.pushVal(diffsq);
    var xVal = this.highPassFilter.getFirstValue();
    
    if (xVal > 3.0){
      if (accSensor.eventCounter == 0) {
        accSensor.evType = 1;
        accSensor.eventCounter = accSensor.eventTimeout;
      } else if (accSensor.eventCounter < accSensor.eventTimeout*0.75){
        accSensor.evType += 1;
      }
    }
    
    if (accSensor.eventCounter == 1) {
//       document.getElementById("log").innerHTML = Date.now() + "," + accSensor.evType + "<br/>" + document.getElementById("log").innerHTML;
      accSensor.evType = 0;
      accSensor.eventCounter = 0;
    }
    
    if (accSensor.eventCounter > 0) {
      accSensor.eventCounter = accSensor.eventCounter -1;
    }
  },
  'init' : function () {
    window.addEventListener("devicemotion", accSensor.accFunc, false);
    highPassFilter.init(15, 0.017, 0.1);
  }
};

function basicSceneWrangler() {
  this.sceneSet = 0;
  this.sceneLen = 0;
  this.texOfs =  0;
  
  var self = this; 
  
  this.init = function () {};
  
  this.initScenes = function (scenes) {
    self.sceneSet = scenes;
    self.texOfs = 0;
    self.update();
  };
  
  this.update = function() {
    stereoScene.replaceTexture(self.sceneSet[self.texOfs]);
  };
  
  this.next = function() { 
    self.texOfs = (self.texOfs + 1) % self.sceneSet.length;
    self.update();
  };
  
  this.prev =  function() { 
    self.texOfs = (self.texOfs - 1) % self.sceneSet.length;
    self.update();
  };
  
  this.next10 = function() { 
    self.texOfs = (self.texOfs + 10) % self.sceneSet.length;
    self.update();
  };
  
  this.prev10 = function() { 
    self.texOfs = (self.texOfs - 10) % self.sceneSet.length;
    self.update();
  };
}
