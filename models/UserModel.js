//PeizhouZhang 101110707
const mongoose = require("mongoose");
//define user schema
let userSchema=new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    privacy:{
        type: Boolean,
        required: true
    },
    history:{
        type: Array,
        required: true
    }
})
//static function to check user in database for login purpose.
userSchema.statics.LogIN=function(userName, passWord, callback){
    this.findOne({username: userName, password: passWord}, (err, result)=>{
        if(err){throw err}
        else{
            if(result!=null){
                if(result.privacy==true)
                    callback(null, 'private')
                else
                    callback(null, 'public');
            }else{
                callback(null, false);
            }
        }
    })
}
//static function for new user registration. check if the username already exist or not.
userSchema.statics.Register=function(userName, passWord, callback){
    this.findOne({username: userName, password: passWord}, (err, result)=>{
        if(err){throw err}
        else{
            if(result==null){
                callback(null, true);
            }else{
                callback(null, false);
            }
        }
    })
}
//check through database by username, and return matched schema
userSchema.statics.FindProfile=function(userName, callback){
    this.findOne({username: userName}, (err, result)=>{
        if(err){throw err}
        else{
            if(result==null){
                callback(null, false)
            }else{
                callback(null, result)
            }
        }
    })
}
//search through database and return all user schemas that begin with given string in username
userSchema.statics.Search=function(userName, callback){
    this.find({username: { $regex: userName, $options: "i" }}, (err, result)=>{
        if(err){throw err}
        else{
            if(result==null){
                callback(null, false)
            }else{
                callback(null, result)
            }
        }
    })
}
//export model
module.exports = mongoose.model("UserModel", userSchema);