var vrImageLoader = require('./VRImageLoader.js');

// var vrImageLoader = new VRImageLoader();

vrImageLoader.init(vrEmbed);

if(vrImageLoader.hasURLParams()) {
  if (vrImageLoader.isGalleryURL()) {
    vrEmbed.clearPage();
    vrEmbed.initFullpage();
    vrImageLoader.getImages(vrImageLoader.getURLParameters()["gallery"]);
  } else if (vrImageLoader.isImageURL()) {
    vrEmbed.clearPage();
    vrEmbed.initFullpage();
    vrImageLoader.buildFromImageURLParams(vrImageLoader.getURLParameters());
  }
}

module.exports = VRImageLoader;
