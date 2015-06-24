var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* Set of Rules to be applied
First blocks a transaction if less than 500
Second blocks a debit card transaction.*/

/*Note that here we are not specifying which rule to apply first.
Rules will be applied as per their index in the array.
If you need to enforce priority manually, then see examples with 
prioritized rules */
var rules = [{
	"name": "rule2",
    "condition": function(R) {
        R.when(this.transactionTotal < 500);
    },
    "consequence": function(R) {
        this.result = false;
        this.reason = "The transaction was blocked as it was less than 500";
        R.stop();//stop if matched. no need to process next rule.
    }
}, {
	"name": "rule2",
    "condition": function(R) {
        R.when(this.cardType === "Debit");
    },
    "consequence": function(R) {
        this.result = false;
        this.reason = "The transaction was blocked as debit cards are not allowed";
        R.stop();
    }
}];
/* Fact with more than 500 as transaction but a Debit card, and this should be blocked */
var fact = {
    "name": "user4",
    "application": "MOB2",
    "transactionTotal": 600,
    "cardType": "Debit"
};

/* GET Rule info page. */
router.get('/', function(req, res, next) {	
	  var rule_desc = "First rule blocks a transaction if less than 500;";
	  rule_desc += "Second rule blocks a debit card transaction";
	  res.render('rules', { title: 'Multiple Rule Example',
		  rule_id: 2,
		  description: rule_desc,
		  data: JSON.stringify(fact, null, 4) });
});

/* Submit fact for rule process */
router.post('/', function(req, res, next) {	
	var db = req.db;
	var collection = db.collection('rulelist');
	collection.find({'name': 'rule2'}).toArray(	function(err, store){
		if((err == null)&& (store.length > 0)) {
			var rule_store = store[0]["store"];
			var R1 = new RuleEngine();
			R1.fromJSON(rule_store);
			var rule_items = R1.findRules({"name": "rule2"});
			if (rule_items.length > 0) {
					/* Creating Rule Engine instance and registering rule */
					var R = new RuleEngine();
					R.register(rule_items);
					R.execute(req.body, function(data) {
						if (data.result) {
							console.log("Valid transaction");
							res.json("Valid transaction");
						} else {
							console.log("Blocked Reason:" + data.reason);
							res.json("Blocked Reason:"+data.reason);
						}
					});
					return;
			}
		}
		res.json("Cannot find rule body!!!");	
	});
});
/* Note: You have to define a variable to export router, rule, or fact etc, for others to use */
var export_objects = {"rule": rules, "router": router};
module.exports = export_objects;