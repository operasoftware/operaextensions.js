OExtension.prototype.getFile = function(path) {
	var response = null;
	
	if(typeof path != "string")return response;
	
  try{
    var host = chrome.extension.getURL('');
    
    if(path.indexOf('widget:')==0)path = path.replace('widget:','chrome-extension:');
    
    path = (path.indexOf(host)==-1?host:'')+path;
    var xhr = new XMLHttpRequest();
    
    xhr.onloadend = function(){
        if (xhr.readyState==xhr.DONE && xhr.status==200){
          result = xhr.response;
          
          result.name = path.substring(path.lastIndexOf('/')+1);
          
          result.lastModifiedDate = null;
          result.toString = function(){
            return "[object File]";
          };
          response = result;
        };
    };
   
    xhr.open('GET',path,false);
    xhr.responseType = 'blob';
  
    xhr.send(null);
	
  } catch(e){
    return response;
  };
  
	return response;
};