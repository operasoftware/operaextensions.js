var MenuItemProperties = function(obj, initial) {
  var lock = false;
  var menuItemId = null;
  var properties = {
    id: "",
    type: "entry",
    contexts: ["page"],
    disabled: false,
    title: "",
    icon: "",
    documentURLPatterns: null,
    targetURLPatterns: null,
    parent: null
  };
  var allowedContexts = ["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"];
  var changed = function() {
      if (!lock) obj.dispatchEvent(new MenuEvent('change', {}, obj));
      }

  var update = function(props) {

    if (lock) return;

    lock = true;

    if (props != undefined) for (var name in props) if (properties[name] !== undefined) {
      if (name === "type") {

        if (["entry", "folder", "line"].indexOf(String(props.type).toLowerCase()) != -1) properties.type = String(props.type);

      } else if (name === "parent") {
        if (props.parent === null || props.parent instanceof OMenuContext) properties.parent = props.parent;
        else throw new TypeError();

      } else if (name === "id") properties.id = String(props.id);
      else obj[name] = props[name];
    };

    lock = false;
    //update
    if (properties.parent == null || (properties.parent instanceof MenuItem && properties.parent.menuItemId == null)) {

      if (menuItemId != null) {
        chrome.contextMenus.remove(menuItemId);
        menuItemId = null;
      };

    } else if (properties.disabled == true) {

      if (menuItemId != null) {
        chrome.contextMenus.remove(menuItemId);
        menuItemId = null;
      };

    } else {

      var updateProperties = {
        title: properties.title.length == 0 ? chrome.app.getDetails().name : properties.title,
        type: properties.type.toLowerCase() == "line" ? "separator" : "normal" //"normal", "checkbox", "radio", "separator"
      };

      var contexts = properties.contexts.join(',').toLowerCase().split(',').filter(function(element) {
        return allowedContexts.indexOf(element.toLowerCase()) != -1;
      });

      if (contexts.length == 0) updateProperties.contexts = ["page"];
      else updateProperties.contexts = contexts;

      if (properties.parent instanceof MenuItem && properties.parent.menuItemId != null) {
        updateProperties.parentId = properties.parent.menuItemId;
      };



      if (menuItemId == null) {
        if (properties.id != "") updateProperties.id = properties.id; //set id
        menuItemId = chrome.contextMenus.create(updateProperties);
      } else chrome.contextMenus.update(menuItemId, updateProperties);

/* unsafe code
  if(
    this.properties.parent instanceof MenuContext && this.properties.icon.length>0 //has icon
    && !(chrome.app.getDetails().icons && chrome.app.getDetails().icons[16]) // no global 16x16 icon
  ){//set custom root icon
    chrome.browserAction.setIcon({path: this.properties.icon });
  };
  */

    };

  };

  var nosetter = function(value) {};

  Object.defineProperty(obj, 'id', {
    enumerable: true,
    get: function() {
      return properties.id;
    },
    set: nosetter
  });

  Object.defineProperty(obj, 'type', {
    enumerable: true,
    get: function() {
      return properties.type;
    },
    set: nosetter
  });

  Object.defineProperty(obj, 'contexts', {
    enumerable: true,
    get: function() {
      return properties.contexts;
    },
    set: function(value) {
      if (!Array.isArray(value)) {
        throw new TypeError();
        return;
      };

      properties.contexts = value.length == 0 ? value : value.join(',').split(',');
      changed();

    }
  });

  Object.defineProperty(obj, 'disabled', {
    enumerable: true,
    get: function() {
      return properties.disabled;
    },
    set: function(value) {
      properties.disabled = Boolean(value);
      changed();
    }
  });

  Object.defineProperty(obj, 'title', {
    enumerable: true,
    get: function() {
      return properties.title;
    },
    set: function(value) {
      properties.title = String(value);
      changed();
    }
  });

  Object.defineProperty(obj, 'icon', {
    enumerable: true,
    get: function() {
      return properties.icon;
    },
    set: function(value) {
      if (typeof value === "string") {
        properties.icon = value;

        if (properties.icon.indexOf(':') == -1 && properties.icon.indexOf('/') == -1 && properties.icon.length > 0) properties.icon = '/' + properties.icon;
      };

      changed();
    }
  });

  Object.defineProperty(obj, 'documentURLPatterns', {
    enumerable: true,
    get: function() {
      return properties.documentURLPatterns;
    },
    set: function(value) {

      if (Array.isArray(value)) {
        properties.documentURLPatterns = [];
        for (var i = 0; i < value.length; i++) properties.documentURLPatterns.push(String(value[i]).toLowerCase());
      };

      changed();
    }
  });

  Object.defineProperty(obj, 'targetURLPatterns', {
    enumerable: true,
    get: function() {
      return properties.targetURLPatterns;
    },
    set: function(value) {

      if (Array.isArray(value)) {
        properties.targetURLPatterns = [];
        for (var i = 0; i < value.length; i++) properties.targetURLPatterns.push(String(value[i]).toLowerCase());
      };

      changed();
    }
  });

  Object.defineProperty(obj, 'menuItemId', {
    enumerable: false,
    get: function() {
      return menuItemId;
    },
    set: nosetter
  });

  Object.defineProperty(obj, 'parent', {
    enumerable: true,
    get: function() {
      return properties.parent;
    },
    set: nosetter
  });

  if (initial != undefined) update(initial);

  return update;
  };


var MenuItem = function(internal, properties) {
  OMenuContext.apply(this, [internal]);

  var _apply = MenuItemProperties(this, properties);

  //click event
  if (properties.onclick != undefined) this.onclick = properties.onclick; //set initial click handler
  if (this.type.toLowerCase() === 'entry') chrome.contextMenus.onClicked.addListener(function(_info, _tab) {
    if (this.menuItemId == null || !(this.menuItemId === _info.menuItemId || this.id === _info.menuItemId)) return;

    this.dispatchEvent(new MenuEvent('click', {
      info: _info,
      tab: _tab
    }, this));

    var event = new MenuEvent('click', {
      info: _info,
      tab: _tab
    }, this);

    OEC.menu.dispatchEvent(event);

    event.source.postMessage({
      "action": "___O_MenuItem_Click",
      "info": _info,
      "menuItemId": this.id
    });

  }.bind(this));

  this.addEventListener('change', function(e) {
    if (e.target === this) _apply(e.properties);
    else _apply();

    for (var i = 0; i < this.length; i++) this[i].dispatchEvent(new MenuEvent('change', {
      properties: e.properties
    }, e.target));

  }, false);

  Object.defineProperty(this, 'toString', {
    value: function(event) {
      return "[object MenuItem]";
    }
  });

};

MenuItem.prototype = Object.create(OMenuContext.prototype);
