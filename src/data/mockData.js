// src/data/mockData.js

export const mockCandidates = [
  { id: 1, name: "Rahul Sharma", party: "Janata Party", photo_url: "https://randomuser.me/api/portraits/men/32.jpg", manifesto: "Education aur Healthcare par focus karunga." },
  { id: 2, name: "Priya Singh", party: "Aam Aadmi Party", photo_url: "https://randomuser.me/api/portraits/women/44.jpg", manifesto: "Mahila suraksha aur rozgar meri priority hai." },
  { id: 3, name: "Amit Patel", party: "National Party", photo_url: "https://randomuser.me/api/portraits/men/85.jpg", manifesto: "Infrastructure aur Technology ka vikas." },
  { id: 4, name: "Sneha Reddy", party: "Green Party", photo_url: "https://randomuser.me/api/portraits/women/65.jpg", manifesto: "Environment protection aur clean energy." },
];

export const mockElection = {
  id: 101,
  title: "Student Council Election 2024",
  status: "active",
  start_date: "2024-08-01",
  end_date: "2024-08-30"
};

export const mockAnalytics = {
  total_voters: 1500,
  votes_cast: 850,
  turnout_percentage: 56.6,
  candidate_results: [
    { name: "Rahul Sharma", votes: 320 },
    { name: "Priya Singh", votes: 280 },
    { name: "Amit Patel", votes: 150 },
    { name: "Sneha Reddy", votes: 100 },
  ]
};

export const mockAuditLogs = [
  { id: 1, timestamp: "2024-08-27T10:00:00", event_type: "Election Created", actor: "Admin", details: "Election 2024 started" },
  { id: 2, timestamp: "2024-08-27T10:05:00", event_type: "Candidate Added", actor: "Admin", details: "Rahul Sharma added" },
  { id: 3, timestamp: "2024-08-27T11:30:00", event_type: "Vote Cast", actor: "Voter #102", details: "Vote recorded securely" },
];