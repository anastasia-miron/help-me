export enum RequestStatusEnum {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    CANCELED = "canceled",
    DONE = "done"
}

class Request {
    public id : string | undefined;
    public beneficiary_id : string | undefined;
    public volunteer_id : string | undefined;
    public description : string | undefined;
    public location : string | undefined;
    public status : RequestStatusEnum = RequestStatusEnum.OPEN;
    public created_at : Date | undefined;
   
}