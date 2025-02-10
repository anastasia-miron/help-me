import { v4 } from "uuid";
import { getDatabase } from "../utils/database";

const db = getDatabase();

class Message {
    public id: string = v4();
    public request_id: string = "";
    public user_id: string = "";
    public content: string = "";
    public timestamp: Date = new Date();

    create() {
        db.query(`INSERT INTO messages (id, request_id, user_id, content, timestamp) 
                  VALUES ($id, $request_id, $user_id, $content, $timestamp)`)
            .run({
                "id": this.id,
                "request_id": this.request_id,
                "user_id": this.user_id,
                "content": this.content,
                "timestamp": this.timestamp.toISOString()
            });
    }
}

export default Message;
