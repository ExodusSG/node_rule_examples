/* This is a rule process module for supervisor approval on staff leave application.
 * It works as a reference for one of the module in our backend rule-engine.
 * 
 * (2015-08-09) Wilson
 */
var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* Rules to check leave approval by supervisor 
 * The outcome can be 1. approved; 2. rejected; 
 *   3.Not determined (need further clarification)
 */
var rules = [ 
	/**** Rule 1: check supervisor leave approval ****/
    {
    	"name": "leave_approval",
    	"sub_name": "supervisor_approval",
    	"priority": 6,    	
    	"condition": function(R) {
    		/* Check the words approve, approved, approval, grant, granted, ok */
    	    var res = this.msg_content.trim().split(/\s+/).join(" ");
    	    var pos = 0;
    	    var tmp_res = null;
    	    this.result = false;
    	    // First check the word approve
    	    pos = res.search(/\bapprove\b/i);
    	    if(pos > -1) {
    	    	tmp_res = res.slice(0, pos);
    	    	this.result = true;
    	    }
    	    if(this.result != true) { // Check the word approved
    	    	pos = res.search(/\bapproved\b/i);
    	    	if(pos > -1) {
    	    		tmp_res = res.slice(0, pos);
    	    		this.result = true;
    	    	}
    	    }
    	    if(this.result != true) { // Check the word approval
    	    	pos = res.search(/\bapproval\b/i);
    	    	if(pos > -1) {
    	    		tmp_res = res.slice(0, pos);
    	    		this.result = true;
    	    	}
    	    }
    	    if(this.result != true) { // Check the word grant
    	    	pos = res.search(/\bgrant\b/i);
    	    	if(pos > -1) {
    	    		tmp_res = res.slice(0, pos);
    	    		this.result = true;
    	    	}
    	    }
    	    if(this.result != true) { // Check the word granted
    	    	pos = res.search(/\bgranted\b/i);
    	    	if(pos > -1) {
    	    		tmp_res = res.slice(0, pos);
    	    		this.result = true;
    	    	}
    	    }
    	    if(this.result != true) { // Check the word ok
    	    	pos = res.search(/\bok\b/i);
    	    	if(pos > -1) {
    	    		tmp_res = res.slice(0, pos);
    	    		this.result = true;
    	    	}
    	    }
    	    if(this.result == true){ // Check the negative word infront of approval words
    	    	this.status = "approved";
    	    	var result1 = /\bnot\b/i.test(tmp_res);
    	    	if(result1 != true) {
    	    		result1 = /\bno\b/i.test(tmp_res);
    	    	}
    	    	if(result1 != true) {
    	    		result1 = /\bdon't\b/i.test(tmp_res);
    	    	}
    	    	if(result1 != true){
    	    		result1 = /\bcannot\b/i.test(tmp_res);
    	    	}
    	    	if(result1 != true) {
    	    		result1 = /\bcan't\b/i.test(tmp_res);
    	    	}
    	    	if(result1 == true) {
    	    		this.status = "rejected";
    	    	}
    	    }
    		R.when(this.result);
    	},
    	"consequence": function(R) {
    		this.report = "The supervisor "+ this.status+" staff leave request.";
    		R.stop();
    	}
    },
	/**** Rule 2: check medical leave ****/
    {
    	"name": "leave_approval",
    	"sub_name": "supervisor_reject",
    	"priority": 4,    	
    	"condition": function(R) {
    	    var res = this.msg_content.trim().split(/\s+/).join(" ");
    	    /* check the word reject */
    	    var result1 = /\breject\b/i.test(res);
    	    if (result1 == false) {
    	    /* Check the word rejected */
    	    	var result1 = /\brejectetd/i.test(res);
    	    }
    	    if (result1 == false) {
        	    /* Check the word rejection */
        	    	var result1 = /\brejection\b/i.test(res);
        	}
    	    if (result1 == false) {
        	    /* Check the word rejected */
        	    	var result1 = /\bno\b/i.test(res);
        	}
    	    this.result = result1;
    		R.when(this.result);
    	},
    	"consequence": function(R) {
    	    this.status = "rejected";
    		this.report = "The supervisor "+ this.status+" staff leave request.";
    		R.stop();
    	}
    }
];

var export_objects = {
	leave_approval_parse : function(req, record, callback) {
		var db = req.db;
		var collection = db.collection('rulelist');
		collection.find({'name': 'leave_approval'}).toArray(function(err, store){
			if((err != null) || (store.length == 0)) {
				err = true;
				return callback(err);
			}
			var rule_store = store[0]["store"];
			var R1 = new RuleEngine();
			R1.fromJSON(rule_store);
			var rule_item = R1.findRules();
			if (rule_item.length == 0) {
				err = true;
				return callback(err);
			}
			/* Creating Rule Engine instance and registering rule */
			var R = new RuleEngine();
			R.register(rule_item);
			R.execute(record, function(data) {
				var approval_status = null;
				var error = null;
				if (data.result) {
					//console.log(data.report);
					approval_status = data.status;
				} else {
				//    console.log("Cannot determine approval status from Supervisor." );
				    approval_status = "Not decided";
				}
				callback(error, approval_status);
			});
	  	});
	}
};

/* Note: You have to define a variable to export router, rule, or fact etc, for others to use */
export_objects.rule = rules; 
export_objects.route = router;

module.exports = export_objects;