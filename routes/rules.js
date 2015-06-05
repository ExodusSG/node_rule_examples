var express = require('express');
var router = express.Router();
var rule1 = require('../rules/1.SimpleRule');
var rule2 = require('../rules/2.MultipleRules');
var rule3 = require('../rules/3.CascadingRules');
var rule4 = require('../rules/4.PrioritizedRules');
var rule5 = require('../rules/5.RecurssionWithRules');
var rule6 = require('../rules/6.MoreRulesAndFacts');

/* GET home page. */
router.get('/', function(req, res, next) {
  /* res.render('index', { title: 'Express' }); */
  console.log("This the home location to access rules");
  res.write("This the home location to access rules: \n");
  res.write("/1 to run rules example 1;\n");
  res.write("/2 to run rules example 2;\n");
  res.write("/3 to run rules example 3;\n");
  res.write("/4 to run rules example 4;\n");
  res.write("/5 to run rules example 5;\n");
  res.write("/6 to run rules example 6;\n");
  res.send();
});

/* GET for rule1 page. */
router.use('/1', rule1);
router.use('/2', rule2);
router.use('/3', rule3);
router.use('/4', rule4);
router.use('/5', rule5);
router.use('/6', rule6);

module.exports = router;
