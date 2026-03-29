'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BandCard from '@/components/BandCard';

interface Band {
  id: string;
  name: string;
  slug: string;
  genre_tags: string[];
  formed_year: number;
  disbanded_year: number | null;
  location_city: string;
  location_state: string;
  image_url: string;
  description: string;
}

export default function Home() {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBands();
  }, []);

  const fetchBands = async () => {
    try {
      const response = await fetch('/api/bands?limit=12');
      const data = await response.json();
      setBands(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bands:', error);
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Featured DC Bands
          </h2>
          <p className="text-gray-400 text-lg">
            Explore the legendary bands that shaped Washington DC's music scene
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-400">Loading bands...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bands.map((band) => (
              <BandCard key={band.id} band={band} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-black border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Bandcestr</h4>
              <p className="text-gray-400">
                Mapping the connections in DC's music scene
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-orange-500">About</a></li>
                <li><a href="/contact" className="hover:text-orange-500">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Data Sources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>MusicBrainz</li>
                <li>Discogs</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 Bandcestr. Built for the music community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
