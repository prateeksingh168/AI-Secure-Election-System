--
-- PostgreSQL database dump
--

\restrict qzfJtlPeZSKLiiAbadshsoPJbySHAHF8bgJ4Ow8OesQkabeflF8B3XZUlM3Yslr

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    log_id character varying(20) NOT NULL,
    actor_type character varying(30) NOT NULL,
    actor_id character varying(20),
    action character varying(100) NOT NULL,
    election_id character varying(20),
    "timestamp" timestamp without time zone NOT NULL,
    status character varying(30) NOT NULL
);


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    candidate_id character varying(20) NOT NULL,
    election_id character varying(20) NOT NULL,
    name character varying(150) NOT NULL,
    department character varying(100),
    symbol character varying(100),
    manifesto text
);


--
-- Name: elections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.elections (
    election_id character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    status character varying(20) NOT NULL,
    rules_version character varying(50),
    CONSTRAINT valid_election_dates CHECK ((end_date > start_date))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id character varying(20) NOT NULL,
    voter_id character varying(20),
    name character varying(150) NOT NULL,
    email character varying(150),
    role character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'VOTER'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = 'ACTIVE'::text))
);


--
-- Name: voters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voters (
    voter_id character varying(20) NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(150),
    phone character varying(30),
    eligible boolean DEFAULT false NOT NULL,
    verification_status character varying(30) NOT NULL,
    has_voted boolean DEFAULT false NOT NULL,
    role character varying(20) NOT NULL,
    CONSTRAINT voters_role_check CHECK (((role)::text = 'VOTER'::text)),
    CONSTRAINT voters_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['PENDING'::character varying, 'VERIFIED'::character varying])::text[])))
);


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    vote_id character varying(20) NOT NULL,
    election_id character varying(20) NOT NULL,
    candidate_id character varying(20) NOT NULL,
    voter_id character varying(20),
    cast_at timestamp without time zone NOT NULL,
    vote_status character varying(30) NOT NULL
);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (candidate_id);


--
-- Name: elections elections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.elections
    ADD CONSTRAINT elections_pkey PRIMARY KEY (election_id);


--
-- Name: votes one_vote_per_election; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT one_vote_per_election UNIQUE (election_id, voter_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: voters voters_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_email_key UNIQUE (email);


--
-- Name: voters voters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voters
    ADD CONSTRAINT voters_pkey PRIMARY KEY (voter_id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (vote_id);


--
-- Name: audit_logs fk_audit_election; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_audit_election FOREIGN KEY (election_id) REFERENCES public.elections(election_id);


--
-- Name: candidates fk_candidate_election; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fk_candidate_election FOREIGN KEY (election_id) REFERENCES public.elections(election_id) ON DELETE CASCADE;


--
-- Name: votes fk_vote_candidate; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT fk_vote_candidate FOREIGN KEY (candidate_id) REFERENCES public.candidates(candidate_id);


--
-- Name: votes fk_vote_election; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT fk_vote_election FOREIGN KEY (election_id) REFERENCES public.elections(election_id);


--
-- Name: votes fk_vote_voter; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT fk_vote_voter FOREIGN KEY (voter_id) REFERENCES public.voters(voter_id);


--
-- PostgreSQL database dump complete
--

\unrestrict qzfJtlPeZSKLiiAbadshsoPJbySHAHF8bgJ4Ow8OesQkabeflF8B3XZUlM3Yslr

