var express = require('express');
var router = express.Router();
var ObjectID = require('mongoskin').ObjectID;
var parse = require('../rules/Rule_LeaveType');

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.TrelloMsg_db;
    var TrelloCollection = req.query.collection;
    var MsgId = req.query.msgid;
    
    console.log("Trello collection: " + TrelloCollection);
    console.log("MsgId: "+ MsgId);
    if((TrelloCollection === undefined)|| (MsgId === undefined)) {
    	res.write("Please input both message id and its collection name !"+ TrelloCollection + MsgId);
    	res.send();
    	return;
    }
    db.collection(TrelloCollection).findOne({"primary_key": ObjectID(MsgId)}, function(err, item){
    	if (item === null ) {
        	res.write("Cannot find message, make sure you input both message id and its collection name correctly !"+ 
        			TrelloCollection + MsgId);
        	res.send();
        	return;
    	}
    	parse.leave_type_parse(req, item, function (err, leave_type) {
    		if(err == null) {
    			if(leave_type === null) {
    				console.log("This is not a leave request message!")
    				res.write("This is not a leave request message!");
    			} else {
    				console.log("This is a leave request and its type is: " + leave_type);
    				res.write("This is a leave request and its type is: " + leave_type);
    			}
    		} else {
    			console.log("There is an error in parsing leave request !");
    	    	res.write("There is an error in parsing leave request !");
    		}
    		res.send();
    	});
//    	console.log(item);
//    	res.json(item);
    });
});

module.exports = router;