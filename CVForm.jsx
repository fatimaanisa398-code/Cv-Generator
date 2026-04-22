import { useState } from 'react'
import axios from 'axios'
import './CVForm.css'

function CVForm({ apiKey }) {
  const [template, setTemplate] = useState('modern')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    professional_summary: '',
    skills: '',
    certifications: '',
  })
  const [experiences, setExperiences] = useState([{ company: '', position: '', start_date: '', end_date: '', description: '' }])
  const [educations, setEducations] = useState([{ institution: '', degree: '', field: '', graduation_year: '' }])
  const [aiJobTitle, setAiJobTitle] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleExperienceChange = (index, field, value) => {
    const newExp = [...experiences]
    newExp[index][field] = value
    setExperiences(newExp)
  }

  const handleEducationChange = (index, field, value) => {
    const newEdu = [...educations]
    newEdu[index][field] = value
    setEducations(newEdu)
  }

  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', start_date: '', end_date: '', description: '' }])
  }

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    setEducations([...educations, { institution: '', degree: '', field: '', graduation_year: '' }])
  }

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index))
  }

  const generateJobDescription = async () => {
    if (!aiJobTitle) {
      setMessage({ text: 'Please enter a job title', type: 'error' })
      return
    }
    if (!apiKey) {
      setMessage({ text: 'Please add API key in Settings', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('/api/ai-generate', {
        job_title: aiJobTitle,
        api_key: apiKey
      })
      if (experiences[0]) {
        const newExp = [...experiences]
        newExp[0].description = res.data.description
        setExperiences(newExp)
      }
      setMessage({ text: '✓ Job description generated!', type: 'success' })
      setAiJobTitle('')
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || err.message), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.full_name || !formData.email) {
      setMessage({ text: 'Please fill in Name and Email', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const data = {
        ...formData,
        template,
        experience_count: experiences.length,
        education_count: educations.length,
      }

      experiences.forEach((exp, i) => {
        data[`experience_${i}_company`] = exp.company
        data[`experience_${i}_position`] = exp.position
        data[`experience_${i}_start`] = exp.start_date
        data[`experience_${i}_end`] = exp.end_date
        data[`experience_${i}_description`] = exp.description
      })

      educations.forEach((edu, i) => {
        data[`education_${i}_institution`] = edu.institution
        data[`education_${i}_degree`] = edu.degree
        data[`education_${i}_field`] = edu.field
        data[`education_${i}_year`] = edu.graduation_year
      })

      const res = await axios.post('/api/generate', data, { responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formData.full_name.replace(' ', '_')}_CV.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setMessage({ text: '✓ CV downloaded!', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Error: ' + (err.response?.data?.error || err.message), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="cv-form">
      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="form-section">
        <h2>Choose Template</h2>
        <div className="template-selector">
          {['modern', 'minimal', 'creative'].map(t => (
            <button
              key={t}
              type="button"
              className={`template-btn ${template === t ? 'active' : ''}`}
              onClick={() => setTemplate(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>Personal Information</h2>
        <div className="form-row">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name *"
            value={formData.full_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-row">
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>
        <textarea
          name="professional_summary"
          placeholder="Professional Summary"
          value={formData.professional_summary}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <h2>🤖 AI Job Description</h2>
        <div className="ai-section">
          <div className="ai-input">
            <input
              type="text"
              placeholder="Job title (e.g., Senior Developer)"
              value={aiJobTitle}
              onChange={(e) => setAiJobTitle(e.target.value)}
            />
            <button type="button" onClick={generateJobDescription} className="btn-generate">
              Generate
            </button>
          </div>
          <small>Get free Groq API key at <a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a></small>
        </div>
      </div>

      <div className="form-section">
        <h2>Professional Experience</h2>
        {experiences.map((exp, i) => (
          <div key={i} className="item-box">
            <div className="item-header">
              <span>Experience {i + 1}</span>
              {experiences.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeExperience(i)}>
                  Remove
                </button>
              )}
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Company"
                value={exp.company}
                onChange={(e) => handleExperienceChange(i, 'company', e.target.value)}
              />
              <input
                type="text"
                placeholder="Position"
                value={exp.position}
                onChange={(e) => handleExperienceChange(i, 'position', e.target.value)}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Start Date"
                value={exp.start_date}
                onChange={(e) => handleExperienceChange(i, 'start_date', e.target.value)}
              />
              <input
                type="text"
                placeholder="End Date"
                value={exp.end_date}
                onChange={(e) => handleExperienceChange(i, 'end_date', e.target.value)}
              />
            </div>
            <textarea
              placeholder="Description"
              value={exp.description}
              onChange={(e) => handleExperienceChange(i, 'description', e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="btn-add" onClick={addExperience}>
          + Add Experience
        </button>
      </div>

      <div className="form-section">
        <h2>Education</h2>
        {educations.map((edu, i) => (
          <div key={i} className="item-box">
            <div className="item-header">
              <span>Education {i + 1}</span>
              {educations.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeEducation(i)}>
                  Remove
                </button>
              )}
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => handleEducationChange(i, 'institution', e.target.value)}
              />
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleEducationChange(i, 'degree', e.target.value)}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Field"
                value={edu.field}
                onChange={(e) => handleEducationChange(i, 'field', e.target.value)}
              />
              <input
                type="text"
                placeholder="Graduation Year"
                value={edu.graduation_year}
                onChange={(e) => handleEducationChange(i, 'graduation_year', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={addEducation}>
          + Add Education
        </button>
      </div>

      <div className="form-section">
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma-separated)"
          value={formData.skills}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-section">
        <input
          type="text"
          name="certifications"
          placeholder="Certifications (comma-separated)"
          value={formData.certifications}
          onChange={handleInputChange}
        />
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Generating...' : '⬇️ Download PDF'}
      </button>
    </form>
  )
}

export default CVForm
