'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Home, Play, Settings, Trash2, Edit, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Game {
  _id: string;
  title: string;
  description: string;
  status: 'not-started' | 'live' | 'finished';
  createdAt: string;
  movies: string[];
}

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGame, setNewGame] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<Array<{
    _id: string;
    teamNumber: number;
    score: number;
    correctCount: number;
    wrongCount: number;
  }>>([]);
  const [editingTeam, setEditingTeam] = useState<{
    _id: string;
    teamNumber: number;
    score: number;
    correctCount: number;
    wrongCount: number;
  } | null>(null);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchGames();
    }
  }, [authLoading, user]);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Access denied. Please log in.</div>
      </div>
    );
  }

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch games:', response.status);
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGame.title || !newGame.description) return;

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame),
      });

      if (response.ok) {
        setNewGame({ title: '', description: '' });
        setShowCreateForm(false);
        fetchGames();
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const handleStartGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleRestartGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to restart this game? This will reset all scores and question states.')) return;

    try {
      const response = await fetch(`/api/games/${gameId}/restart`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Error restarting game:', error);
    }
  };

  const handleViewLeaderboard = async (gameId: string) => {
    try {
      const response = await fetch(`/api/games/${gameId}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
        setShowLeaderboard(gameId);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleEditTeamPoints = async (teamId: string, newPoints: number, correctCount: number, wrongCount: number) => {
    setIsUpdatingTeam(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          points: newPoints,
          correctCount,
          wrongCount
        }),
      });

      if (response.ok) {
        
        // Update leaderboard data
        setLeaderboardData(prev => 
          prev.map(team => 
            team._id === teamId 
              ? { ...team, score: newPoints, correctCount, wrongCount }
              : team
          )
        );
        setEditingTeam(null);
        alert('✅ Team points updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert(`❌ Failed to update team points: ${errorData.error || 'Unknown error'}\n${errorData.details ? 'Details: ' + errorData.details : ''}`);
      }
    } catch (error) {
      console.error('Error updating team points:', error);
      alert(`❌ Network error: ${error}`);
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-gray-500';
      case 'live': return 'bg-green-500';
      case 'finished': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
          <Link href="/" className="text-white hover:text-yellow-400 transition-colors">
            <Home className="w-8 h-8" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-300">Welcome back, {user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Game</span>
          </button>
          <button
            onClick={logout}
            className="bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-black">Create New Game</h2>
            <form onSubmit={handleCreateGame}>
              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={newGame.title}
                  onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter game title"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-black font-semibold mb-2">Description</label>
                <textarea
                  value={newGame.description}
                  onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-gray-400 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-24 resize-none"
                  placeholder="Enter game description"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 bg-white border-2 border-gray-400 rounded-lg font-semibold text-black hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(games) && games.map((game) => (
          <div key={game._id} className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 scale-90">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white truncate">{game.title}</h3>
              <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(game.status)}`}>
                {game.status}
              </span>
            </div>
            
            <p className="text-gray-300 mb-4 line-clamp-3">{game.description}</p>
            
            <div className="text-sm text-gray-400 mb-4">
              <div>Movies: {game.movies?.length || 0}/30</div>
              <div>Created: {new Date(game.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/games/${game._id}`}>
                <button className="bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </Link>

              {game.status === 'not-started' && (
                <button
                  onClick={() => handleStartGame(game._id)}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-1"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
              )}

              {game.status === 'live' && (
                <>
                  <button
                    onClick={() => handleViewLeaderboard(game._id)}
                    className="bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center space-x-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </button>
                  <button
                    onClick={() => handleRestartGame(game._id)}
                    className="bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Restart</span>
                  </button>
                </>
              )}

              <button
                onClick={() => handleDeleteGame(game._id)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(games) || games.length === 0) && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-xl mb-4">No games created yet</div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Create Your First Game
          </button>
        </div>
      )}

      {/* Leaderboard Management Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Admin Leaderboard Management</h2>
              <button
                onClick={() => setShowLeaderboard(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {leaderboardData.map((team, index) => (
                <div key={team._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-black">Team {team.teamNumber}</div>
                      <div className="text-sm text-gray-600">
                        {team.correctCount}C / {team.wrongCount}W
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-black">{team.score} pts</div>
                    </div>
                    <button
                      onClick={() => setEditingTeam(team)}
                      className="bg-blue-500 text-white px-3 py-1 rounded font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {leaderboardData.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">No teams found for this game</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Team Points Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-black">Edit Team {editingTeam.teamNumber}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (isUpdatingTeam) return; // Prevent double submission
              
              const formData = new FormData(e.target as HTMLFormElement);
              const pointsStr = formData.get('points') as string;
              const correctStr = formData.get('correct') as string;
              const wrongStr = formData.get('wrong') as string;
              
              const points = parseInt(pointsStr);
              const correct = parseInt(correctStr);
              const wrong = parseInt(wrongStr);
              
              // Validate inputs
              if (isNaN(points)) {
                alert('Please enter a valid number for points');
                return;
              }
              if (isNaN(correct) || correct < 0) {
                alert('Please enter a valid number for correct answers (0 or greater)');
                return;
              }
              if (isNaN(wrong) || wrong < 0) {
                alert('Please enter a valid number for wrong answers (0 or greater)');
                return;
              }
              
              handleEditTeamPoints(editingTeam._id, points, correct, wrong);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-black font-semibold mb-1">Points</label>
                  <input
                    name="points"
                    type="number"
                    defaultValue={editingTeam.score}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold mb-1">Correct Answers</label>
                  <input
                    name="correct"
                    type="number"
                    min="0"
                    defaultValue={editingTeam.correctCount}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold mb-1">Wrong Answers</label>
                  <input
                    name="wrong"
                    type="number"
                    min="0"
                    defaultValue={editingTeam.wrongCount}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  disabled={isUpdatingTeam}
                  className="flex-1 py-3 bg-gray-300 text-black rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTeam}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingTeam ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
