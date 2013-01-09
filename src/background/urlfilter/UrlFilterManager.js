
var UrlFilterManager = function() {
  
  OEventTarget.call(this);
  
  // Add rule list management stubs
  this.block = new BlockRuleList( this );
  this.allow = new AllowRuleList( this );
  
  // event queue manager
  this.eventQueue = {
    /*
    tabId: [ { eventdetails }, { eventDetails }, { eventDetails } ],
    ...
    */
  };
  
  // https://github.com/adblockplus/adblockpluschrome/blob/master/background.js
  
  with(require("filterClasses")) {
    this.Filter = Filter;
    this.RegExpFilter = RegExpFilter;
    this.BlockingFilter = BlockingFilter;
    this.WhitelistFilter = WhitelistFilter;
  }
  
  with(require("subscriptionClasses")) {
    this.Subscription = Subscription;
    //this.DownloadableSubscription = DownloadableSubscription;
  }
  
  this.FilterStorage = require("filterStorage").FilterStorage;
  
  this.defaultMatcher = require("matcher").defaultMatcher;
  
  // https://github.com/adblockplus/adblockpluschrome/blob/master/webrequest.js
  
  var self = this;
  
  var frames = {};
  
  function recordFrame(tabId, frameId, parentFrameId, frameUrl) {
    if (!(tabId in frames))
      frames[tabId] = {};
    frames[tabId][frameId] = {url: frameUrl, parent: parentFrameId};
  }

  function getFrameData(tabId, frameId) {
    if (tabId in frames && frameId in frames[tabId])
      return frames[tabId][frameId];
    else if (frameId > 0 && tabId in frames && 0 in frames[tabId])
    {
      // We don't know anything about javascript: or data: frames, use top frame
      return frames[tabId][0];
    }
    return null;
  }

  function getFrameUrl(tabId, frameId) {
    var frameData = getFrameData(tabId, frameId);
    return (frameData ? frameData.url : null);
  }

  function forgetTab(tabId) {
    delete frames[tabId];
  }
  
  function checkRequest(type, tabId, url, frameId) {
    if (isFrameWhitelisted(tabId, frameId))
      return false;

    var documentUrl = getFrameUrl(tabId, frameId);
    if (!documentUrl)
      return false;

    var requestHost = extractHostFromURL(url);
    var documentHost = extractHostFromURL(documentUrl);
    var thirdParty = isThirdParty(requestHost, documentHost);
    
    return self.defaultMatcher.matchesAny(url, type, documentHost, thirdParty);
  }
  
  function isFrameWhitelisted(tabId, frameId, type) {
    var parent = frameId;
    var parentData = getFrameData(tabId, parent);
    while (parentData)
    {
      var frame = parent;
      var frameData = parentData;

      parent = frameData.parent;
      parentData = getFrameData(tabId, parent);

      var frameUrl = frameData.url;
      var parentUrl = (parentData ? parentData.url : frameUrl);
      if ("keyException" in frameData || isWhitelisted(frameUrl, parentUrl, type))
        return true;
    }
    return false;
  }
  
  function isWhitelisted(url, parentUrl, type)
  {
    // Ignore fragment identifier
    var index = url.indexOf("#");
    if (index >= 0)
      url = url.substring(0, index);

    var result = self.defaultMatcher.matchesAny(url, type || "DOCUMENT", extractHostFromURL(parentUrl || url), false);
    return (result instanceof self.WhitelistFilter ? result : null);
  }
  
  // Parse a single web request url and decide whether we should block or not
  function onBeforeRequest(details) {
    
    if (details.tabId == -1) {
      return {};
    }

    var type = details.type;
    
    if (type == "main_frame" || type == "sub_frame") {
      recordFrame(details.tabId, details.frameId, details.parentFrameId, details.url);
    }

    // Type names match Mozilla's with main_frame and sub_frame being the only exceptions.
    if (type == "sub_frame") {
      type = "SUBDOCUMENT";
    } else if (type == "main_frame") {
      type = "DOCUMENT";
    } else {
      type = type.toUpperCase();
    }

    var frame = (type != "SUBDOCUMENT" ? details.frameId : details.parentFrameId);
    
    var filter = checkRequest(type, details.tabId, details.url, frame);
    
    if (filter instanceof self.BlockingFilter) {
      
      var msgData = {
        "action": "___O_urlfilter_contentblocked",
        "data": {
          // send enough data so that we can fire the event in the injected script
          "url": details.url
        }
      };

      // Broadcast contentblocked event control message (i.e. beginning with '___O_')
      // towards the tab matching the details.tabId value
      // (but delay it until the content script is loaded!)
      if(self.eventQueue[details.tabId] !== undefined && self.eventQueue[details.tabId].ready === true) {
        
        // tab is already online so send contentblocked messages
        chrome.tabs.sendMessage(
          details.tabId, 
          msgData,
          function() {}
        );
        
      } else {
        
        // queue up this event
        if(self.eventQueue[details.tabId] === undefined) {
          self.eventQueue[details.tabId] = { ready: false, items: [] };
        }
        
        self.eventQueue[details.tabId].items.push( msgData );
        
      }
      
      return { cancel: true };
      
    } else if (filter instanceof self.WhitelistFilter) {
      
      var msgData = {
        "action": "___O_urlfilter_contentunblocked",
        "data": {
          // send enough data so that we can fire the event in the injected script
          "url": details.url
        }
      };

      // Broadcast contentblocked event control message (i.e. beginning with '___O_')
      // towards the tab matching the details.tabId value
      // (but delay it until the content script is loaded!)
      if(self.eventQueue[details.tabId] !== undefined && self.eventQueue[details.tabId].ready === true) {
        
        // tab is already online so send contentblocked messages
        chrome.tabs.sendMessage(
          details.tabId, 
          msgData,
          function() {}
        );
        
      } else {
        
        // queue up this event
        if(self.eventQueue[details.tabId] === undefined) {
          self.eventQueue[details.tabId] = { ready: false, items: [] };
        }
        
        self.eventQueue[details.tabId].items.push( msgData );
        
      }
      
      return {};
    
    } else {
      
      return {};
      
    }
  }
  
  // Listen for webRequest beforeRequest events and block
  // if a rule matches in the associated block RuleList
  chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: [ "http://*/*", "https://*/*" ] }, [ "blocking" ]);
  
  // Wait for tab to add event listeners for urlfilter and then drain queued up events to that tab
  OEX.addEventListener('controlmessage', function( msg ) {
    
    if( !msg.data || !msg.data.action ) {
      return;
    }
    
    if( msg.data.action !== '___O_urlfilter_DRAINQUEUE' ) {
      return;
    }
    
    // Drain queued events belonging to this tab
    var tabId = msg.source.tabId;
    
    if( self.eventQueue[tabId] !== undefined ) {
      
      for(var i = 0, l = self.eventQueue[tabId].items.length; i < l; i++) {
       
        msg.source.postMessage(self.eventQueue[tabId].items[i]);
        
      }
      
      self.eventQueue[tabId].ready = true; // set to resolved (true)
      self.eventQueue[tabId].items = [];
      
    }
    
  });
  
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    
    switch(changeInfo.status) {
      
      case 'loading':
        // kill previous events queue
        self.eventQueue[tabId] = { ready: false, items: [] }; 
        
        break;
        
      case 'complete':
      
        if(self.eventQueue[tabId] !== undefined && self.eventQueue[tabId].ready !== undefined ) {
          
          self.eventQueue[tabId].ready = true;
          
        }
        
        break;

    }
    
  });
  
};

