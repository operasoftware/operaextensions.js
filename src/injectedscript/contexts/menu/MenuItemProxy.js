var MenuItemProxy = function(id) {

  MenuEventTarget.call( this );

  Object.defineProperty(this,'toString',{enumerable: false,  configurable: false, writable: false, value: function(event){
		return "[object MenuItemProxy]";
	}});

  Object.defineProperty(this,'id',{enumerable: true,  configurable: false,  get: function(){return id;}, set: function(){}});

};

MenuItemProxy.prototype = Object.create( MenuEventTarget.prototype );

