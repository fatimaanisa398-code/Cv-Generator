# React CV Generator Frontend

Modern React frontend for the Pro CV Generator using Vite.

## Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The app will run on `http://localhost:3000` and automatically proxy API calls to the Flask backend at `http://127.0.0.1:5000`.

3. **Build for production:**
```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS Modules** - Styling

## Features

- ✅ **Responsive UI** - Works on desktop, tablet, and mobile
- ✅ **Hot Module Reloading** - Instant updates during development  
- ✅ **Fast Build** - Optimized with Vite
- ✅ **AI Integration** - Groq API for intelligent content generation
- ✅ **PDF Generation** - Professional resume PDFs
- ✅ **Multiple Templates** - Modern, Minimal, Creative

## Running Alongside Flask

Terminal 1 (Flask Backend):
```bash
cd d:\cv generator
python app.py
```

Terminal 2 (React Frontend):
```bash
cd d:\cv generator\frontend
npm install
npm run dev
```

Then open: `http://localhost:3000`

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main app component
│   ├── App.css             # App styling
│   ├── index.css           # Global styles
│   └── components/         # React components
│       ├── CVForm.jsx      # CV form component
│       ├── CVForm.css
│       ├── CoverLetterGen.jsx
│       ├── CoverLetterGen.css
│       ├── Settings.jsx
│       └── Settings.css
```
