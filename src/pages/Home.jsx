import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBoards } from '../context/BoardsContext.jsx'

export default function Home(){
  const { state, createBoard, editBoardTitle, deleteBoard } = useBoards()
  const [title, setTitle] = useState('')

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Your Boards</h1>
      <div className="mb-6 flex gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Board title" className="px-3 py-2 rounded bg-neutral-800 outline-none w-64" />
        <button onClick={()=>{ if(title.trim()){createBoard(title.trim()); setTitle('')} }} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500">Create</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.boardOrder.map(id => {
          const b = state.boards[id]
          return (
            <div key={id} className="rounded-xl p-4 bg-neutral-800">
              <Link to={`/board/${id}`} className="text-lg font-medium hover:underline">{b.title}</Link>
              <div className="text-sm opacity-80 mt-1">{b.listOrder.length} lists • {Object.keys(b.cards).length} cards</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>{
                  const t = prompt('New board title', b.title)
                  if(t!==null) editBoardTitle(id, t || 'Untitled')
                }} className="px-2 py-1 rounded bg-neutral-700 text-xs">Rename</button>
                <button onClick={()=>{ if(confirm('Delete board?')) deleteBoard(id) }} className="px-2 py-1 rounded bg-red-600 text-xs">Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
