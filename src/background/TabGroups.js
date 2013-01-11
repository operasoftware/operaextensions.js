
if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabGroups = OEX.tabGroups || new BrowserTabGroupManager();

}
