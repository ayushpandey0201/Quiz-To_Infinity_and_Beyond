'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Film, HelpCircle, Edit, Trash2, Plus } from 'lucide-react';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctIndex: number;
  level: 'easy' | 'medium' | 'hard';
  opened: boolean;
}

interface Level {
  _id: string;
  levelName: 'easy' | 'medium' | 'hard';
  questions: Question[];
}

interface Movie {
  _id: string;
  title: string;
  index: number;
  levels: {
    easy: Level;
    medium: Level;
    hard: Level;
  };
}

interface Game {
  _id: string;
  title: string;
  description: string;
  status: string;
  movies: Movie[];
}

export default function GameDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [game, setGame] = useState<Game | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showEditQuestionForm, setShowEditQuestionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
  });
  const [expandedMovie, setExpandedMovie] = useState<string | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      const { id } = await params;
      
      // Fetch data directly to avoid dependency issues
      try {
        const [gameResponse, moviesResponse] = await Promise.all([
          fetch(`/api/games/${id}`),
          fetch(`/api/games/${id}/movies`)
        ]);

        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          setGame(gameData);
        }

        if (moviesResponse.ok) {
          const moviesData = await moviesResponse.json();
          setMovies(moviesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    initializePage();
  }, [params]);

  const fetchGame = async (gameId?: string) => {
    try {
      const id = gameId || (await params).id;
      const response = await fetch(`/api/games/${id}`);
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const fetchMovies = async (gameId?: string) => {
    try {
      const id = gameId || (await params).id;
      const response = await fetch(`/api/games/${id}/movies`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;

    try {
      const { id } = await params;
      const response = await fetch(`/api/games/${id}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newMovieTitle }),
      });

      if (response.ok) {
        setNewMovieTitle('');
        setShowMovieForm(false);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie || !newQuestion.text || newQuestion.options.some(opt => !opt.trim())) return;

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: (await params).id,
          movieId: selectedMovie,
          level: selectedLevel,
          text: newQuestion.text,
          options: newQuestion.options,
          correctIndex: newQuestion.correctIndex,
        }),
      });

      if (response.ok) {
        setNewQuestion({
          text: '',
          options: ['', '', '', ''],
          correctIndex: 0,
        });
        setShowQuestionForm(false);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.text || editingQuestion.options.some(opt => !opt.trim())) return;

    try {
      const response = await fetch(`/api/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editingQuestion.text,
          options: editingQuestion.options,
          correctIndex: editingQuestion.correctIndex,
        }),
      });

      if (response.ok) {
        setEditingQuestion(null);
        setShowEditQuestionForm(false);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteMovie = async () => {
    if (!deletingMovie) return;

    try {
      const response = await fetch(`/api/movies/${deletingMovie._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeletingMovie(null);
        setShowDeleteConfirm(false);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const startEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowEditQuestionForm(true);
  };

  const startDeleteMovie = (movie: Movie) => {
    setDeletingMovie(movie);
    setShowDeleteConfirm(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelQuestionCount = (movie: Movie, level: 'easy' | 'medium' | 'hard') => {
    return movie.levels[level]?.questions?.length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin" className="text-white hover:text-yellow-400 transition-colors">
            <ArrowLeft className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">{game?.title}</h1>
            <p className="text-gray-300">{game?.description}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowMovieForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Film className="w-5 h-5" />
            <span>Add Movie</span>
          </button>
          <button
            onClick={() => setShowQuestionForm(true)}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Add Movie Modal */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-black">Add New Movie</h2>
            <form onSubmit={handleAddMovie}>
              <div className="mb-6">
                <label className="block text-black font-semibold mb-2">Movie Title</label>
                <input
                  type="text"
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter movie title"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowMovieForm(false)}
                  className="flex-1 py-3 bg-white border-2 border-gray-400 rounded-lg font-semibold text-black hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">Add New Question</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Movie</label>
                <select
                  value={selectedMovie || ''}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a movie</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="easy">Easy (300 points)</option>
                  <option value="medium">Medium (600 points)</option>
                  <option value="hard">Hard (1000 points)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Question</label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 resize-none"
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Options</label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={newQuestion.correctIndex === index}
                      onChange={() => setNewQuestion({ ...newQuestion, correctIndex: index })}
                      className="w-4 h-4 text-green-600 bg-white border-2 border-gray-400 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      className="flex-1 p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="flex-1 py-3 bg-white border-2 border-gray-400 rounded-lg font-semibold text-black hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestionForm && editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-black">Edit Question</h2>
            <form onSubmit={handleEditQuestion}>
              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Question</label>
                <textarea
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Options</label>
                {editingQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-2">
                    <input
                      type="radio"
                      name="editCorrect"
                      checked={editingQuestion.correctIndex === index}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: index })}
                      className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-400 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                      className="flex-1 p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditQuestionForm(false);
                    setEditingQuestion(null);
                  }}
                  className="flex-1 py-3 bg-white border-2 border-gray-400 rounded-lg font-semibold text-black hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Update Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Movie Confirmation Modal */}
      {showDeleteConfirm && deletingMovie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Delete Movie</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete &quot;<strong>{deletingMovie.title}</strong>&quot;? 
              This will also delete all questions associated with this movie. This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingMovie(null);
                }}
                className="flex-1 py-3 bg-white border-2 border-gray-400 rounded-lg font-semibold text-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMovie}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Movie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white truncate">{movie.title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">#{movie.index + 1}</span>
                <button
                  onClick={() => startDeleteMovie(movie)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete Movie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <div key={level}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${getLevelColor(level)}`} />
                      <span className="text-white capitalize font-semibold">{level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">
                        {getLevelQuestionCount(movie, level)} questions
                      </span>
                      <button
                        onClick={() => setExpandedMovie(expandedMovie === `${movie._id}-${level}` ? null : `${movie._id}-${level}`)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Plus className={`w-4 h-4 transition-transform ${expandedMovie === `${movie._id}-${level}` ? 'rotate-45' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  {expandedMovie === `${movie._id}-${level}` && movie.levels[level]?.questions && (
                    <div className="mt-2 ml-5 space-y-2">
                      {movie.levels[level].questions.map((question: Question, qIndex: number) => (
                        <div key={question._id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-gray-200 text-sm mb-2">
                                {qIndex + 1}. {question.text}
                              </p>
                              <div className="space-y-1">
                                {question.options.map((option: string, optIndex: number) => (
                                  <p key={optIndex} className={`text-xs ${question.correctIndex === optIndex ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => startEditQuestion(question)}
                                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                                title="Edit Question"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question._id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {getLevelQuestionCount(movie, level) === 0 && (
                        <p className="text-gray-500 text-sm italic">No questions yet</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-gray-300 text-sm">
                Total: {getLevelQuestionCount(movie, 'easy') + getLevelQuestionCount(movie, 'medium') + getLevelQuestionCount(movie, 'hard')} questions
              </div>
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-xl mb-4">No movies added yet</div>
          <button
            onClick={() => setShowMovieForm(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Add Your First Movie
          </button>
        </div>
      )}

      {movies.length >= 30 && (
        <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
          <p className="text-yellow-300">
            You&apos;ve reached the maximum limit of 30 movies per game.
          </p>
        </div>
      )}
    </div>
  );
}
