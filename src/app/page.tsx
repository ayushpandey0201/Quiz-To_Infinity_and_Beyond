'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Rocket, Settings, Play, Star } from 'lucide-react';

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <Rocket className="w-16 h-16 text-yellow-400 mr-4" />
          <h1 className="text-6xl font-bold text-white">
            TO INFINITY & BEYOND
          </h1>
          <Rocket className="w-16 h-16 text-yellow-400 ml-4 scale-x-[-1]" />
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          The ultimate quiz adventure awaits! Create epic movie quizzes or join the cosmic battle of wits.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Admin Card */}
        <Link href="/admin">
          <div
            className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 border border-white/20 ${
              hoveredCard === 'admin' ? 'bg-white/20 shadow-2xl' : ''
            }`}
            onMouseEnter={() => setHoveredCard('admin')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Admin Panel</h2>
            <p className="text-gray-300 mb-6">
              Create and manage quiz games, add movies, craft challenging questions, and oversee the cosmic competition.
            </p>
            <div className="flex items-center justify-center space-x-2 text-orange-400">
              <Star className="w-5 h-5" />
              <span className="font-semibold">Mission Control</span>
              <Star className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Play Game Card */}
        <Link href="/play">
          <div
            className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 border border-white/20 ${
              hoveredCard === 'play' ? 'bg-white/20 shadow-2xl' : ''
            }`}
            onMouseEnter={() => setHoveredCard('play')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Play Game</h2>
            <p className="text-gray-300 mb-6">
              Join the intergalactic quiz battle! Answer movie questions, pass challenges, and climb the leaderboard.
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Star className="w-5 h-5" />
              <span className="font-semibold">Launch Sequence</span>
              <Star className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-gray-400 mb-4">
          Blast off into the ultimate quiz experience
        </p>
        <Link href="/login" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
          Admin Login
        </Link>
      </div>
    </div>
  );
}