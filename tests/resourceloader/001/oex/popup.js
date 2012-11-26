var ext = opera.extension;

if (typeof ext.getFile === "function") {
    ext.postMessage({
        "type" : "popup",
        "getFile" : "true"
    });
} else {
    ext.postMessage({
        "type" : "popup"
    });
}
