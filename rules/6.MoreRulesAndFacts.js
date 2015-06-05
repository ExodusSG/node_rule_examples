var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* GET home page. */
router.get('/', function(req, res, next) {
var colors = require('colors');
var RuleEngine = require('../index');
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
            res.write("Rule 1 matched - blocks transactions below value 500. Rejecting payment.\n");
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
            res.write("Rule 2 matched - user credibility is more, then avoid further check. Accepting payment.\n");
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
            res.write("Rule 3 matched - filter American Express payment above 10000. Rejecting payment.\n");
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
            res.write("Rule 4 matched - reject the payment if cash card. Rejecting payment.\n");
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
            res.write("Rule 5 matched - reject if above 10000 and customer type is guest. Rejecting payment.\n");
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
            res.write("Rule 6 matched - support rule written for blocking payment above 10000 from guests.\n");
            res.write("Process left to chain with rule 5.\n");
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
            res.write("Rule 7 matched - block payment for Mobile. Reject Payment.\n");
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
            res.write("Rule 8 matched - the event is not critical, so accept\n");
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
            res.write("Rule 9 matched - ip falls in the given list, then block. Rejecting payment.\n");
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
            res.write("Rule 10 matched - the user is malicious, then block. Rejecting payment.\n");
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
var R = new RuleEngine(rules);
console.log("----------".blue);
console.log("start execution of rules".blue);
console.log("----------".blue);
res.write("----------\n");
res.write("start execution of rules\n");
res.write("----------\n");

R.execute(user7, function(result) {
    if (result.result) {
    	console.log("Completed", "User7 Accepted".green);
    	res.write("Completed " + "User7 Accepted\n");
    }
    else {
    	console.log("Completed", "User7 Rejected".red);
    	res.write("Completed " + "User7 Rejected\n");
    }
});
R.execute(user1, function(result) {
    if (result.result) {
    	console.log("Completed", "User1 Accepted".green);
    	res.write("Completed " + "User1 Accepted\n");
    }
    else {
    	console.log("Completed", "User1 Rejected".red);
    	res.write("Completed " + "User1 Rejected\n");
    }
});
R.execute(user2, function(result) {
    if (result.result) {
    	console.log("Completed", "User2 Accepted".green);
    	res.write("Completed " + "User2 Accepted\n");
    }
    else {
    	console.log("Completed", "User2 Rejected".red);
    	res.write("Completed " + "User2 Rejected\n");
    }
});
R.execute(user3, function(result) {
    if (result.result) {
    	console.log("Completed", "User3 Accepted".green);
    	res.write("Completed " + "User3 Accepted\n");
    }
    else {
    	console.log("Completed", "User3 Rejected".red);
    	res.write("Completed " + "User3 Rejected\n");
    } 
});
R.execute(user4, function(result) {
    if (result.result) {
    	console.log("Completed", "User4 Accepted".green);
    	res.write("Completed " + "User4 Accepted\n");
    }
    else {
    	console.log("Completed", "User4 Rejected".red);
    	res.write("Completed " + "User4 Rejected\n");
    }
});
R.execute(user5, function(result) {
    if (result.result) {
    	console.log("Completed", "User5 Accepted".green);
    	res.write("Completed " + "User5 Accepted\n");
    }
    else {
    	console.log("Completed", "User5 Rejected".red);
    	res.write("Completed " + "User5 Rejected\n");
    }
});
R.execute(user6, function(result) {
    if (result.result) {
    	console.log("Completed", "User6 Accepted".green);
    	res.write("Completed " + "User6 Accepted\n");
    }
    else {
    	console.log("Completed", "User6 Rejected".red);
    	res.write("Completed " + "User6 Rejected\n");
    }
});
R.execute(user8, function(result) {
    if (result.result) {
    	console.log("Completed", "User8 Accepted".green);
    	res.write("Completed " + "User8 Accepted\n");
    }
    else {
    	console.log("Completed", "User8 Rejected".red);
    	res.write("Completed " + "User8 Rejected\n");
    }
    res.send();
});
});
module.exports = router;