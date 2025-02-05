import { randomUUIDv7 } from "bun";
class Volunteer {
    public id: string = randomUUIDv7();
    public user_id: string = "";
    public skills: string = "";
    public availability: string = "";


}

export default Volunteer

