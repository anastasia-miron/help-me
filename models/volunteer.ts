import { v4 } from "uuid";
import { getDatabase } from "../utils/database";

const db = getDatabase();
class Volunteer {
    public id: string = v4();
    public user_id: string = "";
    public skills: string = "";
    public availability: string = "";


    create () {
        db.query(`INSERT INTO volunteers (id, user_id, skills, availability) VALUES ($id, $user_id, $skills, $availability)`).run({
            "id": this.id,
            "user_id": this.user_id,
            "skills": this.skills,
            "availability": this.availability
        })
    }
        static findAll() {
            return db.query("SELECT * FROM volunteers").as(Volunteer).all();
        }
    
        static findById(id: string) {
            return db.query("SELECT * FROM volunteers WHERE id = ?").as(Volunteer).get(id);
        }
    }

export default Volunteer

