//Peizhou Zhang     101110707
let userNames = ["winnifred", "lorene", "cyril", "vella", "erich", "pedro", "madaline", "leoma", "merrill",  "jacquie"];
let users = [];
const mongoose = require('mongoose');
const UserModel=require('./models/UserModel');

userNames.forEach(name =>{
	let u = {};
	u.username = name;
	u.password = name;
	u.privacy = false;
	u.history = [];
	users.push(u);
});

mongoose.connect('mongodb://localhost:27017/');
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	mongoose.connection.db.dropDatabase(function(err, result){
		if(err){
			console.log("Error dropping database:");
			console.log(err);
			return;
		}
		console.log("Dropped a4 database. Starting re-creation.");
		let finished = 0;
		let countFail = 0;
		let countSuccess = 0;
		users.forEach(user => {
			let b = new UserModel(user);
			b.save(function(err, callback){
				finished++;
				if(err){
					countFail++;
					console.log(err.message);
				}else{
					countSuccess++;
				}
				if(finished == 10){
					mongoose.connection.close();
					console.log("Successfully added: " + countSuccess +' (should be 10)');
					console.log("Failed: " + countFail);
					process.exit(0);
				}
			});
		});
	});
});