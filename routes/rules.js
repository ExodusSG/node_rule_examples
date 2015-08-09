var express = require('express');
var router = express.Router();
var rule1_obj = require('../rules/1.SimpleRule');
var rule2_obj = require('../rules/2.MultipleRules');
var rule3_obj = require('../rules/3.CascadingRules');
var rule4_obj = require('../rules/4.PrioritizedRules');
var rule5_obj = require('../rules/5.RecurssionWithRules');
var rule6_obj = require('../rules/6.MoreRulesAndFacts');
var LeaveType_obj = require('../rules/Rule_LeaveType');
var LeaveApproval_obj = require('../rules/Rule_LeaveApproval');

var rule1 = rule1_obj.router;
var rule2 = rule2_obj.router;
var rule3 = rule3_obj.router;
var rule4 = rule4_obj.router;
var rule5 = rule5_obj.router;
var rule6 = rule6_obj.router;
var rule_leave_type = LeaveType_obj.router;

/* GET for rule1 page. */
router.use('/1', rule1);
router.use('/2', rule2);
router.use('/3', rule3);
router.use('/4', rule4);
router.use('/5', rule5);
router.use('/6', rule6);

/* GET home page. */
router.get('/', function(req, res, next) {
  /* res.render('index', { title: 'Express' }); */
  console.log("This the home location to access rules");
  res.write("This the home location to access rules: \n");
  res.write("/1 to run SimpleRule example;\n");
  res.write("/2 to run MultipleRules example;\n");
  res.write("/3 to run CascadingRules example;\n");
  res.write("/4 to run PrioritizedRules example;\n");
  res.write("/5 to run RecurssionWithRules example;\n");
  res.write("/6 to run example for Complex Rules And Facts.\n");
  res.send();
});

/* Note: You have to define a variable to export router, rule, or fact etc, for others to use */
var export_objects = {"rule1": rule1_obj.rule, 
		"rule2": rule2_obj.rule,
		"rule3": rule3_obj.rule,
		"rule4": rule4_obj.rule,
		"rule5": rule5_obj.rule,
		"rule6": rule6_obj.rule,
		"leave_type": LeaveType_obj.rule,
		"leave_approval": LeaveApproval_obj.rule,
		"router": router};
module.exports = export_objects;
