# Bandcestr 🎸

**Music Genealogy Platform** - Discover the hidden connections in music history

Bandcestr maps the relationships between bands, musicians, and albums, revealing how artists move between projects and build the fabric of local music scenes.

## 🎯 Project Status

**Current Phase:** MVP Development - DC Metro Launch  
**Timeline:** 6 months to launch  
**Target:** 500-1,000 Washington DC area bands

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Python 3.10+ (for data scraping)

### Installation
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/bandcestr.git
cd bandcestr

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up database
createdb bandcestr
psql bandcestr < database/schema.sql

# Run scrapers (optional)
cd scripts
python3 scrape_dc_bands.py
```

### Running Locally
```bash
# Backend (Terminal 1)
cd backend && npm run dev  # Port 3001

# Frontend (Terminal 2)  
cd frontend && npm run dev  # Port 3000
```

## 📁 Repository Structure
```
bandcestr/
├── backend/          # API server (Node.js + Express)
├── frontend/         # Web app (Next.js + React)
├── scripts/          # Data scrapers (Python)
├── docs/            # Documentation
└── database/        # SQL schema
```

## 🎵 Features

- Band profiles with member history
- Musician profiles showing all projects
- Relationship mapping between artists
- Search & discovery
- User submissions (coming soon)
- Premium accounts (coming soon)

## 🛠️ Tech Stack

- **Frontend:** React, Next.js, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Data:** MusicBrainz, Discogs, Spotify APIs

## 📧 Contact

Questions? Open an issue or email [your-email]

## 📝 License

MIT License
