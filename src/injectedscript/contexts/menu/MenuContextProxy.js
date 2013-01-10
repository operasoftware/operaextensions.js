var MenuContextProxy = function() {

  MenuEventTarget.call( this );

  Object.defineProperty(this,'toString',{enumerable: false,  configurable: false, writable: false, value: function(event){
		return "[object MenuContextProxy]";
	}});


	OEX.addEventListener('controlmessage', function(e) {

		if( !e.data || !e.data.action || e.data.action !== '___O_MenuItem_Click') {
      return;
    }

		this.dispatchEvent( new MenuEvent('click', {info: e.data.info, tab: null},new MenuItemProxy(e.data.menuItemId)) );

  }.bind(this));

};

MenuContextProxy.prototype = Object.create( MenuEventTarget.prototype );



