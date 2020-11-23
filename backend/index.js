const express = require('express');
const app = express();
const User = require('./User.js');
const Journal = require('./Journal.js');
const MoodTracker = require('./MoodTracker.js');



const bodyParser = require('body-parser');
app.use(bodyParser.json());

const expressSession = require('express-session');

    app.use(expressSession({
        name: "mentalHealthAppSession",
        secret: "aksjdlkasjdlaj",
        resave: false,
        saveUninitialized: false
    }));

app.post('/login', (req,res) => {

    let username = req.params.username;
    let password = req.params.password;

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
    res.status(403).send("Unauthorized");
});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
})


// create user

app.post('/user', (req, res) => {
    
    let u = User.create(req.params.username, req.params.password, req.params.fname, req.params.lname);
    if (u==null) {
        res.status(400).send("Bad Request");
        return;
    }
    return res.json(u);
});

// create journal (then update user's journal array)

app.post('/journal', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let j = Journal.create(req.session.user, req.body);

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


// const port = 3030;
// app.listen(port, () => {
//     console.log("Tutorial1 up and running on port " + port);
// });
