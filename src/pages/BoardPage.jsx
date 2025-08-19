import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoards } from '../context/BoardsContext.jsx'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

function Card({ card, onEdit, onDelete }){
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [desc, setDesc] = useState(card.description || '')
  const [labelsText, setLabelsText] = useState((card.labels||[]).join(','))
  const [priority, setPriority] = useState(card.priority || 'low')

  const save = () => {
    onEdit({ title: title || 'Untitled', description: desc, labels: labelsText.split(',').map(s=>s.trim()).filter(Boolean), priority })
    setEditing(false)
  }

  return (
    <div className="rounded-lg p-3 bg-neutral-700 shadow">
      {!editing ? (
        <div>
          <div className="font-medium">{card.title}</div>
          <div className="text-xs opacity-80">{card.description}</div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {(card.labels||[]).map((l, idx)=>(<span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-neutral-600">{l}</span>))}
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-600">Priority: {card.priority||'low'}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={()=>setEditing(true)} className="text-xs px-2 py-1 rounded bg-neutral-600">Edit</button>
            <button onClick={onDelete} className="text-xs px-2 py-1 rounded bg-red-600">Delete</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input className="w-full px-2 py-1 rounded bg-neutral-600" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full px-2 py-1 rounded bg-neutral-600" rows={3} value={desc} onChange={e=>setDesc(e.target.value)} />
          <input className="w-full px-2 py-1 rounded bg-neutral-600" placeholder="label1,label2" value={labelsText} onChange={e=>setLabelsText(e.target.value)} />
          <select className="w-full px-2 py-1 rounded bg-neutral-600" value={priority} onChange={e=>setPriority(e.target.value)}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <div className="flex gap-2">
            <button onClick={save} className="text-xs px-2 py-1 rounded bg-blue-600">Save</button>
            <button onClick={()=>setEditing(false)} className="text-xs px-2 py-1 rounded bg-neutral-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BoardPage(){
  const { boardId } = useParams()
  const { state, addList, addCard, editCard, deleteCard, moveCard, editList } = useBoards()
  const board = state.boards[boardId]

  const [listTitle, setListTitle] = useState('')

  if(!board) return <div className="p-6 text-white">Board not found</div>

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if(!destination) return
    if(destination.droppableId === source.droppableId && destination.index === source.index) return
    moveCard(boardId, source.droppableId, destination.droppableId, source.index, destination.index)
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-semibold mb-3">{board.title}</h2>

      <div className="mb-4 flex gap-2">
        <input value={listTitle} onChange={e=>setListTitle(e.target.value)} placeholder="New list title" className="px-3 py-2 rounded bg-neutral-800 outline-none" />
        <button onClick={()=>{ if(listTitle.trim()){ addList(boardId, listTitle.trim()); setListTitle('') } }} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500">Add List</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
          {board.listOrder.map(listId => {
            const list = board.lists[listId]
            const [newCardTitle, setNewCardTitle] = [null, null] // placeholder for lint
            return (
              <ListColumn
                key={listId}
                boardId={boardId}
                list={list}
                cards={list.cardIds.map(cid => board.cards[cid])}
                onAddCard={(title)=>addCard(boardId, listId, title)}
                onEditCard={(cardId, patch)=>editCard(boardId, cardId, patch)}
                onDeleteCard={(cardId)=>deleteCard(boardId, listId, cardId)}
                onRenameList={(title)=>editList(boardId, listId, title)}
              />
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}

function ListColumn({ list, boardId, cards, onAddCard, onEditCard, onDeleteCard, onRenameList }){
  const [title, setTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  return (
    <div className="w-72 shrink-0">
      <div className="mb-2 flex items-center justify-between">
        {!editingTitle ? (
          <h3 className="font-medium">{list.title}</h3>
        ) : (
          <input className="px-2 py-1 rounded bg-neutral-700" defaultValue={list.title} onBlur={(e)=>{ onRenameList(e.target.value||'Untitled'); setEditingTitle(false) }} autoFocus />
        )}
        <button className="text-xs px-2 py-1 rounded bg-neutral-700" onClick={()=>setEditingTitle(true)}>Rename</button>
      </div>
      <Droppable droppableId={list.id} type="CARD">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 p-2 bg-neutral-800 rounded-xl min-h-[80px]">
            {cards.map((card, index)=>(
              <Draggable draggableId={card.id} index={index} key={card.id}>
                {(p)=> (
                  <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                    <Card
                      card={card}
                      onEdit={(patch)=>onEditCard(card.id, patch)}
                      onDelete={()=>onDeleteCard(card.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <AddCardBox onAdd={title => onAddCard(title)} />
          </div>
        )}
      </Droppable>
    </div>
  )
}

function AddCardBox({ onAdd }){
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  return open ? (
    <div className="space-y-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-2 py-1 rounded bg-neutral-700" placeholder="Card title" />
      <div className="flex gap-2">
        <button onClick={()=>{ if(title.trim()){ onAdd(title.trim()); setTitle(''); setOpen(false)} }} className="text-xs px-2 py-1 rounded bg-blue-600">Add</button>
        <button onClick={()=>setOpen(false)} className="text-xs px-2 py-1 rounded bg-neutral-600">Cancel</button>
      </div>
    </div>
  ) : (
    <button onClick={()=>setOpen(true)} className="w-full text-left text-xs px-2 py-1 rounded bg-neutral-700">+ Add a card</button>
  )
}
