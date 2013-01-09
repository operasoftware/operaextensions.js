
var RuleList = function( parentObj ) {

  this._parentObj = parentObj;

  // Runtime Rule object storage collection
  this._collection = [];
  
  this.createRule = function(rule, options) {
    
    rule += ""; // force rule argument to be a string

    var ruleId = Math.floor( Math.random() * 1e15 );

    // Sanitize options, if any

    options = options || {};

    var opts = {
      'includeDomains': options.includeDomains || [],
      'excludeDomains': options.excludeDomains || [],
      'resources': options.resources || 0xFFFFFFFF,
      'thirdParty': options.thirdParty || null
    };

    //  Process options and append to rule argument

    var filterOptions = [];

    var includeDomainsStr = "";
    var excludeDomainsStr = "";

    if(opts.includeDomains && opts.includeDomains.length > 0) {

      for(var i = 0, l = opts.includeDomains.length; i < l; i++) {
        if(includeDomainsStr.length > 0) includeDomainsStr += "|"; // add domain seperator (pipe)
        includeDomainsStr += opts.includeDomains[i];
      }

    }

    if(opts.excludeDomains && opts.excludeDomains.length > 0) {

      for(var i = 0, l = opts.excludeDomains.length; i < l; i++) {
        if(excludeDomainsStr.length > 0 || includeDomainsStr.length > 0) excludeDomainsStr += "|"; // add domain seperator (pipe)
        excludeDomainsStr += "~" + opts.excludeDomains[i];
      }

    }

    if(includeDomainsStr.length > 0 || excludeDomainsStr.length > 0) {

      var domainsStr = "domain=" + includeDomainsStr + excludeDomainsStr;

      filterOptions.push(domainsStr);

    }

    if(opts.resources && opts.resources !== 0xFFFFFFFF) {

      var typeMap = {
        1: "other",
        2: "script",
        4: "image",
        8: "stylesheet",
        16: "object",
        32: "subdocument",
        64: "document",
        128: "refresh",
        2048: "xmlhttprequest",
        4096: "object_subrequest",
        16384: "media",
        32768: "font"
      };

      var resourcesListStr = "";

      for(var i = 0, l = 31; i < l; i ++) {
        if(((opts.resources >> i) % 2 != 0) === true) {
          var typeStr = typeMap[ Math.pow(2, i) ];
          if(typeStr) {
            if(resourcesListStr.length > 0) resourcesListStr += ",";
            resourcesListStr += typeStr;
          }
        }
      }

      if(resourcesListStr.length > 0) {
        filterOptions.push(resourcesListStr);
      }

    }

    if(opts.thirdParty) {
      filterOptions.push("third-party");
    }

    if(filterOptions.length > 0) {
      rule += "$";

      for(var i = 0, l = filterOptions.length; i < l; i++) {
        if(i !== 0) rule += ","; // add filter options seperator (comma)
        rule += filterOptions[i];
      }
    }
    
    return { 'id': ruleId, 'rule': rule };
    
  }
  
  this.addRule = function( ruleObj ) {
    
    // Parse rule to a Filter object
      var filter = this._parentObj.Filter.fromText( ruleObj['rule'] );
      
      // Add rule's filter object to AdBlock FilterStorage
      this._parentObj.FilterStorage.addFilter(filter);

      // Add rule to current RuleList collection
      this._collection.push({
        'id': ruleObj['id'],
        'filter': filter
      });
    
  }
  
  this.removeRule = function( ruleId ) {
    
    for(var i = 0, l = this._collection.length; i < l; i++) {

      if( this._collection[i]['id'] && this._collection[i]['id'] == ruleId ) {

        // Remove rule's filter object from AdBlock FilterStorage
        this._parentObj.FilterStorage.removeFilter(this._collection[i]['filter']);

        // Remove rule from current RuleList collection
        this._collection.splice(i);

        break;
      }
    }
    
  }

};

RuleList.prototype.add = function( rule, options ) {
  
  var ruleObj = this.createRule(rule, options);

  this.addRule(ruleObj);

  return ruleObj['id'];

};

RuleList.prototype.remove = function( ruleId ) {

  this.removeRule( ruleId );

};
