
var BrowserTabGroupManager = function( parentObj ) {
  
  OEventTarget.call(this);
  
  this._parent = parentObj;
  
  // Set up 0 mock BrowserTabGroup objects at startup
  this.length = 0;
  
};

BrowserTabGroupManager.prototype = Object.create( OEventTarget.prototype );

BrowserTabGroupManager.prototype.create = function() {
  
  // When this feature is not supported in the current user agent then we must
  // throw a NOT_SUPPORTED_ERR as per the full Opera WinTabs API specification.
  throw {
      name:        "Not Supported Error",
      message:     "The current user agent does not support Tab Groups"
  };
  
};

BrowserTabGroupManager.prototype.getAll = function() {
  return []; // always empty
};