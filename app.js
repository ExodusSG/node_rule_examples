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

var routes = require('./routes/index');
var users = require('./routes/users');
var RuleEngine = require('./index');
var rules_obj = require('./routes/rules');
rules = rules_obj.router; // Get the rules middleware

/* Settle the rules before processing */
async.series([
	//Check the first rule, rule1, if it is already saved in DB
	function(callback) {
		var collection = db.collection('rulelist');
		collection.find({'name': 'rule1'}).toArray(	function(err, store){
			var R1 = new RuleEngine();
			if((err == null)&& (store.length > 0)) {
				var rule_store = store[0]["store"];
				R1.fromJSON(rule_store);
				var rule1 = R1.findRules({"name": "rule1"});
				if (rule1.length > 0) {
					// This rule is already existing, no need to save again
					callback();
					return ;
				}
			}
			// Somehow, this rule does not exist in DB, need to save it now
			var R2 = new RuleEngine(rules_obj.rule1);
			var rule_store = R2.toJSON();
			store = {"name": "rule1", "store": rule_store};
			db.collection('rulelist').insert(store, function(err, result){  
				// we are going to insert 'rule1' to 'rulelist'
				if (err ) return callback(err);
				callback();
			});
		});
	},
	//Check the second rule, rule2, if it is already saved in DB
	function(callback) {
		var collection = db.collection('rulelist');
		collection.find({'name': 'rule2'}).toArray(	function(err, store){
			var R1 = new RuleEngine();
			if((err == null)&& (store.length > 0)) {
				var rule_store = store[0]["store"];
				R1.fromJSON(rule_store);
				var rule1 = R1.findRules({"name": "rule2"});
				if (rule1.length > 0) {
					// This rule is already existing, no need to save again
					callback();
					return ;
				}
			}
			// Somehow, this rule does not exist in DB, need to save it now
			var R2 = new RuleEngine(rules_obj.rule2);
			var rule_store = R2.toJSON();
			store = {"name": "rule2", "store": rule_store};
			db.collection('rulelist').insert(store, function(err, result){  
				// we are going to insert 'rule2' to 'rulelist'
				if (err ) return callback(err);
				callback();
			});
		});
	},
	//Check the third rule, rule3, if it is already saved in DB
	function(callback) {
		var collection = db.collection('rulelist');
		collection.find({'name': 'rule3'}).toArray(	function(err, store){
			var R1 = new RuleEngine();
			if((err == null)&& (store.length > 0)) {
				var rule_store = store[0]["store"];
				R1.fromJSON(rule_store);
				var rule3 = R1.findRules({"name": "rule3"});
				if (rule3.length > 0) {
					// This rule is already existing, no need to save again
					callback();
					return ;
				}
			}
			// Somehow, this rule does not exist in DB, need to save it now
			var R2 = new RuleEngine(rules_obj.rule3);
			var rule_store = R2.toJSON();
			store = {"name": "rule3", "store": rule_store};
			db.collection('rulelist').insert(store, function(err, result){  
				// we are going to insert 'rule3' to 'rulelist'
				if (err ) return callback(err);
				callback();
			});
		});
	},
	//Check the fourth rule, rule4, if it is already saved in DB
	function(callback) {
		var collection = db.collection('rulelist');
		collection.find({'name': 'rule4'}).toArray(	function(err, store){
			var R1 = new RuleEngine();
			if((err == null)&& (store.length > 0)) {
				var rule_store = store[0]["store"];
				R1.fromJSON(rule_store);
				var rule4 = R1.findRules({"name": "rule4"});
				if (rule4.length > 0) {
					// This rule is already existing, no need to save again
					callback();
					return ;
				}
			}
			// Somehow, this rule does not exist in DB, need to save it now
			var R2 = new RuleEngine(rules_obj.rule4);
			var rule_store = R2.toJSON();
			store = {"name": "rule4", "store": rule_store};
			db.collection('rulelist').insert(store, function(err, result){  
				// we are going to insert 'rule4' to 'rulelist'
				if (err ) return callback(err);
				callback();
			});
		});
	},
	//Check the fifth rule, rule5, if it is already saved in DB
	function(callback) {
		var collection = db.collection('rulelist');
		collection.find({'name': 'rule5'}).toArray(	function(err, store){
			var R1 = new RuleEngine();
			if((err == null)&& (store.length > 0)) {
				var rule_store = store[0]["store"];
				R1.fromJSON(rule_store);
				var rule5 = R1.findRules({"name": "rule5"});
				if (rule5.length > 0) {
					// This rule is already existing, no need to save again
					callback();
					return ;
				}
			}
			// Somehow, this rule does not exist in DB, need to save it now
			var R2 = new RuleEngine(rules_obj.rule5);
			var rule_store = R2.toJSON();
			store = {"name": "rule5", "store": rule_store};
			db.collection('rulelist').insert(store, function(err, result){  
				// we are going to insert 'rule5' to 'rulelist'
				if (err ) return callback(err);
				callback();
			});
		});
	},
	//Check the sixth rule, rule6, if it is already saved in DB
	function(callback) {
		var collection = db.collection('rulelist');
		collection.find({'name': 'rule6'}).toArray(	function(err, store){
			var R1 = new RuleEngine();
			if((err == null)&& (store.length > 0)) {
				var rule_store = store[0]["store"];
				R1.fromJSON(rule_store);
				var rule6 = R1.findRules({"name": "rule6"});
				if (rule6.length > 0) {
					// This rule is already existing, no need to save again
					callback();
					return ;
				}
			}
			// Somehow, this rule does not exist in DB, need to save it now
			var R2 = new RuleEngine(rules_obj.rule6);
			var rule_store = R2.toJSON();
			store = {"name": "rule6", "store": rule_store};
			db.collection('rulelist').insert(store, function(err, result){  
				// we are going to insert 'rule6' to 'rulelist'
				if (err ) return callback(err);
				callback();
			});
		});
	}
	//Load posts (won't be called before task 1's "task callback" has been called)
    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
		if (err) return (err);
	}
);

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
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/rules', rules);

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
