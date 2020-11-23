const journal_data = require('data-store')({ path: process.cwd() + '/data/journals.json' });
const User = require('./User.js');

class Journal {
    constructor(id, user_id, body, date) {
        this.id = id;
        this.user_id = user_id;
        this.body = body;
        this.date = date;
        // this.user = User.findByUsername(user_id);
    }

     update(new_body) {
         this.body = new_body;
         journal_data.set(this.id.toString(), this);
         this.user.removeJournal(this.id);
         this.user.addJournal(this);

    }
    delete() {
        this.user.removeJournal(this.id);
        journal_data.del(this.id.toString());
    }

}

Journal.getAllIDs = () => {
    return Object.keys(journal_data.data).map(id => parseInt(id));
};

Journal.findByID = (id) => {
    let jdata = journal_data.get(id);
    if (jdata != null) {
        return new Journal(jdata.id, jdata.user_id, jdata.body, jdata.date);
    }
    return null;
};

Journal.next_id = Journal.getAllIDs().reduce((max, next_id) => {
    if (max < next_id) {
        return next_id;
    }
    return max;
}, -1) + 1;

Journal.create = (user_id, body) => {
    let id = Journal.next_id;
    Journal.next_id += 1;
    let d = new Date(Date.now());
    let j = new Journal(id, user_id, body, d);
   let u = User.findByUsername(user_id);
    u.addJournal(j);
    journal_data.set(j.id.toString(), j);
    return j;
}


module.exports = Journal;