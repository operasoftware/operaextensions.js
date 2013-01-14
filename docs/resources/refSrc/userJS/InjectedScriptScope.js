/**
* InjectedScriptScope is the object that allows you to communicate with the {@see BackgroundProcess}.
* It is represented as <code>opera.extension</code> on the injected scripts side. 
* It provides a way to send messages and recieve messages, as well means to listen for 
events related to the background process (e.g., when the user disables an extension).
<pre class="brush: js">
//Listen to messages from the background process
opera.extension.onmessage = function(e){
		opera.postError(e.data);
	}

//Send a message to the Background Process
opera.extension.postMessage("hello")

//listen for when the extension is uninstalled or deactivated
opera.extension.ondisconnect = function(e){
		opera.postError("disconnected!");
	}
	
//Alternative way to listen for events	
opera.extension.addEventListener("disconnect", 
	function(e){
		opera.postError("Custom handler for disconnect");
	},"false"); 
</pre>
*@constructor 
**/
function InjectedScriptScope(){
	
}

/**
* This event is fired when the extension is disconnected from the current page (e.g., when the extension is disabled by the user). 
* <pre class="brush: js">
opera.extension.ondisconnect = function(e){
	alert("The extension has been disabled or uninstalled"); 
}
 </pre>
* @param {EventListener} eventListener Function that will listen for disconnection between the extension and page. 
**/
InjectedScriptScope.prototype.ondisconnect = function(eventListener){}

/**
* This event is used to listen for messages being sent from the background process to the injected script script.
* Messages from the background process can only be sent as strings and you can access them 
* through the a HTML5 <a href="http://dev.w3.org/html5/postmsg/#messageevent">MessageEvent</a>. 
* <pre class="brush: js">
opera.extensions.onmessage = function(e){
	var parsedData = JSON.parse(e.data); 
	
}
</pre>
* @param {EventListener} eventListener Function that will listen for messages from the Extension. 
**/
InjectedScriptScope.prototype.onmessage    = function(eventListener){}

/**
* This method allows for data to be posted directly to the background process. 
* @param {DOMString} data The data to send to the extension.
* @param {MessagePortArray} ports Optional An array of <a href="http://dev.w3.org/html5/postmsg/#message-ports">communication ports</a> as defined in HTML5 Web Messaging. 
**/
InjectedScriptScope.prototype.postMessage  = function(data, ports){}

/**
* This method is used to listen for events being dispatched by the background process. 
* @param {DOMString} type The type of event to listen to. Allowed values are: <code>connect</code>, <code>disconnect</code> and <code>message</code>.  
* @param {EventListener} listener The function that will be called.
* @param {Boolean} useCapture If <code>true</code>, the event listener is only added for the capture phase and target.
*/
InjectedScriptScope.prototype.addEventListener  = function(type, listener, UseCapture){}

/**
* This method removes a listener from receiving an event.
* @param {DOMString} type The type of event. Allowed values are: <code>connect</code>, <code>disconnect</code> and <code>message</code>.
* @param {EventListener} listener The object that the listener was attached to.
* @param {Boolean} useCapture Which phase the listener was assigned to. 
*/
InjectedScriptScope.prototype.removeEventListener = function(type, listener, UseCapture){}