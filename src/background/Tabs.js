
if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabs = OEX.tabs || new RootBrowserTabManager();

}
