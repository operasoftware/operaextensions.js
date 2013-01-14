/**
* This is a reference to the <code>BrowserWindow</code> this <code>Tab</code> is contained in.
* @type BrowserWindow
**/
BrowserTab.prototype.browserWindow = "";

/**
* This attribute is <code>true</code> when Opera and this tab are in focus. This attribute is read only.
* @type boolean 
**/
BrowserTab.prototype.focused = "";

/**
* This attribute contains the current URL of this tab. This attribute is read only.
* @type DOMString 
**/
BrowserTab.prototype.url = "";

/**
* This attribute contains the title of the current document in this tab. This attribute is read only.
* @type DOMString 
**/
BrowserTab.prototype.title = "";

/**
* This attribute contains the URL to the favicon for this tab. This attribute is read only.
* @type DOMString 
**/
BrowserTab.prototype.faviconUrl = "";
    
/**
* This method closes the tab.
*/
BrowserTab.prototype.close = function(){};

/**
* This method changes this tab's properties to the <code>BrowserTabProperties</code> provided.
* @param {BrowserTabProperties} props The new properties for the tab. Note: In the current release, only the url property can be updated.
*/
BrowserTab.prototype.update = function( props ){};
