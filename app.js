var express = require('express'),
    request = require('request'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    data_server = ' http://localhost:3001',
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

// Home Routes
app.get('/', (req, res) => {
    res.redirect('/home')
})

app.get('/home', (req, res) => {
    res.render('home', {user: req.user})
})

app.get('/search', (req, res) => {
    console.log(req.query.summoner_name)
    request(`${data_server}/summoner/account/name/${req.query.summoner_name}`, (userError, userResponse, userBody) => {
        if(userError){
            console.log(userError)
        } else {
            var summoner_data = JSON.parse(userBody)
            request(`${data_server}/summoner/championmastery/${summoner_data.id}`, (masteryError, masteryResponse, masteryBody) => {
                if(masteryError) {
                    console.log(masteryError)
                }
                var mastery_data = JSON.parse(masteryBody)
                res.render('results', {summoner_data: summoner_data, mastery_data: mastery_data})
            })
        }
    })
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})