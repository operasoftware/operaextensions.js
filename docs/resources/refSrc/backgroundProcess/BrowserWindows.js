/**
* This event is fired when a new browser window is created by the user or via a script.
* @param {Function} functionObj The function that is executed when a new browser window is created.
*/
BrowserWindows.prototype.oncreate = function(functionObj){} 

/**
* This event is fired when a browser window is focused
* @param {Function} The function that is executed when a browser window is focused.
*/
BrowserWindows.prototype.onfocus = function(functionObj){}

/**
* This event is fired when a browser window is closed.
* @param {Function} functionObj The function that is executed when a browser window is closed.
*/
BrowserWindows.prototype.onclose = function(functionObj){} 

/**
* This event is fired when a browser window is blurred / loses focus.
* @param {Function} functionObj The function that is executed when a browser window is blurred / loses focus.
*/
BrowserWindows.prototype.onblur = function(functionObj){} 

/**
* This method returns a list of all <code>BrowserWindows</code> objects that cointain injected script from this extension. 
* @returns An array of <code>BrowserWindows</code>.
* @type BrowserWindows[]
*/
BrowserWindows.prototype.getAll = function(){} 

/**
* This method creates a new browser window.
* @returns BrowserWindows 
* @type BrowserWindows
*/
BrowserWindows.prototype.create = function(){} 

/**
* This method returns the last <code>ExtensionWindow</code> from this extension that received focus.
* @type BrowserWindows
* @returns The <code>BrowserWindows</code> that was last focused by the user or by a script.  
*/
BrowserWindows.prototype.getFocused = function(){} 


/**
* This method is used to listen for events being dispatched. 
* @param {EventType} type Type of event. Allowed values are: <code>focus</code>, <code>close</code>, <code>create</code> and <code>blur</code>.
* @param {EventListener} eventListener The function that is executed when the event occurs.
* @param {useCapture} useCapture Boolean, keep <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
BrowserWindows.prototype.addEventListener = function(){}


/**
* This method removes a listener from receiving an event.
* @param {EventType} type Type of event. Allowed values are: <code>focus</code>, <code>close</code>, <code>create</code> and <code>blur</code>.
* @param {EventListener} eventListener The function to be removed.
* @param {useCapture} useCapture Boolean, keep <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
BrowserWindows.prototype.removeEventListener = function(){}