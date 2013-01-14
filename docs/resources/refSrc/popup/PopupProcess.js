/**
* This event fires when the <code>BackgroundProcess</code>'s environment is shut down, and can no longer be communicated with. The source is a <code>messagePort</code> to the disconnecting environment, used only for comparative purposes. The port itself may be closed.
* @param {EventListener} eventListener The function that is executed when an injected script or popup's environment is shut down, and can no longer be communicated with.
**/
PopupProcess.prototype.ondisconnect = function(){}

/**
* This event fired when a message is received from the <code>BackgroundProcess</code>. The source is a <code>messagePort</code> to the connecting environment.
* @param {EventListener} eventListener The function that is executed when a message is received from an injected script or the popup.
**/
PopupProcess.prototype.onmessage = function(){}

/**
* This method is used to post a message to the <code>BackgroundProcess</code> of the extension.
* @param {DOMString} data Data to be posted.
* @param {array} ports An array of ports to be passed along to the <code>BackgroundProcess</code>.
*/
PopupProcess.prototype.postMessage = function(data, ports){};
