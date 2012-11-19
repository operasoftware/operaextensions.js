
/**
 * Opera API shim test - Windows and Tabs API 
 *
 * This extension uses the Opera Windows & Tabs API to:
 *
 * 1. Create 1 new browser window
 * 2. Create 5 new tabs within that new browser window, making the http://opera.com tab active
 * 3. Shuffle the position of the 5 new tabs around once they've been created
 * 4. Create a new (6th) tab once all tab moving has been complete
 * 5. Close the http://opera.com tab
 * 6. Once the http://opera.com tab is closed, focus the http://yahoo.de tab
 * 7. Log all Window and Tab events to the console.
 * 
 */

var oex = opera.extension;

console.log(oex.windows);
console.log(oex.tabs);


oex.tabs.oncreate = function(e) {
  console.log("New tab created: " + e.tab.id);
  //console.debug( e );
};

oex.tabs.addEventListener('close', function(e) {
  console.log("Existing tab removed: " + e.tab.id);
  //console.debug( e );
});

oex.tabs.addEventListener('move', function(e) {
  console.log("Existing tab moved from " + e.prevPosition + " to " + e.tab.position);
  //console.debug( e );
});

oex.windows.addEventListener('create', function(e) {
  console.log("New window created: " + e.browserWindow.id);
  //console.debug( e );
}, false);

oex.windows.addEventListener('close', function(e) {
  console.log("Existing window removed: " + e.browserWindow.id);
  //console.debug( e );
}, false);



var browserWindow = oex.windows.create(null, { "focused": true });

var browserWindowTabs = [
  browserWindow.tabs.create({ url: "http://maps.google.com" }),
  browserWindow.tabs.create({ url: "http://google.com/news" }),
  browserWindow.tabs.create({ url: "http://opera.com", focused: true }),
  browserWindow.tabs.create({}),
  browserWindow.tabs.create({ url: "http://yahoo.de" })
];

//browserWindow.tabs[0].close();

var count = 0;

(function tabShuffle() {
  
  window.setTimeout(function() {
    
    console.log("browserWindow.tabs.length = " + browserWindow.tabs.length ); 
    
    console.log("Moving item at index[" + browserWindowTabs[ count ].position + "] to index[" + browserWindowTabs[ (count + 2) % 5 ].position + "]");

    browserWindow.insert( browserWindowTabs[ count ], browserWindowTabs[ (count + 2) % 5 ]);

    if(count < 4) {
      count++;
      tabShuffle();
    } else {
      // Let's create a new tab
      browserWindow.tabs.create({ url: "http://news.ycombinator.com" });
      
      // Let's remove the http://opera.com tab and onclose, focus the http://yahoo.de tab
      browserWindowTabs[ 2 ].addEventListener('close', function() {
        
        browserWindowTabs[ 4 ].update({ focused: true });
        
      }, false);
      
      browserWindowTabs[ 2 ].close();
    }

  }, 1000);
  
})();
