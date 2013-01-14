/**
* This object provides a JavaScript interface to the Opera Browser 
**/

/**
* This object provides a means to communicate with the background process, as well as functionality to override and hook into variables, functions and events defined in the page. It is only exposed to the injected script side of an extension. 
* @type Extension
* @final
**/
Opera.prototype.extension = new InjectedScriptScope();


/**
* This method can be used by to override global variables defined by regular scripts in a page. 
*<pre class="brush: js">
window.opera.defineMagicVariable('isGoodBrowser', function (curVal)
{
  return true;
}, function (newVal)
{
  if (!newVal)
  {
    window.status = 'Repairing script';
  }
});
</pre>
* @param {DOMString} name String giving the name of the variable to be overridden.
* @param {DOMString} getter Function to be run whenever a script attempts to access the contents of the variable. Any value returned by the function is used as the value of the variable. The function receives the current value of the variable as parameter.
* @param {DOMString} setter Optional function to be run whenever a script attempts to set the value of the variable. The value that the script was attempting to assign to the variable is passed to the function as parameter. If no setter function is required, the value <code>null</code> must be used instead.
*/
Opera.prototype.defineMagicVariable = function(getter,setter,name){}

/**
* This method can be used to override global functions defined by regular scripts in a page.
* @param {DOMString} name String giving the name of the function to be overridden.
* @param {Function}  implementation Function to be run in place of the function defined by the page. The function will be passed the following parameters: 
<ul>
<li>A reference to the real function defined by the page.
</li><li>The object that would have been referred to by the <code>this</code> keyword in the real function.</li>
<li>Any parameters that would have been passed to the real function (each is passed as a separate parameter to the magic function).</li>
</ul>
*/
Opera.prototype.defineMagicFunction = function(name, implementation){}


