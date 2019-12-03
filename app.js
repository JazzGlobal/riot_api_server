var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    app = express()

// MONGOOSE CONFIG
// Input correct <password>
mongoose.connect('mongodb+srv://admin:admin@cluster0-o2apy.mongodb.net/riot_api_server?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})

//PASSPORT CONFIG
passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((obj,done)=>{
    done(null,obj);
});

app.use(require("express-session")({
    secret: 'i am root',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// General Configuration
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/home')
})

app.get('/home', (req, res) => {
    res.render('home', {user: req.user})
})

// Authorization Routes 

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/login', (req, res) => {
    if(req.user == null){
        return res.render('login', {user: req.user});
    } else {res.redirect('/')}
});

app.post('/login', passport.authenticate('local',{successRedirect: "/", failureRedirect: "/failed"}),
  function(req, res, next){
});

app.get('/signup', (req, res) => {
    if(req.user == null){
        return res.render('signup', {user: req.user});
    } else {res.redirect('/')}
});

app.post('/signup', (req, res) => {
    var newUser = new User(
        {
            username: req.body.username, 
            email: req.body.email,
        });
    User.register(newUser, req.body.password ,(err, user) => {
        if(err){
            console.log(err);
            return res.render('signup', {user: user, err: err});
        }
        passport.authenticate('local')(req, res, ()=> {
            res.redirect('/');
        });
    });
});

app.listen(3000, () => {
    console.log('Listening on port 3000')
})