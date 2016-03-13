VRUIAccordion = function() {
  var self = this;
  this.bar=null;
  this.button = null;
  this.container = null;
  this.shown = false;
  this.accordionManager = false;
  this.name = null;

  this.totalHide = function(doit) {
    self.container.hidden = doit;
    self.bar.hidden = doit;
  }

  this.show = function(show) {
    self.shown = show;
    if (show == false) {
      self.container.hidden = true;
      self.button.innerHTML = "+";
    } else {
      self.container.hidden = false;
      self.button.innerHTML = "-";
    }
  }

  this.toggle = function() {
    self.accordionManager.toggle(self.name);
  }

  this.init = function(manager, name) {
    this.name = name;
    this.accordionManager = manager;
    this.container = document.getElementById(name);
    this.button = document.getElementById(name+"_button");
    this.bar = document.getElementById(name+"_bar");
    this.button.onclick = this.toggle;
    this.show(false);
  }
}

module.exports = VRUIAccordion;
