var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');
var resp_text='';

var rules = [
    /**** Rule 1 ****/
    {
        "name": "transaction minimum 500",
        "priority": 3,
        "on": true,
        "condition": function(R) {
            R.when(this.transactionTotal < 500);
        },
        "consequence": function(R) {
            console.log("Rule 1 matched - blocks transactions below value 500. Rejecting payment.");
            resp_text += ("Rule 1 matched - blocks transactions below value 500. Rejecting payment.\n");
            this.result = false;
            R.stop();
        }
    },
    /**** Rule 2 ****/
    {
        "name": "high credibility customer - avoid checks and bypass",
        "priority": 2,
        "on": true,
        "condition": function(R) {
            R.when(this.userCredibility && this.userCredibility > 5);
        },
        "consequence": function(R) {
            console.log("Rule 2 matched - user credibility is more, then avoid further check. Accepting payment.");
            resp_text += ("Rule 2 matched - user credibility is more, then avoid further check. Accepting payment.\n");
            this.result = true;
            R.stop();
        }
    },
    /**** Rule 3 ****/
    {
        "name": "block AME > 10000",
        "priority": 4,
        "on": true,
        "condition": function(R) {
            R.when(this.cardType == "Credit Card" && this.cardIssuer == "American Express" && this.transactionTotal > 1000);
        },
        "consequence": function(R) {
            console.log("Rule 3 matched - filter American Express payment above 10000. Rejecting payment.");
            resp_text += ("Rule 3 matched - filter American Express payment above 10000. Rejecting payment.\n");
            this.result = false;
            R.stop();
        }
    },
    /**** Rule 4 ****/
    {
        "name": "block Cashcard Payment",
        "priority": 8,
        "on": true,
        "condition": function(R) {
            R.when(this.cardType == "Cash Card");
        },
        "consequence": function(R) {
            console.log("Rule 4 matched - reject the payment if cash card. Rejecting payment.");
            resp_text += ("Rule 4 matched - reject the payment if cash card. Rejecting payment.\n");
            this.result = false;
            R.stop();
        }
    },
    /**** Rule 5 ****/
    {
        "name": "block guest payment above 10000",
        "priority": 6,
        "on": true,
        "condition": function(R) {
            R.when(this.customerType && this.transactionTotal > 10000 && this.customerType == "guest");
        },
        "consequence": function(R) {
            console.log("Rule 5 matched - reject if above 10000 and customer type is guest. Rejecting payment.");
            resp_text += ("Rule 5 matched - reject if above 10000 and customer type is guest. Rejecting payment.\n");
            this.result = false;
            R.stop();
        }
    },
    /**** Rule 6 ****/
    {
        "name": "is customer guest?",
        "priority": 7,
        "on": true,
        "condition": function(R) {
            R.when(!this.userLoggedIn);
        },
        "consequence": function(R) {
            console.log("Rule 6 matched - support rule written for blocking payment above 10000 from guests.");
            console.log("Process left to chain with rule 5.");
            resp_text += ("Rule 6 matched - support rule written for blocking payment above 10000 from guests.\n");
            resp_text += ("Process left to chain with rule 5.\n");
            this.customerType = "guest";
            R.next(); // the fact has been altered, so all rules will run again. No need to restart.
        }
    },
    /**** Rule 7 ****/
    {
        "name": "block payment from specific app",
        "priority": 5,
        "on": true,
        "condition": function(R) {
            R.when(this.appCode && this.appCode === "MOBI4");
        },
        "consequence": function(R) {
            console.log("Rule 7 matched - block payment for Mobile. Reject Payment.");
            resp_text += ("Rule 7 matched - block payment for Mobile. Reject Payment.\n");
            this.result = false;
            R.stop();
        }
    },
    /**** Rule 8 ****/
    {
        "name": "event risk score",
        "priority": 2,
        "on": true,
        "condition": function(R) {
            R.when(this.eventRiskFactor && this.eventRiskFactor < 5);
        },
        "consequence": function(R) {
            console.log("Rule 8 matched - the event is not critical, so accept");
            resp_text += ("Rule 8 matched - the event is not critical, so accept\n");
            this.result = true;
            R.stop();
        }
    },
    /**** Rule 9 ****/
    {
        "name": "block ip range set",
        "priority": 3,
        "on": true,
        "condition": function(R) {
        	var ipList = ["10.X.X.X", "12.122.X.X", "12.211.X.X", "64.X.X.X", "64.23.X.X", "74.23.211.92"];
            var allowedRegexp = new RegExp('^(?:' + ipList.join('|').replace(/\./g, '\\.').replace(/X/g, '[^.]+') + ')$');
            R.when(this.userIP && this.userIP.match(allowedRegexp));
        },
        "consequence": function(R) {
            console.log("Rule 9 matched - ip falls in the given list, then block. Rejecting payment.");
            resp_text += ("Rule 9 matched - ip falls in the given list, then block. Rejecting payment.\n");
            this.result = false;
            R.stop();
        }
    },
    /**** Rule 10 ****/
    {
        "name": "check if user's name is blacklisted",
        "priority": 1,
        "on": true,
        "condition": function(R) {
            var blacklist = ["user4"];
            R.when(this && blacklist.indexOf(this.name) > -1);
        },
        "consequence": function(R) {
            console.log("Rule 10 matched - the user is malicious, then block. Rejecting payment.");
            resp_text += ("Rule 10 matched - the user is malicious, then block. Rejecting payment.\n");
            this.result = false;
            R.stop();
        }
    }
];
/** example of cash card user, so payment blocked. ****/
var user1 = {
    "userIP": "10.3.4.5",
    "name": "user1",
    "eventRiskFactor": 6,
    "userCredibility": 1,
    "appCode": "WEB1",
    "userLoggedIn": false,
    "transactionTotal": 12000,
    "cardType": "Cash Card",
    "cardIssuer": "OXI",
};
/** example of payment from blocked app, so payemnt blocked. ****/
var user2 = {
    "userIP": "27.3.4.5",
    "name": "user2",
    "eventRiskFactor": 2,
    "userCredibility": 2,
    "appCode": "MOBI4",
    "userLoggedIn": true,
    "transactionTotal": 500,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};
