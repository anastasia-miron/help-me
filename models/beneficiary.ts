import { getDatabase } from "../utils/database";
import { randomUUIDv7 } from "bun";

const db = getDatabase();

class Beneficiary {
    public id: string = randomUUIDv7();
    public user_id: string = "";
    public needs: string = "";
    public location: string = "";

    create() {
        db.query<unknown, { id: string, user_id: string, needs: string, location: string }>(`INSERT INTO beneficiaries (id, user_id, needs, location) VALUES ($id, $user_id, $needs, $location)`)
            .run({
                "id": this.id!,
                "user_id": this.user_id!,
                "needs": this.needs!,
                "location": this.location!
            })
    }


}

export default Beneficiary