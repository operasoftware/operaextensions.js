
var RuleList = function( parentObj ) {

  this._parentObj = parentObj;

  // Runtime Rule object storage collection
  this._collection = [];

};

// Implemented in AllowRuleList or BlockRuleList
RuleList.prototype.add = function( rule, options ) {};

RuleList.prototype.remove = function( ruleId ) {

  for(var i = 0, l = this._collection.length; i < l; i++) {

    if( this._collection[i]['id'] && this._collection[i]['id'] == ruleId ) {

      // Remove rule's filter object from AdBlock FilterStorage
      this._parentObj.FilterStorage.removeFilter(this._collection[i]['filter']);

      // Remove rule from current RuleList collection
      this._collection.splice(i);

      break;
    }
  }

};
