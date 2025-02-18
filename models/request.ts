import { v4 } from "uuid";
import { getDatabase } from "../utils/database";
import { updateRequestStatusQuery, updateRequestQuery, handleRequestAssignmentQuery, findAllRequestsQuery, findRequestByIdQuery, findRequestsByBeneficiaryIdQuery, findRequestsByVolunteerIdQuery, findDoneRequestsOfBeneficiaryQuery, findDoneRequestsOfVolunteerQuery } from "../db/queries";
import Volunteer from "./volunteer";
import Beneficiary from "./beneficiary";
import User, { UserTypeEnum } from "./user";

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
    public id: string = v4();
    public beneficiary_id: string = "";
    public volunteer_id?: string | null = null;
    public title: string = "";
    public description: string = "";
    public location: string = "";
    public urgency: string = RequestUrgencyEnum.MEDIUM;
    public status: RequestStatusEnum = RequestStatusEnum.OPEN;
    public created_at: Date = new Date();

    toJSON() {
        return {
            id: this.id,
            beneficiary_id: this.beneficiary_id,
            volunteer_id: this.volunteer_id,
            title: this.title,
            description: this.description,
            location: this.location,
            urgency: this.urgency,
            status: this.status,
            created_at: this.created_at,
            volunteer: this.volunteer_id ? User.findById(this.volunteer_id) : null,
            beneficiary: this.beneficiary_id ? User.findById(this.beneficiary_id) : null
        }
    }


    create() {
        db.query(`INSERT INTO requests (id, beneficiary_id, description, title, location, status, created_at) 
                  VALUES ($id, $beneficiary_id, $description, $title, $location, $status, $created_at)`)
            .run({
                "id": this.id,
                "beneficiary_id": this.beneficiary_id,
                "title": this.title,
                "description": this.description,
                "location": this.location,
                "urgency": this.urgency,
                "status": this.status,
                "created_at": this.created_at.toISOString()
            });
    }

    update() {
        updateRequestQuery.run({
            id: this.id,
            title: this.title,
            description: this.description,
            location: this.location,
            urgency: this.urgency,
        });
    }

    accept(volunteer_id: string) {
        this.volunteer_id = volunteer_id;
        this.status = RequestStatusEnum.IN_PROGRESS;
        handleRequestAssignmentQuery.run({
            id: this.id,
            volunteer_id: this.volunteer_id,
            status: this.status
        })
        
    }
   
    complete() {
        this.status = RequestStatusEnum.DONE;
        updateRequestStatusQuery.run({
            id: this.id,
            status: this.status
        });
    }
    reject() {
        this.status = RequestStatusEnum.OPEN;
        this.volunteer_id = null;
        handleRequestAssignmentQuery.run({
            id: this.id,
            volunteer_id: this.volunteer_id,
            status: this.status
        });
    }
    cancel() {
        this.status = RequestStatusEnum.CANCELED;
        updateRequestStatusQuery.run({
            id: this.id,
            status: this.status
        });
    }


    static findAll() {
        return findAllRequestsQuery.as(Request).all();
    }

    static findById(id: string) {
        return findRequestByIdQuery.as(Request).get({ id });
    }
    
    static findByVolunteerId(volunteerId: string) {
        return findRequestsByVolunteerIdQuery.as(Request).all({ volunteer_id: volunteerId });
    }

    static findByBeneficiaryId(beneficiaryId: string) {
        return findRequestsByBeneficiaryIdQuery.as(Request).all({ beneficiary_id: beneficiaryId });
    }

    static findCompleted(user: User) {
        if(user.type === UserTypeEnum.BENEFICIARY) {
            return findDoneRequestsOfBeneficiaryQuery.as(Request).all({ beneficiary_id: user.id });
        } 
        if(user.type === UserTypeEnum.VOLUNTEER) {
            return findDoneRequestsOfVolunteerQuery.as(Request).all({ volunteer_id: user.id });
        }
        return []
    }
}


export default Request;
