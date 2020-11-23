const user_data = require('data-store')({ path: process.cwd() + '/data/users.json' });

class User {
    constructor(username, password, fname, lname) {
        this.username = username;
        this.password = password;
        this.fname = fname;
        this.lname = lname;

        this.journals = [];
        this.moodTrackers = [];
    }

    update() {
        user_data.set(this.username, this);
    }

    delete() {
        user_data.del(this.username);
    }

    addJournal(journal) {
        this.journals.push(journal);
        this.update();
    }

    addMoodTracker(mood_tracker) {
        this.moodTrackers.push(mood_tracker);
        this.update();
    }

    removeJournal(journal_id) {
        this.journals = this.journal.filter(journal=> journal.id!=journal_id);
        this.update();
    }

    removeMoodTracker(moodTracker_id) {
        this.moodTrackers = this.moodTrackers.filter(moodTracker=> moodTracker.id!=moodTracker_id);
        this.update();
    }
}

User.getAllUsernames = () => {
    return Object.keys(user_data.data);
};

User.findByUsername = (username) => {
    let udata = user_data.get(username);
    if (udata != null) {
        let x = new User(udata.username, udata.password, udata.fname, udata.lname);
        x.journals = udata.journals;
        x.moodTrackers = udata.moodTrackers;
    }
    return null;
};


User.create = (username, password, fname, lname) => {
    let u = new User(username.toString(), password.toString(), fname.toString(), lname.toString());
    user_data.set(u.username, u);
    return u;
}

module.exports = User;


