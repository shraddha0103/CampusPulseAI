import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createIncident,
  getAllIncidents,
  getMyIncidents,
  updateIncidentStatus,
} from "../controllers/incidentController.js";

const router = express.Router();

// Create Incident
router.post("/", authMiddleware, createIncident);

// Get All Incidents
router.get("/", authMiddleware, getAllIncidents);

// Get Logged-in User Incidents
router.get("/my", authMiddleware, getMyIncidents);

router.patch(
  "/:id",
  authMiddleware,
  updateIncidentStatus
);

export default router;