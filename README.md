## Opera Extensions JavaScript API Compatibility Layer (operaextensions.js)

This library provides a compatibility Layer containing the JavaScript Opera Extension APIs that have been provided in Opera <= version 12.

**<font color="red">This library is intended for use in the [oex2nex convertor tool](https://github.com/operasoftware/oex2nex). If you want to convert an existing Opera oex extension into an Opera 15+ nex extension then you should download the [oex2nex convertor tool](https://github.com/operasoftware/oex2nex) directly rather than using this library standalone.</font>**

### Supported Opera Extension APIs

This library adds support to Chromium for the following Opera (.oex) Extension APIs:

- [Widget object](http://dev.opera.com/articles/view/extensions-api-widget-object/)
- [Windows and Tabs API](http://dev.opera.com/articles/view/extensions-api-windows-tabs)
- [Messaging API](http://dev.opera.com/articles/view/extensions-api-messaging)
- [Button and Badge API](http://dev.opera.com/articles/view/extensions-api-browser-toolbar)
- [Popup API](http://dev.opera.com/articles/view/extensions-api-popup)
- [Resource Loader API](http://dev.opera.com/articles/view/extensions-api-resourceloader)
- [Screenshot API](http://dev.opera.com/articles/view/extensions-api-screenshot)
- [Injected Scripts API](http://dev.opera.com/articles/view/extensions-api-injected-scripts) *
- [URL Filter API](http://dev.opera.com/articles/view/extensions-api-urlfilter)
- [Context Menus API](http://dev.opera.com/articles/view/extensions-api-contextmenu)
- [Speed Dial API](http://dev.opera.com/articles/view/extensions-api-speeddial)

\* minus support for [addEventListener](http://dev.opera.com/articles/view/extensions-api-opera-addEventListener) and [removeEventListener](http://dev.opera.com/articles/view/extensions-api-opera-removeEventListener) UserJS events.

##### Further API reference documentation

The full Opera Extension (.oex) API Documentation is provided for reference in the `/build` directory of this repository.

### Download this library

You can download a [ZIP](https://github.com/operasoftware/operaextensions.js/zipball/master) or [TAR.GZ](https://github.com/operasoftware/operaextensions.js/tarball/master) file containing all the operaextensions.js library code or you can clone this repo via Git as follows:

    git clone git://github.com/operasoftware/operaextensions.js.git

### Building the libraries

Using utilities provided in this library we can build the compatibility library for the different contexts in which it can be used.

The latest builds are provided by default in the `/build` directory of this repository (see: [the Opera Extension Compatibility Libraries](#the-opera-extension-compatibility-layer-libraries) section below). If, however, you would like to build these files yourself then the following instructions are for you.

The build utilities included in this library have the following dependencies that first need to be installed:

* Python >= version 1.6
* Java

To build the library from source change directories to the folder in which you cloned this repository and execute the follow code:

    cd ./utils
    ./build.sh

(alternatively, we can replace 'build.sh' above with 'build.bat' if we are running on Windows).

### The Opera Extension Compatibility Layer libraries

The following six final build files are provided in this repository:

* [`/build/operaextensions_background.js`](https://github.com/operasoftware/operaextensions.js/blob/master/build/operaextensions_background.js) - The compatibility file required for code running in an [OEX background process](http://dev.opera.com/articles/view/whats-in-an-opera-extension/#bgprocess).
* [`/build/operaextensions_injectedscript.js`](https://github.com/operasoftware/operaextensions.js/blob/master/build/operaextensions_injectedscript.js) - The compatibility file required for code running in an [OEX injected script process](http://dev.opera.com/articles/view/whats-in-an-opera-extension/#injected).
* [`/build/operaextensions_popup.js`](https://github.com/operasoftware/operaextensions.js/blob/master/build/operaextensions_popup.js) - The compatibility file required for code running in an [OEX popup process](http://dev.opera.com/articles/view/whats-in-an-opera-extension/#popup) (and code running in a tab view context such as e.g. [an Extension's options page](http://dev.opera.com/articles/view/whats-in-an-opera-extension/#options)).
* [`/build/operaextensions_background.min.js`](https://github.com/operasoftware/operaextensions.js/blob/master/build/operaextensions_background.min.js) - A minified version of `/build/operaextensions_background.js` for inclusion in your own converted extension.
* [`/build/operaextensions_injectedscript.min.js`](https://github.com/operasoftware/operaextensions.js/blob/master/build/operaextensions_injectedscript.min.js) - A minified version of `/build/operaextensions_injectedscript.js` for inclusion in your own converted extension.
* [`/build/operaextensions_popup.min.js`](https://github.com/operasoftware/operaextensions.js/blob/master/build/operaextensions_popup.min.js) - A minified version of `/build/operaextensions_popup.js` for inclusion in your own converted extension.

### Using the libraries in your own converted extension

Each library available in the `/build` directory of this repository needs to be included in to your extension according to the guidelines provided below.

**Note:** <font color="red">It is strongly advised that you use these library files via the [oex2nex convertor tool](https://github.com/operasoftware/oex2nex) only.</font> The oex2nex convertor tool will parse and modify your existing Opera oex JavaScript code to run correctly under this compatibility layer. The following instructions are intended for debugging purposes only and do not cover the JavaScript code anomalies you will find if you attempt to run this in an unconverted oex extension.

##### Including the background process library in your converted extension

1. Copy `/build/operaextensions_background.min.js` to your Opera oex extension's directory (to e.g. `/oex_shim/operaextensions_background.min.js`)
2. Add a new &lt;script&gt; tag in your background HTML page as follows:

    <pre>&lt;script type="application/javascript" src="/oex_shim/operaextensions_background.min.js"&gt;&lt;/script&gt;</pre>

3. Wrap all your existing Opera oex extension code in an `opera.isReady` function as follows:

    <pre>opera.isReady(function() {
      // your old OEX extension code goes here
    });</pre>

##### Including the popup process library in your converted extension

1. Copy `/build/operaextensions_popup.min.js` to your Opera oex extension's directory (to e.g. `/oex_shim/operaextensions_popup.min.js`)
2. Add a new &lt;script&gt; tag in all your popup HTML pages (including your options.html page if available) as follows:

    <pre>&lt;script type="application/javascript" src="/oex_shim/operaextensions_popup.min.js"&gt;&lt;/script&gt;</pre>

3. Wrap all your existing Opera oex extension code in an `opera.isReady` function as follows:

    <pre>opera.isReady(function() {
      // your old OEX extension code goes here
    });</pre>

##### Including the injected script process library in your converted extension

1. Copy `/build/operaextensions_injectedscript.min.js` to your Opera oex extension's directory (to e.g. `/oex_shim/operaextensions_injectedscript.min.js`)
2. Add this path to the `content_scripts` directive inside your extension's `manifest.json` file as follows:

   <pre>"content_scripts": [
       {
         "matches": ["http://*/*", "https://*/*"],
         "js": ["/oex_shim/operaextensions_injectedscript.min.js"],
         "run_at":"document_start"
       }
   ]</pre>

3. Wrap all your existing Opera oex extension code in an `opera.isReady` function as follows:

    <pre>opera.isReady(function() {
      // your old OEX extension code goes here
    });</pre>

### Feedback

If you find any bugs or issues please report them on the [operaextensions.js Issue Tracker](https://github.com/operasoftware/operaextensions.js/issues).

If you would like to contribute to this project please consider [forking this repo](https://github.com/operasoftware/operaextensions.js/fork) and then creating a new [Pull Request](https://github.com/operasoftware/operaextensions.js/pulls) back to the main code base.

### License

Copyright &copy; 2013 Opera Software ASA

See the [LICENSE](https://github.com/operasoftware/operaextensions.js/blob/master/LICENSE) file.
