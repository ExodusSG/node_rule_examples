var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
// Database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/node_express/data", {native_parser:true});
var TrelloMsg_db = mongo.db("mongodb://localhost:27017/MsgDB/data", {native_parser:true});
var HRMgmt_db = mongo.db("mongodb://localhost:27017/HRMgmtDB/data", {native_parser:true});

var routes = require('./routes/index');
var users = require('./routes/users');
var trello = require('./routes/trello');

var RuleEngine = require('./index');
var rules_obj = require('./routes/rules');
rules = rules_obj.router; // Get the rules middleware

/* Settle the rules before processing */
var rule_idx = [0, 1, 2, 3, 4, 5, 6, 7];
var rule_names = ["rule1", "rule2", "rule3", "rule4", "rule5", "rule6",
                  "leave_type", "leave_approval"];
var rule_items = [rules_obj.rule1, rules_obj.rule2, rules_obj.rule3,
                  rules_obj.rule4, rules_obj.rule5, rules_obj.rule6,
                  rules_obj.leave_type, rules_obj.leave_approval];
async.each(rule_idx, // 1st param is the array of index
		// 2nd param is the function that checks and save each rule into DB
		function(idx, callback){
			var collection = db.collection('rulelist');
			collection.find({'name': rule_names[idx]}).toArray(	function(err, store){
				var R1 = new RuleEngine();
				if((err == null)&& (store.length > 0)) {
					var rule_store = store[0]["store"];
					R1.fromJSON(rule_store);
					var rule = R1.findRules({"name": rule_names[idx]});
					if (rule.length > 0) {
						// This rule is already existing, no need to save again
						callback();
						return ;
					}
				}
				// Somehow, this rule does not exist in DB, need to save it now
				var R2 = new RuleEngine(rule_items[idx]);
				var rule_store = R2.toJSON();
				store = {"name": rule_names[idx], "store": rule_store};
				db.collection('rulelist').insert(store, function(err, result){  
					// we are going to insert this rule to 'rulelist'
					if (err ) return callback(err);
					callback();
				});
			});
		}, 
		function(err) { //This function gets called after the two tasks have called their "task callbacks"
			if (err) return (err);
		}
);
/* Get the HR resource information before detail process */
var HRResource = {};
HRMgmt_db.collection("HRResource").find().toArray(function(err, items){
	if(items.length <= 0) {
		console.log("Cannot find HR Resource information!")
	} else {
		HRResource = items[0];
	}
});    
    
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// mongodb stuff
app.use(function(req,res,next){
  req.db = db;
  req.TrelloMsg_db = TrelloMsg_db;
  req.HRResource = HRResource;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/rules', rules);
app.use('/trello', trello);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
