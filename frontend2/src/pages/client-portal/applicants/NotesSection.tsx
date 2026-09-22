import { useState } from 'react'
import './applicants.css'
import '../ClientPortalHome.css'

export default function NotesSection() {
  const [notes, setNotes] = useState<Array<{ id: number; applicantId: number; text: string; date: string }>>([])
  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now(),
        applicantId: 1,
        text: newNote,
        date: new Date().toLocaleString()
      }])
      setNewNote('')
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Notes Section</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Notes Section</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="form-group">
          <label>Add Note</label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter note text..."
            rows={4}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: 'white',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
        <button className="submit-button" onClick={handleAddNote}>Add Note</button>

        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Notes History</h3>
          {notes.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>No notes yet</p>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div key={note.id} className="note-item">
                  <p>{note.text}</p>
                  <span className="note-date">{note.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


















