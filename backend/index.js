const express = require('express');
const session = require('express-session');
const app = express();
const User = require('./User.js');
const Journal = require('./Journal.js');
const MoodTracker = require('./MoodTracker.js');
var sessionstore = require('sessionstore');
const cors = require('cors')

app.use(cors());




const bodyParser = require('body-parser');
app.use(bodyParser.json());

    app.use(session({
        name: "mentalHealthAppSession",
        secret: "aksjdlkasjdlaj",
        resave: false,
        saveUninitialized: false,
        store: sessionstore.createSessionStore(),
       // proxy : true, // add this when behind a reverse proxy, if you need secure cookies
        cookie : {
            // secure : true,
            maxAge: 5184000000 // 2 months
        }
    }));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
      });

app.post('/login', (req,res) => {
    res.set('Access-Control-Allow-Origin', '*');

    let username = req.body.username;
    let password = req.body.password;

    let user_data = User.findByUsername(username);
    if (user_data == null) {
        res.status(404).send("user not found");
        return;
    }
    if (user_data.password == password) {
        console.log("User " + username + " credentials valid");
        req.session.user = username;
        res.json(true);
        return;
    }
    // res.status(403).send("Unauthorized");
});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
    return;
})

app.get('/', (req, res)=> {
    res.json(true);
    return;
})


// create user

app.post('/user', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    
    let u = User.create(req.body.username, req.body.password, req.body.fname, req.body.lname);
    if (u==null) {
        res.status(400).send("Bad Request");
        return;
    }
    return res.json(u);
});

// create journal (then update user's journal array)

app.post('/journal', (req, res) => {
    // if (req.session.user == undefined) {
    //     res.status(403).send("Unauthorized");
    //     return;
    // }
    let j = Journal.create(req.session.user, req.body.body);

    if (j==null) {
        res.status(400).send("Bad Request");
        return;
    }

    return res.json(j);

});
// create moodTracker (then update user's mood tracker array)

app.post('/journal', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let m = MoodTracker.create(req.session.user, req.body);

    if (m==null) {
        res.status(400).send("Bad Request");
        return;
    }

    return res.json(m);

});


// retrieve user info (access data and journal/ mood arrays)
app.get('/:username', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let user = User.findByUsername(req.params.username);
    if(user == null) {
        res.status(404).send("not found");
        return;
    }
    if(user.username != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }
    return res.json(user);
})

app.get('/journal', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let user = User.findByUsername(req.body.username);
    return res.json(user.journals);
})

app.get('/moodtracker', (req, res) =>{
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let user = User.findByUsername(req.session.user);
    return res.json(user.moodTrackers);
});

//retrieve specific journal

app.get('/journal/:id', (req, res)=> {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let journal = Journal.findByID(req.params.id);
    if(journal == null) {
        res.status(404).send("not found");
        return;
    }
    if(journal.user_id != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }
    return res.json(journal);
});
//retrieve specific mood tracker

app.get('/moodtracker/:id', (req, res)=> {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let mt = MoodTracker.findByID(req.params.id);
    if(mt == null) {
        res.status(404).send("not found");
        return;
    }
    if(mt.user_id != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }
    return res.json(mt);
});


// //update user info nevermind too complicated

//update journal info
app.put('/journal/:id', (req, res)=> {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let journal = Journal.findByID(req.params.id);
    if(journal == null) {
        res.status(404).send("not found");
        return;
    }
    if(journal.user_id != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    journal.update(req.body.entry);
    return res.json(journal);
});
//update mood tracker info
app.put('/moodtracker/:id', (req, res)=> {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let mt = MoodTracker.findByID(req.params.id);
    if(mt == null) {
        res.status(404).send("not found");
        return;
    }
    if(mt.user_id != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    mt.update(req.body.mood);
    return res.json(mt);
});

app.delete('/journal/:id', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let journal = Journal.findByID(req.params.id);
    if(journal == null) {
        res.status(404).send("not found");
        return;
    }
    if(journal.user_id != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    journal.delete();
    return res.json(true);
});

app.delete('/moodtracker/:id', (req, res)=> {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let mt = MoodTracker.findByID(req.params.id);
    if(mt == null) {
        res.status(404).send("not found");
        return;
    }
    if(mt.user_id != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    mt.delete();
    return res.json(true);
});

//delete user (delete all journal and moodtrackers as well) 
//delete specific journal (and remove from user's array)
//delete specific moodTracker (and remove from user's array)

app.listen(process.env.PORT || 3030);
