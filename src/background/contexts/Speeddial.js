
if(global.opr && global.opr.speeddial && manifest && manifest.speeddial){

  OEC.speeddial = OEC.speeddial || new SpeeddialContext();

} else {

  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['SPEEDDIAL_LOADED'] = true;

}

