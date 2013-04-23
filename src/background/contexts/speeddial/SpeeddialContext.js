
var SpeeddialContext = function() {
  
  this.properties = {};
  
  global.opr.speeddial.get(function(speeddialProperties) {
    this.properties.url = speeddialProperties.url;
    this.properties.title = speeddialProperties.title;
    
    // Set WinTabs feature to LOADED
    deferredComponentsLoadStatus['SPEEDDIAL_LOADED'] = true;
  }.bind(this));

};

SpeeddialContext.prototype.constructor = SpeeddialContext;

SpeeddialContext.prototype.__defineGetter__('url', function() {
  return this.properties.url || "";
}); // read

SpeeddialContext.prototype.__defineSetter__('url', function(val) {
  
  global.opr.speeddial.update({ 'url': val }, function(speeddialProperties) {
    this.properties.url = speeddialProperties.url;
  }.bind(this));

}); // write

SpeeddialContext.prototype.__defineGetter__('title', function() {
  return this.properties.title || "";
}); // read

SpeeddialContext.prototype.__defineSetter__('title', function(val) {
  
  global.opr.speeddial.update({ 'title': val }, function(speeddialProperties) {
    this.properties.title = speeddialProperties.title;
  }.bind(this));

}); // write
