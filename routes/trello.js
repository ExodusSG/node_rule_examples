var express = require('express');
var router = express.Router();
var ObjectID = require('mongoskin').ObjectID;
var parse = require('../rules/Rule_LeaveType');

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.TrelloMsg_db;
    var TrelloCollection = req.query.collection;
    var MsgId = req.query.msgid;
    var HRResource = req.HRResource;
    
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
    		if(err != null) {
    			console.log("There is an error in parsing leave request !");
    	    	res.write("There is an error in parsing leave request !");
    	    	res.send();
    	    	return;
    		}
    		if(leave_type === null) {
    			console.log("This is not a leave request message!")
    			res.write("This is not a leave request message!");
    			res.send();
    			return;
    		} 
    		console.log("This is a leave request and its type is: " + leave_type);
    		res.write("This is a leave request and its type is: " + leave_type);
    		res.send();

	    	/* Prepare leave record here */
	    	/*** Note: now we just hard code some leave record field for demo */
	    	var leave_record = {
	    		"db_name": "HRMgmtDB",
	    		"collection_name": "HRLeaveRepository",
	    		"record_id": ObjectID(),
	    		"leave_requestor": item.msg_originator,
	   			"leave_timestamp": item.msg_timestamp,
	   			"leave_type": leave_type,
	   			"leave_start_date": Date(),
	   			"leave_start_time": "FullDay",
	   			"leave_end_date": Date(),
	   			"leave_end_time": "FullDay",
	   			"leave_request_status":	"processing",
	   			"leave_comment": "",
	   			"leave_requset_message": item.msg_content,
	   			"leave_msg_db": item.db_name,
	   			"leave_msg_collection": item.collection_name,
	   			"leave_msg_id": item.primary_key
	    	};
    	    console.log(leave_record);
	    	/* Prepare HR leave status record here */
	    	/*** Note: now we just hard code some leave record field for demo */
    	    var leave_status_record = {
    	    	"db_name": "HRMgmtDB",
    	    	"collection_name": "HRLeaveStatus",
    	    	"record_id": ObjectID(),
    	    	"staff": leave_record.leave_requestor,
    	    	"leave_card_id": HRResource.leave_card_id,
    	    	"hr_card_id": HRResource.hr_card_id,
    	    	"supervisor_card_id": HRResource.supervisor_card_id,
    	    	"supervisor_approval_status": "pending",
    	    	"leave_status": "processing",
    	    	"leave_record": leave_record,
    	    	"leave_outstanding_field": "",
    	    	"leave_record_id": leave_record.record_id	
    	    };
    	    //console.log(leave_status_record);
    	    var leave_sending_msg = {
   	    		"db_name": "MsgDB",
   	    		"collection_name": "TrelloMsgSendingQueue",
   	    		"msgID": ObjectID(),
   	    		"msg_timestamp": Date(),
   	    		"msg_requestor": leave_record.leave_requestor,
   	    		"msg_destination": "trello card ID",
   	    		"msg_content": "msg in text format"
    	    };
    	    // Insert this request message into HR card
    	    var hr_leave_sending_msg = leave_sending_msg;
    	    hr_leave_sending_msg.msgID = ObjectID();
    	    hr_leave_sending_msg._id = hr_leave_sending_msg.msgID;
    	    hr_leave_sending_msg.msg_content = item.msg_content;
    	    hr_leave_sending_msg.msg_destination = leave_status_record.hr_card_id;
    	    console.log(hr_leave_sending_msg);
    	    db.collection(hr_leave_sending_msg.collection_name).insert(hr_leave_sending_msg, 
    	    		function(err, result){ 
    	    	if(err) {
    	    		console.log("Error in inserting hr_leave_sending_msg into queue!");
    	    	}
    	    });
    	    // Insert this request message into supervisor card
    	    var sp_leave_sending_msg = leave_sending_msg;
    	    sp_leave_sending_msg.msgID = ObjectID();
    	    sp_leave_sending_msg._id = sp_leave_sending_msg.msgID;
    	    sp_leave_sending_msg.msg_content = sp_leave_sending_msg.msg_requestor + 
    	    	" submit a leave request for your approval. \n " + 
    	    	"[Request Info]: " + item.msg_content;
    	    sp_leave_sending_msg.msg_destination = leave_status_record.supervisor_card_id;
    	    console.log(sp_leave_sending_msg);
    	    db.collection(sp_leave_sending_msg.collection_name).insert(sp_leave_sending_msg, 
    	    		function(err, result){ 
    	    	if(err) {
    	    		console.log("Error in inserting sp_leave_sending_msg into queue!");
    	    	}
    	    });
    	    // Insert this request notification into staff card
    	    var staff_leave_sending_msg = leave_sending_msg;
    	    staff_leave_sending_msg.msgID = ObjectID();
    	    staff_leave_sending_msg._id = staff_leave_sending_msg.msgID;
    	    staff_leave_sending_msg.msg_content = "Your leave request is under processing.";
    	    staff_leave_sending_msg.msg_destination = leave_status_record.leave_card_id;
    	    console.log(staff_leave_sending_msg);
    	    db.collection(staff_leave_sending_msg.collection_name).insert(staff_leave_sending_msg, 
    	    		function(err, result){ 
    	    	if(err) {
    	    		console.log("Error in inserting staff_leave_sending_msg into queue!");
    	    	}
    	    });
    	});
//    	console.log(item);
//    	res.json(item);
    });
});

module.exports = router;