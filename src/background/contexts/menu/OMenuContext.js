var OMenuContext = function(internal) {
  if(internal !== Opera){//only internal creations
    throw new OError(
      "NotSupportedError",
      "NOT_SUPPORTED_ERR",
      DOMException.NOT_SUPPORTED_ERR
    );
    return;
  };

  MenuEventTarget.call( this );

  var length = 0;

	Object.defineProperty(this,'length',{enumerable: true,  configurable: false,  get: function(){ return length;	}, set: function(value){ }	});

	function toUint32(value){
    value = Number(value);
    value = value < 0 ? Math.ceil(value) : Math.floor(value);

    return value - Math.floor(value/Math.pow(2, 32))*Math.pow(2, 32);
  };


	Object.defineProperty(this,'addItem',{enumerable: true,  configurable: false, writable: false, value: function(menuItem,before){


		//too many items
    if(this instanceof MenuContext && this.length>0){
      throw new OError(
        "NotSupportedError",
        "NOT_SUPPORTED_ERR",
        DOMException.NOT_SUPPORTED_ERR
      );
      return;
    };

    //no item to add
    if( !menuItem || !(menuItem instanceof MenuItem) ) {
      throw new OError(
        "TypeMismatchError",
        "TYPE_MISMATCH_ERR",
        DOMException.TYPE_MISMATCH_ERR
      );
      return;
    }

    //adding only for folders
    if(this instanceof MenuItem && this.type!='folder'){
			throw new OError(
        "TypeMismatchError",
        "TYPE_MISMATCH_ERR",
        DOMException.TYPE_MISMATCH_ERR
      );
      return;
    };

    if(Array.prototype.indexOf.apply(this,[menuItem])!=-1)return;//already exist

    //same parent check
    if(before===undefined || this instanceof MenuContext)before = this.length;
    else if(before instanceof MenuItem){
      var index = Array.prototype.indexOf.apply(this,[before]);
      if(before.parent != this || index == -1){
        throw new OError(
          "HierarchyRequestError",
          "HIERARCHY_REQUEST_ERR",
          DOMException.HIERARCHY_REQUEST_ERR
        );
        return;

      } else before = index;

    } else if(before === null)before = this.length;
    else before = toUint32(before);

    if(isNaN(before))before = 0;

    //loop check
    var parent = this;
    var noLoop = false;
    while(!noLoop){
      if(parent instanceof MenuContext || parent == null)noLoop = true;
      else if(parent === menuItem){
        throw new OError(
          "HierarchyRequestError",
          "HIERARCHY_REQUEST_ERR",
          DOMException.HIERARCHY_REQUEST_ERR
        );
        return;
      } else parent = parent.parent;

    };


    Array.prototype.splice.apply(this,[before,0,menuItem]);

		length = length + 1;

    if(this instanceof MenuContext)menuItem.dispatchEvent( new MenuEvent('change', {properties : {parent: this} },menuItem));
		else this.dispatchEvent( new MenuEvent('change', {properties : {parent: this} }, menuItem));

	}});

	Object.defineProperty(this,'removeItem',{enumerable: true,  configurable: false, writable: false, value: function(index){
		if(index===undefined) {
			throw new OError(
				"TypeMismatchError",
				"TYPE_MISMATCH_ERR",
				DOMException.TYPE_MISMATCH_ERR
			);
			return;
		};

		if(index<0 || index >= length || this[ index ] == undefined)return;

		this[ index ].dispatchEvent( new MenuEvent('change', {properties : {parent: null} },this[ index ]));

		Array.prototype.splice.apply(this,[index,1]);

		length = length - 1;

	}});

	Object.defineProperty(this,'item',{enumerable: true,  configurable: false, writable: false, value: function(index){
		return this[index] || null;
	}});

};

OMenuContext.prototype = Object.create( MenuEventTarget.prototype);

