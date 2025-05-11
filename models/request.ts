import { v4 } from "uuid";
import { getDatabase } from "../utils/database";
import {
  updateRequestStatusQuery,
  updateRequestQuery,
  handleRequestAssignmentQuery,
  findAllRequestsQuery,
  findRequestByIdQuery,
  findRequestsByBeneficiaryIdQuery,
  findRequestsByVolunteerIdQuery,
  findDoneRequestsOfBeneficiaryQuery,
  findDoneRequestsOfVolunteerQuery,
} from "../db/queries";
import Volunteer from "./volunteer";
import Beneficiary from "./beneficiary";
import User, { UserTypeEnum } from "./user";
import type { LocationPayload } from "../types/type";

const db = getDatabase();

export enum RequestStatusEnum {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  CANCELED = "canceled",
  REJECTED = "rejected",
  DONE = "done",
}

export enum NotificationStatusEnum {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  CANCELED = "canceled",
  REJECTED = "rejected",
  RATED = "rated",
  DONE = "done",
}
export enum RequestUrgencyEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

class Request {
  public id: string = v4();
  public beneficiary_id: string = "";
  public volunteer_id?: string | null = null;
  public title: string = "";
  public description: string = "";
  public location: LocationPayload = { address: "", lat: 0, lng: 0 };
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
      beneficiary: this.beneficiary_id
        ? User.findById(this.beneficiary_id)
        : null,
    };
  }

  create() {
    db.query(
      `INSERT INTO requests (id, beneficiary_id, description, title, location_address, location_lat, location_lng, location, status, created_at) 
                  VALUES ($id, $beneficiary_id, $description, $title,
                    $address, $lat, $lng,
                    $urgency, $status, $created_at)`
    ).run({
      id: this.id,
      beneficiary_id: this.beneficiary_id,
      title: this.title,
      description: this.description,
      address: this.location.address,
      lat: this.location.lat,
      lng: this.location.lng,
      urgency: this.urgency,
      status: this.status,
      created_at: this.created_at.toISOString(),
    });
  }

  update() {
    updateRequestQuery.run({
      id: this.id,
      title: this.title,
      description: this.description,
      address: this.location.address,
      lat: this.location.lat,
      lng: this.location.lng,
      urgency: this.urgency,
    });
  }

  accept(volunteer_id: string) {
    this.volunteer_id = volunteer_id;
    this.status = RequestStatusEnum.IN_PROGRESS;
    handleRequestAssignmentQuery.run({
      id: this.id,
      volunteer_id: this.volunteer_id,
      status: this.status,
    });
  }

  complete() {
    this.status = RequestStatusEnum.DONE;
    updateRequestStatusQuery.run({
      id: this.id,
      status: this.status,
    });
  }

  reject() {
    this.status = RequestStatusEnum.OPEN;
    this.volunteer_id = null;
    handleRequestAssignmentQuery.run({
      id: this.id,
      volunteer_id: this.volunteer_id,
      status: this.status,
    });
  }

  cancel() {
    this.status = RequestStatusEnum.CANCELED;
    updateRequestStatusQuery.run({
      id: this.id,
      status: this.status,
    });
  }

  private static fromRow(row: any): Request {
    const req = Object.assign(new Request(), row);
    if (typeof req.location === "string") {
      req.location = JSON.parse(req.location) as LocationPayload;
    }

    return req;
  }

  static findAll() {
    return findAllRequestsQuery.as(Request).all().map(Request.fromRow);
  }

  static findById(id: string) {
    const row = findRequestByIdQuery.as(Request).get({ id });
    return row ? Request.fromRow(row) : null;
  }

  static findByVolunteerId(volunteerId: string) {
    return findRequestsByVolunteerIdQuery
      .as(Request)
      .all({ volunteer_id: volunteerId })
      .map(Request.fromRow);
  }

  static findByBeneficiaryId(beneficiaryId: string) {
    return findRequestsByBeneficiaryIdQuery
      .as(Request)
      .all({ beneficiary_id: beneficiaryId })
      .map(Request.fromRow);
  }

  static findCompleted(user: User) {
    if (user.type === UserTypeEnum.BENEFICIARY) {
      return findDoneRequestsOfBeneficiaryQuery
        .as(Request)
        .all({ beneficiary_id: user.id })
        .map(Request.fromRow);
    }
    if (user.type === UserTypeEnum.VOLUNTEER) {
      return findDoneRequestsOfVolunteerQuery
        .as(Request)
        .all({ volunteer_id: user.id })
        .map(Request.fromRow);
    }
    return [];
  }
}

export default Request;
