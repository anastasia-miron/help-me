import {Hono} from "hono";
import { getVolunteers, getVolunteerById, getVolunteerRequests } from "../controllers/volunteers";

const route = new Hono();
route.get("/" , getVolunteers);
route.get("/:id" , getVolunteerById);
route.get("/:id/requests" , getVolunteerRequests);

export default route;