/** example of low priority event, so skips frther checks. ****/
var user3 = {
    "userIP": "27.3.4.5",
    "name": "user3",
    "eventRiskFactor": 2,
    "userCredibility": 2,
    "appCode": "WEB1",
    "userLoggedIn": true,
    "transactionTotal": 500,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};
/** malicious list of users in rule 10 matches and exists. ****/
var user4 = {
    "userIP": "27.3.4.5",
    "name": "user4",
    "eventRiskFactor": 8,
    "userCredibility": 2,
    "appCode": "WEB1",
    "userLoggedIn": true,
    "transactionTotal": 500,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};
/** highly credible user exempted from further checks. ****/
var user5 = {
    "userIP": "27.3.4.5",
    "name": "user5",
    "eventRiskFactor": 8,
    "userCredibility": 8,
    "appCode": "WEB1",
    "userLoggedIn": true,
    "transactionTotal": 500,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};
/** example of a user whose ip listed in malicious list. ****/
var user6 = {
    "userIP": "10.3.4.5",
    "name": "user6",
    "eventRiskFactor": 8,
    "userCredibility": 2,
    "appCode": "WEB1",
    "userLoggedIn": true,
    "transactionTotal": 500,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};
/** example of a chaned up rule. will take two iterations. ****/
var user7 = {
    "userIP": "27.3.4.5",
    "name": "user7",
    "eventRiskFactor": 2,
    "userCredibility": 2,
    "appCode": "WEB1",
    "userLoggedIn": false,
    "transactionTotal": 100000,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};
/** none of rule matches and fires exit clearance with accepted payment. ****/
var user8 = {
    "userIP": "27.3.4.5",
    "name": "user8",
    "eventRiskFactor": 8,
    "userCredibility": 2,
    "appCode": "WEB1",
    "userLoggedIn": true,
    "transactionTotal": 500,
    "cardType": "Credit Card",
    "cardIssuer": "VISA",
};

