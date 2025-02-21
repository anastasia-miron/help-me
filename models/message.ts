import { v4 } from "uuid";
import { getDatabase } from "../utils/database";
import User from "./user";

const db = getDatabase();

class Message {
    public id: string = v4();
    public request_id: string = "";
    public user_id: string | null = null;
    public is_system: boolean = false;
    public content: string = "";
    public timestamp: Date = new Date();

    toJSON() {
        return {
            id: this.id,
            request_id: this.request_id,
            user_id: this.user_id,
            user: this.user_id ? User.findById(this.user_id) : null,
            isSystem: this.is_system,
            content: this.content,
            timestamp: this.timestamp
        }
    }

    create() {
        db.query(`INSERT INTO messages (id, request_id, user_id, is_system, content, timestamp) 
                  VALUES ($id, $request_id, $user_id, $is_system, $content, $timestamp)`)
            .run({
                "id": this.id,
                "request_id": this.request_id,
                "is_system": this.is_system,
                "user_id": this.user_id,
                "content": this.content,
                "timestamp": this.timestamp.toISOString()
            });
    }

    static findByRequest (id: string) {
        return db.prepare(`SELECT * FROM messages WHERE request_id = $request_id ORDER BY timestamp ASC`)
            .as(Message).all({
                "request_id": id
            });
    }
}

export default Message;
