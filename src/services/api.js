import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  login: async (data) => {
    const response = await client.post("/auth/login", data);
    return response.data;
  },

  // Elections
  getElections: async () => {
    const response = await client.get("/elections");
    return response.data;
  },

  // Candidates
  getCandidates: async (electionId = "E001") => {
    const response = await client.get(
      `/elections/${electionId}/candidates`
    );
    return response.data;
  },

  // Eligibility
  getEligibility: async (electionId = "E001") => {
    const response = await client.get(
      `/voters/me/eligibility?election_id=${electionId}`
    );
    return response.data;
  },

  // Voting
  castVote: async (data, electionId = "E001") => {
    const response = await client.post(
      `/elections/${electionId}/vote`,
      data
    );
    return response.data;
  },

  // Results / Analytics
  getAnalytics: async (electionId = "E001") => {
    const response = await client.get(
      `/elections/${electionId}/results`
    );
    return response.data;
  },

    // Audit Logs
  getAuditLogs: async (electionId = "E001") => {
    const response = await client.get(
      `/audit-logs?election_id=${electionId}`
    );
    return response.data;
  },
  // AI Question & Answer
  askAssistant: async (question, electionId = "E001") => {
    const response = await client.post(
      `/ai/ask/${electionId}`,
      {
        question,
        election_id: electionId,
      }
    );

    return response.data;
  },


  // Biometric enrollment
  enrollBiometric: async (data) => {
    const response = await client.post(
      "/biometrics/enroll",
      data
    );
    return response.data;
  },

  // Biometric verification
  verifyBiometric: async (data) => {
    const response = await client.post(
      "/biometrics/verify",
      data
    );
    return response.data;
  },

  baseUrl: API_BASE_URL,
};
