//Based on: view-source:http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html


function textSprite(message, parameters) {
  if (parameters === undefined) 
    this.parameters = {};
  else
    this.parameters = parameters;
  
  this.message = message;
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.texture = null;
  this.spriteMaterial = null;
  this.sprite = null;
  
  var self = this;
  
  this.setupFromParams = function() {
    var fontface = self.parameters.hasOwnProperty("fontface") ? 
      self.parameters["fontface"] : "Arial";
    
    var fontsize = self.parameters.hasOwnProperty("fontsize") ? 
      self.parameters["fontsize"] : 18;
    
    var borderThickness = self.parameters.hasOwnProperty("borderThickness") ? 
      self.parameters["borderThickness"] : 4;
    
    var borderColor = self.parameters.hasOwnProperty("borderColor") ?
      self.parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    
    var backgroundColor = self.parameters.hasOwnProperty("backgroundColor") ?
      self.parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
  
  
    self.context.font = "Bold " + fontsize + "px " + fontface;
      
    // get size data (height depends only on font size)
    var metrics = self.context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    self.context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                    + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    self.context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                    + borderColor.b + "," + borderColor.a + ")";

    self.context.lineWidth = borderThickness;
    roundRect(self.context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    self.context.fillStyle = "rgba(0, 0, 0, 1.0)";

    self.context.fillText( message, borderThickness, fontsize + borderThickness);
  }
  
  this.setupSprite = function() {
    // canvas contents will be used for a texture
    self.texture = new THREE.Texture(self.canvas) 
    self.texture.needsUpdate = true;

    self.spriteMaterial = new THREE.SpriteMaterial( { map: self.texture} );
    self.sprite = new THREE.Sprite( self.spriteMaterial );    
    //     self.sprite.scale.set(100,50,1.0);  
  }
  
  this.setOpacity = function(opac) {
    self.spriteMaterial.opacity = opac;
  }
  
  this.makeDirty = function() {
    self.texture.needsUpdate = true;
  }
  
  this.setupFromParams();
  this.setupSprite();
}

function countdownSprite() {
  this.complete = 0.0;
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.context.canvas.width  = 200;
  this.context.canvas.height = 200;
  this.texture = null;
  this.spriteMaterial = null;
  this.sprite = null;
  
  var self = this;
  
  this.setupFromParams = function() {
    self.context.beginPath();
    self.context.moveTo(100, 100);
    self.context.arc(100, 100, 80, 1.5*Math.PI, 1.5*Math.PI+self.complete*2.0*Math.PI, false);
//     self.context.arc(100, 100, 80, 0, 2.0*Math.PI*self.complete, false);
    self.context.closePath();
    self.context.lineWidth = 5;
    //self.context.fillStyle = '#ff0000';
    
    var byteComplete =  Math.floor(self.complete*255);
    self.context.fillStyle = "rgba(0,"+byteComplete+",0,1.0)";
//     //self.context.fillStyle = "rgba(" + 1.0-self.complete +", "+ self.complete+", 0, 0.5)";
    self.context.fill();
    self.context.strokeStyle = "rgba(0,0,0,1.0)";
    self.context.stroke();
  }
  
  this.setupSprite = function() {
    // canvas contents will be used for a texture
    self.texture = new THREE.Texture(self.canvas) 
    self.texture.needsUpdate = true;

    self.spriteMaterial = new THREE.SpriteMaterial( { map: self.texture} );
    self.sprite = new THREE.Sprite( self.spriteMaterial );    
  }
  
  this.setOpacity = function(opac) {
    self.spriteMaterial.opacity = opac;
  }
  this.makeDirty = function() {
    self.texture.needsUpdate = true;
  }
  
  this.resetCount = function() {
    self.complete = 0.0;
    self.context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
    self.makeDirty();
  }
    
  this.setupFromParams();
  this.setupSprite();
}


// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();   
}

function panoGUITriggerBox (name, x, y, w, h, onEnter, onLeave, onStay) {
  this.name = name;
  this.onEnter = onEnter;
  this.onLeave = onLeave;
  this.onStay = onStay;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.isTriggered = false;
  this.triggerStart = 0.0;
  this.x_extent = x+w;
  this.y_extent = y+h;
  this.isInTrigger = function(x, y) {
    if (x<this.x)
      return false;
    if (y<this.y)
      return false;
    if (x>this.x_extent)
      return false;
    if (y>this.y_extent)
      return false;
    return true;
  };
}

function panoGUITriggerCircle (name, x, y, r, onEnter, onLeave, onStay, onRenderCallback) {
  this.name = name;
  this.onEnter = onEnter;
  this.onLeave = onLeave;
  this.onStay = onStay;
  this.onRenderCallback = onRenderCallback;
  this.x = x;
  this.y = y;
  this.r = r;
  this.isTriggered = false;
  this.triggerStart = 0.0;
  this.rsquared = r*r;
  this.isInTrigger = function(x, y) {
    var ineq = (this.x-x)*(this.x-x) + (this.y-y)*(this.y-y);
    if (ineq<this.rsquared)
      return true;
    else
      return false;
  }; 
}

