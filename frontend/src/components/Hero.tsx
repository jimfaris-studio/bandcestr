'use client';

import { useState } from 'react';

interface HeroProps {
  onSearch?: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <section 
      className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600")',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Every Band<br />
          Has a <span className="text-orange-500 relative inline-block squiggle-underline">
            Backstory
          </span>{' '}
          To<br />
          Trace.
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Discover how your favorite bands are connected — who jammed with who, who 
          left for greener pastures, and how side projects turned into legends.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition font-semibold text-lg shadow-lg">
            Start Tracing the Music Lineage
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition font-semibold text-lg">
            Add Your Band!
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-12">
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a band or musician..."
              className="w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur text-black placeholder-gray-600 text-lg focus:outline-none focus:ring-4 focus:ring-orange-500/50"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition font-semibold"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
