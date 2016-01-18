#!/bin/sh


#browserify -d -t [ exposify --expose [ --three THREE ] ] src/js/main.js > bin/vrEmbed.js
browserify -d src/js/main.js > bin/vrEmbed.js
cat bin/vrEmbed.js | uglifyjs -cm > vrEmbed.min.js

browserify -d -t [ exposify --expose [ --three THREE ] ] src/js/twglTest.js > bin/twglTest.js
cat bin/twglTest.js | uglifyjs -cm > twglTest.min.js