/* GET Rule info page. */
router.get('/', function(req, res, next) {	
	var rule_fact = [];
	var rule_desc = '';
	
	rule_fact += JSON.stringify(user1, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user2, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user3, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user4, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user5, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user6, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user7, null, 4);
	rule_fact += ", ";
	rule_fact += JSON.stringify(user8, null, 4);
	rule_fact = "[" + rule_fact + "]";
	
	rule_desc = "This example shows combination with more rules and more user inputs. ";
	rule_desc += "** Rule 1 : transaction minimum 500 **; ";
	rule_desc += "** Rule 2 : high credibility customer - avoid checks and bypass **; ";
	rule_desc += "** Rule 3 : block AME > 10000 **; ";
	rule_desc += "** Rule 4 : block Cashcard Payment **; "; 
	rule_desc += "** Rule 5 : block guest payment above 10000 **; "; 
	rule_desc += "** Rule 6 : check is customer guest? **; ";
	rule_desc += "** Rule 7 : block payment from specific app **; "; 
	rule_desc += "** Rule 8 : check event risk score **; ";
	rule_desc += "** Rule 9 : block ip range set **; ";
	rule_desc += "** Rule 10 : check if user's name is blacklisted ** ";
	res.render('rules', { title: 'Multiple Rules with  Multiple User Input Example',
	  rule_id: 6,
	  description: rule_desc,
	  data: rule_fact });
});

/* Submit fact for rule process */
router.post('/', function(req, res, next) {
var colors = require('colors');
var RuleEngine = require('../index');
var R = new RuleEngine(rules);

var rule_fact = req.body;
if ((rule_fact.constructor === Array) && (rule_fact.length === 8)) {
    var req_user1 = rule_fact[0];
    var req_user2 = rule_fact[1];
    var req_user3 = rule_fact[2];
    var req_user4 = rule_fact[3];
    var req_user5 = rule_fact[4];
    var req_user6 = rule_fact[5];
    var req_user7 = rule_fact[6];
    var req_user8 = rule_fact[7];

    console.log("----------".blue);
    console.log("start execution of rules".blue);
    console.log("----------".blue);
    resp_text = '';
    resp_text += ("----------\n");
    resp_text += ("start execution of rules\n");
    resp_text += ("----------\n");

	R.execute(req_user7, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User7 Accepted".green);
	    	resp_text += ("Completed " + "User7 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User7 Rejected".red);
	    	resp_text += ("Completed " + "User7 Rejected\n\n");
	    }
	});
	R.execute(req_user1, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User1 Accepted".green);
	    	resp_text += ("Completed " + "User1 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User1 Rejected".red);
	    	resp_text += ("Completed " + "User1 Rejected\n\n");
	    }
	});
	R.execute(req_user2, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User2 Accepted".green);
	    	resp_text += ("Completed " + "User2 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User2 Rejected".red);
	    	resp_text += ("Completed " + "User2 Rejected\n\n");
	    }
	});
	R.execute(req_user3, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User3 Accepted".green);
	    	resp_text += ("Completed " + "User3 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User3 Rejected".red);
	    	resp_text += ("Completed " + "User3 Rejected\n\n");
	    } 
	});
	R.execute(req_user4, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User4 Accepted".green);
	    	resp_text += ("Completed " + "User4 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User4 Rejected".red);
	    	resp_text += ("Completed " + "User4 Rejected\n\n");
	    }
	});
	R.execute(req_user5, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User5 Accepted".green);
	    	resp_text += ("Completed " + "User5 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User5 Rejected".red);
	    	resp_text += ("Completed " + "User5 Rejected\n\n");
	    }
	});
	R.execute(req_user6, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User6 Accepted".green);
	    	resp_text += ("Completed " + "User6 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User6 Rejected".red);
	    	resp_text += ("Completed " + "User6 Rejected\n\n");
	    }
	});
	R.execute(req_user8, function(result) {
	    if (result.result) {
	    	console.log("Completed", "User8 Accepted".green);
	    	resp_text += ("Completed " + "User8 Accepted\n\n");
	    }
	    else {
	    	console.log("Completed", "User8 Rejected".red);
	    	resp_text += ("Completed " + "User8 Rejected\n\n");
	    }
	    res.json(resp_text);
	});
} else {
	res.json("Wrong input !!!");
}
});
module.exports = router;
