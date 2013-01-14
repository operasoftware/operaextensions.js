/**
* The Widget object provides an interface to access an extension's configuration document metadata.
*<pre class="brush: js">
&lt;!doctype html&gt;
&lt;title&gt;Hypothetical example that emails an Author&lt;/title&gt;
&lt;a style=&quot;display:hidden&quot;&gt;Email bug&lt;/a&gt;
&lt;script&gt;
function emailBug(msg){
    var a        = document.getElementsByTagName(&quot;a&quot;)[0]; 
    var subject  = widget.name   + &quot; (&quot; + widget.version + &quot;)&quot;;
    var to       = widget.authorEmail;
    var emailURI =    &quot;mailto:&quot;   + to 
                    + &quot;?subject=&quot; + escape(subject) 
                    + &quot;&amp;body=&quot;    + escape(msg);  
	  a.setAttribute(&quot;href&quot;, emailURI);
    a.click();      
}  

// Hypothetical example that generates an about box 
// using metadata from a widget's configuration document. 
function makeAboutBox(){
    var title    = &quot;&lt;h1&gt;&quot; + widget.shortName + &quot;&lt;/h1&gt;&quot;;
    var version  = &quot;&lt;h2&gt;Version: &quot; + widget.version + &quot;&lt;/h2&gt;&quot;;
    var id       = &quot;&lt;p&gt;&lt;small&gt;&quot; + widget.id +&quot;&lt;/small&gt;&lt;/p&gt; &lt;hr/&gt;&quot;;
    var auth     = &quot;&lt;p&gt;Created by: &quot; + widget.author + &quot;&lt;/p&gt;&quot;; 
    var homepage = &quot;&lt;p&gt;My Site: &quot;  +widget.authorHref + &quot;&lt;/p&gt;&quot; 
    var desc     = &quot;&lt;h3&gt;About this Widget&lt;/h3&gt;&lt;p&gt;&quot;  
                  + widget.description + &quot;&lt;/p&gt;&quot;
    var button  = "&lt;button onclick='emailBug(&quot;hello there!&quot;)'>Email Bug&lt;/button&gt;&quot;;
    var box      = &quot;&lt;div id='aboutBox'&gt;&quot;   
                   + title + version + id + auth + desc +
    &quot;&lt;/div&gt;&quot;;

    document.getElementById(&quot;console&quot;).innerHTML = box; 
}
makeAboutBox();
&lt;/script&gt;
</pre>
*@constructor
**/
function Widget (){}

/**
* This readonly attribute corresponds to the author element in the configuration document, if one was declared. Otherwise, it will return null.
 
* @type DOMString 
**/  
Widget.prototype.author = "";

/**
* This readonly attribute corresponds to the <code>author</code> element <code>email</code> attribute in the configuration document, if one was declared. Otherwise, it will return null. 
 
* @type DOMString 
**/  
Widget.prototype.authorEmail = "";

/**
* This readonly attribute corresponds to the <code>author</code> element's <code>href</code> attribute in the configuration document, if one was declared. Otherwise, it will return null. 
 
* @type DOMString 
**/ 
Widget.prototype.authorHref = "";

/**
* This readonly attribute corresponds to the <code>description</code> element in the configuration document, if one was declared. Otherwise, it will return null. 
 
* @type DOMString 
**/ 
Widget.prototype.description = "";


/**
* This readonly attribute corresponds to the widget element's <code>id</code> element in the configuration document, if one was declared. Otherwise, it will return null. 
 
* @type DOMString 
**/ 
Widget.prototype.id = "";


/**
* This readonly attribute corresponds to the <code>name</code> element in the configuration document, if one was declared. Otherwise, it will return null. 
 
* @type DOMString 
**/ 
Widget.prototype.name = "";

/**
* This readonly attribute corresponds to the <code>name</code> element's <code>short</code> attribute in the configuration document, if one was declared. Otherwise, it will return null. 
 
* @type DOMString 
**/ 
Widget.prototype.shortName = "";

/**
* This readonly attribute implements a <a href="http://www.w3.org/TR/webstorage/#the-storage-interface">HTML5 DOM Storage interface</a> that allows read/write access to the name and values of any preference elements declared in the configuration document. 
* <pre class="brush: js">&lt;!doctype html&gt;

...

&lt;fieldset id=&quot;prefs-form&quot;&gt;
&lt;legend&gt;Game Options&lt;/legend&gt;
  &lt;label&gt;Volume:  &lt;input type=&quot;range&quot; min=&quot;0&quot; max=&quot;100&quot; name=&quot;volume&quot;/&gt; &lt;/label&gt; 
  &lt;label&gt;Difficulty:  &lt;input type=&quot;range&quot; min=&quot;0&quot; max=&quot;100&quot; name=&quot;difficulty&quot;/&gt; &lt;/label&gt;
  &lt;input type=&quot;button&quot; value=&quot;Save&quot; onclick=&quot;savePrefs()&quot;/&gt;
  &lt;input type=&quot;button&quot; value=&quot;load&quot; onclick=&quot;loadPrefs()&quot;/&gt;
&lt;/fieldset&gt;

...

&lt;script&gt;
var form   = document.getElementById(&quot;prefs-form&quot;);
var fields = form.querySelectorAll(&quot;input[type='range']&quot;); 

function&nbsp;loadPrefs() {
   for(var i = 0; i &lt; fields.length; i++){
      var field = fields[i];
      if (typeof widget.preferences[field.name] !== &quot;undefined&quot;) {
        field.value = widget.preferences.getItem(field.name); 
      }
   }  
}

function&nbsp;savePrefs () {
  for(var i = 0; i &lt; fields.length; i++){
      var field = fields[i];
      widget.preferences.setItem(field.name,field.value);
  }
}
&lt;/script&gt;</pre>
* @type Storage   
* @returns Storage
**/ 
Widget.prototype.preferences = new Storage();

/**
* This readonly attribute corresponds to the <code>widget</code> element's <code>version</code> attribute in the configuration document, if one was declared. Otherwise, it will return null.  
 
* @type DOMString 
**/ 
Widget.prototype.version = "";


