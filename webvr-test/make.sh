#!/bin/sh

cat src/js-ext/webvr-polyfill.js | uglifyjs -cm > src/js-ext/webvr-polyfill.min.js
cat src/js-ext/webvr-manager.js | uglifyjs -cm > src/js-ext/webvr-manager.min.js
cat src/js-ext/VRControls.js | uglifyjs -cm > src/js-ext/VRControls.min.js
cat src/js-ext/three.js | uglifyjs -cm > bin/three.min.js


browserify   src/vr-bundle-main.js > bin/vr-bundle.js