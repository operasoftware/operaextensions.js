opera.isReady(function() {

   // Create a toolbar button
   var button = opera.contexts.toolbar.createItem({
     title:'Cookie sharing test',
     icon:'/opera.png',
     /*badge: {
       backgroundColor: '#5566ff',
       color: '#ffffff',
       display: 'block',
       text: ''
     },*/
     popup: {
       href: 'popup.html'
     }
   });

   // Add it to the browser UI
   opera.contexts.toolbar.addItem(button);

});