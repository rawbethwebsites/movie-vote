"use client";

import { useState } from "react";
import styles from "./MovieVote.module.css";

interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
}

interface VoteRecord {
  roomId: string;
  movieId: string;
  voterName: string;
}

export default function MovieVoting() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [voterName, setVoterName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());

  const votedFor = (movieId: string) =>
    votes.some((v) => v.roomId === roomCode && v.movieId === movieId);

  const addMovie = () => {
    if (!newTitle.trim()) return;
    const movie: Movie = {
      id: `movie-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      year: parseInt(newYear) || 2024,
    };
    setMovies([...movies, movie]);
    setNewTitle("");
    setNewDescription("");
    setNewYear(new Date().getFullYear().toString());
  };

  const removeMovie = (id: string) => {
    setMovies(movies.filter((m) => m.id !== id));
    setVotes(votes.filter((v) => v.movieId !== id));
  };

  const vote = (movieId: string) => {
    if (!roomCode || !voterName || !isHost) {
      alert("Enter room code and name, then click 'Join as Camper'");
      return;
    }
    if (votedFor(movieId)) {
      setVotes(votes.filter((v) => !(v.roomId === roomCode && v.movieId === movieId)));
    } else {
      setVotes([...votes, { roomId: roomCode, movieId, voterName }]);
    }
  };

  const getVoteCount = (movieId: string) =>
    votes.filter((v) => v.movieId === movieId).length;

  const sortedMovies = [...movies].sort((a, b) =>
    getVoteCount(b.id) - getVoteCount(a.id)
  );

  const winner =
    sortedMovies[0] && getVoteCount(sortedMovies[0].id) > 0
      ? sortedMovies[0]
      : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎬 Movie Vote</h1>
        <p className={styles.subtitle}>
          Pick the next film. Host adds movies. Everyone votes.
        </p>
      </header>

      <div className={styles.authSection}>
        <div className={styles.inputGroup}>
          <label>Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="e.g. CAMP2026"
            maxLength={10}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Your Name</label>
          <input
            type="text"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setIsHost(true)}
            disabled={!roomCode || !voterName}
          >
            Join as Host
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setIsHost(false)}
            disabled={!roomCode || !voterName}
          >
            Join as Camper
          </button>
        </div>
      </div>

      {roomCode && voterName && (
        <div className={styles.mainContent}>
          <div className={styles.hostControls}>
            <h2>{isHost ? "🎬 Host Controls" : "🎬 Available Movies"}</h2>

            {isHost && (
              <form
                className={styles.addForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  addMovie();
                }}
              >
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Movie title"
                  required
                />
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="Year"
                  min="1900"
                  max="2030"
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                />
                <button type="submit" className={styles.btnAdd}>
                  + Add Movie
                </button>
              </form>
            )}

            {movies.length === 0 && (
              <p className={styles.empty}>
                No movies yet. {isHost ? "Add some above!" : "Wait for the host to add movies."}
              </p>
            )}

            <div className={styles.movieGrid}>
              {sortedMovies.map((movie, index) => {
                const count = getVoteCount(movie.id);
                const hasVoted = votedFor(movie.id);
                const isWinner = winner?.id === movie.id && count > 0;

                return (
                  <div
                    key={movie.id}
                    className={`${styles.movieCard} ${isWinner ? styles.winner : ""} ${hasVoted ? styles.voted : ""}`}
                    onClick={() => !isHost && vote(movie.id)}
                  >
                    <div className={styles.movieRank}>
                      {isWinner ? (
                        <span className={styles.trophy}>🏆</span>
                      ) : (
                        <span>#{index + 1}</span>
                      )}
                    </div>
                    <div className={styles.movieInfo}>
                      <h3 className={styles.movieTitle}>{movie.title}</h3>
                      <p className={styles.movieYear}>{movie.year}</p>
                      {movie.description && (
                        <p className={styles.movieDesc}>{movie.description}</p>
                      )}
                    </div>
                    <div className={styles.movieActions}>
                      <span className={styles.voteCount}>
                        {count} vote{count !== 1 ? "s" : ""}
                      </span>
                      {isHost && (
                        <button
                          className={styles.removeBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMovie(movie.id);
                          }}
                        >
                          ✕
                        </button>
                      )}
                      {!isHost && (
                        <button
                          className={`${styles.voteBtn} ${hasVoted ? styles.votedBtn : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            vote(movie.id);
                          }}
                        >
                          {hasVoted ? "✓ Voted" : "Vote"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {winner && (
              <div className={styles.winnerBanner}>
                <span className={styles.winnerEmoji}>🎬</span>
                <span className={styles.winnerText}>
                  <strong>{winner.title}</strong> wins with{" "}
                  {getVoteCount(winner.id)} votes!
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
