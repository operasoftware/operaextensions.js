
/*
* This object provides a communication channel from the Extension to the <code>BackgroundProcess</code>.
* It also provides a <code>Windows</code> and <code>Tabs</code> API, which mainly allows for communicating with individual tabs.
* @type Extension
* @final 
*/

Opera.prototype.extension = new PopupProcess(); 

/**
* Makes a given object appear in the Error Console. Helpful for debugging.  
* @param {Object} object Any object
*/
Opera.prototype.postError = function(object){}
