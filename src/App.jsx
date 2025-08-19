import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { BoardsProvider, useBoards } from './context/BoardsContext.jsx'
import BoardPage from './pages/BoardPage.jsx'
import Home from './pages/Home.jsx'

function Topbar() {
  const navigate = useNavigate()
  const { clearAll, exportJSON, importJSON } = useBoards()

  const handleImport = async () => {
    const text = prompt('Paste JSON here:')
    if (!text) return
    try { importJSON(JSON.parse(text)); alert('Imported!') } catch(e){ alert('Invalid JSON') }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-neutral-800 text-white sticky top-0 z-50">
      <button onClick={()=>navigate('/')} className="font-semibold">Trello Clone</button>
      <div className="flex items-center gap-2">
        <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(exportJSON(), null, 2))} className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm">Copy JSON</button>
        <button onClick={handleImport} className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-sm">Import JSON</button>
        <button onClick={clearAll} className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-sm">Reset</button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BoardsProvider>
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="*" element={<div className="p-6 text-white">Not Found</div>} />
      </Routes>
    </BoardsProvider>
  )
}
