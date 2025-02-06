import { randomUUIDv7 } from "bun";
import { getDatabase } from "../utils/database";

const db = getDatabase();
class Volunteer {
    public id: string = randomUUIDv7();
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
}

export default Volunteer

