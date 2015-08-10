/* This is a rule process module for leave type check on staff leave application.
 * It works as a reference for one of the module in our backend rule-engine.
 * 
 * (2015-08-08) Wilson
 */
var express = require('express');
var router = express.Router();	
var RuleEngine = require('../index');

/* Rules to check leave type : annual leave, medical leave, hospital leave */
var rules = [ 
	/**** Rule 1: check hospital leave ****/
    {
    	"name": "leave_type",
    	"sub_name": "hospital_leave",
    	"priority": 6,    	
    	"condition": function(R) {
    	//	console.log("\n[6] Msg_content: "+ this.msg_content);
    	    var res = this.msg_content.trim().split(/\s+/).join(" ");
    	    this.result = /\bhospital leave\b/i.test(res);
    		R.when(this.result);
    	},
    	"consequence": function(R) {
    		this.leave_type = "hospital_leave";
    		this.report = "The is a hospital leave request";
    		R.stop();
    	}
    },
	/**** Rule 2: check medical leave ****/
    {
    	"name": "leave_type",
    	"sub_name": "medical_leave",
    	"priority": 4,
    	"condition": function(R) {
    	//	console.log("\n[4]Msg_content: "+ this.msg_content);
    	    var res = this.msg_content.trim().split(/\s+/).join(" ");
    	    /* check "medical leave" */
    	    var result1 = /\bmedical leave\b/i.test(res);
    	    if (result1 == false) {
    	    	/* check "mc" */
    	    	var result1 = /\bmc\b/i.test(res);
    	    }
    	    this.result = result1;
    		R.when(this.result);
    	},
    	"consequence": function(R) {
    		this.leave_type = "medical_leave";
    		this.report = "The is a medical leave request";
    		R.stop();
    	}
    },
	/**** Rule 3: check annual (general) leave ****/
    {
    	"name": "leave_type",
    	"sub_name": "annual_leave",
    	"priority": 2,
    	"condition": function(R) {
    	//	console.log("\n[2]Msg_content: "+ this.msg_content);
    	    var res = this.msg_content;
    	    /* check "leave" */
    	    this.result = /\bleave\b/i.test(res);
    		R.when(this.result);
    	},
    	"consequence": function(R) {
    		this.leave_type = "annual_leave";
    		this.report = "The is an annual leave request";
    		R.stop();
    	}
    }        
];

var export_objects = {
	leave_type_parse : function(req, record, callback) {
		var db = req.db;
		var collection = db.collection('rulelist');
		collection.find({'name': 'leave_type'}).toArray(function(err, store){
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
				var leave_type = null;
				var error = null;
				if (data.result) {
					leave_type = data.leave_type;
				} 
				callback(error, leave_type);
			});
	  	});
	}
};

/* Note: You have to define a variable to export router, rule, or fact etc, for others to use */
export_objects.rule = rules; 
export_objects.route = router;

module.exports = export_objects;