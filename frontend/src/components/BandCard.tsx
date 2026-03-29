'use client';

import Link from 'next/link';
import { Users, Calendar, MapPin } from 'lucide-react';

interface Band {
  id: string;
  name: string;
  slug: string;
  genre_tags?: string[];
  formed_year?: number;
  disbanded_year?: number | null;
  location_city?: string;
  location_state?: string;
  image_url?: string;
  description?: string;
}

interface BandCardProps {
  band: Band;
}

export default function BandCard({ band }: BandCardProps) {
  return (
    <Link href={`/bands/${band.slug}`}>
      <div className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all duration-300 cursor-pointer group h-full border border-gray-800">
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {band.image_url ? (
            <img 
              src={band.image_url} 
              alt={band.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-orange-500" />
              </div>
            </div>
          )}
          
          {band.genre_tags && band.genre_tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {band.genre_tags.slice(0, 2).map((genre, idx) => (
                <span 
                  key={idx}
                  className="bg-black/70 backdrop-blur text-orange-400 text-xs px-3 py-1 rounded-full font-semibold"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition">
            {band.name}
          </h3>
          
          {band.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {band.description}
            </p>
          )}

          <div className="flex flex-col space-y-2 text-sm text-gray-400">
            {band.formed_year && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>
                  {band.formed_year}
                  {band.disbanded_year ? ` - ${band.disbanded_year}` : ' - Present'}
                </span>
              </div>
            )}
            
            {band.location_city && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>
                  {band.location_city}
                  {band.location_state && `, ${band.location_state}`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center text-orange-500 font-semibold text-sm group-hover:translate-x-2 transition-transform">
            View Details →
          </div>
        </div>
      </div>
    </Link>
  );
}
