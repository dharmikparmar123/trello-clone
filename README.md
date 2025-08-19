# Trello Clone (LocalStorage + React + Context + react-beautiful-dnd + Tailwind)


```bash
npm install
npm run dev
```

## Features
- Create, rename, delete boards
- Add lists to boards
- Add/edit/delete cards
- Drag & drop cards between lists (react-beautiful-dnd)
- Labels + priority on cards
- Auto-saves to LocalStorage
- Reset all data
- Export/Import JSON (Top bar buttons)

## Data Model (LocalStorage)
Stored under key: `trello_clone_data_v1`.

```json
{
  "boardOrder": ["board-id"],
  "boards": {
    "board-id": {
      "id": "board-id",
      "title": "My Trello Board",
      "lists": {
        "list-id": { "id": "list-id", "title": "To Do", "cardIds": ["card-id"] }
      },
      "cards": {
        "card-id": { "id": "card-id", "title": "Example", "description": "", "labels": ["starter"], "priority": "medium" }
      },
      "listOrder": ["list-id"]
    }
  }
}
```

Use **Copy JSON** to place formatted JSON on your clipboard and **Import JSON** to paste it back.
