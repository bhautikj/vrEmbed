# vrEmbed, by Bhautik Joshi

<img src="src/assets/vrEmbedLogo.png" width="300px">

vrEmbed is an easy-to-use tool to create a VR experience from photos. You can use it to take an existing image:

<img src="src/assets/rheingauer_dom.jpg" width=300px/>

<a href="https://commons.wikimedia.org/wiki/File:Rheingauer_Dom,_Geisenheim,_360_Panorama_(Equirectangular_projection).jpg" target="_blank"><i>(source)</i></a>

..and turn it into an <a href="http://vrEmbed.org/?src=src/assets/rheingauer_dom.jpg&sphereParams=360,180,0,0&isStereo=false">interactive VR experience</a>.

The above could be achieved using a simple, one-line embed code:
```
<a class="vrEmbedPhoto" src="src/assets/rheingauer_dom.jpg" isStereo="false" sphereParams="360,180,0,0"></a><script async src="//vrEmbed.org/vrEmbed.min.js" charset="utf-8"></div></script>
```

or a single URL:
```
http://vrEmbed.org/?src=src/assets/rheingauer_dom.jpg&sphereParams=360,180,0,0&isStereo=false
```

You can even take 3D image pairs:

<img src="src/assets/stereograph_b.jpg" width=300px/>

..and turn them into an <a href="http://vrEmbed.org/?src=src/assets/stereograph_b.jpg&sphereParams=90,90,0,0&isStereo=true&texParams=.0,.0,.5,1.,.5,.0,1.,1.">interactive scene</a>.


##How to create a vrEmbed pano
The quick mode for vrEmbed allows you to quickly wrap a single image to turn it into an interactive VR scene.

The basic format of a vrEmbed goes like this:
```
<a class="vrEmbedPhoto" src="foo.jpg" isStereo="false" sphereParams="w,h,x,y" texParams="LTx,LTy,LBx,LBy,RTx,RTy,RBx,RBy"></a><script async src="//vrEmbed.org/vrEmbed.min.js" charset="utf-8"></div></script>
```

Alternatively, if you don't want an embed code and just want a single URL to turn your image into an interactive scene, you can format your URL like this:
```
https://vrEmbed.org/?src=foo.jpg&amp;isStereo=false&amp;sphereParams=w,h,x,y&amp;texParams=LTx,LTy,LBx,LBy,RTx,RTy,RBx,RBy
```

###Needed: src
```
src="foo.jpg"
```
Simply point the code at where your image lives online.

###Needed: isStereo
```
isStereo="false"
```
If your image is a composite of left and right images, set this to <b>true</b> otherwise just leave it as <b>false</b>.

###Needed: sphereParams
```
sphereParams="w,h,x,y"
```
<div class="figure"><img src="src/assets/image_size.png" width=300px/></div>
<b>h</b> and <b>w</b> refer to the vertical height and horizontal width of your image on the sphere, in degrees. If you have a full, 360 by 180 panorama then <b>w=360</b> and <b>h=180</b>.
<div class="figure"><img src="src/assets/image_location.png" width=300px/></div>
<b>x</b> and <b>y</b> refer to where on the sphere the <i>centre</i> of your image is. <b>x</b> goes from left to right from -180 to 180; 0 is straight ahead of the viewer, -90 is directly to the left and 90 is directly to the right. <b>y</b> goes from top to bottom -90 to 90; 0 is straight ahead of the viewer, -90 is directly above and 90 is directly below.

###Optional: texParams
```
texParams="LTx,LTy,LBx,LBy,RTx,RTy,RBx,RBy"
```
<div class="figure"><img src="src/assets/stereo_image_coords.png" width=300px/></div>
More advanced users can set up their embed with a 3D (i.e. stereo) image. For vrEmbed we currently assume that the left and right images combined together into the <i>same</i> image, typically side-by-side or top-and-bottom. We need to tell vrEmbed where the left and right images are. We measure the x-coordinate from left to right going from 0.0 to 1.0, amd the y-coordinate from top to bottom also going from 0.0 to 1.0. Note that at the moment we <i>do not</i> support pixel coordinates - these are floating-point values (this may change depending on need).<br/>
We define <b>(LTx,LTy)</b> as the top-left coordinate of the left image, <b>(LBx,LBy)</b> as the bottom-right coordinate of the left image.  <b>(RTx,RTy)</b> and <b>(RBx,RBy)</b> correspondingly match the right image.

###Optional: width and height
You can set the width and height of the embed using width and height parameters, which both need to be set (e.g. width=640px height=480px); otherwise the embed defaults to creating a 16:9 ratio embed that takes up the width of the container.
