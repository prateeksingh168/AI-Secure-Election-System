import sqlite3
import csv

DB = "database/election.db"

tables = [
    ("elections.csv", "elections"),
    ("voters.csv", "voters"),
    ("users.csv", "users"),
    ("candidates.csv", "candidates"),
    ("seed_votes_for_demo.csv", "votes"),
    ("audit_logs.csv", "audit_logs"),
]

conn = sqlite3.connect(DB)
conn.execute("PRAGMA foreign_keys = ON")

with open("database/schema.sql", encoding="utf-8") as f:
    conn.executescript(f.read())

for filename, table in tables:
    with open(f"database/{filename}", encoding="utf-8", newline="") as f:
        rows = list(csv.reader(f))

    data = rows[1:]

    for index, row in enumerate(data):

        if table == "votes":
            row = [
                row[0],
                row[1],
                row[2],
                f"V{index + 1:03d}",
                row[3],
                row[4]
            ]

        else:
            row = [
                1 if value.lower() == "true"
                else 0 if value.lower() == "false"
                else None if value == ""
                else value
                for value in row
            ]

        placeholders = ",".join(["?"] * len(row))

        conn.execute(
            f"INSERT INTO {table} VALUES ({placeholders})",
            row
        )

conn.commit()
conn.close()

print("SQLite database created successfully.")