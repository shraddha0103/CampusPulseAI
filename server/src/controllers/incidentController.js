import { io } from "../index.js";
import prisma from "../config/db.js";
import { analyzeIncident } from "../utils/gemini.js";

// Create Incident
export const createIncident = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    // AI Analysis
    const aiResult = await analyzeIncident(description);

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        location,
        category: aiResult.category,
        severity: aiResult.severity,
        userId: req.user.id,
      },
    });

    // Emit real-time event
    io.emit("newIncident", incident);

    res.status(201).json({
      message: "Incident reported successfully",
      aiAnalysis: aiResult,
      incident,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllIncidents = async (req, res) => {

  try {

    const incidents = await prisma.incident.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(incidents);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get Logged In User Incidents
export const getMyIncidents = async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(incidents);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const { status } = req.body;

    const updatedIncident = await prisma.incident.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
      },
    });

    // Emit real-time update
    io.emit("incidentUpdated", updatedIncident);

    res.status(200).json({
      message: "Incident status updated",
      incident: updatedIncident,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};