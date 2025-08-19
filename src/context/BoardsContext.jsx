import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

const STORAGE_KEY = 'trello_clone_data_v1'

const initialState = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // default demo board
  const boardId = uuid()
  const todoId = uuid(), doingId = uuid(), doneId = uuid()
  const card1 = uuid(), card2 = uuid()
  return {
    boardOrder: [boardId],
    boards: {
      [boardId]: {
        id: boardId,
        title: 'My Trello Board',
        lists: {
          [todoId]: { id: todoId, title: 'To Do', cardIds: [card1] },
          [doingId]: { id: doingId, title: 'Doing', cardIds: [card2] },
          [doneId]: { id: doneId, title: 'Done', cardIds: [] }
        },
        cards: {
          [card1]: { id: card1, title: 'Welcome 🎉', description: 'Edit me', labels: ['starter'], priority: 'medium' },
          [card2]: { id: card2, title: 'Drag me →', description: '', labels: [], priority: 'low' }
        },
        listOrder: [todoId, doingId, doneId]
      }
    }
  }
})()

const BoardsContext = createContext(null)

function reducer(state, action) {
  switch(action.type){
    case 'SAVE': {
      return action.payload
    }
    case 'CREATE_BOARD': {
      const id = action.id
      const newState = { ...state, boardOrder: [...state.boardOrder, id], boards: { ...state.boards, [id]: { id, title: action.title, lists: {}, cards: {}, listOrder: [] } } }
      return newState
    }
    case 'EDIT_BOARD_TITLE': {
      const { boardId, title } = action
      const newState = { ...state, boards: { ...state.boards, [boardId]: { ...state.boards[boardId], title } } }
      return newState
    }
    case 'DELETE_BOARD': {
      const { boardId } = action
      const newBoards = { ...state.boards }
      delete newBoards[boardId]
      return { ...state, boardOrder: state.boardOrder.filter(id=>id!==boardId), boards: newBoards }
    }
    case 'ADD_LIST': {
      const { boardId, title, listId } = action
      const board = state.boards[boardId]
      const lists = { ...board.lists, [listId]: { id: listId, title, cardIds: [] } }
      const listOrder = [...board.listOrder, listId]
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, lists, listOrder } } }
    }
    case 'EDIT_LIST': {
      const { boardId, listId, title } = action
      const board = state.boards[boardId]
      const lists = { ...board.lists, [listId]: { ...board.lists[listId], title } }
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, lists } } }
    }
    case 'DELETE_LIST': {
      const { boardId, listId } = action
      const board = state.boards[boardId]
      const lists = { ...board.lists }
      // remove cards of this list
      const cardIds = lists[listId].cardIds
      const cards = { ...board.cards }
      cardIds.forEach(id => delete cards[id])
      delete lists[listId]
      const listOrder = board.listOrder.filter(id=>id!==listId)
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, lists, listOrder, cards } } }
    }
    case 'ADD_CARD': {
      const { boardId, listId, title, cardId } = action
      const board = state.boards[boardId]
      const newCard = { id: cardId, title, description: '', labels: [], priority: 'low' }
      const cards = { ...board.cards, [cardId]: newCard }
      const lists = { ...board.lists, [listId]: { ...board.lists[listId], cardIds: [...board.lists[listId].cardIds, cardId] } }
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, cards, lists } } }
    }
    case 'EDIT_CARD': {
      const { boardId, cardId, patch } = action
      const board = state.boards[boardId]
      const cards = { ...board.cards, [cardId]: { ...board.cards[cardId], ...patch } }
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, cards } } }
    }
    case 'DELETE_CARD': {
      const { boardId, listId, cardId } = action
      const board = state.boards[boardId]
      const lists = { ...board.lists, [listId]: { ...board.lists[listId], cardIds: board.lists[listId].cardIds.filter(id=>id!==cardId) } }
      const cards = { ...board.cards }
      delete cards[cardId]
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, lists, cards } } }
    }
    case 'MOVE_CARD': {
      const { boardId, sourceListId, destListId, sourceIndex, destIndex } = action
      const board = state.boards[boardId]
      const source = Array.from(board.lists[sourceListId].cardIds)
      const [moved] = source.splice(sourceIndex, 1)
      const dest = sourceListId === destListId ? source : Array.from(board.lists[destListId].cardIds)
      dest.splice(destIndex, 0, moved)
      const lists = {
        ...board.lists,
        [sourceListId]: { ...board.lists[sourceListId], cardIds: source },
        [destListId]: { ...board.lists[destListId], cardIds: dest }
      }
      return { ...state, boards: { ...state.boards, [boardId]: { ...board, lists } } }
    }
    case 'CLEAR_ALL': {
      return { boardOrder: [], boards: {} }
    }
    default:
      return state
  }
}

export function BoardsProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo(()=>({
    state,
    createBoard: (title) => dispatch({ type: 'CREATE_BOARD', id: uuid(), title }),
    editBoardTitle: (boardId, title) => dispatch({ type: 'EDIT_BOARD_TITLE', boardId, title }),
    deleteBoard: (boardId) => dispatch({ type: 'DELETE_BOARD', boardId }),
    addList: (boardId, title) => dispatch({ type: 'ADD_LIST', boardId, title, listId: uuid() }),
    editList: (boardId, listId, title) => dispatch({ type: 'EDIT_LIST', boardId, listId, title }),
    deleteList: (boardId, listId) => dispatch({ type: 'DELETE_LIST', boardId, listId }),
    addCard: (boardId, listId, title) => dispatch({ type: 'ADD_CARD', boardId, listId, title, cardId: uuid() }),
    editCard: (boardId, cardId, patch) => dispatch({ type: 'EDIT_CARD', boardId, cardId, patch }),
    deleteCard: (boardId, listId, cardId) => dispatch({ type: 'DELETE_CARD', boardId, listId, cardId }),
    moveCard: (boardId, sourceListId, destListId, sourceIndex, destIndex) => dispatch({ type: 'MOVE_CARD', boardId, sourceListId, destListId, sourceIndex, destIndex }),
    clearAll: () => dispatch({ type: 'CLEAR_ALL' }),
    exportJSON: () => state,
    importJSON: (obj) => dispatch({ type: 'SAVE', payload: obj })
  }), [state])

  return <BoardsContext.Provider value={api}>{children}</BoardsContext.Provider>
}

export const useBoards = () => useContext(BoardsContext)
