import './Settings.css'

function Settings({ apiKey, onSave }) {
  const handleSaveKey = (e) => {
    e.preventDefault()
    const key = e.target.apiKey.value
    onSave(key)
    alert('API Key saved!')
  }

  return (
    <div className="settings">
      <div className="settings-section">
        <h2>🔑 Groq API Key</h2>
        <form onSubmit={handleSaveKey}>
          <p className="info">
            Get your free API key at <a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a>
            <br />
            This enables AI-powered job descriptions and cover letters.
          </p>
          <input
            type="password"
            name="apiKey"
            placeholder="gsk_..."
            defaultValue={apiKey}
            className="api-input"
          />
          <button type="submit" className="btn-save">
            💾 Save API Key
          </button>
        </form>
      </div>

      <div className="info-section">
        <h3>About This App</h3>
        <p>Pro CV Generator is an AI-powered tool to create professional resumes and cover letters in minutes.</p>
        <h4>Features:</h4>
        <ul>
          <li>✅ Multiple professional templates</li>
          <li>✅ AI-powered job descriptions & cover letters</li>
          <li>✅ Easy data import/export</li>
          <li>✅ PDF generation</li>
          <li>✅ Fast & secure</li>
          <li>✅ Built with React + Python Flask</li>
        </ul>
      </div>
    </div>
  )
}

export default Settings
