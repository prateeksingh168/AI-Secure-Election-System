PRAGMA foreign_keys = ON;

CREATE TABLE elections (
    election_id VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    rules_version VARCHAR(50),
    PRIMARY KEY (election_id),
    CONSTRAINT valid_election_dates CHECK (end_date > start_date)
);

CREATE TABLE voters (
    voter_id VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    eligible BOOLEAN NOT NULL DEFAULT 0,
    verification_status VARCHAR(30) NOT NULL,
    has_voted BOOLEAN NOT NULL DEFAULT 0,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (voter_id),
    UNIQUE (email),
    CONSTRAINT voters_role_check CHECK (role = 'VOTER'),
    CONSTRAINT voters_verification_status_check
        CHECK (verification_status IN ('PENDING', 'VERIFIED'))
);

CREATE TABLE users (
    user_id VARCHAR(20) NOT NULL,
    voter_id VARCHAR(20),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE (email),
    CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'VOTER')),
    CONSTRAINT users_status_check CHECK (status = 'ACTIVE'),
    FOREIGN KEY (voter_id)
        REFERENCES voters(voter_id)
);

CREATE TABLE candidates (
    candidate_id VARCHAR(20) NOT NULL,
    election_id VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    symbol VARCHAR(100),
    manifesto TEXT,
    PRIMARY KEY (candidate_id),
    FOREIGN KEY (election_id)
        REFERENCES elections(election_id)
        ON DELETE CASCADE
);

CREATE TABLE votes (
    vote_id VARCHAR(20) NOT NULL,
    election_id VARCHAR(20) NOT NULL,
    candidate_id VARCHAR(20) NOT NULL,
    voter_id VARCHAR(20) NOT NULL,
    cast_at TIMESTAMP NOT NULL,
    vote_status VARCHAR(30) NOT NULL,
    PRIMARY KEY (vote_id),
    UNIQUE (election_id, voter_id),
    FOREIGN KEY (election_id)
        REFERENCES elections(election_id),
    FOREIGN KEY (candidate_id)
        REFERENCES candidates(candidate_id),
    FOREIGN KEY (voter_id)
        REFERENCES voters(voter_id)
);

CREATE TABLE audit_logs (
    log_id VARCHAR(20) NOT NULL,
    actor_type VARCHAR(30) NOT NULL,
    actor_id VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    election_id VARCHAR(20),
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL,
    PRIMARY KEY (log_id),
    FOREIGN KEY (election_id)
        REFERENCES elections(election_id)
);
CREATE TABLE biometric_records (
    record_id VARCHAR(50) NOT NULL,
    voter_id VARCHAR(20) NOT NULL,
    method VARCHAR(20) NOT NULL,
    template_hash VARCHAR(255) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    enrolled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (record_id),
    FOREIGN KEY (voter_id)
        REFERENCES voters(voter_id),
    UNIQUE (voter_id, method)
);