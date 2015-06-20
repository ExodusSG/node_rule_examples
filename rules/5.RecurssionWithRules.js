var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');
var resp_text = '';

/* Sample Rule to block a transaction if its someval is less than 10 */
var rule = {
    "condition": function(R) {
        R.when(this.someval < 10);
    },
    "consequence": function(R) {
        console.log(++this.someval, " : incrementing again till 10");
        resp_text += (this.someval + " : incrementing again till 10\n");
        R.restart();
    }
};
/* some val is 0 here, rules will recursively run till it becomes 10.
This just a mock to demo the restart feature. */
var fact = {
    "someval": 0
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
var RuleEngine = require('../index');
/* Creating Rule Engine instance and registering rule */
var R = new RuleEngine();
R.register(rule);
resp_text = '';

R.execute(req.body, function(data) {
    console.log("Finished with value", data.someval);
    resp_text += ("Finished with value : " + data.someval);
    res.json(resp_text);
});
});
module.exports = router;