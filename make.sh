#!/bin/sh


browserify --standalone vr-embed -d src/js/main.js > bin/vrEmbed.js
cat bin/vrEmbed.js | uglifyjs -cm > vrEmbed.min.js

browserify src/js/create.js -d > bin/vrCreate.js

# browserify -d src/js/twglTest.js > bin/twglTest.js
# cat bin/twglTest.js | uglifyjs -cm > twglTest.min.js
