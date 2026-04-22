import { useState } from 'react'
import './App.css'
import CVForm from './components/CVForm'
import CoverLetterGen from './components/CoverLetterGen'
import Settings from './components/Settings'
import { FaFileAlt, FaEnvelope, FaCog, FaDownload } from 'react-icons/fa'

function App() {
  const [activeTab, setActiveTab] = useState('cv')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groqApiKey') || '')

  const tabs = [
    { id: 'cv', label: '📄 CV Creator', icon: FaFileAlt },
    { id: 'cover', label: '✉️ Cover Letter', icon: FaEnvelope },
    { id: 'settings', label: '⚙️ Settings', icon: FaCog },
  ]

  const handleSaveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('groqApiKey', key)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Pro CV Generator</h1>
        <p>AI-Powered Resume & Cover Letter Builder</p>
      </header>

      <div className="container">
        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="content">
          {activeTab === 'cv' && <CVForm apiKey={apiKey} />}
          {activeTab === 'cover' && <CoverLetterGen apiKey={apiKey} />}
          {activeTab === 'settings' && <Settings apiKey={apiKey} onSave={handleSaveApiKey} />}
        </main>
      </div>
    </div>
  )
}

export default App
