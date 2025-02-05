import {Hono} from "hono";
import { getBeneficiaries, getBeneficiaryById, getBeneficiaryRequests } from "../controllers/beneficiars";

const route = new Hono();
route.get ("/", getBeneficiaries);
route.get ("/:id", getBeneficiaryById);
route.get ("/:id/requests", getBeneficiaryRequests);
export default route;

