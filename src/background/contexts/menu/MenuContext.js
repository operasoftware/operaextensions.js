var MenuContext = function(internal) {

  chrome.contextMenus.removeAll(); //clear all items

  OMenuContext.apply(this, [internal]);

  Object.defineProperty(this, 'toString', {
    value: function(event) {
      return "[object MenuContext]";
    }
  });

};

MenuContext.prototype = Object.create(OMenuContext.prototype);

MenuContext.prototype.createItem = function(menuItemProperties) {

  return new MenuItem(Opera, menuItemProperties);

};
