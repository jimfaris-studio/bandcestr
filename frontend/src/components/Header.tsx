'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center relative">
              <div className="w-6 h-6 border-4 border-yellow-300 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              </div>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              bandcestr
              <span className="text-sm align-super text-gray-400">™</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/discover" className="text-gray-300 hover:text-white font-medium transition">
              Discover
            </Link>
            <Link href="/bands" className="text-gray-300 hover:text-white font-medium transition">
              Bands
            </Link>
            <Link href="/artists" className="text-gray-300 hover:text-white font-medium transition">
              Artists
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-white border border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
              Sign In
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium flex items-center space-x-2">
              <span>⭐</span>
              <span>Get Premium</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
