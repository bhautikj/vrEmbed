twgl = require('../js-ext/twgl-full.js');

function rotateZX (pitch, yaw) {
  var mat = twgl.m4.identity();
  var axisPitch = twgl.v3.create(0,0,1);
  twgl.m4.axisRotate(mat, axisPitch, pitch, mat);
  var axisYaw = twgl.v3.create(0,1,0);
  twgl.m4.axisRotate(mat, axisYaw, yaw, mat);
  return mat;
}

//
// via: https://github.com/fieldOfView/krpano_fovplugins/blob/master/gyro/source/gyro.source.js
//
function rotateEuler( euler )
{
  // This function is based on http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToMatrix/index.htm
  // and http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToEuler/index.htm

  var heading, bank, attitude,
    ch = Math.cos(euler.yaw),
    sh = Math.sin(euler.yaw),
    ca = Math.cos(euler.pitch),
    sa = Math.sin(euler.pitch),
    cb = Math.cos(euler.roll),
    sb = Math.sin(euler.roll),

    matrix = [
      sh*sb - ch*sa*cb,   -ch*ca,    ch*sa*sb + sh*cb,
      ca*cb,              -sa,      -ca*sb,
      sh*sa*cb + ch*sb,    sh*ca,   -sh*sa*sb + ch*cb
    ]; // Note: Includes 90 degree rotation around z axis

  /* [m00 m01 m02] 0 1 2
   * [m10 m11 m12] 3 4 5
   * [m20 m21 m22] 6 7 8 */

  if (matrix[3] > 0.9999)
  {
    // Deal with singularity at north pole
    heading = Math.atan2(matrix[2],matrix[8]);
    attitude = Math.PI/2;
    bank = 0;
  }
  else if (matrix[3] < -0.9999)
  {
    // Deal with singularity at south pole
    heading = Math.atan2(matrix[2],matrix[8]);
    attitude = -Math.PI/2;
    bank = 0;
  }
  else
  {
    heading = Math.atan2(-matrix[6],matrix[0]);
    bank = Math.atan2(-matrix[5],matrix[4]);
    attitude = Math.asin(matrix[3]);
  }

  return { yaw:heading, pitch:attitude, roll:bank };
}


// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToEuler/
var _matToEuler = function(mat) {
  var x = Math.atan2(-mat[2],mat[0]);
  var y = Math.atan2(-mat[9],mat[5]);
  var z = Math.asin(mat[1]);
  return [x,y,z];
}

VRRotMath = function() {
  this.timer = 0.0;

  this.gyroToMat = function(_alpha, _beta, _gamma, _orientation, _offset) {
    var degRad = Math.PI / 180;
    var orientation = rotateEuler({
						yaw: _alpha * degRad,
						pitch: _beta * degRad,
						roll: _gamma * degRad
				})

    var mat = twgl.m4.identity();

    // pitch
    twgl.m4.rotateY(mat, -orientation.pitch,mat);
    // yaw
    twgl.m4.rotateZ(mat, Math.PI + -orientation.yaw,mat);
    // disable roll - doesn't make sense in stereo yet
    twgl.m4.rotateX(mat, Math.PI, mat);

    var yaw = (360 + -180*orientation.yaw/Math.PI)%360.0 -180.0; //-180->180
    var pitch = -180.0*orientation.pitch/Math.PI;
    // document.getElementById("log").innerHTML = Math.floor(yaw) + "," + Math.floor(pitch);
    return [mat, yaw, pitch];
  }

  this.matToEuler = function(mat) {
    return _matToEuler(mat);
  }

  this.rotateZX = function(pitch, yaw) {
    return rotateZX(pitch, yaw);
  }
}

module.exports = VRRotMath;
