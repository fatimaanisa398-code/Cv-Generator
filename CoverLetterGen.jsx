import { useState } from 'react'
import axios from 'axios'
import './CoverLetterGen.css'

function CoverLetterGen({ apiKey }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    company: '',
    skills: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = async () => {
    if (!formData.name || !formData.job_title || !formData.company) {
      setMessage({ text: 'Please fill all required fields', type: 'error' })
      return
    }
    if (!apiKey) {
      setMessage({ text: 'Please add API key in Settings', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(https://anisafatima.pythonanywhere.com/api/, {
        ...formData,
        api_key: apiKey
      })
      setCoverLetter(res.data.cover_letter)
      setMessage({ text: '✓ Cover letter generated!', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || err.message), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(coverLetter))
    element.setAttribute('download', 'cover_letter.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="cover-letter-gen">
      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="form-section">
        <h2>🤖 AI Cover Letter Generator</h2>
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="job_title"
            placeholder="Job Title *"
            value={formData.job_title}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            name="company"
            placeholder="Company Name *"
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>
        <textarea
          name="skills"
          placeholder="Your Key Skills (Python, React, Leadership, AWS...)"
          value={formData.skills}
          onChange={handleInputChange}
          style={{ minHeight: '100px' }}
        />
        <button
          onClick={handleGenerate}
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Generating...' : '✨ Generate Cover Letter'}
        </button>
      </div>

      {coverLetter && (
        <div className="output-section">
          <h3>Generated Cover Letter</h3>
          <div className="output-box">{coverLetter}</div>
          <button onClick={handleDownload} className="btn-download">
            ⬇️ Download as Text
          </button>
        </div>
      )}
    </div>
  )
}

export default CoverLetterGen
