
var AllowRuleList = function( parentObj ) {

  RuleList.call(this, parentObj);

};

AllowRuleList.prototype = Object.create( RuleList.prototype );

AllowRuleList.prototype.add = function( rule, options ) {

  var ruleObj = this.createRule(rule, options);

  if(ruleObj['rule'] !== null) {

    // Add exclude pattern to rule (@@)
    ruleObj['rule'] = "@@" + ruleObj['rule'];

    this.addRule(ruleObj);

  }

  return ruleObj['id'];

};
