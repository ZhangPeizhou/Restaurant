// Peizhou Zhang    101110707
/////////////////////////////// Basic Setting ///////////////////////////////
const fs=require('fs');
const pug=require('pug');
const path = require('path');
const express=require('express');
const session=require('express-session');
const mongoose=require('mongoose');
const MongoDBStore=require('connect-mongo');
const app=express();
const UserModel=require('./models/UserModel');
//store session in mongodb
const store=new MongoDBStore({
    mongoUrl: 'mongodb://localhost:27017/',
    collection: 'session'
})
store.on('error', (error)=>{ console.log(error) })
/////////////////////////////// Midware Functions ///////////////////////////////
app.use(function(req, res, next){
    if(req.session) res.locals.session=req.session;
    next();
});
app.use(function(req, res, next){
    console.log(`${req.method} for ${req.url}`);
    next();
})
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: 'some secret key here',
    //store session in mongodb
    store: store,
    resave: true,
    saveUninitialized: false,
}))
/////////////////////////////// Helper Functions ///////////////////////////////
//Send Response
function sendResponse(res,status,data){
    res.statusCode=status;
    res.write(data);
    res.end();
}
//Send functions.js
app.get("/functions.js",(req,res)=>{
    fs.readFile('functions.js',(err,data)=>{
        if(err)return sendResponse(res,500,'Server Error');
        res.setHeader("Content-Type","application/javascript");
        sendResponse(res,200,data);
    })
})
//Send orderform.js
app.get("/orderform.js",(req,res)=>{
    fs.readFile('public/orderform.js',(err,data)=>{
        if(err)return sendResponse(res,500,'Server Error');
        res.setHeader("Content-Type","application/javascript");
        sendResponse(res,200,data);
    })
})
/////////////////////////////// Main Part ///////////////////////////////
//send homepage
app.get('/', (req, res)=>{
    let ses=req.session;
    ses.searchResult=['a'];
    //console.log(ses);
    //console.log(Object.keys(ses).length)
    res.status=200;
    res.setHeader('Content-Type','text/html');
    res.send(pug.renderFile('public/home.pug', {session: ses, length: Object.keys(ses).length}));
})
//send log in page (where user input username and password)
app.get('/logIn',(req, res)=>{
    res.status=200;
    res.setHeader('Content-Type','text/html');
    res.send(pug.renderFile('public/logIn.pug'));
})
//get username and password from client and query through database.
app.post('/logIn',(req, res)=>{
    console.log(`LogIn Info: username: ${req.body.username}, password: ${req.body.password}`);
    UserModel.LogIN(req.body.username.toLowerCase(), req.body.password, (err, result)=>{
        if(err){throw err};
        if(result!=false){
            console.log(result);
            req.session.logIn=true;
            req.session.username=req.body.username.toLowerCase();
            req.session.password=req.body.password;
            if(result=='public') req.session.privacy=false;
            else req.session.privacy=true;
            res.locals.session=req.session;
            res.status(200).redirect('/');
        }else{
            req.session.logIn=false;
            req.session.username='ERROR404';
            req.session.password='';
            res.locals.session=req.session;
            res.status(200).redirect('/');
        }
    })
})
//let user to logout by cleaning session data and redirecting to homepage
app.get('/logOut', (req, res)=>{
    req.session.logIn=false;
    req.session.username='';
    req.session.password='';
    req.session.searchResult=null;
    res.status=200;
    res.setHeader('Content-Type','text/html');
    res.send(pug.renderFile('public/home.pug', {session: req.session, length: Object.keys(req.session).length}));
})
//send client register page where user can regist as new user
app.get('/register', (req, res)=>{
    res.statusCode=200;
    res.setHeader("Content-Type", "text/html");
    res.send(pug.renderFile('public/register.pug'));
})
//let user to register as new user
app.post('/register', (req, res)=>{
    console.log(`Register Info: username: ${req.body.username}, password: ${req.body.password}`);
    UserModel.Register(req.body.username.toLowerCase(), req.body.password, (err, result)=>{
        if(err){throw err}
        console.log(result);
        if(result){
            let newuser={};
            newuser.username=req.body.username.toLowerCase();
            newuser.password=req.body.password;
            newuser.privacy=false;
            let u=new UserModel(newuser);
            u.save(function(err, callback){
                if(err){console.log(err.message)}
            })
            req.session.logIn=true;
            req.session.username=req.body.username.toLowerCase();
            req.session.password=req.body.password;
            req.session.privacy=false;
            req.session.searchResult=null;
            res.locals.session=req.session;
            res.status(200).redirect(`/profile/${req.body.username}`);
        }else{
            req.session.logIn=false;
            req.session.username='Token';
            req.session.password='';
            req.session.searchResult=null;
            res.locals.session=req.session;
            res.status(200).redirect(`/profile/${req.body.username}`);
        }
    })
})
//go to a specific user profine with given username
app.get("/profile/:username", (req, res)=>{
    console.log(req.session);
    if(req.session.username=='Token'){
        res.statusCode=200;
        res.setHeader("Content-Type", "text/html");
        res.send(pug.renderFile('public/home.pug', {session: req.session, length: Object.keys(req.session).length}));
    }else{
        if(req.params.username=='functions.js'){
            fs.readFile('functions.js',(err,data)=>{
                if(err)return sendResponse(res,500,'Server Error');
                res.setHeader("Content-Type","application/javascript");
                sendResponse(res,200,data);
            })
        }else if(req.params.username=='orderform.js'){
            fs.readFile('public/orderform.js',(err,data)=>{
                if(err)return sendResponse(res,500,'Server Error');
                res.setHeader("Content-Type","application/javascript");
                sendResponse(res,200,data);
            })
        }else{
            console.log(req.params.username);
            UserModel.FindProfile(req.params.username.toLowerCase(), (err, result)=>{
                console.log('profile: '+result);
                if(err){throw err}
                if(result!=false){
                    let avaliable=false;
                    if(req.session.logIn){avaliable=true}
                    else if(!result.privacy){avaliable=true}
                    if(avaliable){
                        res.statusCode=200;
                        res.setHeader("Content-Type", "text/html");
                        res.send(pug.renderFile('public/profile.pug', {data: result, client: req.session}))
                    }else{res.status(403).send()}  
                }else{
                    res.statusCode=200;
                    res.setHeader("Content-Type", "text/html");
                    res.send(pug.renderFile('public/404.pug'))
                }
            })
        }
    }
})
//let user change their privacy
app.post('/changePrivacy', (req, res)=>{
    let userName=req.session.username.toLowerCase();
    UserModel.findOneAndUpdate({username:userName}, {$set: {privacy: !req.session.privacy }}, (err, result)=>{
        if(err) throw err
        req.session.privacy=!req.session.privacy;
        req.session.searchResult=null;
        res.locals.session=req.session;
        res.statusCode=200;
        res.setHeader("Content-Type", "text/html");
        res.send(pug.renderFile('public/profile.pug', {data: result, client: req.session}))
    })
})
//let user search other user by username (for example, input "w" will gives you all user whose username start with w)
app.post('/search', (req, res)=>{
    UserModel.Search(req.body.username, (err, result)=>{
        if(err) throw err
        req.session.searchResult=null;
        req.session.searchResult=result;
        res.locals.session=req.session;
        res.status(200).send(pug.renderFile('public/result.pug',{data: req.session.searchResult, client: req.session}))
    })
})
//give out the result of search
app.get('/result', (req, res)=>{
    res.statusCode=200;
    res.setHeader("Content-Type", "text/html");
    res.send(pug.renderFile('public/result.pug',{data: req.session.searchResult, client: req.session}))
})
//send out the orderform.html
app.get('/orders', (req, res)=>{
    fs.readFile('public/orderform.html',(err,data)=>{
        if(err)return sendResponse(res,500,'Server Error');
        res.setHeader("Content-Type","text/html");
        sendResponse(res,200,data);
    })
})
//accept user's order
app.post('/orders', (req, res)=>{
    console.log(req.body);
    UserModel.Search(req.session.username.toLowerCase(), (err, result)=>{
        if(err) throw err
        let order=req.body;
        let count=result[0].history.length;
        order.id=count;
        console.log(`Order: `+order);
        UserModel.findOneAndUpdate({username: req.session.username.toLowerCase()}, { $push: { history: order } }, (err, resu)=>{
            if(err) throw err
            res.status(200).send();
        })
    })
})
//show history order details
app.get('/order/:username/:id', (req, res)=>{
    let username=req.params.username;
    let id=req.params.id;
    UserModel.Search(username, (err, result)=>{
        if(err) throw err
        let target;
        let avaliable=false;
        console.log(result[0])
        for(let i=0; i<result[0].history.length; i++){
            if(result[0].history[i].id==id){ 
                target=result[0].history[i];
            }
        }
        if(req.session.logIn){avaliable=true}
        else if(!result[0].privacy){avaliable=true}
        if(avaliable){
            console.log(target);
            if(req.session.logIn){}
            res.statusCode=200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile('public/order.pug', {data: target, client: req.session, max:result[0].history.length, username: username, id:id}))
        }else{res.status(403).send()}
        
    })
})
/////////////////////////////// Connect to Mongoose ///////////////////////////////
mongoose.connect('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true})
let db=mongoose.connection;
db.once('open', function(){
    //startServer();
    app.listen(3000);
    console.log("Server listening at http://localhost:3000");
});
