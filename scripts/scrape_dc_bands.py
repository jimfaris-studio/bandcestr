#!/usr/bin/env python3
"""
Bandcestr MusicBrainz Data Scraper
Scrapes Washington DC band data from MusicBrainz API
"""

import requests
import time
import json
from typing import List, Dict, Optional
from datetime import datetime

class MusicBrainzScraper:
    """Scraper for MusicBrainz API with rate limiting"""
    
    BASE_URL = "https://musicbrainz.org/ws/2"
    RATE_LIMIT_DELAY = 1.0  # 1 second between requests per MusicBrainz rules
    
    def __init__(self, user_agent: str = "Bandcestr/0.1 (contact@bandcestr.com)"):
        """Initialize scraper with user agent"""
        self.headers = {
            "User-Agent": user_agent,
            "Accept": "application/json"
        }
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Ensure we don't exceed 1 request per second"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.RATE_LIMIT_DELAY:
            time.sleep(self.RATE_LIMIT_DELAY - elapsed)
        self.last_request_time = time.time()
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make rate-limited request to MusicBrainz API"""
        self._rate_limit()
        
        url = f"{self.BASE_URL}/{endpoint}"
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None
    
    def search_dc_bands(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Search for bands from Washington DC"""
        params = {
            'query': 'area:"Washington" AND country:US',
            'type': 'group',
            'limit': min(limit, 100),
            'offset': offset,
            'fmt': 'json'
        }
        
        result = self._make_request('artist', params)
        if not result:
            return []
        
        bands = []
        for artist in result.get('artists', []):
            bands.append({
                'musicbrainz_id': artist.get('id'),
                'name': artist.get('name'),
                'type': artist.get('type'),
                'begin_date': artist.get('life-span', {}).get('begin'),
                'end_date': artist.get('life-span', {}).get('end'),
                'ended': artist.get('life-span', {}).get('ended', False),
                'area': artist.get('area', {}).get('name', ''),
                'score': artist.get('score', 0)
            })
        
        print(f"Found {len(bands)} bands")
        return bands
    
    def get_band_details(self, musicbrainz_id: str) -> Optional[Dict]:
        """Get detailed information about a band including members"""
        params = {
            'inc': 'artist-rels+url-rels+releases+tags',
            'fmt': 'json'
        }
        
        result = self._make_request(f'artist/{musicbrainz_id}', params)
        if not result:
            return None
        
        # Extract band members
        members = []
        for rel in result.get('relations', []):
            if rel.get('type') == 'member of band':
                members.append({
                    'member_id': rel.get('artist', {}).get('id'),
                    'member_name': rel.get('artist', {}).get('name'),
                    'instruments': rel.get('attributes', []),
                    'begin_date': rel.get('begin'),
                    'end_date': rel.get('end')
                })
        
        return {
            'musicbrainz_id': result.get('id'),
            'name': result.get('name'),
            'begin_date': result.get('life-span', {}).get('begin'),
            'end_date': result.get('life-span', {}).get('end'),
            'ended': result.get('life-span', {}).get('ended', False),
            'tags': [tag['name'] for tag in result.get('tags', [])],
            'members': members,
            'release_count': len(result.get('releases', []))
        }


def main():
    """Run the scraper"""
    print("=" * 60)
    print("Bandcestr MusicBrainz DC Music Scene Scraper")
    print("=" * 60)
    
    scraper = MusicBrainzScraper()
    
    # Search for DC bands
    print("\n Searching for Washington DC bands...")
    dc_bands = scraper.search_dc_bands(limit=50)
    
    # Save results
    with open('dc_bands_raw.json', 'w') as f:
        json.dump(dc_bands, f, indent=2)
    print(f"\n✓ Saved {len(dc_bands)} bands to dc_bands_raw.json")
    
    # Get detailed info for top bands
    print("\n📊 Fetching detailed info for top 10 bands...")
    detailed_bands = []
    
    for band in sorted(dc_bands, key=lambda x: x['score'], reverse=True)[:10]:
        print(f"  • {band['name']}...")
        details = scraper.get_band_details(band['musicbrainz_id'])
        if details:
            detailed_bands.append(details)
    
    # Save detailed results
    with open('dc_bands_detailed.json', 'w') as f:
        json.dump(detailed_bands, f, indent=2)
    print(f"\n✓ Saved detailed info to dc_bands_detailed.json")
    
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
