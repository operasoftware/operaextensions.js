opera.isReady(function(){
    function getDocHeightWidth() {
        var D = document;
        return {h: Math.max(
            Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
            Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
            Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        ), w: Math.max(
    	Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
    	Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
    	Math.max(D.body.clientWidth, D.documentElement.clientWidth)
        )};
    }
    function updateDim(){
        var d = document;
        var dim = getDocHeightWidth();
        d.getElementById('h').innerHTML = dim.h;
        d.getElementById('w').innerHTML = dim.w ;
    }
    window.addEventListener("resize", function() {
        updateDim();
    });
    window.addEventListener("load", function() {
        updateDim();
    });
});