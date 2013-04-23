
if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.windows = OEX.windows || new BrowserWindowManager();

} else {
  
  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['WINTABS_LOADED'] = true;
  
}
