import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import API from "../services/api";

// Socket connection
const socket = io(
  import.meta.env.VITE_SOCKET_URL
);

function Dashboard() {

  const [incidents, setIncidents] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
  });

  // Analytics Data
  const totalIncidents = incidents.length;

  const pendingCount = incidents.filter(
    (i) => i.status === "Pending"
  ).length;

  const resolvedCount = incidents.filter(
    (i) => i.status === "Resolved"
  ).length;

  const highSeverityCount = incidents.filter(
    (i) => i.severity === "High"
  ).length;

  const categoryData = [
    {
      name: "Water",
      value: incidents.filter(
        (i) => i.category === "Water"
      ).length,
    },
    {
      name: "Electrical",
      value: incidents.filter(
        (i) => i.category === "Electrical"
      ).length,
    },
    {
      name: "Cleanliness",
      value: incidents.filter(
        (i) => i.category === "Cleanliness"
      ).length,
    },
    {
      name: "Other",
      value: incidents.filter(
        (i) => i.category === "Other"
      ).length,
    },
  ];

  // Fetch incidents
  const fetchIncidents = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get(
        "/incidents/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIncidents(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  // Real-time updates
  useEffect(() => {

    const loadIncidents = async () => {
      await fetchIncidents();
    };

    loadIncidents();

    // Listen for new incidents
    socket.on("newIncident", (newIncident) => {

      setIncidents((prev) => [
        newIncident,
        ...prev,
      ]);

    });

    // Listen for incident updates
    socket.on("incidentUpdated", () => {

      fetchIncidents();

    });

    return () => {

      socket.off("newIncident");
      socket.off("incidentUpdated");

    };

  }, []);

  // Handle form input changes
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  // Submit incident
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      await API.post(
        "/incidents",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Incident reported successfully");

      setFormData({
        title: "",
        description: "",
        location: "",
      });

      fetchIncidents();

    } catch (error) {

      console.log(error);

      alert("Failed to report incident");
    }
  };

  // Update incident status
  const updateStatus = async (id, status) => {

    try {

      const token = localStorage.getItem("token");

      await API.patch(
        `/incidents/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchIncidents();

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        CampusPulse AI Dashboard
      </h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500">
            Total Incidents
          </h3>

          <p className="text-3xl font-bold text-blue-600">
            {totalIncidents}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500">
            Pending
          </h3>

          <p className="text-3xl font-bold text-yellow-600">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500">
            Resolved
          </h3>

          <p className="text-3xl font-bold text-green-600">
            {resolvedCount}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-500">
            High Severity
          </h3>

          <p className="text-3xl font-bold text-red-600">
            {highSeverityCount}
          </p>
        </div>

      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          Incident Categories
        </h2>

        <div className="flex justify-center">

          <PieChart width={400} height={300}>

            <Pie
              data={categoryData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>

        </div>

      </div>

      {/* IoB Insights */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          AI & IoB Insights
        </h2>

        <div className="space-y-3">

          <p>
            📌 Most incidents are currently marked as
            pending.
          </p>

          <p>
            ⚡ High severity incidents require immediate
            attention.
          </p>

          <p>
            📍 Frequent complaints detected in high-traffic
            campus areas.
          </p>

          <p>
            🤖 AI-based classification is actively monitoring
            incident trends.
          </p>

        </div>

      </div>

      {/* Incident Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-2xl font-semibold mb-4">
          Report Incident
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            name="title"
            placeholder="Incident Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <textarea
            name="description"
            placeholder="Describe the incident"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Submit Incident
          </button>

        </form>

      </div>

      {/* Incident List */}
      <div>

        <h2 className="text-2xl font-semibold mb-4">
          Recent Incidents
        </h2>

        <div className="grid gap-4">

          {incidents.map((incident) => (

            <div
              key={incident.id}
              className="bg-white p-5 rounded-xl shadow"
            >

              <div className="flex justify-between items-center mb-2">

                <h3 className="text-xl font-bold">
                  {incident.title}
                </h3>

                <span className="bg-yellow-200 px-3 py-1 rounded-full text-sm">
                  {incident.status}
                </span>

              </div>

              <p className="text-gray-700 mb-2">
                {incident.description}
              </p>

              <p className="text-sm text-gray-500">
                📍 {incident.location}
              </p>

              <div className="flex gap-3 mt-3">

                <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                  {incident.category || "Other"}
                </span>

                <span className="bg-red-100 px-3 py-1 rounded-full text-sm">
                  {incident.severity || "Medium"}
                </span>

              </div>

              {/* Status Buttons */}
              <div className="flex gap-2 mt-4">

                <button
                  onClick={() =>
                    updateStatus(
                      incident.id,
                      "In Progress"
                    )
                  }
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm"
                >
                  In Progress
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      incident.id,
                      "Resolved"
                    )
                  }
                  className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Resolved
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;