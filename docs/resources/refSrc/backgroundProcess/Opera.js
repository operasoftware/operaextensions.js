/**
* This container object holds the contexts on which context menus can be built. Supported contexts include: <code>toolbar</code> and <code>menu</code>.
* @type Contexts
* @final 
**/
Opera.prototype.contexts = new Contexts(); 

/**
* This object provides a communication channel to all injected script and popups related to this extension. It also provides a <code>Windows</code> and <code>Tabs</code> API, which allows for communication with individual tabs.
* @type BackgroundProcess
* @final 
**/
Opera.prototype.extension = new BackgroundProcess(); 

/**
* Makes a given object appear in the Error Console. Helpful for debugging.  
* @param {Object} object Any object
*/
Opera.prototype.postError = function(object){}
