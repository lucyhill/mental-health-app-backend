const mood_data = require('data-store')({ path: process.cwd() + '/data/moods.json' });
const User = require('./User.js'); 

class MoodTracker {
    constructor(id, user_id, mood, date) {
        this.id = id;
        this.user_id = user_id;
        this.user = User.findByUsername(user_id);
        this.mood = mood;
        this.date = date;
    }

    update(new_mood) {
        this.mood = new_mood;
        mood_data.set(this.id.toString(), this);
        this.user.removeMoodTracker(this.id);
        this.user.addMoodTracker(this);
    }

    delete() {
        this.user.removeMoodTracker(this.id);
        mood_data.del(this.id.toString());
    }
}

MoodTracker.getAllIDs = () => {
    return Object.keys(mood_data.data).map(id => parseInt(id));
};

MoodTracker.findByID = (id) => {
    let mdata = mood_data.get(id);
    if (mdata != null) {
        return new MoodTracker(mdata.id, mdata.user_id, mdata.mood, mdata.date);
    }
    return null;
};

MoodTracker.next_id = MoodTracker.getAllIDs().reduce((max, next_id) => {
    if (max < next_id) {
        return next_id;
    }
    return max;
}, -1) + 1;

MoodTracker.create = (user_id, mood) => {
    let id = MoodTracker.next_id;
    MoodTracker.next_id += 1;
    let d = new Date(Date.now());
    let m = new MoodTracker(id, user_id, mood, d);
    let u = User.findByUsername(user_id);
    u.addMoodTracker(m);
    mood_data.set(m.id.toString(), m);
    return m;
}

module.exports = MoodTracker;
