var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* Sample Rule to block a transaction if its below 500 */
var rule = {
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
/* Creating Rule Engine instance and registering rule */
var R = new RuleEngine();
R.register(rule);

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
});
module.exports = router;