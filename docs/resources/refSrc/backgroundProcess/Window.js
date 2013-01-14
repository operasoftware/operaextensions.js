
/*
* The object that represents the Opera browser on the <code>BackgroundProcess</code> side.
* @type Opera 
*/
Window.prototype.opera = new Opera();

/*
* The widget object gives access to the metadata that was 
  declared in the configuration document. It is only avaiable  
  on the <code>{@see BackgroundProcess}</code> side.
* @type Opera 
*/
Window.prototype.widget = new Widget();
