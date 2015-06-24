var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');
var resp_text = '';

/* Sample Rule to block a transaction if its someval is less than 10 */
var rule = {
		"name": "rule5",
		"condition": function(R) {
        R.when(this.someval < 10);
    },
    "consequence": function(R) {
        console.log(++this.someval, " : incrementing again till 10");
        this.resp_text += (this.someval + " : incrementing again till 10\n");
        R.restart();
    }
};
/* some val is 0 here, rules will recursively run till it becomes 10.
This just a mock to demo the restart feature. */
var fact = {
		"someval": 0,
		"resp_text": ""
};

/* GET Rule info page. */
router.get('/', function(req, res, next) {	
	  var rule_desc = " Simple rule to block a transaction if its someval is less than 10. ";
	  rule_desc += "But it will repeat the rule after modified someval.";
	  res.render('rules', { title: 'Recurssion with Rule Example',
		  rule_id: 5,
		  description: rule_desc,
		  data: JSON.stringify(fact, null, 4) });
});

/* Submit fact for rule process */
router.post('/', function(req, res, next) {
	var db = req.db;
	var collection = db.collection('rulelist');
	collection.find({'name': 'rule5'}).toArray(	function(err, store){
		if((err == null)&& (store.length > 0)) {
			var rule_store = store[0]["store"];
			var R1 = new RuleEngine();
			R1.fromJSON(rule_store);
			var rule_items = R1.findRules({"name": "rule5"});
			if (rule_items.length > 0) {
				/* Creating Rule Engine instance and registering rule */
				var R = new RuleEngine();
				R.register(rule_items);
				resp_text = '';

				R.execute(req.body, function(data) {
					console.log("Finished with value", data.someval);
					resp_text += data.resp_text; 
					resp_text += ("Finished with value : " + data.someval);
					res.json(resp_text);
				});
				return;
			}
		}
		res.json("Cannot find rule body!!!");
	});
});

/* Note: You have to define a variable to export router, rule, or fact etc, for others to use */
var export_objects = {"rule": rule, "router": router};
module.exports = export_objects;