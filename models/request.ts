import { randomUUIDv7 } from "bun";
import { getDatabase } from "../utils/database";

const db = getDatabase();

export enum RequestStatusEnum {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    CANCELED = "canceled",
    DONE = "done"
}

export enum RequestUrgencyEnum {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

class Request {
    public id: string = randomUUIDv7();
    public beneficiary_id: string = "";
    public volunteer_id?: string;
    public title: string = "";
    public description: string = "";
    public location: string = "";
    public urgency: string = RequestUrgencyEnum.MEDIUM;
    public status: RequestStatusEnum = RequestStatusEnum.OPEN;
    public created_at: Date = new Date();

    create() {
        db.query(`INSERT INTO requests (id, beneficiary_id, volunteer_id, description, location, status, created_at) 
                  VALUES ($id, $beneficiary_id, $volunteer_id, $description, $location, $status, $created_at)`)
            .run({
                "id": this.id,
                "beneficiary_id": this.beneficiary_id,
                "volunteer_id": this.volunteer_id || null,
                "title": this.title,
                "description": this.description,
                "location": this.location,
                "urgency": this.urgency,
                "status": this.status,
                "created_at": this.created_at.toISOString()
            });
    }
}

export default Request;
