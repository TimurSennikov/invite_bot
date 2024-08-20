const db = require("better-sqlite3")("server.db");

class State{
    #exists(id){
        return db.prepare("SELECT * FROM states WHERE id = ?").get(id) == undefined ? false : true;
    }

    getState(ctx){
        let result = db.prepare("SELECT state FROM states WHERE id = ?").get(ctx.from.id);

        return result != undefined ? result.state : "idle";
    }

    setState(ctx, state){
        if(!this.#exists(ctx.from.id)){db.prepare("INSERT INTO states VALUES(?, ?)").run(ctx.from.id, state);}
        else{db.prepare("UPDATE states SET state = ? WHERE id = ?").run(state, ctx.from.id);}
    }
};

class Queue{
    #exists(id){
        return db.prepare("SELECT * FROM queue WHERE id = ?").get(id) == undefined ? false : true;
    }

    get(id){
        let result = db.prepare("SELECT * FROM queue WHERE id = ?").get(id);

        return result;
    }

    add(id, form){
        if(!this.#exists(id)){
            db.prepare("INSERT INTO queue VALUES(?, ?)").run(id, form);
        }
        else{
            db.prepare("UPDATE queue SET form = ? WHERE id = ?").run(form, id);
        }
    }

    remove(id){
        if(!this.#exists(id)){
            return -1;
        }
        else{
            db.prepare("DELETE FROM queue WHERE id = ?").run(id);
        }
    }
};

class Command{
    static getArg(command, ctx){
        return ctx.message.text.split(command)[1].trim() || "0";
    }
};

module.exports = {State, Queue, Command};