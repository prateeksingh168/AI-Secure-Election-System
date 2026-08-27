from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATABASE_DIR = PROJECT_ROOT / "database" / "data"


def find_column(df, possible_columns):
    for col in possible_columns:
        if col in df.columns:
            return col
    return None


class ElectionAnalytics:
    def __init__(self):
        self.voters_path = Path(r"D:\Hackathon Practice Projects\AI-Secure-Election-System\database") / "voters.csv"
        self.votes_path = Path(r"D:\Hackathon Practice Projects\AI-Secure-Election-System\database") / "seed_votes_for_demo.csv"
        self.candidates_path = Path(r"D:\Hackathon Practice Projects\AI-Secure-Election-System\database") / "candidates.csv"
        self.elections_path = Path(r"D:\Hackathon Practice Projects\AI-Secure-Election-System\database") / "elections.csv"

    def _read_csv(self, path):
        if not path.exists():
            return pd.DataFrame()

        return pd.read_csv(path)

    def calculate_turnout(self, election_id=None):
        voters = self._read_csv(self.voters_path)
        votes = self._read_csv(self.votes_path)

        if voters.empty:
            return {
                "error": "voters.csv not found or empty"
            }

        voter_election_col = find_column(voters, ["election_id"])
        vote_election_col = find_column(votes, ["election_id"])

        if election_id and voter_election_col:
            voters = voters[voters[voter_election_col].astype(str) == str(election_id)]

        if election_id and vote_election_col and not votes.empty:
            votes = votes[votes[vote_election_col].astype(str) == str(election_id)]

        eligible_col = find_column(voters, ["eligible", "is_eligible", "eligibility_status", "status"])

        if eligible_col:
            eligible_voters = voters[
                voters[eligible_col].astype(str).str.lower().isin(
                    ["true", "1", "yes", "eligible", "verified", "active"]
                )
            ]
        else:
            eligible_voters = voters

        voter_id_col_in_votes = find_column(votes, ["voter_id", "user_id"]) if not votes.empty else None

        if not votes.empty and voter_id_col_in_votes:
            votes_cast = votes[voter_id_col_in_votes].nunique()
        else:
            votes_cast = len(votes)

        total_eligible = len(eligible_voters)

        turnout_percentage = 0

        if total_eligible > 0:
            turnout_percentage = round((votes_cast / total_eligible) * 100, 2)

        return {
            "election_id": election_id or "all",
            "eligible_voters": total_eligible,
            "votes_cast": int(votes_cast),
            "turnout_percentage": turnout_percentage
        }

    def candidate_vote_distribution(self, election_id=None):
        votes = self._read_csv(self.votes_path)
        candidates = self._read_csv(self.candidates_path)

        if votes.empty:
            return {
                "error": "seed_votes_for_demo.csv not found or empty"
            }

        candidate_col_votes = find_column(votes, ["candidate_id", "selected_candidate_id"])
        election_col_votes = find_column(votes, ["election_id"])

        if not candidate_col_votes:
            return {
                "error": "candidate_id column not found in votes file"
            }

        if election_id and election_col_votes:
            votes = votes[votes[election_col_votes].astype(str) == str(election_id)]

        distribution = (
            votes.groupby(candidate_col_votes)
            .size()
            .reset_index(name="vote_count")
        )

        total_votes = distribution["vote_count"].sum()

        if total_votes > 0:
            distribution["percentage"] = round((distribution["vote_count"] / total_votes) * 100, 2)
        else:
            distribution["percentage"] = 0

        candidate_id_col = find_column(candidates, ["candidate_id", "id"]) if not candidates.empty else None

        if candidate_id_col:
            distribution[candidate_col_votes] = distribution[candidate_col_votes].astype(str)
            candidates[candidate_id_col] = candidates[candidate_id_col].astype(str)

            distribution = distribution.merge(
                candidates,
                left_on=candidate_col_votes,
                right_on=candidate_id_col,
                how="left"
            )

        return {
            "election_id": election_id or "all",
            "total_votes": int(total_votes),
            "distribution": distribution.to_dict(orient="records")
        }

    def election_summary(self, election_id=None):
        turnout = self.calculate_turnout(election_id=election_id)
        distribution = self.candidate_vote_distribution(election_id=election_id)

        return {
            "turnout": turnout,
            "candidate_distribution": distribution
        }