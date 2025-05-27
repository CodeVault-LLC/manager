import { createFileRoute } from '@tanstack/react-router'
import { useNoteStore } from '../../core/store/note.store'
import { useEffect } from 'react'

export const Route = createFileRoute('/notes/')({
  component: RouteComponent
})

function RouteComponent() {
  const { notes, getAll } = useNoteStore()

  useEffect(() => {
    if (notes.length === 0) {
      getAll()
    }
  }, [])

  return (
    <div>
      {notes.length > 0 ? (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notes available</p>
      )}

      {notes.map((note) => (
        <div key={note.id}>
          <h2>{note.title}</h2>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  )
}
