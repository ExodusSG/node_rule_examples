var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');
/* Here we can see a rule which upon matching its condition,
does some processing and passes it to other rules for processing */
var rules = [{
	"name": "rule3",
   "condition": function(R) {
        R.when(this.application === "MOB");
    },
    "consequence": function(R) {
        this.isMobile = true;
        R.next();//we just set a value on to fact, now lests process rest of rules
    }
}, {
	"name": "rule3",
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
    "application": "MOB",
    "transactionTotal": 600,
    "cardType": "Credit"
};

/* GET Rule info page. */
router.get('/', function(req, res, next) {	
	  var rule_desc = "First rule is to check if it is from moble device; ";
	  rule_desc += "Second rule blocks a debit card transaction. ";
	  rule_desc += "Here we can see a rule which upon matching its condition," +
	  		"does some processing and passes it to other rules for processing"
	  res.render('rules', { title: 'Cascading Rule Example',
		  rule_id: 3,
		  description: rule_desc,
		  data: JSON.stringify(fact, null, 4) });
});

/* Submit fact for rule process */
router.post('/', function(req, res, next) {
	var db = req.db;
	var collection = db.collection('rulelist');
	collection.find({'name': 'rule3'}).toArray(	function(err, store){
		if((err == null)&& (store.length > 0)) {
			var rule_store = store[0]["store"];
			var R1 = new RuleEngine();
			R1.fromJSON(rule_store);
			var rule_items = R1.findRules({"name": "rule3"});
			if (rule_items.length > 0) {
				/* Creating Rule Engine instance and registering rule */
				var R = new RuleEngine();
				R.register(rule_items);
				R.execute(req.body, function(data) {
					var resp_text = '';
					if (data.result) {
						console.log("Valid transaction");
						resp_text += ("Valid transaction");
					} else {
						console.log("Blocked Reason:" + data.reason);
						resp_text += ("Blocked Reason:" + data.reason);
					}

					if(data.isMobile) {
						console.log("It was from a mobile device too!!");
						resp_text += ("\nIt was from a mobile device too!!");
					}
					res.json(resp_text);
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