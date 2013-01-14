/**
* BackgroundProcess is called with <code>opera.extension</code>.
*<pre class="brush: js">
opera.extension.addEventListener('connect', function&nbsp;(event) {
  window.opera.postError('Connected. Event source: ' + event.source);
}, false);
</pre>
* @constructor
**/
function BackgroundProcess(){}

/**
* This event listener is invoked when an injected script, popup or options environment is created that can be communicated with. The event's source is a <code>messagePort</code> to the connecting environment.
*<pre class="brush: js">
opera.extension.onconnect = &nbsp;function(event)&nbsp;  {
  window.opera.postError('Connected. Event source: ' + event.source);
}
</pre>
@type null
**/
BackgroundProcess.prototype.onconnect = null;

/**
* This event listener is invoked when an injected script, popup or options environment is destroyed and can no longer be communicated with. The source is a <code>messagePort</code> to the disconnecting environment, used only for comparative purposes. The port itself may be closed.
*<pre class="brush: js">
opera.extension.ondisconnect = &nbsp;function(event)&nbsp;  {
  window.opera.postError('Disconnected. Event source: ' + event.source);
}
</pre>
* @type null
**/
BackgroundProcess.prototype.ondisconnect = null; 

/**
* This event listener is invoked when a message is received from injected script, popup or options page. The source is a <code>messagePort</code> to the connecting environment.
*<pre class="brush: js">
opera.extension.onmessage = &nbsp;function(event)&nbsp; {
  window.opera.postError('Message received. Event source: ' + event.source);
}
</pre>
* @type null 
**/
BackgroundProcess.prototype.onmessage = null; 

/**
* This method is used to broadcast data to all connected injected script and popup environments associated with the extension.
*<pre class="brush: js">
opera.extension.broadcastMessage('Message broadcast.');
</pre>
* @param {DOMString} data Data to be broadcasted.
*/
BackgroundProcess.prototype.broadcastMessage = function(data){};

/**
* This attribute contains the <code>BrowserWindows</code> associated with this extension. Only those windows which contain tabs accessible by this extension are available.
* @type BrowserWindows
**/
BackgroundProcess.prototype.windows = new BrowserWindows();

/**
* This attribute contains the <code>Tabs</code> associated with this extension. Only those tabs which have an injected script from this extension applied to them are available.
* @type Tabs
**/
BackgroundProcess.prototype.tabs = new BrowserTabs();

/**
* This method is used to listen for events being dispatched. For the Background Process, 
this inlcudes "connect", "message", "disconnect". 
*<pre class="brush: js">
opera.extension.addEventListener('connect', function(event) {
  window.opera.postError('Connected. Event source: ' + event.source);
}, false);

opera.extension.addEventListener('message', function(event) {
  window.opera.postError('Message received. Event source: ' + event.source);
  opera.extension.broadcastMessage('Message sent to injected script');
}, false);

opera.extension.addEventListener('disconnect', function(event) {
  window.opera.postError('Disconnected. Event source: ' + event.source);
}, false);
</pre>
* @param {DOMString} type Type of event. Allowed values are: <code>message</code>, <code>disconnect</code>, and <code>connect</code>.
* @param {EventListener} eventListener The function to be executed when the event occurs.
* @param {boolean} useCapture Boolean, keep <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/

BackgroundProcess.prototype.addEventListener = function(type, eventListerner, useCapture){};

/**
* This method removes a listener from receiving an event
* @param {DOMString} type Type of event. Allowed values are: <code>message</code>, <code>disconnect</code>, and <code>connect</code>. 
* @param {} eventListener The function to be removed.
* @param {boolean} useCapture Boolean, keep <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
BackgroundProcess.prototype.removeEventListener = function(type, eventListerner, useCapture){};