var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* Sample Rule to block a transaction if its below 500 */
var rule = {
	"name": "rule1",
    "condition": function(R) {
        R.when(this.transactionTotal < 500);
    },
    "consequence": function(R) {
        this.result = false;
        this.reason = "The transaction was blocked as it was less than 500";
        R.stop();
    }
};
/* Fact with less than 500 as transaction, and this should be blocked */
var fact = {
    "name": "user4",
    "application": "MOB2",
    "transactionTotal": 400,
    "cardType": "Credit Card"
};

/* GET Rule info page. */
router.get('/', function(req, res, next) {
	res.render('rules', { title: 'Simple Rule Example',
		rule_id: 1,
		description: "Block when transactionTotal < 500 ",
		data: JSON.stringify(fact, null, 4) });
});

/* Submit fact for rule process */
router.post('/', function(req, res, next) {
	var db = req.db;
	var collection = db.collection('rulelist');
	collection.find({'name': 'rule1'}).toArray(	function(err, store){
		if((err == null)&& (store.length > 0)) {
			var rule_store = store[0]["store"];
			var R1 = new RuleEngine();
			R1.fromJSON(rule_store);
			var rule_item = R1.findRules({"name": "rule1"});
			if (rule_item.length > 0) {
				/* Creating Rule Engine instance and registering rule */
				var R = new RuleEngine();
				R.register(rule_item);
				
				R.execute(req.body, function(data) {
				    if (data.result) {
				        console.log("Valid transaction");
				        res.json("Valid transaction");
				    } else {
				        console.log("Blocked Reason:" + data.reason);
				    /*    console.log(res); */
				        res.json("Blocked Reason:" + data.reason); 
				    }
				});
				return ;
			}
		} 
		res.json("Cannot find rule body!!!");			
	});
});
/* Note: You have to define a variable to export router, rule, or fact etc, for others to use */
var export_objects = {"rule": rule, "router": router};
module.exports = export_objects;