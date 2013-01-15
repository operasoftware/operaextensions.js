
var ToolbarBadge = function( properties ) {

  OPromise.call( this );

  this.properties = {};

  // Set provided properties through object prototype setter functions
  this.properties.textContent = properties.textContent;
  this.properties.backgroundColor = complexColorToHex(properties.backgroundColor);
  this.properties.color = complexColorToHex(properties.color);
  this.properties.display = String(properties.display).toLowerCase() === 'none' ? 'none' : 'block';
};

ToolbarBadge.prototype = Object.create( OPromise.prototype );

ToolbarBadge.prototype.apply = function() {

  chrome.browserAction.setBadgeBackgroundColor({ "color": (this.backgroundColor || "#f00") });

  if( this.display === "block" ) {
    chrome.browserAction.setBadgeText({ "text": this.textContent });
  } else {
    chrome.browserAction.setBadgeText({ "text": "" });
  }

};

// API

ToolbarBadge.prototype.__defineGetter__("textContent", function() {
  return this.properties.textContent;
});

ToolbarBadge.prototype.__defineSetter__("textContent", function( val ) {
  this.properties.textContent = "" + val;
  if( this.properties.display === "block" ) {
    Queue.enqueue(this, function(done) {

      chrome.browserAction.setBadgeText({ "text": ("" + val) });

      done();

    }.bind(this));
  }
});

ToolbarBadge.prototype.__defineGetter__("backgroundColor", function() {
  return this.properties.backgroundColor;
});

ToolbarBadge.prototype.__defineSetter__("backgroundColor", function( val ) {
  this.properties.backgroundColor = complexColorToHex("" + val);

  Queue.enqueue(this, function(done) {

    chrome.browserAction.setBadgeBackgroundColor({ "color": this.properties.backgroundColor });

    done();

  }.bind(this));
});

ToolbarBadge.prototype.__defineGetter__("color", function() {
  return this.properties.color;
});

ToolbarBadge.prototype.__defineSetter__("color", function( val ) {
  this.properties.color = complexColorToHex("" + val);
  // not implemented in chromium
});

ToolbarBadge.prototype.__defineGetter__("display", function() {
  return this.properties.display;
});

ToolbarBadge.prototype.__defineSetter__("display", function( val ) {
    if(("" + val).toLowerCase() === "none")  {
	this.properties.display = "none";
	Queue.enqueue(this, function(done) {

	    chrome.browserAction.setBadgeText({ "text": "" });

	    done();
	}.bind(this));
    }

    else {
	this.properties.display = "block";
	Queue.enqueue(this, function(done) {

	chrome.browserAction.setBadgeText({ "text": this.properties.textContent });

      done();

    }.bind(this));
  }
});
