var dev_key = 'RGAPI-49506711-0958-403b-aa1e-764ef9f3aaba',
    express = require('express'),
    request = require('request'),
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

// Home Routes
app.get('/', (req, res) => {
    res.redirect('/home')
})

app.get('/home', (req, res) => {
    res.render('home', {user: req.user})
})

//Profile Routes
app.get('/profile', (req, res) => {
    if(req.user != null){
        // Perform data requests. 
        res.render('profile', {user: req.user})
    } else {res.redirect('/home')}
})

// Riot Account Link Routes

app.get('/link', (req, res) => {
    if(req.user == null){
        res.redirect('/')
    } else {return res.render('link', {user: req.user})}
})

app.post('/link/connect', (req, res) => {
    request(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.body.summoner_name}?api_key=RGAPI-49506711-0958-403b-aa1e-764ef9f3aaba`, (err, response, body) => {
        console.log(req.user)
        var bodyData = JSON.parse(body)
        console.log(bodyData.accountId)
        User.findByIdAndUpdate(req.user._id, {accountId: bodyData.accountId, summonerId: bodyData.id}, (err, foundUser) => {
            if(err) {
                console.log(err)
                res.redirect('/') // Replace with on screen message.
            } else {
                foundUser.save((err) => {
                    if(err) {
                        console.log(err)
                    } else {
                        res.redirect('/logout')
                    }
                })
            }
        })

        // Use Find User By ID and add "body.accountId" to the found user. Implement check to make sure this route cannot be accessed without first being logged in. 
        // Ensure that relinking is not possible. 
    })
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

app.get('/failed', (req, res) => {
    res.send('The login failed. Go back and try again.')
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})