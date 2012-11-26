// Window size and position
test(function() {
	win = createWindow(null, {top: 200, left: 100, height: 300, width: 300 });
	assert_equals(win.top, 200,  "The window should be positioned 200px from the top, checking top property");
	assert_equals(win.left, 100,  "The window should be positioned 100px from the left, checking left property");
}, "Create positioned windows, explicitly specifying the top and left property");


// Moving windows
test(function() {
	win = createWindow();
	win.update({ top: 200, left: 100, height: 300, width: 300 });
	assert_equals(win.top, 200,  "The window should be positioned 200px from the top, checking top property");
}, "Updating window position, explicitly specifying the top property");

test(function() {
	var win = createWindow();
	win.update({ top: 200, left: 100, height: 300, width: 300 });
	assert_equals(win.left, 100,  "The window should be positioned 100px from the left, checking top property");
}, "Updating window position, explicitly specifying the left property");
