'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Play, Users, Trophy } from 'lucide-react';

interface Game {
  _id: string;
  title: string;
  description: string;
  status: 'not-started' | 'live' | 'finished';
  createdAt: string;
  movies: unknown[];
}

export default function PlayPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setGames(data.filter((game: Game) => game.status !== 'finished'));
        } else {
          console.error('API returned non-array data:', data);
          setGames([]);
        }
      } else {
        console.error('API request failed:', response.status);
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-gray-500';
      case 'live': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return 'Ready to Play';
      case 'live': return 'Live Game';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white hover:text-yellow-400 transition-colors">
            <Home className="w-8 h-8" />
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">Choose Your Adventure</h1>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {games.filter(game => game.status === 'live').map((game) => (
          <Link key={game._id} href={`/play/game/${game._id}`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white truncate">{game.title}</h3>
                <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(game.status)}`}>
                  {getStatusText(game.status)}
                </span>
              </div>
              
              <p className="text-gray-300 mb-6 line-clamp-3">{game.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span>Movies: {game.movies?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Trophy className="w-4 h-4" />
                  <span>Status: {getStatusText(game.status)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-green-400 font-semibold">
                <Play className="w-5 h-5" />
                <span>Enter Game</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {games.filter(game => game.status === 'live').length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-xl mb-4">No live games available to play</div>
          <p className="text-gray-500 mb-4">
            {games.length > 0 
              ? 'Games exist but are not live yet. Ask an admin to start them.' 
              : 'No games created yet. Contact an admin to create games.'
            }
          </p>
          <p className="text-yellow-400 text-sm mb-8">
            💡 Only games with &quot;Live&quot; status appear here for play.
          </p>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
            Back to Home
          </Link>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="text-white text-xl">Loading games...</div>
        </div>
      )}
    </div>
  );
}
