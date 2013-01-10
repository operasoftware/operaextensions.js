opera.isReady({
    test(function() {
    	assert_equals(types("other"), 1)
    }, "Value of RESOURCE_OTHER");
    
    test(function() {
    	assert_equals(types("script"), 2);
    }, "Value of RESOURCE_SCRIPT");
    
    test(function() {
    	assert_equals(types("image"), 4);
    }, "Value of RESOURCE_IMAGE");
    
    test(function() {
    	assert_equals(types("stylesheet"),8);
    }, "Value of RESOURCE_STYLESHEET");
    
    test(function() {
    	assert_equals(types("object"),16);
    }, "Value of RESOURCE_OBJECT");
    
    test(function() {
    	assert_equals(types("subdocument"), 32);
    }, "Value of RESOURCE_SUBDOCUMENT");
    
    test(function() {
    	assert_equals(types("document"), 64);
    }, "Value of RESOURCE_DOCUMENT");
    
    test(function() {
    	assert_equals(types("refresh"), 128);
    }, "Value of RESOURCE_REFRESH");
    
    test(function() {
    	assert_equals(types("xmlhttprequest"), 2048);
    }, "Value of RESOURCE_XMLHTTPREQUEST");
    
    test(function() {
    	assert_equals(types("objectsubrequest"), 4096);
    }, "Value of RESOURCE_OBJECT_SUBREQUEST");
    
    test(function() {
    	assert_equals(types("media"), 16384);
    }, "Value of RESOURCE_MEDIA");
    
    test(function() {
    	assert_equals(types("font"), 32768);
    }, "Value of RESOURCE_FONT");
});
