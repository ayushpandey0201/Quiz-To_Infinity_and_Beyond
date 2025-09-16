'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, ArrowRight, Check, X, Settings, Eye } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctIndex: number;
  level: 'easy' | 'medium' | 'hard';
  opened: boolean;
  passHistory: Array<{ fromTeam: number; toTeam: number; at: string }>;
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

interface Team {
  teamNumber: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  rank?: number;
}

interface Game {
  _id: string;
  title: string;
  description: string;
  status: string;
  allowShowAnswer: boolean;
  movies: Movie[];
}

export default function GamePlayPage({ params }: { params: Promise<{ id: string }> }) {
  const [game, setGame] = useState<Game | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<Team[]>([]);
  const [numberOfTeams, setNumberOfTeams] = useState<number>(2);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
    scoreChange: number;
    selectedOption: number;
    team: {
      number: number;
      score: number;
      correctCount: number;
      wrongCount: number;
    };
  } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<{movieId: string, level: 'easy' | 'medium' | 'hard'} | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');
  const [teamOperationLoading, setTeamOperationLoading] = useState(false);
  const [showPassTeamSelection, setShowPassTeamSelection] = useState(false);
  const [showAnswerRevealed, setShowAnswerRevealed] = useState(false);

  useEffect(() => {
    const initializeGame = async () => {
      const { id } = await params;
      setGameId(id);
      
      // Fetch initial data
      try {
        const [gameResponse, moviesResponse, teamsResponse, leaderboardResponse] = await Promise.all([
          fetch(`/api/games/${id}`),
          fetch(`/api/games/${id}/movies`),
          fetch(`/api/games/${id}/teams`),
          fetch(`/api/games/${id}/leaderboard`)
        ]);

        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          setGame(gameData);
        }

        if (moviesResponse.ok) {
          const moviesData = await moviesResponse.json();
          setMovies(moviesData);
        }

        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
          if (teamsData.length === 0) {
            setShowTeamSetup(true);
          }
        }

        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }

      // Initialize Socket.IO
      const socketInstance = io();
      setSocket(socketInstance);

      socketInstance.emit('join-game', id);

      socketInstance.on('leaderboard-update', (updatedLeaderboard) => {
        setLeaderboard(updatedLeaderboard);
      });

      return () => {
        socketInstance.emit('leave-game', id);
        socketInstance.disconnect();
      };
    };

    initializeGame();
  }, [params]);

  const fetchGame = async (id?: string) => {
    try {
      const currentGameId = id || gameId || await params.then(p => p.id);
      const response = await fetch(`/api/games/${currentGameId}`);
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const fetchMovies = async (id?: string) => {
    try {
      const currentGameId = id || gameId || await params.then(p => p.id);
      const response = await fetch(`/api/games/${currentGameId}/movies`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (id?: string) => {
    try {
      const currentGameId = id || gameId || await params.then(p => p.id);
      const response = await fetch(`/api/games/${currentGameId}/teams`);
      const data = await response.json();
      setTeams(data);
      if (data.length === 0) {
        setShowTeamSetup(true);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchLeaderboard = async (id?: string) => {
    try {
      const currentGameId = id || gameId || await params.then(p => p.id);
      const response = await fetch(`/api/games/${currentGameId}/leaderboard`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleCreateTeams = async () => {
    setTeamOperationLoading(true);
    try {
      const currentGameId = gameId || await params.then(p => p.id);
      const response = await fetch(`/api/games/${currentGameId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberOfTeams }),
      });

      if (response.ok) {
        // Get the created teams from the response
        const createdTeams = await response.json();
        
        // Immediately update local state for instant UI response
        setTeams(createdTeams);
        setLeaderboard(createdTeams.map((team: Team, index: number) => ({
          rank: index + 1,
          teamNumber: team.teamNumber,
          score: team.score,
          correctCount: team.correctCount,
          wrongCount: team.wrongCount
        })));
        
        setShowTeamSetup(false);
        setDebugInfo(`✅ Successfully created ${numberOfTeams} teams`);
        
        // Still fetch from server to ensure consistency
        fetchTeams();
        fetchLeaderboard();
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error.includes('already created')) {
          // Teams already exist, just close the modal and fetch them
          setShowTeamSetup(false);
          fetchTeams();
          fetchLeaderboard();
          setDebugInfo('Teams already exist - loaded existing teams');
        } else {
          console.error('Error creating teams:', errorData);
          setDebugInfo(`❌ Error creating teams: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Error creating teams:', error);
      setDebugInfo(`❌ Network error creating teams: ${error}`);
    } finally {
      setTeamOperationLoading(false);
    }
  };

  const openQuestion = (movieId: string, level: 'easy' | 'medium' | 'hard') => {
    console.log('Opening question, teams available:', teams);
    setDebugInfo(`Opening ${level} question. Teams: ${teams.length}`);
    
    if (teams.length === 0) {
      alert('No teams available! Please create teams first.');
      setDebugInfo('No teams available - redirecting to team setup');
      setShowTeamSetup(true);
      return;
    }
    
    setPendingQuestion({ movieId, level });
    setShowTeamSelection(true);
    setDebugInfo(`Team selection modal opened for ${level} question`);
  };

  const handleTeamSelection = async (teamNumber: number) => {
    if (!pendingQuestion) {
      setDebugInfo('Error: No pending question found');
      return;
    }

    setDebugInfo(`Team ${teamNumber} selected. Finding question...`);

    const movie = movies.find(m => m._id === pendingQuestion.movieId);
    if (!movie) {
      setDebugInfo('Error: Movie not found');
      alert('Movie not found!');
      setShowTeamSelection(false);
      setPendingQuestion(null);
      return;
    }

    const levelQuestions = movie.levels[pendingQuestion.level]?.questions || [];
    const nextQuestion = levelQuestions.find(q => !q.opened && !q.answered);
    
    if (!nextQuestion) {
      setDebugInfo('No more questions available in this level');
      alert('No more questions available in this level!');
      setShowTeamSelection(false);
      setPendingQuestion(null);
      return;
    }

    setDebugInfo(`Opening question ${nextQuestion._id}...`);

    try {
      const response = await fetch(`/api/questions/${nextQuestion._id}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQuestion(data);
        setSelectedTeam(teamNumber);
        setShowAnswer(false);
        setAnswerResult(null);
        setShowTeamSelection(false);
        setPendingQuestion(null);
        
        if (data.message) {
          setDebugInfo(`${data.message} - Team ${teamNumber} can now answer`);
        } else {
          setDebugInfo(`Question opened successfully for Team ${teamNumber}`);
        }
        fetchMovies(); // Refresh to update opened status
      } else {
        const errorData = await response.text();
        setDebugInfo(`API Error: ${response.status} - ${errorData}`);
        console.error('API Error:', response.status, errorData);
        
        // More user-friendly error messages
        if (response.status === 400) {
          setDebugInfo('This question has already been opened. Please refresh the page.');
        } else {
          setDebugInfo(`Failed to open question (${response.status}). Please try again.`);
        }
        
        setShowTeamSelection(false);
        setPendingQuestion(null);
      }
    } catch (error) {
      console.error('Error opening question:', error);
      setDebugInfo(`Network Error: ${error}`);
      alert('Network error while opening question. Please try again.');
      setShowTeamSelection(false);
      setPendingQuestion(null);
    }
  };

  const handleCorrectAnswer = async () => {
    
    if (!currentQuestion) {
      console.error('❌ No current question');
      return;
    }

    if (!selectedTeam) {
      console.error('❌ No team selected');
      alert('Please select a team first!');
      return;
    }

    try {
      const payload = {
        teamNumber: selectedTeam,
        selectedOptionIndex: currentQuestion.correctIndex,
        manualOverride: true
      };
      
      const response = await fetch(`/api/questions/${currentQuestion._id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setAnswerResult(result);
        setShowAnswer(true);
        fetchLeaderboard();
        // Question modal stays open until manually closed
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to submit answer'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting correct answer:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleWrongAnswer = async () => {
    
    if (!currentQuestion) {
      console.error('❌ No current question');
      return;
    }

    if (!selectedTeam) {
      console.error('❌ No team selected');
      alert('Please select a team first!');
      return;
    }

    try {
      // Submit with a wrong answer index (not the correct one)
      const wrongIndex = currentQuestion.correctIndex === 0 ? 1 : 0;
      const payload = {
        teamNumber: selectedTeam,
        selectedOptionIndex: wrongIndex,
        manualOverride: true
      };
      
      const response = await fetch(`/api/questions/${currentQuestion._id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setAnswerResult(result);
        setShowAnswer(true);
        fetchLeaderboard();
        // Question modal stays open until manually closed
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to submit answer'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting wrong answer:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleOptionClick = async (selectedOptionIndex: number) => {
    if (!currentQuestion) {
      console.error('❌ No current question');
      return;
    }

    try {
      const response = await fetch(`/api/questions/${currentQuestion._id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamNumber: selectedTeam,
          selectedOptionIndex,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add the selected option to the result for UI display
        const resultWithSelection = {
          ...result,
          selectedOption: selectedOptionIndex
        };
        
        setAnswerResult(resultWithSelection);
        setShowAnswer(true);
        fetchLeaderboard();
        
        // Show immediate feedback
        const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;
        setDebugInfo(
          isCorrect 
            ? `🎉 Team ${selectedTeam} got it RIGHT! +${result.scoreChange} points` 
            : `💭 Team ${selectedTeam} got it wrong. ${result.scoreChange} points`
        );
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setDebugInfo(`❌ Error: ${errorData.error || 'Failed to submit answer'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      setDebugInfo('❌ Network error. Please try again.');
    }
  };

  const handlePass = () => {
    if (!currentQuestion) return;
    setShowPassTeamSelection(true);
  };

  const handlePassToTeam = async (toTeamNumber: number) => {
    if (!currentQuestion) return;

    try {
      const response = await fetch(`/api/questions/${currentQuestion._id}/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromTeam: selectedTeam,
          toTeam: toTeamNumber,
        }),
      });

      if (response.ok) {
        setDebugInfo(`✅ Question passed from Team ${selectedTeam} to Team ${toTeamNumber}!`);
        setSelectedTeam(toTeamNumber);
        setShowPassTeamSelection(false);
      } else {
        setDebugInfo('❌ Failed to pass question. Please try again.');
      }
    } catch (error) {
      console.error('Error passing question:', error);
      setDebugInfo('❌ Network error. Please try again.');
    }
  };

  const handleShowAnswer = () => {
    setShowAnswerRevealed(true);
    setShowAnswer(true);
  };

  const closeQuestion = () => {
    setCurrentQuestion(null);
    setShowAnswer(false);
    setAnswerResult(null);
    setShowAnswerRevealed(false);
    setShowPassTeamSelection(false);
  };

  const handleRestartGame = async () => {
    if (!confirm('Are you sure you want to restart this game? This will reset all scores and make all questions available again.')) return;

    try {
      const currentGameId = gameId || await params.then(p => p.id);
      const response = await fetch(`/api/games/${currentGameId}/restart`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh all data after restart
        fetchGame();
        fetchMovies();
        fetchTeams();
        fetchLeaderboard();
        setDebugInfo('✅ Game restarted successfully! All questions are now available again.');
      } else {
        setDebugInfo('❌ Failed to restart game. Please try again.');
      }
    } catch (error) {
      console.error('Error restarting game:', error);
      setDebugInfo('❌ Error restarting game. Please try again.');
    }
  };

  const handleResetTeams = async () => {
    if (!confirm('Are you sure you want to reset teams? This will delete all existing teams and their scores.')) return;

    setTeamOperationLoading(true);
    try {
      // First delete existing teams
      const currentGameId = gameId || await params.then(p => p.id);
      const deleteResponse = await fetch(`/api/games/${currentGameId}/teams`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        // Immediately update local state to reflect team deletion
        setTeams([]);
        setLeaderboard([]);
        
        // Then show team setup modal
        setShowTeamSetup(true);
        setDebugInfo('✅ Teams reset successfully - ready to create new teams');
      } else {
        setDebugInfo('❌ Failed to reset teams. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting teams:', error);
      setDebugInfo('❌ Error resetting teams. Please try again.');
    } finally {
      setTeamOperationLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQuestionCount = (movie: Movie, level: 'easy' | 'medium' | 'hard') => {
    return movie.levels[level]?.questions?.filter(q => !q.opened).length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/play" className="text-white hover:text-yellow-400 transition-colors">
            <ArrowLeft className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">{game?.title}</h1>
            <p className="text-gray-300">{game?.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRestartGame}
            className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Restart Game</span>
          </button>
          {teams.length > 0 && (
            <button
              onClick={handleResetTeams}
              disabled={teamOperationLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-4 h-4" />
              <span>{teamOperationLoading ? 'Resetting...' : 'Reset Teams'}</span>
            </button>
          )}
          <div className="text-right">
            <div className="text-white font-semibold">Teams: {teams.length}</div>
            <div className="text-gray-300">Status: {game?.status}</div>
            {debugInfo && (
              <div className="text-xs text-yellow-300 mt-1 max-w-xs">
                Debug: {debugInfo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Setup Modal */}
      {showTeamSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-black">Setup Teams</h2>
            {teams.length > 0 ? (
              <div className="mb-6">
                <p className="text-black mb-4">
                  This game already has <strong>{teams.length} teams</strong> created.
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  You can continue with existing teams or reset them to create new ones.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowTeamSetup(false)}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Use Existing Teams
                  </button>
                  <button
                    onClick={handleResetTeams}
                    disabled={teamOperationLoading}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {teamOperationLoading ? '⏳ Resetting...' : 'Reset Teams'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-black font-semibold mb-2">How many teams?</label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={numberOfTeams}
                    onChange={(e) => setNumberOfTeams(parseInt(e.target.value))}
                    className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleCreateTeams}
                  disabled={teamOperationLoading}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {teamOperationLoading ? '⏳ Creating Teams...' : 'Create Teams'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Team Selection Modal */}
      {showTeamSelection && pendingQuestion && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-black">🎯 Select Team</h2>
            <p className="text-black mb-6">
              Which team is attempting this <span className="font-semibold text-blue-600">{pendingQuestion.level}</span> question?
            </p>
            {teams.length > 0 ? (
              <div className="flex-1 overflow-y-auto mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {teams.map((team) => (
                    <button
                      key={team.teamNumber}
                      onClick={() => handleTeamSelection(team.teamNumber)}
                      className="p-4 bg-white border-2 border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center transform hover:scale-105"
                    >
                      <div className="font-bold text-black text-lg">Team {team.teamNumber}</div>
                      <div className="text-sm text-black">Score: {team.score}</div>
                      <div className="text-xs text-gray-600">{team.correctCount}✓ / {team.wrongCount}✗</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600 mb-6">
                <p className="font-semibold">No teams found!</p>
                <p className="text-sm">Please create teams first.</p>
              </div>
            )}
            <button
              onClick={() => {
                setShowTeamSelection(false);
                setPendingQuestion(null);
              }}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {currentQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Team {selectedTeam} - {currentQuestion.level.toUpperCase()} Question
              </h2>
              <button
                onClick={closeQuestion}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-xl font-semibold text-black mb-4">{currentQuestion.text}</p>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showAnswer && handleOptionClick(index)}
                    disabled={showAnswer}
                    className={`w-full p-4 border-2 rounded-lg transition-all duration-200 ${
                      showAnswer && index === currentQuestion.correctIndex
                        ? 'bg-green-100 border-green-500'
                        : showAnswer && answerResult && answerResult.selectedOption === index && index !== currentQuestion.correctIndex
                        ? 'bg-red-100 border-red-500'
                        : showAnswer
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-white border-gray-400 hover:border-blue-500 hover:bg-blue-50'
                    } ${!showAnswer ? 'cursor-pointer transform hover:scale-105' : 'cursor-default'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-xl text-black">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-lg font-medium text-black">{option}</span>
                      {showAnswer && index === currentQuestion.correctIndex && (
                        <Check className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                      {showAnswer && answerResult && answerResult.selectedOption === index && index !== currentQuestion.correctIndex && (
                        <X className="w-5 h-5 text-red-600 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Show Answer Button */}
              {!showAnswer && (game?.allowShowAnswer ?? false) && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleShowAnswer}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show Answer</span>
                  </button>
                </div>
              )}
            </div>

            {!showAnswer && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    Team {selectedTeam} is attempting this question
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    💡 Click any option above to select it, or use manual controls below
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={handleCorrectAnswer}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Correct Answer</span>
                  </button>
                  <button
                    onClick={handlePass}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>Pass</span>
                  </button>
                  <button
                    onClick={handleWrongAnswer}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Wrong Answer</span>
                  </button>
                </div>
              </div>
            )}

            {showAnswer && (
              <div>
                {answerResult ? (
                  <div className={`p-6 rounded-lg border-2 ${answerResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-2xl font-bold mb-3 ${answerResult.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {answerResult.isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                    </div>
                    <div className={`text-xl font-semibold mb-2 ${answerResult.scoreChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Team {answerResult.team.number}: {answerResult.scoreChange > 0 ? '+' : ''}{answerResult.scoreChange} points
                    </div>
                    <div className="text-gray-700 font-medium mb-3">
                      {answerResult.isCorrect ? '🎉 Great job!' : '💭 Better luck next time!'}
                    </div>
                    {answerResult.selectedOption !== undefined && (
                      <div className="text-gray-700 text-sm mb-3 bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <span><strong>Team selected:</strong> Option {String.fromCharCode(65 + answerResult.selectedOption)}</span>
                          <span><strong>Correct answer:</strong> Option {String.fromCharCode(65 + answerResult.correctAnswer)}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-gray-600 text-sm bg-white p-2 rounded border">
                      <strong>Updated Stats:</strong> Score: {answerResult.team.score} | ✅ Correct: {answerResult.team.correctCount} | ❌ Wrong: {answerResult.team.wrongCount}
                    </div>
                  </div>
                ) : showAnswerRevealed && (
                  <div className="p-6 rounded-lg border-2 bg-blue-50 border-blue-200">
                    <div className="text-2xl font-bold mb-3 text-blue-700">
                      👁️ Answer Revealed
                    </div>
                    <div className="text-gray-700 font-medium mb-3">
                      The correct answer is highlighted above.
                    </div>
                    <div className="text-gray-700 text-sm bg-white p-3 rounded border">
                      <span><strong>Correct answer:</strong> Option {String.fromCharCode(65 + currentQuestion.correctIndex)}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={closeQuestion}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Close Question
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Movies Grid */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-white mb-6">Movie Grid</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <div key={movie._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 truncate">{movie.title}</h3>
                
                <div className="space-y-2">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => openQuestion(movie._id, level)}
                      disabled={getQuestionCount(movie, level) === 0}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        getQuestionCount(movie, level) > 0
                          ? 'hover:bg-white/20 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${getLevelColor(level)}`} />
                        <span className="text-white capitalize text-sm font-semibold">{level}</span>
                      </div>
                      <span className="text-gray-300 text-sm">
                        {getQuestionCount(movie, level)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-h-[70vh] flex flex-col">
            {leaderboard.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {leaderboard.map((team, index) => (
                  <div key={team.teamNumber} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold">Team {team.teamNumber}</div>
                        <div className="text-gray-400 text-sm">
                          {team.correctCount}C / {team.wrongCount}W
                        </div>
                      </div>
                    </div>
                    <div className="text-white font-bold text-lg">
                      {team.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                No teams created yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pass Team Selection Modal */}
      {showPassTeamSelection && currentQuestion && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-black">🔄 Pass Question</h2>
            <p className="text-black mb-6">
              Team {selectedTeam} wants to pass this question. Select which team should receive it:
            </p>
            {teams.length > 0 ? (
              <div className="flex-1 overflow-y-auto mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {teams
                    .filter(team => team.teamNumber !== selectedTeam)
                    .map((team) => (
                    <button
                      key={team.teamNumber}
                      onClick={() => handlePassToTeam(team.teamNumber)}
                      className="p-4 bg-white border-2 border-gray-400 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 text-center transform hover:scale-105"
                    >
                      <div className="font-bold text-black text-lg">Team {team.teamNumber}</div>
                      <div className="text-sm text-black">Score: {team.score}</div>
                      <div className="text-xs text-gray-600">{team.correctCount}✓ / {team.wrongCount}✗</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600 mb-6">
                <p className="font-semibold">No other teams available!</p>
                <p className="text-sm">Cannot pass question.</p>
              </div>
            )}
            <button
              onClick={() => setShowPassTeamSelection(false)}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
