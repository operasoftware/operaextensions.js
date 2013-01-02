window.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById('link_open');
    var href = el.getAttribute('href');
    el.addEventListener('click', function(){
	chrome.tabs.create({url: href});
	return false;
    });
});