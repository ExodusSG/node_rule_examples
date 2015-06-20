// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();
    
    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
    
    // Add User button click
    $('#btnAddUser').on('click', addUser);
    
    // Apply Rules button click
    $('#btnApplyRule').on('click', ApplyRule);    

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

      userListData = data;
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
    
};

//Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

};


//Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};


//Add User
function addUser(event) {
    event.preventDefault();
    
    var errorCount=0;
    
    // validation simple one
    $('#addUser input').each(function(index,val){
      if($(this).val() == '') { errorCount++;}
    });
    
    // check and make sure errorCount at zero
    if(errorCount == 0){
      // compile user input in one object
      var newUser = {
          'username': $('#addUser fieldset input#inputUserName').val(),
          'email': $('#addUser fieldset input#inputUserEmail').val(),
          'fullname': $('#addUser fieldset input#inputUserFullname').val(),
          'age': $('#addUser fieldset input#inputUserAge').val(),
          'location': $('#addUser fieldset input#inputUserLocation').val(),
          'gender': $('#addUser fieldset input#inputUserGender').val()      
      };
      
      // use AJAX to post
      $.ajax({
        type: 'POST',
        data: newUser,
        url: '/users/adduser',
        dataType: 'JSON'
      }).done(function(response){
        
        if(response.msg ==''){
          $('#addUser fieldset input').val('');
          populateTable();  
        }
        else{
          // something else 
        }
          
      });
    }
    else{
      // errorCount more than 0
    }
          
};

//Apply Rule
function ApplyRule(event) {
	// Prevent Link from Firing
	event.preventDefault();
    
    // convert text_area input into an object
    var textarea = $('#FactArea').val();
    var linebreak = textarea.split('\n');
    var length = linebreak.length;
    var rule_fact = [];
    for ( var i = 0 ; i<length ; i++){
    	var itembreak = linebreak[i].split(":");
    	if(itembreak.length) {
    		rule_fact = rule_fact + linebreak[i];
    	}
    }
    var rule_id = $('#rule_id').text().replace(/\s+/g, '');
    var url_link = '/rules/'+rule_id;
    // use AJAX to post
    $.ajax({
        type: 'POST',
        data: JSON.parse(rule_fact),
        url: url_link,
        dataType: 'JSON'
      }).done(function(response){
       
        if(response.msg !=''){
          $('#ResultArea').val(response);
        }
      });
};
