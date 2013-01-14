// JavaScript Document
/**
* This is the event object passed to an injected script event handler functions and available through <code>window.event</code>. Opera extensions reuse functionality built into the browser for traditional <a href="http://www.opera.com/docs/userjs/specs/">User JavaScript (UserJS)</a>, so this object matches the definition of <code>UserJSEvent</code>. It contains the usual <code>Event</code> properties and methods, such as <code>getAttribute</code> and <code>setAttribute</code>, although many of these serve little purpose in an injected script (e.g., the <code>currentTarget</code>, <code>srcElement</code>, and <code>target</code> all reference <code>window.opera</code>), but also extends the object with additional properties specific to Opera's injected script implementation. The following properties and methods are the most useful:
<dl>
		<dt><code>element</code></dt>
		<dd>
			<ul>
				<li>Object, readonly: the <code>script</code> or plug-in element.</li>
				<li>All the usual DOM methods are available, such as <code>getAttribute</code> and <code>setAttribute</code>.</li>
				<li>Available for <code>BeforeExternalScript</code>, <code>BeforeScript</code>, <code>AfterScript</code> and <code>pluginInitialized</code>
					events.</li>
			</ul>
		</dd>
		<dt><code>element.text</code></dt>
		<dd>
			<ul>
				<li>String, read-write: the script that is about to be executed.</li>
				<li>Available for <code>BeforeScript</code> and <code>AfterScript</code> events.</li>
				<li>Unlike normal page scripts, User JavaScripts are allowed to see the script source from any domain, not just those that
					are served from the same domain as the current page.</li>
			</ul>
		</dd>
		<dt><code>event</code></dt>
		<dd>
			<ul>
				<li>Object, readonly: the regular event object.</li>
				<li>Available for <code>BeforeEvent</code> and <code>AfterEvent</code> events.</li>
			</ul>
		</dd>
		<dt><code>eventCancelled</code></dt>
		<dd>
			<ul>
				<li>Boolean, readonly: says if an event handler has cancelled the event.</li>
				<li>Available for <code>AfterEvent</code> events.</li>
			</ul>
		</dd>
		<dt><code>listener</code></dt>
		<dd>
			<ul>
				<li>Function, readonly: a reference to the event handler function.</li>
				<li>Available for <code>BeforeEventListener</code> and <code>AfterEventListener</code> events.</li>
			</ul>
		</dd>
		<dt><code>preventDefault</code></dt>
		<dd>
			<ul>
				<li>Function, readonly: Prevents the default action, for example;
					<ul>
						<li>Prevents a script from being executed</li>
						<li>Prevents an event from firing</li>
						<li>Prevents an event handler from blocking a form submission</li>
					</ul>
				</li>
				<li>Available for all events, but has no effect with <code>AfterScript</code> events.</li>
			</ul>
		</dd>
		<dt><code>propagationStopped</code></dt>
		<dd>
			<ul>
				<li>Boolean, read-write: says if an event handler has stopped propagation of the event.</li>
				<li>Available for <code>AfterEventListener</code> events.</li>
			</ul>
		</dd>
		<dt><code>returnValue</code></dt>
		<dd>
			<ul>
				<li>String, read-write: the value returned by the script.</li>
				<li>Available for <code>AfterJavascriptURL</code> events.</li>
			</ul>
		</dd>
		<dt><code>source</code></dt>
		<dd>
			<ul>
				<li>String, read-write: the script that is about to execute or has been executed.</li>
				<li>Available for <code>BeforeJavascriptURL</code> and <code>AfterJavascriptURL</code> events.</li>
			</ul>
		</dd>
		<dt><code>type</code></dt>
		<dd>
			<ul>
				<li>String, readonly: the type of the event that was detected; for example, <code>BeforeJavascriptURL</code>.</li>
				<li>Available for all events.</li>
			</ul>
		</dd>
	</dl>
* @extends DOMEvent
* @see http://www.opera.com/docs/userjs/specs/#userjsevent
**/
function UserScriptEvent(){
	
}

/**
* A <code>UserJSElement</code>, which is either a script or plug-in element. 
All the usual DOM Level 2 methods are available, such as <code>getAttribute</code> and <code>setAttribute</code>.
Available for <code>BeforeExternalScript</code>, <code>BeforeScript</code>, <code>AfterScript</code> and <code>pluginInitialized</code> events.
*@type HTMLElement
**/
UserJSEvent.element = "";


