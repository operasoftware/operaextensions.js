
/**
 * Opera API shim test - Toolbar Button API 
 *
 * This extension uses the Opera Toolbar Context API to:
 *
 * 1. Create a new toolbar context button
 * 2. Add this toolbar context button to the UI
 * 3. Incrementally count from 0 to 200 and display the result in the button's badge
 * 4. During the counting, 'Popup #1' should be available on click.
 * 5. On hitting 200, disable the button for one second then re-enabled
 * 6. On re-enabling the button, 'Popup #2' should be available on click.
 * 7. Log all Toolbar Context events to the console.
 * 
 */
 
 // Register for events
 opera.contexts.toolbar.addEventListener('remove', function(e) {
   console.log("Toolbar Context button has been disabled");
 }, false);
 
 opera.contexts.toolbar.onclick = function(e) {
   console.log("Toolbar Context button has been clicked");
 };

 // Create a toolbar button
 var button = opera.contexts.toolbar.createItem({
   title:'My Extension',
   icon:'/icon.png',
   badge: {},
   popup: {
     href: 'popup.html'
   }
 });

 // Add it to the browser UI
 opera.contexts.toolbar.addItem(button);

 // Set the badge and the font colors
 var badge = button.badge; 
 badge.backgroundColor = '#5566ff';
 badge.color = "#ffffff";
 badge.display = "block";

 // Update badge properties directly through the button object
 var count = button.badge.textContent = 0;
 
 (function incrementBadgeItem() {
   window.setTimeout(function() {
     button.badge.textContent = count++;
     if(count <= 200) {
       incrementBadgeItem();
     } else {
       button.popup.href = "popup2.html";
       opera.contexts.toolbar.removeItem(button);
       
       window.setTimeout(function() {
         
         // Re-add the button and we should be able to click to see 'Popup #2'
         opera.contexts.toolbar.addItem(button);
         
       }, 1000);
     }
   }, 50);
 })();

 // Get the background color?
 console.log( button.badge.backgroundColor ); // this was set to '#5566ff' above
