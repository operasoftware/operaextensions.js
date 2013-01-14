// JavaScript Document

/**
* IsolatedWindowProxy provides an isolated script execution enviroment in which 
* scripts in the <code>includes/</code> folder are executed. It also provides a transparent 
* means for injected scripts to interact with the DOM of the page they have been inserted into.  
* You can use the IsolatedWindowProxy if it was the DOM of the Web pages. The means you can use it 
* to detect when DOM content is loaded, change the DOM of the Web page, etc. For security, this environment is 
* isolated from other browser extensions or UserJS scripts that may be running on the page. 
*
<pre class="brush: js">
window.addEventListener("DOMContentLoaded",
	function(){
	    var h1s= document.getElementsByTagName("h1"); 
		//
		for(var i in h1s){
				
		}
		
	}					
, false)
</pre>
*
**/
function Window(){} 

/**
* The object that represents the Opera browser on the injected script side.
* @type Opera 
**/
Window.prototype.opera = new Opera();
