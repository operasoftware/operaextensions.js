
if(manifest && manifest.permissions && manifest.permissions.indexOf('contextMenus')!=-1){

  global.MenuItem = OEX.bgProcess.MenuItem;
  global.MenuContext = OEX.bgProcess.MenuContext;

  OEC.menu = OEC.menu || OEX.bgProcess.opera.contexts.menu;

}