/**
* Registers a listener for an event specific to the injected script side. 
* The listener needs to use the standard <code>EventListener</code> interface - a function with an <code>Event</code> object as its first argment (e.g., <code>var myListener = function(event){alert(event.type)}</code>. Functions can be registered for the following events: 
<dl>
		<dt><code>BeforeExternalScript</code></dt>
		<dd>
			<ul>
				<li>Fired when a <code>script</code> element with a <code>src</code> attribute is encountered.</li>
				<li>The <code>script</code> element is available in the <code>element</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>If cancelled, the external source is not loaded and the <code>script</code> element is not executed.</li>
				<li>In addition, if it is cancelled, the <code>BeforeScript</code> event will not fire.</li>
			</ul>

		</dd>
		<dt><code>BeforeScript</code></dt>
		<dd>
			<ul>
				<li>Fired before a <code>script</code> element is executed.</li>
				<li>The <code>script</code> element is available in the <code>element</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>The content of the script is available in the <code>text</code> property of the <code>script</code> element, and is also writable:
					<pre class="brush: js">UserJSEvent.element.text = UserJSEvent.element.text.replace(/!=\s*null/,'');</pre>
				</li>
				<li>The <code>BeforeScript</code> event is fired for inline scripts as well as external scripts, including scripts with a type that Opera normally does not execute (such as VBScript).</li>
				<li>If cancelled, the <code>script</code> element is not executed.</li>
			</ul>
		</dd>
		
		<dt><code>AfterScript</code></dt>
		<dd>
			<ul>
				<li>Fired after a <code>script</code> element has finished executing.</li>
				<li>The <code>script</code> element is available in the <code>element</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>Modifying the <code>text</code> property of the event object has no effect, unlike the <code>BeforeScript</code> event.</li>
			</ul>
		</dd>
		<dt><code>BeforeEvent</code></dt>
		<dd>
			<ul>
				<li>Fired before a regular event is fired, regardless of whether or not an event handler has been registered for that event.</li>
				<li>The regular event is available in the <code>event</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>If cancelled, the regular event is not fired, its default action is performed, and any associated <code>BeforeEventListener</code> events are not fired.</li>
			</ul>
		</dd>

		<dt><code>BeforeEvent.{type}</code></dt>
		<dd>
			<ul>
				<li>Like <code>BeforeEvent</code>, but fired only for events of the specified type (e.g., <code>BeforeEvent.click</code>). As shown by the example, the {type} needs to be substituted for the type of event you want to listen for. See the <a href="http://dev.w3.org/html5/spec/Overview.html#event-handlers-on-elements-document-objects-and-window-objects">Event handlers on elements, <code>Document</code> objects, and <code>Window</code> objects</a> of the <cite>HTML5</cite> specificaton for a complete list of events. <strong>Note:</strong> at present, not all event types are supported.</li>
			</ul>
		</dd>

		<dt><code>AfterEvent</code></dt>
		<dd>
		
			<ul>
				<li>Fired after a regular event has been fired and handled but before its default action has been performed.</li>
				<li>The regular event is available in the <code>event</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>If cancelled, any attempts by a regular event handler to cancel the regular event will be ignored.</li>
				<li>The <a href="UserScriptEvent.html"><code>UserJSEvent</code></a> object will also have a <code>eventCancelled</code> property, which will be set to <code>true</code> if any regular event handlers have cancelled the event.</li>
			</ul>
		</dd>

		<dt><code>AfterEvent.{type}</code></dt>
		<dd>
			<ul>
				<li>Like <code>AfterEvent</code>, but fired only for events of the specified type (e.g., <code>AfterEvent.click</code>). 
				As shown by the example, the {type} needs to be substituted for the type of event you want to listen for. See the
				<a href="http://dev.w3.org/html5/spec/Overview.html#event-handlers-on-elements-document-objects-and-window-objects">
				Event handlers on elements, Document objects, and Window objects</a> of the <cite>HTML5</cite> specificaton for a complete list of events 
				you can listen for. <strong>Note:</strong> at present, not all event types are supported.</li>
			</ul>
		</dd>

		<dt><code>BeforeEventListener</code></dt>
		<dd>
			<ul>
				<li>Fired before a listener for a regular event is called.</li>
				<li>The regular event is available in the <code>event</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>, and its regular listener is available in the <code>listener</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>If cancelled, the regular event listener will not be called.</li>
			</ul>
		</dd>

		<dt><code>BeforeEventListener.type</code></dt>
		<dd>
			<ul>
				<li>Like <code>BeforeEventListener</code>, but fired only for events of the specified type (for example, <code>BeforeEventListener.click</code>).</li>
			</ul>
		</dd>

		<dt><code>AfterEventListener</code></dt>
		<dd>
			<ul>
				<li>Fired after a <code>listener</code> for regular events is called.</li>
				<li>The <a href="UserScriptEvent.html"><code>UserJSEvent</code></a> object contains references to the original <code>event<code> and <code>listener</code> that were defined  on the page.</li>
				<li>If cancelled, any attempts by a regular event handler to cancel the regular event propagation will be ignored.</li>
				<li>The <a href="UserScriptEvent.html"><code>UserJSEvent</code></a> object will also have the <code>propagationStopped</code> property, which will be set to <code>true</code> if any regular event handlers have cancelled the event propagation.</li>
			</ul>
		</dd>

		<dt><code>AfterEventListener.{type}</code></dt>
		<dd>
			<ul>
				<li>Like <code>AfterEventListener</code>, but fired only for events of the specified type (for example, <code>AfterEventListener.click</code>). As shown by the example, the {type} needs to be substituted for the type of event you want to listen for. See the <a href="http://dev.w3.org/html5/spec/Overview.html#event-handlers-on-elements-document-objects-and-window-objects">Event handlers on elements, <code>Document</code> objects, and <code>Window</code> objects</a> of the <cite>HTML5</cite> specificaton for a complete list of events. <strong>Note:</strong> at present, not all event types are supported.</li>
			</ul>
		</dd>

		<dt><code>BeforeJavascriptURL</code></dt>
		<dd>
			<ul>
				<li>Fired before a <code>javascript:</code> URL is executed.</li>
				<li>The JavaScript code to be executed (everything after the <code>javascript:</code> in the URL) is available in the <code>source</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>, and is also writable.</li>
				<li>If cancelled, the <code>javascript:</code> URL is not executed.</li>
			</ul>
		</dd>

		<dt><code>AfterJavascriptURL</code></dt>
		<dd>
			<ul>
				<li>Fired after a <code>javascript:</code> URL is executed.</li>
				<li>The JavaScript code that was executed (everything after the <code>javascript:</code> in the URL) is available in the <code>source</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>, and any value returned by that code is available in the <code>returnValue</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
				<li>The <code>returnValue</code> is also writable.</li>
				<li>If cancelled, any returned value will not be used as the source of a new page.</li>
			</ul>
		</dd>

		<dt><code>pluginInitialized</code></dt>
		<dd>
			<ul>
				<li>Fired after a plug-in instance has been initialized.</li>
				<li>The element which represents the plug-in instance is available in the <code>element</code> attribute of the <a href="UserScriptEvent.html"><code>UserJSEvent</code></a>.</li>
			</ul>
		</dd>
	</dl>																						   
																						   
* @param {DOMString} type The type of event to listen to. See list in the method details.  
* @param {EventListener} listener The function that will be called.
* @param {boolean} useCapture If <code>true</code>, the event listener is only added for the capture phase and target.
*/
Opera.prototype.addEventListener    = function(type, listener, UseCapture){}

/**
* Removes an existing listener from an event.
* @param {DOMString} type The type of event. See addEventListener for the list of possible event types. 
* @param {EventListener} listener The object that the listener was attached to.
* @param {Boolean} useCapture Which phase the listener was assigned to. 
*/
Opera.prototype.removeEventListener = function(type, listener, UseCapture){}


/**
* Makes a given object appear in the Error Console. Helpful for debugging.  
* @param {Object} object Any object
*/
Opera.prototype.postError = function(object){}

