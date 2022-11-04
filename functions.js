//Peizhou Zhang     101110707
//Get username and password from user input, and send them to server
function logIn(){
    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    if(username.length==0){alert('Please Enter Username')}
    else if(username.includes(' ')){alert('No Space Allowed')}
    else if(password.length==0){alert('Please Enter Password')}
    else if(password.includes(' ')){alert('No Space Allowed')}
    else{
        let format={'username':username, 'password':password};
        let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                window.location.href='/';
	        }
        }
        req.open("POST", `/logIn`);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert('loging...');
    }
}
//Register as new user
function register(){
    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    if(username.length==0){alert('Please Enter Username')}
    else if(username.includes(' ')){alert('No Space Allowed')}
    else if(password.length==0){alert('Please Enter Password')}
    else if(password.includes(' ')){alert('No Space Allowed')}
    else{
        let format={'username':username, 'password':password};
        let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                setTimeout( window.location.href=`/profile/${username}`,1500 );
	        }
        }
        req.open("POST", `/register`);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert('Registering...');
    }
}
//Change Privacy
function changePrivacy(username){
    let format={'username': username};
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if(this.readyState==4 && this.status==200){
            setTimeout( window.location.href=`/profile/${username}`,1500 );
	    }
    }
    req.open("POST", `/changePrivacy`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(format));
    alert('Updating...');
}
//Search user by username
function search(){
    let username=document.getElementById('search').value;
    if(username.length==0){alert('Please Enter Username')}
    else{
        let format={'username': username};
        let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
	        if(this.readyState==4 && this.status==200){
                setTimeout( window.location.href=`/result`,1500 );
	        }
        }
        req.open("POST", `/search`);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(format));
        alert('Searching...');
    }
}