function xyToSpaceCoords(pitch,yaw,depth) {
  var d2r = Math.PI / 180;

  // x==pitch (down:-90 centre:0 up: 90)
  // y==yaw (left:90 centre:0 right:-90)
  //   Top (yaw)
  //   
  //           0
  //           -z 
  //           ^
  //           |
  //           |
  //    90 ----+---->+x -90
  //           |
  //           |
  //           |
  //           180
  //
  
  xpos = depth * Math.cos(pitch*d2r) * Math.sin(yaw*d2r)
  ypos = depth * Math.sin(pitch*d2r) * Math.cos(yaw*d2r)
  zpos = -1*depth * Math.cos(yaw)

  return [xpos,ypos,zpos]
}

function createPanoGUITriggerCircleSimple(gui, name, x, y, r, timeout, txt, callbackFuncOnFire) {
  this.textSprite = new textSprite( " " + txt + " ", 
                                 { fontsize: 48, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
  this.lastTrigger = 0;
  this.timeout = timeout;
  this.countingDown = false;
  this.callbackFuncOnFire = callbackFuncOnFire;
  this.gui = gui;
  this.idleOpacity = 0.4;
  
  var self = this;  
  var spritePos = xyToSpaceCoords(x,y,50);
  
  self.textSprite.sprite.position.set(spritePos[0], spritePos[1], spritePos[2]);
  self.textSprite.sprite.scale.set(100,50,1.0);
  self.textSprite.setOpacity(self.idleOpacity);

  this.onEnter = function() {
    console.log(this.name + " onEnter!");
    self.textSprite.setOpacity(1.0);
    self.lastTrigger = Date.now();
    self.countingDown = true;
  };

  this.onLeave = function() {
    console.log(this.name + " onLeave!");
    self.textSprite.setOpacity(self.idleOpacity);
    self.countingDown = false;
    self.gui.resetCountdown();
  };

  this.onStay = function() {
//     console.log(this.name + " onStay!");
  };
  
  this.onRenderCallback  = function() {

    if (self.timeout == 0)
      return;
    if (self.countingDown == false)
      return;

    var now = Date.now();
    var diff = now - self.lastTrigger;
    if (diff > self.timeout) {
      console.log("FIRED!");
      if (self.callbackFuncOnFire != 0) {
        self.callbackFuncOnFire();
      }
      self.gui.resetCountdown();
      self.countingDown = false;
    } else {
      var percentageComplete = diff*1.0/self.timeout*1.0;  
      self.gui.setCountdown(percentageComplete);
    }
    
  };
  
  this.trigger = new panoGUITriggerCircle(name, x, y, r, this.onEnter, this.onLeave, this.onStay, this.onRenderCallback);
}

function panoGUI() {
  this.lastX = 0.0;
  this.lastY = 0.0;
  this.guiTriggers = [];
  this.lastRenderCallback = 0;
  this.countdownSprite = new countdownSprite();
  this.countdownSprite.sprite.scale.set(50,50,1.0);
  
  var self = this;
  
  this.init = function() {
  };
  
  this.renderCallback = function() {
    var now = Date.now();
    if (now - self.lastRenderCallback < 17) 
      return; // ~60Hz
    self.lastRenderCallback = now;
    
    var arrayLength = self.guiTriggers.length;
    for (var i = 0; i < arrayLength; i++) {
      trigger = self.guiTriggers[i];
      trigger.onRenderCallback();
    }
  };
  
  this.addTrigger = function (trigger) {
    this.guiTriggers.push(trigger);
  };
  
  
  // x==pitch (down:-90 centre:0 up: 90)
  // y==yaw (left:90 centre:0 right:-90)
  this.moveEvent = function(x, y) {
    var arrayLength = this.guiTriggers.length;
    for (var i = 0; i < arrayLength; i++) {
      trigger = this.guiTriggers[i];
      if (trigger.isTriggered == true) {
        if (trigger.isInTrigger(x,y)) {
          // still triggered
          trigger.onStay();
        } else {
          // leave trigger
          trigger.onLeave();
          trigger.isTriggered = false;
        }
      } else {
        if (trigger.isInTrigger(x,y)) {
          // new trigger
          trigger.onEnter();
          trigger.isTriggered = true; 
          var countdownPos = xyToSpaceCoords(trigger.x, trigger.y, 45);
          self.countdownSprite.sprite.position.set(countdownPos[0], countdownPos[1], countdownPos[2]);
        } 
      }
    }
  }
  
  this.resetCountdown = function() {
    self.countdownSprite.resetCount();
  }
  
  this.setCountdown = function(percentageComplete) { 
    self.countdownSprite.complete = percentageComplete;
    self.countdownSprite.setupFromParams();
    self.countdownSprite.makeDirty();
  }
  
}