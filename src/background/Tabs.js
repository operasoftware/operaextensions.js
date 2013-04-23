
if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabs = OEX.tabs || new RootBrowserTabManager();

}  else {

  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['WINTABS_LOADED'] = true;

}
