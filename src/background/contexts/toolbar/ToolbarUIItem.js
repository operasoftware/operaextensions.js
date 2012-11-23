
var ToolbarUIItem = function( properties ) {
  
  OPromise.call( this );
  
  this.properties = {};
  
  this.properties.disabled = properties.disabled || false;
  this.properties.title = properties.title || "";
  this.properties.icon = properties.icon || "";
  this.properties.popup = new ToolbarPopup( properties.popup || {} );
  this.properties.badge = new ToolbarBadge( properties.badge || {} );
  
  //this.enqueue('apply');
  
};

ToolbarUIItem.prototype = Object.create( OPromise.prototype );

ToolbarUIItem.prototype.apply = function() {
  
  // Apply disabled property
  if( this.disabled === true ) {
    chrome.browserAction.disable();
  } else {
    chrome.browserAction.enable();
  }
  
  // Apply title property
  chrome.browserAction.setTitle({ "title": (this.title) });
  
  // Apply icon property
  chrome.browserAction.setIcon({ "path": this.icon });
  
};

// API

ToolbarUIItem.prototype.__defineGetter__("disabled", function() {
  return this.properties.disabled;
});

ToolbarUIItem.prototype.__defineSetter__("disabled", function( val ) {
  if( this.properties.disabled !== val ) {
    if( val === true || val === "true" || val === 1 || val === "1" ) {
      this.properties.disabled = true;
      if( this.resolved ) {
        chrome.browserAction.disable();
      }
    } else {
      this.properties.disabled = false;
      if( this.resolved ) {
        chrome.browserAction.enable();
      }
    }
  }
});

ToolbarUIItem.prototype.__defineGetter__("title", function() {
  return this.properties.title;
});

ToolbarUIItem.prototype.__defineSetter__("title", function( val ) {
  this.properties.title = "" + val;
  
  if( this.resolved ) {
    chrome.browserAction.setTitle({ "title": (this.title) });
  }
});

ToolbarUIItem.prototype.__defineGetter__("icon", function() {
  return this.properties.icon;
});

ToolbarUIItem.prototype.__defineSetter__("icon", function( val ) {
  this.properties.icon = "" + val;
  
  if( this.resolved ) {
    chrome.browserAction.setIcon({ "path": this.icon });
  }
});

ToolbarUIItem.prototype.__defineGetter__("popup", function() {
  return this.properties.popup;
});

ToolbarUIItem.prototype.__defineGetter__("badge", function() {
  return this.properties.badge;
});
