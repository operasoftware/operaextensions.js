
if(global.opr && global.opr.speeddial && manifest && manifest.permissions && manifest.permissions.indexOf('speeddial')!=-1){

  OEC.speeddial = OEC.speeddial || new SpeeddialContext();

} else {

  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['SPEEDDIAL_LOADED'] = true;

}

