var express = require('express');
var router = express.Router();
// json

//crypto
var crypto= require('crypto'), algorithm='aes-256-ctr',password='xxxxxx';

router.get('/', function(req, res){
	  console.log("This the home location to access users");
	  res.send("This the home location to access users");
});


/* GET users listing. 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/

router.get('/userlist', function(req, res){
  var db = req.db;
  var collection = db.collection('userlist');
  
  //collection.count(function(err, count) {
  //  console.log("There are " + count + " records.");
  //});
  
  collection.find().toArray(function(err, items){
    items.forEach(function(entry) {
      entry.email = decrypt(entry.email);
      //console.log(entry.email);
    });
    res.json(items);
  });
});


/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {  // we are going to post some data (req.body)
  var db = req.db;
  var email_encrypted = encrypt(req.body.email);
  console.log(decrypt(email_encrypted));

  req.body.email = email_encrypted;
  db.collection('userlist').insert(req.body, function(err, result){  // we are going to insert 'req.body' to 'userlist'
      res.send(
          (err === null) ? { msg: '' } : { msg: err }
      );
  });
});


function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}
 
/*
 * DELETE to deleteuser.
 */
router['delete']('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});


module.exports = router;
