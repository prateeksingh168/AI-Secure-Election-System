// src/data/mockData.js

export const mockCandidates = [
  {
    id: "C001",
    name: "Aditi Sharma",
    party: "Janata Party",
    photo_url: "https://randomuser.me/api/portraits/women/32.jpg",
    manifesto: "Education and Healthcare par focus."
  },
  {
    id: "C002",
    name: "Rahul Verma",
    party: "Aam Aadmi Party",
    photo_url: "https://randomuser.me/api/portraits/men/32.jpg",
    manifesto: "Employment and public welfare par focus."
  },
  {
    id: "C003",
    name: "Priya Singh",
    party: "National Party",
    photo_url: "https://randomuser.me/api/portraits/women/44.jpg",
    manifesto: "Women safety and employment meri priority."
  },
  {
    id: "C004",
    name: "Kunal Patel",
    party: "Green Party",
    photo_url: "https://randomuser.me/api/portraits/men/85.jpg",
    manifesto: "Environment and clean energy par focus."
  },
  {
    id: "C005",
    name: "Neha Gupta",
    party: "Development Party",
    photo_url: "https://randomuser.me/api/portraits/women/65.jpg",
    manifesto: "Infrastructure and technology development."
  }
];

export const mockElection = {
  id: "E001",
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
    { name: "Aditi Sharma", votes: 320 },
    { name: "Rahul Verma", votes: 280 },
    { name: "Priya Singh", votes: 150 },
    { name: "Kunal Patel", votes: 100 },
    { name: "Neha Gupta", votes: 0 }
  ]
};

export const mockAuditLogs = [
  {
    id: 1,
    timestamp: "2024-08-27T10:00:00",
    event_type: "Election Created",
    actor: "Admin",
    details: "Election 2024 started"
  },
  {
    id: 2,
    timestamp: "2024-08-27T10:05:00",
    event_type: "Candidate Added",
    actor: "Admin",
    details: "Aditi Sharma added"
  },
  {
    id: 3,
    timestamp: "2024-08-27T11:30:00",
    event_type: "Vote Cast",
    actor: "Voter",
    details: "Vote recorded securely"
  }
];