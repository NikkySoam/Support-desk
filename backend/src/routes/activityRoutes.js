import express from "express";
import { getTicketActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get("/:id/activities", getTicketActivities);

export default router;