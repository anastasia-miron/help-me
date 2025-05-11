import { Hono } from "hono";

import { jwtVerify } from "../middlewares/jwtVerify";
import { getAllRegions, getRegionStatsByIso } from "../controllers/regions";

const route = new Hono();

route.get("/", jwtVerify, getAllRegions);
route.get("/:iso/volunteer", getRegionStatsByIso);

export default route;
