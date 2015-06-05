var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* GET home page. */
router.get('/', function(req, res, next) {
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
/* Creating Rule Engine instance and registering rule */
var R = new RuleEngine();
R.register(rule);
/* Fact with less than 500 as transaction, and this should be blocked */
var fact = {
    "name": "user4",
    "application": "MOB2",
    "transactionTotal": 400,
    "cardType": "Credit Card"
};
R.execute(fact, function(data) {
    if (data.result) {
        console.log("Valid transaction");
        res.send("Valid transaction");
    } else {
        console.log("Blocked Reason:" + data.reason);
    /*    console.log(res); */
        res.send("Blocked Reason:" + data.reason); 
    }
});
});
module.exports = router;