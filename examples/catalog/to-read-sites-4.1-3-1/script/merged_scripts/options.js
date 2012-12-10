opera.isReady(function() {
  
  /*
   * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
   * in FIPS PUB 180-1
   * Version 2.1a Copyright Paul Johnston 2000 - 2002.
   * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
   * Distributed under the BSD License
   * See http://pajhome.org.uk/crypt/md5 for details.
   */

  /*
   * Configurable variables. You may need to tweak these to be compatible with
   * the server-side, but the defaults work in most cases.
   */
  var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
  var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
  var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

  /*
   * These are the functions you'll usually want to call
   * They take string arguments and return either hex or base-64 encoded strings
   */
  function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
  function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
  function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
  function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
  function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
  function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

  /*
   * Perform a simple self-test to see if the VM is working
   */
  function sha1_vm_test()
  {
    return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
  }

  /*
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  function core_sha1(x, len)
  {
    /* append padding */
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;

    var w = Array(80);
    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;
    var e = -1009589776;

    for(var i = 0; i < x.length; i += 16)
    {
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      var olde = e;

      for(var j = 0; j < 80; j++)
      {
        if(j < 16) w[j] = x[i + j];
        else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
        var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                         safe_add(safe_add(e, w[j]), sha1_kt(j)));
        e = d;
        d = c;
        c = rol(b, 30);
        b = a;
        a = t;
      }

      a = safe_add(a, olda);
      b = safe_add(b, oldb);
      c = safe_add(c, oldc);
      d = safe_add(d, oldd);
      e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);

  }

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  function sha1_ft(t, b, c, d)
  {
    if(t < 20) return (b & c) | ((~b) & d);
    if(t < 40) return b ^ c ^ d;
    if(t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
  }

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  function sha1_kt(t)
  {
    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
           (t < 60) ? -1894007588 : -899497514;
  }

  /*
   * Calculate the HMAC-SHA1 of a key and some data
   */
  function core_hmac_sha1(key, data)
  {
    var bkey = str2binb(key);
    if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

    var ipad = Array(16), opad = Array(16);
    for(var i = 0; i < 16; i++)
    {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
    return core_sha1(opad.concat(hash), 512 + 160);
  }

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  function safe_add(x, y)
  {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  function rol(num, cnt)
  {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /*
   * Convert an 8-bit or 16-bit string to an array of big-endian words
   * In 8-bit function, characters >255 have their hi-byte silently ignored.
   */
  function str2binb(str)
  {
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for(var i = 0; i < str.length * chrsz; i += chrsz)
      bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
    return bin;
  }

  /*
   * Convert an array of big-endian words to a string
   */
  function binb2str(bin)
  {
    var str = "";
    var mask = (1 << chrsz) - 1;
    for(var i = 0; i < bin.length * 32; i += chrsz)
      str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
    return str;
  }

  /*
   * Convert an array of big-endian words to a hex string.
   */
  function binb2hex(binarray)
  {
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for(var i = 0; i < binarray.length * 4; i++)
    {
      str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
             hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
    }
    return str;
  }

  /*
   * Convert an array of big-endian words to a base-64 string
   */
  function binb2b64(binarray)
  {
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var str = "";
    for(var i = 0; i < binarray.length * 4; i += 3)
    {
      var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                  | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                  |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
      for(var j = 0; j < 4; j++)
      {
        if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
        else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
      }
    }
    return str;
  }
  
  /*
   * Copyright 2008 Netflix, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /* Here's some JavaScript software for implementing OAuth.

     This isn't as useful as you might hope.  OAuth is based around
     allowing tools and websites to talk to each other.  However,
     JavaScript running in web browsers is hampered by security
     restrictions that prevent code running on one website from
     accessing data stored or served on another.

     Before you start hacking, make sure you understand the limitations
     posed by cross-domain XMLHttpRequest.

     On the bright side, some platforms use JavaScript as their
     language, but enable the programmer to access other web sites.
     Examples include Google Gadgets, and Microsoft Vista Sidebar.
     For those platforms, this library should come in handy.
  */

  // The HMAC-SHA1 signature method calls b64_hmac_sha1, defined by
  // http://pajhome.org.uk/crypt/md5/sha1.js

  /* An OAuth message is represented as an object like this:
     {method: "GET", action: "http://server.com/path", parameters: ...}

     The parameters may be either a map {name: value, name2: value2}
     or an Array of name-value pairs [[name, value], [name2, value2]].
     The latter representation is more powerful: it supports parameters
     in a specific sequence, or several parameters with the same name;
     for example [["a", 1], ["b", 2], ["a", 3]].

     Parameter names and values are NOT percent-encoded in an object.
     They must be encoded before transmission and decoded after reception.
     For example, this message object:
     {method: "GET", action: "http://server/path", parameters: {p: "x y"}}
     ... can be transmitted as an HTTP request that begins:
     GET /path?p=x%20y HTTP/1.0
     (This isn't a valid OAuth request, since it lacks a signature etc.)
     Note that the object "x y" is transmitted as x%20y.  To encode
     parameters, you can call OAuth.addToURL, OAuth.formEncode or
     OAuth.getAuthorization.

     This message object model harmonizes with the browser object model for
     input elements of an form, whose value property isn't percent encoded.
     The browser encodes each value before transmitting it. For example,
     see consumer.setInputs in example/consumer.js.
   */

  /* This script needs to know what time it is. By default, it uses the local
     clock (new Date), which is apt to be inaccurate in browsers. To do
     better, you can load this script from a URL whose query string contains
     an oauth_timestamp parameter, whose value is a current Unix timestamp.
     For example, when generating the enclosing document using PHP:

     <script src="oauth.js?oauth_timestamp=<?=time()?>" ...

     Another option is to call OAuth.correctTimestamp with a Unix timestamp.
   */

  var OAuth; if (OAuth == null) OAuth = {};

  OAuth.setProperties = function setProperties(into, from) {
      if (into != null && from != null) {
          for (var key in from) {
              into[key] = from[key];
          }
      }
      return into;
  }

  OAuth.setProperties(OAuth, // utility functions
  {
      percentEncode: function percentEncode(s) {
          if (s == null) {
              return "";
          }
          if (s instanceof Array) {
              var e = "";
              for (var i = 0; i < s.length; ++s) {
                  if (e != "") e += '&';
                  e += OAuth.percentEncode(s[i]);
              }
              return e;
          }
          s = encodeURIComponent(s);
          // Now replace the values which encodeURIComponent doesn't do
          // encodeURIComponent ignores: - _ . ! ~ * ' ( )
          // OAuth dictates the only ones you can ignore are: - _ . ~
          // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
          s = s.replace(/\!/g, "%21");
          s = s.replace(/\*/g, "%2A");
          s = s.replace(/\'/g, "%27");
          s = s.replace(/\(/g, "%28");
          s = s.replace(/\)/g, "%29");
          return s;
      }
  ,
      decodePercent: function decodePercent(s) {
          if (s != null) {
              // Handle application/x-www-form-urlencoded, which is defined by
              // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
              s = s.replace(/\+/g, " ");
          }
          return decodeURIComponent(s);
      }
  ,
      /** Convert the given parameters to an Array of name-value pairs. */
      getParameterList: function getParameterList(parameters) {
          if (parameters == null) {
              return [];
          }
          if (typeof parameters != "object") {
              return OAuth.decodeForm(parameters + "");
          }
          if (parameters instanceof Array) {
              return parameters;
          }
          var list = [];
          for (var p in parameters) {
              list.push([p, parameters[p]]);
          }
          return list;
      }
  ,
      /** Convert the given parameters to a map from name to value. */
      getParameterMap: function getParameterMap(parameters) {
          if (parameters == null) {
              return {};
          }
          if (typeof parameters != "object") {
              return OAuth.getParameterMap(OAuth.decodeForm(parameters + ""));
          }
          if (parameters instanceof Array) {
              var map = {};
              for (var p = 0; p < parameters.length; ++p) {
                  var key = parameters[p][0];
                  if (map[key] === undefined) { // first value wins
                      map[key] = parameters[p][1];
                  }
              }
              return map;
          }
          return parameters;
      }
  ,
      getParameter: function getParameter(parameters, name) {
          if (parameters instanceof Array) {
              for (var p = 0; p < parameters.length; ++p) {
                  if (parameters[p][0] == name) {
                      return parameters[p][1]; // first value wins
                  }
              }
          } else {
              return OAuth.getParameterMap(parameters)[name];
          }
          return null;
      }
  ,
      formEncode: function formEncode(parameters) {
          var form = "";
          var list = OAuth.getParameterList(parameters);
          for (var p = 0; p < list.length; ++p) {
              var value = list[p][1];
              if (value == null) value = "";
              if (form != "") form += '&';
              form += OAuth.percentEncode(list[p][0])
                +'='+ OAuth.percentEncode(value);
          }
          return form;
      }
  ,
      decodeForm: function decodeForm(form) {
          var list = [];
          var nvps = form.split('&');
          for (var n = 0; n < nvps.length; ++n) {
              var nvp = nvps[n];
              if (nvp == "") {
                  continue;
              }
              var equals = nvp.indexOf('=');
              var name;
              var value;
              if (equals < 0) {
                  name = OAuth.decodePercent(nvp);
                  value = null;
              } else {
                  name = OAuth.decodePercent(nvp.substring(0, equals));
                  value = OAuth.decodePercent(nvp.substring(equals + 1));
              }
              list.push([name, value]);
          }
          return list;
      }
  ,
      setParameter: function setParameter(message, name, value) {
          var parameters = message.parameters;
          if (parameters instanceof Array) {
              for (var p = 0; p < parameters.length; ++p) {
                  if (parameters[p][0] == name) {
                      if (value === undefined) {
                          parameters.splice(p, 1);
                      } else {
                          parameters[p][1] = value;
                          value = undefined;
                      }
                  }
              }
              if (value !== undefined) {
                  parameters.push([name, value]);
              }
          } else {
              parameters = OAuth.getParameterMap(parameters);
              parameters[name] = value;
              message.parameters = parameters;
          }
      }
  ,
      setParameters: function setParameters(message, parameters) {
          var list = OAuth.getParameterList(parameters);
          for (var i = 0; i < list.length; ++i) {
              OAuth.setParameter(message, list[i][0], list[i][1]);
          }
      }
  ,
      /** Fill in parameters to help construct a request message.
          This function doesn't fill in every parameter.
          The accessor object should be like:
          {consumerKey:'foo', consumerSecret:'bar', accessorSecret:'nurn', token:'krelm', tokenSecret:'blah'}
          The accessorSecret property is optional.
       */
      completeRequest: function completeRequest(message, accessor) {
          if (message.method == null) {
              message.method = "GET";
          }
          var map = OAuth.getParameterMap(message.parameters);
          if (map.oauth_consumer_key == null) {
              OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey || "");
          }
          if (map.oauth_token == null && accessor.token != null) {
              OAuth.setParameter(message, "oauth_token", accessor.token);
          }
          if (map.oauth_version == null) {
              OAuth.setParameter(message, "oauth_version", "1.0");
          }
          if (map.oauth_timestamp == null) {
              OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
          }
          if (map.oauth_nonce == null) {
              OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(7));
          }
          OAuth.SignatureMethod.sign(message, accessor);
      }
  ,
      setTimestampAndNonce: function setTimestampAndNonce(message) {
          OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
          OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(7));
      }
  ,
      addToURL: function addToURL(url, parameters) {
          newURL = url;
          if (parameters != null) {
              var toAdd = OAuth.formEncode(parameters);
              if (toAdd.length > 0) {
                  var q = url.indexOf('?');
                  if (q < 0) newURL += '?';
                  else       newURL += '&';
                  newURL += toAdd;
              }
          }
          return newURL;
      }
  ,
      /** Construct the value of the Authorization header for an HTTP request. */
      getAuthorizationHeader: function getAuthorizationHeader(realm, parameters) {
          var header = 'OAuth realm="' + OAuth.percentEncode(realm) + '"';
          var list = OAuth.getParameterList(parameters);
          for (var p = 0; p < list.length; ++p) {
              var parameter = list[p];
              var name = parameter[0];
              if (name.indexOf("oauth_") == 0) {
                  header += ',' + OAuth.percentEncode(name) + '="' + OAuth.percentEncode(parameter[1]) + '"';
              }
          }
          return header;
      }
  ,
      /** Correct the time using a parameter from the URL from which the last script was loaded. */
      correctTimestampFromSrc: function correctTimestampFromSrc(parameterName) {
          parameterName = parameterName || "oauth_timestamp";
          var scripts = document.getElementsByTagName('script');
          if (scripts == null || !scripts.length) return;
          var src = scripts[scripts.length-1].src;
          if (!src) return;
          var q = src.indexOf("?");
          if (q < 0) return;
          parameters = OAuth.getParameterMap(OAuth.decodeForm(src.substring(q+1)));
          var t = parameters[parameterName];
          if (t == null) return;
          OAuth.correctTimestamp(t);
      }
  ,
      /** Generate timestamps starting with the given value. */
      correctTimestamp: function correctTimestamp(timestamp) {
          OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
      }
  ,
      /** The difference between the correct time and my clock. */
      timeCorrectionMsec: 0
  ,
      timestamp: function timestamp() {
          var t = (new Date()).getTime() + OAuth.timeCorrectionMsec;
          return Math.floor(t / 1000);
      }
  ,
      nonce: function nonce(length) {
          var chars = OAuth.nonce.CHARS;
          var result = "";
          for (var i = 0; i < length; ++i) {
              var rnum = Math.floor(Math.random() * chars.length);
              result += chars.substring(rnum, rnum+1);
          }
          return result;
      }
  });

  OAuth.nonce.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

  /** Define a constructor function,
      without causing trouble to anyone who was using it as a namespace.
      That is, if parent[name] already existed and had properties,
      copy those properties into the new constructor.
   */
  OAuth.declareClass = function declareClass(parent, name, newConstructor) {
      var previous = parent[name];
      parent[name] = newConstructor;
      if (newConstructor != null && previous != null) {
          for (var key in previous) {
              if (key != "prototype") {
                  newConstructor[key] = previous[key];
              }
          }
      }
      return newConstructor;
  }

  /** An abstract algorithm for signing messages. */
  OAuth.declareClass(OAuth, "SignatureMethod", function OAuthSignatureMethod(){});

  OAuth.setProperties(OAuth.SignatureMethod.prototype, // instance members
  {
      /** Add a signature to the message. */
      sign: function sign(message) {
          var baseString = OAuth.SignatureMethod.getBaseString(message);
          var signature = this.getSignature(baseString);
          OAuth.setParameter(message, "oauth_signature", signature);
          return signature; // just in case someone's interested
      }
  ,
      /** Set the key string for signing. */
      initialize: function initialize(name, accessor) {
          var consumerSecret;
          if (accessor.accessorSecret != null
              && name.length > 9
              && name.substring(name.length-9) == "-Accessor")
          {
              consumerSecret = accessor.accessorSecret;
          } else {
              consumerSecret = accessor.consumerSecret;
          }
          this.key = OAuth.percentEncode(consumerSecret)
               +"&"+ OAuth.percentEncode(accessor.tokenSecret);
      }
  });

  /* SignatureMethod expects an accessor object to be like this:
     {tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..", accessorSecret: "xcmvzc..."}
     The accessorSecret property is optional.
   */
  // Class members:
  OAuth.setProperties(OAuth.SignatureMethod, // class members
  {
      sign: function sign(message, accessor) {
          var name = OAuth.getParameterMap(message.parameters).oauth_signature_method;
          if (name == null || name == "") {
              name = "HMAC-SHA1";
              OAuth.setParameter(message, "oauth_signature_method", name);
          }
          OAuth.SignatureMethod.newMethod(name, accessor).sign(message);
      }
  ,
      /** Instantiate a SignatureMethod for the given method name. */
      newMethod: function newMethod(name, accessor) {
          var impl = OAuth.SignatureMethod.REGISTERED[name];
          if (impl != null) {
              var method = new impl();
              method.initialize(name, accessor);
              return method;
          }
          var err = new Error("signature_method_rejected");
          var acceptable = "";
          for (var r in OAuth.SignatureMethod.REGISTERED) {
              if (acceptable != "") acceptable += '&';
              acceptable += OAuth.percentEncode(r);
          }
          err.oauth_acceptable_signature_methods = acceptable;
          throw err;
      }
  ,
      /** A map from signature method name to constructor. */
      REGISTERED : {}
  ,
      /** Subsequently, the given constructor will be used for the named methods.
          The constructor will be called with no parameters.
          The resulting object should usually implement getSignature(baseString).
          You can easily define such a constructor by calling makeSubclass, below.
       */
      registerMethodClass: function registerMethodClass(names, classConstructor) {
          for (var n = 0; n < names.length; ++n) {
              OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
          }
      }
  ,
      /** Create a subclass of OAuth.SignatureMethod, with the given getSignature function. */
      makeSubclass: function makeSubclass(getSignatureFunction) {
          var superClass = OAuth.SignatureMethod;
          var subClass = function() {
              superClass.call(this);
          };
          subClass.prototype = new superClass();
          // Delete instance variables from prototype:
          // delete subclass.prototype... There aren't any.
          subClass.prototype.getSignature = getSignatureFunction;
          subClass.prototype.constructor = subClass;
          return subClass;
      }
  ,
      getBaseString: function getBaseString(message) {
          var URL = message.action;
          var q = URL.indexOf('?');
          var parameters;
          if (q < 0) {
              parameters = message.parameters;
          } else {
              // Combine the URL query string with the other parameters:
              parameters = OAuth.decodeForm(URL.substring(q + 1));
              var toAdd = OAuth.getParameterList(message.parameters);
              for (var a = 0; a < toAdd.length; ++a) {
                  parameters.push(toAdd[a]);
              }
          }
          return OAuth.percentEncode(message.method.toUpperCase())
           +'&'+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeUrl(URL))
           +'&'+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeParameters(parameters));
      }
  ,
      normalizeUrl: function normalizeUrl(url) {
          var uri = OAuth.SignatureMethod.parseUri(url);
          var scheme = uri.protocol.toLowerCase();
          var authority = uri.authority.toLowerCase();
          var dropPort = (scheme == "http" && uri.port == 80)
                      || (scheme == "https" && uri.port == 443);
          if (dropPort) {
              // find the last : in the authority
              var index = authority.lastIndexOf(":");
              if (index >= 0) {
                  authority = authority.substring(0, index);
              }
          }
          var path = uri.path;
          if (!path) {
              path = "/"; // conforms to RFC 2616 section 3.2.2
          }
          // we know that there is no query and no fragment here.
          return scheme + "://" + authority + path;
      }
  ,
      parseUri: function parseUri (str) {
          /* This function was adapted from parseUri 1.2.1
             http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
           */
          var o = {key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                   parser: {strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }};
          var m = o.parser.strict.exec(str);
          var uri = {};
          var i = 14;
          while (i--) uri[o.key[i]] = m[i] || "";
          return uri;
      }
  ,
      normalizeParameters: function normalizeParameters(parameters) {
          if (parameters == null) {
              return "";
          }
          var list = OAuth.getParameterList(parameters);
          var sortable = [];
          for (var p = 0; p < list.length; ++p) {
              var nvp = list[p];
              if (nvp[0] != "oauth_signature") {
                  sortable.push([ OAuth.percentEncode(nvp[0])
                                + " " // because it comes before any character that can appear in a percentEncoded string.
                                + OAuth.percentEncode(nvp[1])
                                , nvp]);
              }
          }
          sortable.sort(function(a,b) {
                            if (a[0] < b[0]) return  -1;
                            if (a[0] > b[0]) return 1;
                            return 0;
                        });
          var sorted = [];
          for (var s = 0; s < sortable.length; ++s) {
              sorted.push(sortable[s][1]);
          }
          return OAuth.formEncode(sorted);
      }
  });

  OAuth.SignatureMethod.registerMethodClass(["PLAINTEXT", "PLAINTEXT-Accessor"],
      OAuth.SignatureMethod.makeSubclass(
          function getSignature(baseString) {
              return this.key;
          }
      ));

  OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"],
      OAuth.SignatureMethod.makeSubclass(
          function getSignature(baseString) {
              //opera.postError(baseString);
              b64pad = '=';
              var signature = b64_hmac_sha1(this.key, baseString);
              return signature;
          }
      ));

  try {
      OAuth.correctTimestampFromSrc();
  } catch(e) {
  }
  
  /**
   * @license
   * Copyright 2011 Joel Spadin
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * @overview
   * This library facilitates making requests to the Opera Link synchronization
   * server. It is intended for use in Opera extensions, but it can be used in any
   * situation where JavaScript security allows cross domain XML HTTP requests.
   * 
   * This library depends on oauth.js and sha1.js, which can be found here:
   * http://oauth.googlecode.com/svn/code/javascript/
   * 
   * Before sending any requests to Opera Link, you must first authenticate with
   * OAuth. To do this, your application needs a consumer key and secret, which
   * you can obtain by registering your application at
   * https://auth.opera.com/service/oauth/applications/
   * 
   * Call opera.link.consumer() with your application's consumer key and secret.
   * Now, each user needs their own token and token secret. A full explanation of
   * the authentication process can be found at
   * http://dev.opera.com/articles/view/gentle-introduction-to-oauth/
   * 
   * This library simplifies the process somewhat. Call opera.link.requestToken()
   * to get a request token and token secret (steps 1-5). Save these values so
   * that you can recall them once the user grants access to your application. 
   * This function will automatically send the user to the authorization page if
   * used in an Opera extension. If the extensions API is not available, you must
   * set opera.link.authorizeFunction and handle the opening of the authorization
   * page yourself.
   * 
   * Once the user grants access to your application (step 6), they will get a 
   * 6-digit verifier code (step 7). Call opera.link.getAccessToken with the 
   * request token, token secret, and the verifier to get an access token and 
   * token secret (steps 8,9). 
   * You should save the access token and token secret to permanent storage so
   * they can be recalled later and the user will not have to repeat the 
   * authentication process.
   * 
   * To set up authentication from a saved access token, call 
   * opera.link.authorize() with the saved token and token secret. Next, check 
   * that the grant has not expired by calling opera.link.testAuthorization(). If
   * the grant has expired, you will need to redo the full authentication process.
   * 
   * 
   * opera.link provides methods to set up authentication and send OAuth signed
   *		requests.
   *		
   *	opera.link.utils provides generic methods and methods common to all datatypes
   *	
   *	opera.link.bookmarks, opera.link.notes, opera.link.searchengines,
   *	opera.link.speeddial, and opera.link.urlfilter provide access to each of the
   *		data types supported by Opera Link.
   *		
   *	Documentation on the parameters of specific request types can be found here:
   *	http://www.opera.com/docs/apis/linkrest/
   *	
   *	Examples using the Opera Link API can be found here:
   *	http://dev.opera.com/articles/view/introducing-the-opera-link-api/
   */


  try {
  	opera;
  } catch (error) {
  	/**
  	 * @namespace
  	 * @desc Nothing to see here. Move along.
  	 */
  	opera = new function Opera() {};
  }

  try {
  	widget;
  } catch (error) {
  	widget = undefined;
  }


  /**
   * @namespace
   * @desc Handles communication and authentication with the Opera Link server.
   * Add access to https://auth.opera.com and https://link.api.opera.com 
   * in your extension's config.xml. 
   * @requires oauth.js 
   * @requires sha.js
   */
  opera.link = new function OperaLink() {

  	/**
  	 *	Enum of the response codes used by Opera Link
  	 * @readonly
  	 * @enum {number{
  	 */
  	this.response = {
  		/**
  		 * 200 : The request completed successfully.
  		 */
  		Ok: 200,
  		/**
  		 * 204 : The item was successfully deleted.
  		 */
  		Deleted: 204,
  		/**
  		 * 400 : The request is invalid and cannot be processed. The cause of this is
  		 * often missing a required parameter or trying to execute an invalid
  		 * method on an item.
  		 */
  		BadRequest: 400,
  		/**
  		 * 401 : The request cannot be allowed, possibly because your authentication
  		 * information is invalid or because too many requests sent in a short
  		 * period made the throttling ban them.
  		 */
  		Unauthorized: 401,
  		/**
  		 * 404 : The item you seek or wish to manipulate was not found
  		 */
  		NotFound: 404,
  		/**
  		 * 405 : The method you tried to use is not allowed
  		 */
  		MethodNotAllowed: 405,
  		/**
  		 * 500 : This is an unexpected server error.
  		 */
  		InternalServerError: 500,
  		/**
  		 * 501 : You are trying to execute a method that is not implemented. This can
  		 * happen when you execute a method that is not supported by the specific
  		 * datatype or if you misspelled a method name in the request.
  		 */
  		NotImplemented: 501
  	}


  	/**
  	 * The location of the Opera Link REST API
  	 * @default 'https://link.api.opera.com/rest/'
  	 * @type String 
  	 */
  	this.apiurl = 'https://link.api.opera.com/rest/';

  	/**
  	 * If true, the library will print information about requests using console.log.
  	 * @default false
  	 * @type Boolean
  	 */
  	this.debug = false;

  	/**
  	 * If true, the results of actions that only return one object will be 
  	 * simplified from an array containing one object to just the one object.
  	 * @default true
  	 * @type Boolean
  	 */
  	this.simplifyResults = true;

  	/**
  	 * If using this library outside of extensions, opera.link.requestToken will
  	 * call this function instead of opera.extension.tabs.create to show the user
  	 * the authorization page. The function should take one parameter, the url
  	 * of the authorization page.
  	 * @default null
  	 * @type Function(url)
  	 */
  	this.authorizeFunction = null;

  	/**
  	 * Sets the storage object used by saveToken and loadToken
  	 * @default widget.preferences if available, otherwise localStorage
  	 * @type Storage
  	 */
  	this.storage = (widget && widget.preferences) ? widget.preferences : localStorage;


  	/**
  	 * Authentication parameters for OAuth
  	 * @private
  	 */
  	var accessor = {
  		consumerKey : null,
  		consumerSecret: null,
  		token: null,
  		tokenSecret: null,
  	}

  	/**
  	 * Parameters used for OAuth authentication. Don't change these unless you 
  	 * know what you're doing.
  	 */
  	this.provider = {
  		signatureMethod: 'HMAC-SHA1',
  		requestTokenURL: 'https://auth.opera.com/service/oauth/request_token',
  		userAuthorizationURL: 'https://auth.opera.com/service/oauth/authorize',
  		accessTokenURL: 'https://auth.opera.com/service/oauth/access_token',
  	}


  	/**
  	 * Sends an OAuth GET request to the specified URL
  	 * @param {String} url The location to send the request
  	 * @param {Object} params The data to send. Use null for no data
  	 * @param {Function(xhr)} callback Function called when the request completes.
  	 *		The callback is passed one argument: the XMLHttpRequest object used
  	 */
  	this.get = function(url, params, callback) {
  		var message = {
  			action: url,
  			method: 'GET',
  			parameters: params
  		}

  		OAuth.completeRequest(message, accessor);
  		url += '?' + OAuth.formEncode(message.parameters);

  		var xhr = new XMLHttpRequest();
  		xhr.onreadystatechange = function() {
  			if (xhr.readyState == 4)
  				callback(xhr);
  		}

  		xhr.open(message.method, url, true);
  		xhr.send(null);

  		if (this.debug)
  			console.debug('GET', url);
  	}

  	/**
  	 * Sends an OAuth POST request to the specified URL
  	 * @param {String} url The location to send the request
  	 * @param {Object} params The data to send. Use null for no data
  	 * @param {Function(xhr)} callback Function called when the request completes.
  	 *		The callback is passed one argument: the XMLHttpRequest object used.
  	 */
  	this.post = function(url, params, callback) {
  		var message = {
  			action: url,
  			method: 'POST',
  			parameters: null	// parameters do not get signed when posting JSON data
  		}

  		var requestBody = JSON.stringify(params);
  		OAuth.completeRequest(message, accessor);
  		var authorizationHeader = OAuth.getAuthorizationHeader('', message.parameters);

  		var xhr = new XMLHttpRequest();
  		xhr.onreadystatechange = function() {
  			if (xhr.readyState == 4)
  				callback(xhr);
  		}

  		xhr.open(message.method, message.action, true);
  		xhr.setRequestHeader('Authorization', authorizationHeader);
  		xhr.setRequestHeader('Content-Type', 'application/json');
  		xhr.send(requestBody);

  		if (this.debug)
  			console.debug('POST', url, message.parameters);
  	}

  	/**
  	 * Sets the OAuth consumer key and secret. These are given to you when you
  	 * set up a new application with Opera Link and are specific to your application.
  	 * @param {String} key The application's consumer key
  	 * @param {String} secret The application's consumer secret
  	 */
  	this.consumer = function(key, secret) {
  		accessor.consumerKey = key;
  		accessor.consumerSecret = secret;
  	}

  	/**
  	 * Sets the OAuth access token and token secret. These are specific to each user.
  	 * @param {String} token The user's access token
  	 * @param {String} secret The user's access token secret
  	 */
  	this.authorize = function(token, secret) {
  		accessor.token = token;
  		accessor.tokenSecret = secret;
  	}

  	/**
  	 * Unsets the OAuth access token and token secret. To clear tokens that are
  	 * saved to storage, use clearSavedToken() instead.
  	 */
  	this.deauthorize = function() {
  		accessor.token = null;
  		accessor.tokenSecret = null;
  	}

  	/**
  	 * Requests a new request token. This will open a new tab where the user can
  	 * grant access to your application. The resulting request token, token secret,
  	 * and 6-digit verifier must be used with opera.link.getAccessToken to get a
  	 * permanent access token.
  	 * @param {Function(data)} callback Function that is called if the request
  	 *		succeeds. The callback is passed one argument, an object with two
  	 *		properties: "token", the temporary request token, and "secret", the
  	 *		secret that goes with the token.
  	 * @param {Function(xhr)} [error] Function that is called if the request fails. 
  	 *		The function is passed one argument: the XMLHttpRequest object used.
  	 */
  	this.requestToken = function(callback, error) {
  		this.getRequestToken(function success(e) {
  			opera.link.authorizeRequestToken(e.token);
  			callback(e);
  		}, error);
  	}

  	/**
  	 * Requests a new access token.
  	 * @param {String} requestToken The request token
  	 * @param {String} requestSecret The request token secret
  	 * @param {String} verifier The 6-digit verifier code
  	 * @param {Function(data)} callback Function that is called if the request
  	 *		succeeds. The callback is passed one argument, an object with two
  	 *		properties: "token", the access token, and "secret", the secret that 
  	 *		goes with the token.
  	 * @param {Function(xhr)} [error] Function that is called if the request fails. 
  	 *		The function is passed one argument: the XMLHttpRequest object used.
  	 */
  	this.getAccessToken = function(requestToken, requestSecret, verifier, callback, error) {
  		this.authorize(requestToken, requestSecret);

  		this.get(this.provider.accessTokenURL, {
  			'oauth_signature_method': this.provider.signatureMethod,
  			'oauth_verifier': verifier,
  		}, function(xhr) {
  			if (xhr.status == 200) {
  				var params = parseResponse(xhr.responseText);
  				opera.link.authorize(params.oauth_token, params.oauth_token_secret);
  				callback({token: params.oauth_token, secret: params.oauth_token_secret});
  			}
  			else if (error)
  				error(xhr);
  		});
  	}

  	/**
  	 * Tests whether the current authentication tokens are valid
  	 * @param {Function(success)} callback Function which is called with the 
  	 *		result of the test. The function is passed one argument: true if 
  	 *		the authorization parameters are correct or false otherwise.
  	 */
  	this.testAuthorization = function(callback) {
  		this.get(this.apiurl + 'bookmark', null, function(xhr) {
  			callback(xhr.status != opera.link.response.Unauthorized
  			      && xhr.status < 500); // 50x error is a server error.
  		});
  	}




  	this.getRequestToken = function(callback, error) {
  		this.get(this.provider.requestTokenURL, {
  				'oauth_signature_method': this.provider.signatureMethod,
  				'oauth_callback': 'oob',
  			}, function (xhr) {		
  				if (xhr.status == 200) {
  					var params = parseResponse(xhr.responseText);
  					callback({token: params.oauth_token, secret: params.oauth_token_secret});
  				}
  				else if (error)
  					error(xhr);
  			}
  		);
  	}

  	this.authorizeRequestToken = function(requestToken) {
  		var message = {
  			action: this.provider.userAuthorizationURL,
  			method: 'GET',
  			parameters: {
  				'oauth_signature_method': this.provider.signatureMethod,
  				'oauth_callback': 'oob',
  				'oauth_token': requestToken,
  			}
  		}

  		OAuth.completeRequest(message, accessor);
  		var url = message.action + '?' + OAuth.formEncode(message.parameters);

  		if (this.authorizeFunction)
  			this.authorizeFunction(url)
  		else
  			opera.extension.tabs.create({url: url, focused: true});
  	}

  	/**
  	 * Saves the current OAuth token and token secret to storage in the values
  	 * oauth_token and oauth_secret.
  	 */
  	this.saveToken = function() {
  		this.storage['oauth_token'] = JSON.stringify(accessor.token);
  		this.storage['oauth_secret'] = JSON.stringify(accessor.tokenSecret);
  	}

  	/**
  	 * Loads the OAuth token and token secret stored in the values oauth_token 
  	 * and oauth_secret.
  	 * @returns {Boolean} True if there were token values to load, false otherwise
  	 */
  	this.loadToken = function() {
  		var token = JSON.parse(this.storage['oauth_token'] || null);
  		var secret = JSON.parse(this.storage['oauth_secret'] || null);

  		if (token && secret) {
  			this.authorize(token, secret);
  			return true;
  		}
  		return false;
  	}

  	/**
  	 * Deletes the saved OAuth token and token secret from storage
  	 */
  	this.clearSavedToken = function() {
  		this.storage.removeItem('oauth_token');
  		this.storage.removeItem('oauth_secret');
  	}


  	/**
  	 * Parses the response of a token request
  	 * @private
  	 */
  	var parseResponse = function(q) {
  		var items = q.split('&');
  		var result = {};
  		for (var i = 0; i < items.length; i++) {
  			var temp = items[i].split('=');
  			var key = decodeURIComponent(temp[0].replace(/\+/g, '%20'));
  			var value = decodeURIComponent(temp[1].replace(/\+/g, '%20'));
  			result[key] = value;
  		}
  		return result;
  	}
  }


  /**
   * @namespace
   * @desc Utility methods and methods common to all datatypes
   */
  opera.link.util = new function OperaLinkUtils() {

  	/**
  	 * Gets the properties of the requested item
  	 * @param {String} datatype The item type
  	 * @param {String} item The item id
  	 * @param {null|Object} params Extra parameters for the request. 
  	 *		Use null if no parameters are needed.
  	 * @param {Function(data)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.get = function(datatype, item, params, callback) {
  		var url = opera.link.apiurl + datatype + '/' + item;
  		if (url[url.length - 1] != '/')
  			url += '/';

  		opera.link.get(url, completeParams(params), function(xhr) {
  			var response = xhr.status == opera.link.response.Ok ? 
  				JSON.parse(xhr.responseText || 'null') : xhr.responseText;
  			callback({
  				status: xhr.status,
  				response: response,
  			});
  		});
  	}

  	/**
  	 * Sends a POST request to Opera Link
  	 * @param {String} method One of the following: create, delete, trash, update, or move
  	 * @param {String} datatype The item type
  	 *	@param {null|String} item The id of the item to modify. Use null if not applicable
  	 * @param {Object} params Parameters for the request. Required parameters
  	 *		depend on the method and datatype used
  	 *	@param {Function(data)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.post = function(method, datatype, item, params, callback) {
  		var url = opera.link.apiurl + datatype + '/' + (item || '');
  		if (url[url.length - 1] != '/')
  			url += '/';

  		params = completeParams(params);
  		params.api_method = method;

  		opera.link.post(url, params, function(xhr) {
  			var response = xhr.status == opera.link.response.Ok ? 
  				JSON.parse(xhr.responseText || 'null') : xhr.responseText;
  			callback({
  				status: xhr.status,
  				response: response,
  			});
  		});
  	}

  	/**
  	 * Returns an image data URL suitable for use when creating bookmarks
  	 * @param {HTMLImageElement} image The image to convert
  	 * @param {Number} [size] The size of the icon (defaults to 16)
  	 * @returns {String} A data URL of the icon formatted as image/png
  	 */
  	this.makeIcon = function(image, size) {
  		size = size || 16;

  		var canvas = document.createElement('canvas');
  		canvas.width = size;
  		canvas.height = size;
  		var ctx = canvas.getContext('2d');
  		ctx.drawImage(image, 0, 0, size, size);
  		return canvas.toDataURL('image/png');
  	}

  	/**
  	 * Returns an image data URL suitable for use when creating bookmarks
  	 * Make sure to allow access to the image in config.xml or this function will
  	 * fail silently without calling the callback function.
  	 * @param {String} src The location of the icon
  	 * @param {Function(dataurl)} callback A function which will be called with 
  	 *		the result of the request. The function is passed one argument: 
  	 *		either the icon encoded as a data URL, or null if the request failed
  	 *	@param {Number} [size] The size of the icon (defaults to 16)
  	 */
  	this.getIcon = function(src, callback, size) {
  		var img = new Image();
  		size = size || 16
  		img.onload = function() {
  			callback(opera.link.util.makeIcon(img, size));
  		}
  		img.onerror = function() {
  			callback(null);
  		}

  		img.src = src;
  	}


  	/**
  	 * Helper function to simplify results of requests that only return one item.
  	 * Replaces single element arrays with the one element.
  	 * @param {Object} data The result object
  	 * @param {Function(result)} callback The original callback function
  	 */
  	this.simplify = function(data, callback) {
  		if (opera.link.simplifyResults && data.response.length == 1) 
  			data.response = data.response[0];

  		callback(data);
  	}


  	/**
  	 * @private
  	 */
  	var completeParams = function(params) {
  		if (!params)
  			params = {};

  		params.api_output = 'json';
  		return params;
  	}
  }


  /**
   * @namespace
   * @desc Accesses and/or manipulates synchronized bookmarks
   */
  opera.link.bookmarks = new function OperaLinkBookmarks() {

  	var type = 'bookmark';
  	var util = opera.link.util;

  	/**
  	 * Gets a bookmark or group of bookmarks
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.get = function(item, callback) {
  		util.get(type, item, null, callback);
  	}


  	/**
  	 * Gets an array of all bookmarks inside the root folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 *	Gets an array of all bookmarks inside a folder
  	 *	@param {String} id The id of the parent folder
  	 *	@param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.getAll = function(callback) {
  		var parent = null;
  		if (typeof callback == 'string') {
  			parent = arguments[0];
  			callback = arguments[1];
  		}

  		var item = parent ? parent + '/descendants' : 'descendants';
  		item = item.replace('//', '/');
  		util.get(type, item, null, callback);
  	}

  	/**
  	 * Creates a new bookmark
  	 * @param {Object} params The bookmark's properties
  	 * @param {Function} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 * Creates a new bookmark inside a folder
  	 * @param {Object} params The bookmark's properties
  	 * @param {String} parent The id of the parent folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.create = function(params) {
  		var parent = null;
  		var callback = arguments[1];
  		if (typeof callback == 'string') {
  			parent = arguments[1];
  			callback = arguments[2];
  		}

  		params.item_type = 'bookmark';
  		util.post('create', type, parent, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Creates a new bookmark folder
  	 * @param {Object} params The bookmark folder's properties
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 * Creates a new bookmark folder inside a folder
  	 * @param {Object} params The bookmark folder's properties
  	 * @param {String} parent The id of the parent folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.createFolder = function(params) {
  		var parent = null;
  		var callback = arguments[1];
  		if (typeof callback == 'string') {
  			parent = arguments[1];
  			callback = arguments[2];
  		}

  		params.item_type = 'bookmark_folder';
  		util.post('create', type, parent, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Creates a new bookmark separator
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 * Creates a new bookmark separator inside a folder
  	 * @param {String} parent The id of the parent folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.createSeparator = function(callback) {
  		var parent = null;
  		if (typeof callback == 'string') {
  			parent = arguments[0];
  			callback = arguments[1];
  		}

  		var params = {item_type: 'bookmark_separator'};
  		util.post('create', type, parent, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Permanently deletes a bookmark, folder, or separator
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.deleteItem = function(item, callback) {
  		util.post('delete', type, item, null, callback);
  	}

  	/**
  	 * Sends a bookmark, folder, or separator to the trash
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.trash = function(item, callback) {
  		util.post('trash', type, item, null, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Updates a bookmark or folder with new properties
  	 * @param {String} item The item's id
  	 * @param {Object} params The new properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.update = function(item, params, callback) {
  		util.post('update', type, item, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Moves a bookmark, folder, or separator
  	 * @param {String} item The item's id
  	 * @param {String} ref The id of a reference item
  	 * @param {String} pos The new position of the item relative to the reference item.
  	 *		Use one of the following: into, after, or before
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.move = function(item, ref, pos, callback) {
  		var params = {
  			reference_item: ref,
  			relative_position: pos
  		}
  		util.post('move', type, item, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}
  }

  /**
   * @namespace
   * @desc Accesses and/or manipulates synchronized notes
   */
  opera.link.notes = new function OperaLinkNotes() {

  	var type = 'note';
  	var util = opera.link.util;

  	/**
  	 * Gets a bookmark or group of bookmarks
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.get = function(item, callback) {
  		util.get(type, item, null, callback);
  	}

  	/**
  	 * Gets an array of all notes inside the root folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 *	Gets an array of all notes inside a folder
  	 *	@param {String} id The id of the parent folder
  	 *	@param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.getAll = function(callback) {
  		var parent = null;
  		if (typeof callback == 'string') {
  			parent = arguments[0];
  			callback = arguments[1];
  		}

  		var item = parent ? parent + '/descendants' : 'descendants';
  		item = item.replace('//', '/');
  		util.get(type, item, null, callback);
  	}

  	/**
  	 * Creates a new note
  	 * @param {Object} params The note's properties
  	 * @param {Function} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 * Creates a new note inside a folder
  	 * @param {Object} params The note's properties
  	 * @param {String} parent The id of the parent folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.create = function(params) {
  		var parent = null;
  		var callback = arguments[1];
  		if (typeof callback == 'string') {
  			parent = arguments[1];
  			callback = arguments[2];
  		}

  		params.item_type = 'note';
  		util.post('create', type, parent, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Creates a new note folder folder
  	 * @param {Object} params The note folder's properties
  	 * @param {Function} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 * Creates a new note folder inside a folder
  	 * @param {Object} params The note folder's properties
  	 * @param {String} parent The id of the parent folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.createFolder = function(params) {
  		var parent = null;
  		var callback = arguments[1];
  		if (typeof callback == 'string') {
  			parent = arguments[1];
  			callback = arguments[2];
  		}

  		params.item_type = 'note_folder';
  		util.post('create', type, parent, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Creates a new note separator folder
  	 * @param {Function} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 *//**
  	 * Creates a new note separator inside a folder
  	 * @param {String} parent The id of the parent folder
  	 * @param {Function(result)} callback A function which will be called with the result
  	 *		of the request. The callback function is passed one argument, an object 
  	 *		with two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.createSeparator = function(callback) {
  		var parent = null;
  		if (typeof callback == 'string') {
  			parent = arguments[0];
  			callback = arguments[1];
  		}

  		var params = {item_type: 'note_separator'};
  		util.post('create', type, parent, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Permanently deletes a note, folder, or separator
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.deleteItem = function(item, callback) {
  		util.post('delete', type, item, null, callback);
  	}

  	/**
  	 * Sends a note, folder, or separator to the trash
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.trash = function(item, callback) {
  		util.post('trash', type, item, null, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Updates a note or folder with new properties
  	 * @param {String} item The item's id
  	 * @param {Object} params The new properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.update = function(item, params, callback) {
  		util.post('update', type, item, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Moves a note, folder, or separator
  	 * @param {String} item The item's id
  	 * @param {String} ref The id of a reference item
  	 * @param {String} pos The new position of the item relative to the reference item.
  	 *		Use one of the following: into, after, or before
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.move = function(item, ref, pos, callback) {
  		var params = {
  			reference_item: ref,
  			relative_position: pos
  		}
  		util.post('move', type, item, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}
  }

  /**
   * @namespace
   * @desc Accesses and/or manipulates synchronized search engines
   */
  opera.link.searchengines = new function OperaLinkSearchEngines() {

  	var type = 'search_engine';
  	var util = opera.link.util;

  	/**
  	 * Gets a search engine or group of search engines
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.get = function(item, callback) {
  		util.get(type, item, null, callback);
  	}

  	/**
  	 * Gets an array of all search engines
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.getAll = function(callback) {
  		util.get(type, 'children', null, callback);
  	}

  	/**
  	 * Creates a new search engine
  	 * @param {Object} params The search engine's properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.create = function(params, callback) {
  		params.item_type = 'search_engine';
  		util.post('create', type, null, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Permanently deletes a search engine
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.deleteItem = function(item, callback) {
  		util.post('delete', type, item, null, callback);
  	}

  	/**
  	 * Updates a search engine with new properties
  	 * @param {String} item The item's id
  	 * @param {Object} params The new properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.update = function(item, params, callback) {
  		util.post('update', type, item, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}
  }

  /**
   * @namespace
   * @desc Access and/or manipulates synchronized speed dial entries
   */
  opera.link.speeddial = new function OperaLinkSpeedDial() {

  	var type = 'speeddial';
  	var util = opera.link.util;

  	/**
  	 * Gets a speed dial entry
  	 * @param {Number} position The number of the speed dial
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.get = function(position, callback) {
  		util.get(type, position, null, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Gets an array containing all speed dial entries
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.getAll = function(callback) {
  		util.get(type, 'children', null, callback);
  	}

  	/**
  	 * Creates a new speed dial entry
  	 * @param {Object} params The speed dial entry's properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.create = function(params, callback) {
  		params.item_type = 'search_engine';
  		util.post('create', type, null, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Permanently deletes a speed dial entry
  	 * @param {Number} position The number of the speed dial entry
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.deleteItem = function(position, callback) {
  		util.post('delete', type, position, null, callback);
  	}

  	/**
  	 * Updates a speed dial entry with new properties
  	 * @param {Number} position The item's id
  	 * @param {Object} params The new properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.update = function(position, params, callback) {
  		util.post('update', type, position, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}
  }

  /**
   * @namespace 
   * @desc Access and/or manipulates synchronized URL filters
   */
  opera.link.urlfilter = new function OperaLinkUrlFilter() {

  	var type = 'urlfilter';
  	var util = opera.link.util;

  	/**
  	 * Gets a url filter
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.get = function(item, callback) {
  		util.get(type, item, null, callback);
  	}

  	/**
  	 * Gets an array of all url filters
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.getAll = function(callback) {
  		util.get(type, 'children', null, callback);
  	}

  	/**
  	 * Creates a new url filter
  	 * @param {Object} params The filter's properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.create = function(params, callback) {
  		params.item_type = 'urlfilter';
  		util.post('create', type, null, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}

  	/**
  	 * Permanently deletes a url filter
  	 * @param {String} item The item's id
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.deleteItem = function(item, callback) {
  		util.post('delete', type, item, null, callback);
  	}

  	/**
  	 * Updates a url filter with new properties
  	 * @param {String} item The item's id
  	 * @param {Object} params The new properties
  	 * @param {Function(result)} callback Function which is called with the result
  	 *		of the request. The function is passed one argument, an object with 
  	 *		two properties: "status", the response code, and "response", the JSON 
  	 *		parsed response body.
  	 */
  	this.update = function(item, params, callback) {
  		util.post('update', type, item, params, function(data) { 
  			opera.link.util.simplify(data, callback);
  		});
  	}
  }
  
  var tempToken = null, authorized = false, tokenRequester = null;
  opera.link.consumer('5ylmz7Z2ccww4bh2dc1neMv4b4namBJq', 'XcrGsCDEXRprPLzz9Oo3D0Bz9PwVaCEx');
  function requestFailed(xhr) {
  	opera.postError(xhr.toString);
  	opera.postError('error: ' + xhr.status + ' ' + xhr.statusText);
  }

  function getRequestToken() {
  	opera.link.requestToken(function(e) {
  		tempToken = {
  			token : e.token,
  			secret : e.secret
  		};
  	}, requestFailed);
  }

  function saveAccessToken() {
  	opera.link.saveToken();
  	tempToken = null;
  	authorized = true;

  	if(tokenRequester) {
  		tokenRequester.postMessage({
  			action : 'authorized'
  		});
  		tokenRequester = null;
  	}
  }
  
  function initLink() {
  	document.getElementById("link-status").className = "checking...";
  	if(opera.link.loadToken()) {
  		opera.link.testAuthorization(function(result) {
  			authorized = result;
  			document.getElementById("configure-link").className = "disabled";
  			document.getElementById("disable-link").className = "";
  			document.getElementById("link-status").className = "";
  		});
  	} else {
  		document.getElementById("configure-link").className = "";
  		document.getElementById("disable-link").className = "disabled";
  		document.getElementById("link-status").className = "disabled";
  	}
  }

  window.addEventListener("DOMContentLoaded", function() {
  	opera.link.consumer('5ylmz7Z2ccww4bh2dc1neMv4b4namBJq', 'XcrGsCDEXRprPLzz9Oo3D0Bz9PwVaCEx');
  	document.getElementById("export").addEventListener("click", handleExport, false);
  	document.getElementById("import").addEventListener("change", handleFileUpload, false);
  	var sync = document.getElementById("syncInterval");
  	sync.value = localStorage.getItem("syncInterval") || 5;
  	sync.addEventListener("change", handleChangeSyncInterval, false);
  	var lock = document.getElementById("lockAutomatically");
  	lock.checked = (localStorage.getItem("lockAutomatically")==1) ? "checked" : "";
  	lock.addEventListener("change", handleLock);

  	initLink();

  }, false);
  function handleLock(evt) {
  	localStorage.setItem("lockAutomatically", evt.srcElement.checked?1:0);
  }

  function handleChangeSyncInterval(evt) {
  	localStorage.setItem("syncInterval", evt.srcElement.value);
  	opera.extension.postMessage({
  		action : 'changeSyncInterval'
  	});
  }

  function handleFileUpload(evt) {
  	var file = evt.target.files[0];
  	// FileList object

  	var reader = new FileReader();

  	reader.onload = function(evt) {
  		try {
  			var importData = JSON.parse(evt.target.result);
  			if(importData.app !== "to-read-sites") {
  				throw "Wrong file";
  			}
  			var entries = JSON.parse(importData.data);
  			for(var i = 0, entry; entry = entries[i]; i++) {
  				if(entry.title === undefined || entry.url === undefined) {
  					throw "Wrong data format";
  				}
  			}
  			var currentEntries = JSON.parse(localStorage.getItem("eventsList"));
  			if(currentEntries === null) {
  				currentEntries = [];
  			}
  			currentEntries = currentEntries.concat(entries);
  			localStorage.setItem("eventsList", JSON.stringify(currentEntries));

  			opera.extension.postMessage({
  				action : "setBadge",
  				size : currentEntries.length
  			});
  			opera.extension.postMessage({
  				action : "init"
  			});
  			alert("Your sites have been imported");
  		} catch (e) {
  			alert('Could not import data: ' + e);
  		}
  	};

  	reader.readAsText(file);

  }

  function handleExport() {
  	var items = localStorage.getItem("eventsList");
  	if(items == null) {
  		alert("There is nothing to export");
  		return;
  	}
  	var elements = {
  		app : "to-read-sites",
  		version : "2",
  		"data" : items
  	};
  	window.open("data:text/plain;charset=utf-8," + escape(JSON.stringify(elements)));
  }

  function handleConfigureLink() {
  	opera.extension.postMessage({
  		action : "request_token"
  	});
  }

  function handleDisableLink() {
  	authorized = false;
  	// opera.link.deauthorize();
  	// opera.link.clearSavedToken();
  	opera.extension.postMessage({
  		action : "disable-link"
  	});
  	document.getElementById("configure-link").className = "";
  	document.getElementById("disable-link").className = "disabled";
  	document.getElementById("link-status").className = "disabled";
  }

  opera.extension.onmessage = function(e) {
  	switch (e.data.action) {
  		case 'update':
  			if(updateAction) {
  				updateAction(e.data);
  				updateAction = null;
  			}
  			break;
  		case 'import_error':
  			errorStatus('import');
  			var el = useFileApi ? $('#import_fileselect') : $('#import_textarea');
  			el.disabled = $('#import').disabled = importing = false;
  			break;
  		case 'import_done':
  			closeStatus('import');
  			var el = useFileApi ? $('#import_fileselect') : $('#import_textarea');
  			el.disabled = $('#import').disabled = importing = false;
  			break;
  		case 'authorized':
  			authorized = true;
  			initLink();
  			break;
  	}

  }
  
  
});