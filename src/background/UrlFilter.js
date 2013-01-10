
if(widget && widget.properties && widget.properties.permissions 
    && widget.properties.permissions.indexOf('webRequest') != -1 && widget.properties.permissions.indexOf('webRequestBlocking') != -1 ) {

  OEX.urlfilter = OEX.urlfilter || new UrlFilterManager();

}
