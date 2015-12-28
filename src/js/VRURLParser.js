function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
        console.log(tmparr[0], tmparr[1]);
    }
    return params;
}

VRURLParser = function () {
  this.isEditor = false;
  this.params = [];
  this.parseURL = function() {
    this.params = getSearchParameters();
  }

  this.init = function() {
    var editorTags=document.getElementsByTagName("vrEditor");
    this.parseURL();

    var numArgs = 0;
    for (var key in this.params) {
      numArgs+=1;
      console.log(this.params[key]);
    }

    if(editorTags.length != 0 && numArgs != 0){
      this.isEditor = true;
      console.log("IS EDITOR");
    }
  }
};

module.exports = VRURLParser;
