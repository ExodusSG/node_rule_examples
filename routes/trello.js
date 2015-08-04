var express = require('express');
var router = express.Router();
var ObjectID = require('mongoskin').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.TrelloMsg_db;
    var TrelloCollection = req.query.collection;
    var MsgId = req.query.msgid;
    
    console.log("Trello collection: " + TrelloCollection);
    console.log("MsgId: "+ MsgId);
 
    db.collection(TrelloCollection).findOne({"primary_key": ObjectID(MsgId)}, function(err, item){
//    	console.log(item);
    	res.json(item);
    });
});

module.exports = router;