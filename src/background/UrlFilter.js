
if(manifest && manifest.permissions && manifest.permissions.indexOf('webRequest') != -1 && manifest.permissions.indexOf('webRequestBlocking') != -1 ) {

  OEX.urlfilter = OEX.urlfilter || new UrlFilterManager();

}