UrlFilterManager.prototype = Object.create( OEventTarget.prototype );

// URL Filter Resource Types (bit-mask values)

UrlFilterManager.prototype.RESOURCE_OTHER             = 0x00000001; //     1
UrlFilterManager.prototype.RESOURCE_SCRIPT            = 0x00000002; //     2
UrlFilterManager.prototype.RESOURCE_IMAGE             = 0x00000004; //     4
UrlFilterManager.prototype.RESOURCE_STYLESHEET        = 0x00000008; //     8
UrlFilterManager.prototype.RESOURCE_OBJECT            = 0x00000010; //    16
UrlFilterManager.prototype.RESOURCE_SUBDOCUMENT       = 0x00000020; //    32
UrlFilterManager.prototype.RESOURCE_DOCUMENT          = 0x00000040; //    64
UrlFilterManager.prototype.RESOURCE_REFRESH           = 0x00000080; //   128
UrlFilterManager.prototype.RESOURCE_XMLHTTPREQUEST    = 0x00000800; //  2048
UrlFilterManager.prototype.RESOURCE_OBJECT_SUBREQUEST = 0x00001000; //  4096
UrlFilterManager.prototype.RESOURCE_MEDIA             = 0x00004000; // 16384
UrlFilterManager.prototype.RESOURCE_FONT              = 0x00008000; // 32768
