// Kanban drag-and-drop functionality
document.addEventListener('DOMContentLoaded', () => {
  setupKanban()
})

function setupKanban() {
  const kanbanBoard = document.querySelector('.kanban-board')
  if (!kanbanBoard) return

  let draggedElement: HTMLElement | null = null
  let originalLane: HTMLElement | null = null
  let placeholder: HTMLElement | null = null
  let updateTimeout: number | null = null

  // Add event listeners to all cards
  const cards = document.querySelectorAll('.kanban-card')
  cards.forEach(card => {
    if (!(card instanceof HTMLElement)) return
    
    card.addEventListener('dragstart', handleDragStart)
    card.addEventListener('dragend', handleDragEnd)
  })

  // Add event listeners to all lanes
  const lanes = document.querySelectorAll('.kanban-lane-cards')
  lanes.forEach(lane => {
    if (!(lane instanceof HTMLElement)) return
    
    lane.addEventListener('dragover', handleDragOver)
    lane.addEventListener('dragenter', handleDragEnter)
    lane.addEventListener('dragleave', handleDragLeave)
    lane.addEventListener('drop', handleDrop)
  })

  function handleDragStart(e: DragEvent) {
    if (!(e.target instanceof HTMLElement)) return
    draggedElement = e.target.closest('.kanban-card') as HTMLElement
    originalLane = draggedElement.closest('.kanban-lane-cards') as HTMLElement
    
    // Create a placeholder element
    placeholder = document.createElement('div')
    placeholder.className = 'kanban-card-placeholder'
    
    // Add a class to the dragged element
    draggedElement.classList.add('dragging')
    
    // Store the data for the drop
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', draggedElement.dataset.cardId || '')
      e.dataTransfer.effectAllowed = 'move'
    }
    
    // Delay replacing with placeholder to ensure the drag image is created
    setTimeout(() => {
      if (draggedElement && draggedElement.parentNode) {
        draggedElement.parentNode.insertBefore(placeholder as Node, draggedElement)
        draggedElement.style.display = 'none'
      }
    }, 0)
  }

  function handleDragEnd() {
    if (!draggedElement) return
    
    // Remove the dragging class
    draggedElement.classList.remove('dragging')
    draggedElement.style.display = ''
    
    // Remove the placeholder
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder)
    }
    
    draggedElement = null
    originalLane = null
    placeholder = null
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
    
    if (!draggedElement || !placeholder) return
    
    const lane = e.currentTarget as HTMLElement
    const cards = Array.from(lane.querySelectorAll('.kanban-card:not(.dragging)'))
    
    // Find the card we're dragging over
    let closestCard = null
    let closestOffset = Number.NEGATIVE_INFINITY
    
    const mouseY = e.clientY
    
    cards.forEach(card => {
      const box = (card as HTMLElement).getBoundingClientRect()
      const offset = mouseY - box.top - box.height / 2
      
      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset
        closestCard = card
      }
    })
    
    // Move the placeholder
    if (closestCard) {
      lane.insertBefore(placeholder, closestCard)
    } else {
      lane.appendChild(placeholder)
    }
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault()
    if (!(e.currentTarget instanceof HTMLElement)) return
    e.currentTarget.classList.add('drag-over')
  }

  function handleDragLeave(e: DragEvent) {
    if (!(e.currentTarget instanceof HTMLElement)) return
    e.currentTarget.classList.remove('drag-over')
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    if (!(e.currentTarget instanceof HTMLElement)) return
    
    const lane = e.currentTarget
    lane.classList.remove('drag-over')
    
    if (!draggedElement || !placeholder) return
    
    // Move the card to its new position
    lane.insertBefore(draggedElement, placeholder)
    
    // Save the new state
    saveKanbanState()
  }

  function saveKanbanState() {
    // Clear any pending updates
    if (updateTimeout) {
      window.clearTimeout(updateTimeout)
    }
    
    // Debounce updates to prevent too many operations
    updateTimeout = window.setTimeout(() => {
      const kanbanState = extractKanbanState()
      updateKanbanMarkdown(kanbanState)
    }, 500)
  }

  function extractKanbanState() {
    const lanes = document.querySelectorAll('.kanban-lane')
    const state: any[] = []
    
    lanes.forEach(laneElement => {
      if (!(laneElement instanceof HTMLElement)) return
      
      const laneId = laneElement.dataset.laneId || ''
      const laneTitle = laneElement.querySelector('.kanban-lane-header h3')?.textContent || ''
      const cards: any[] = []
      
      const cardElements = laneElement.querySelectorAll('.kanban-card')
      cardElements.forEach(cardElement => {
        if (!(cardElement instanceof HTMLElement)) return
        
        cards.push({
          id: cardElement.dataset.cardId || '',
          content: cardElement.querySelector('.kanban-card-content')?.innerHTML || ''
        })
      })
      
      state.push({
        id: laneId,
        title: laneTitle,
        cards
      })
    })
    
    return state
  }

  async function updateKanbanMarkdown(state: any[]) {
    try {
      // Send the updated state to the server
      const response = await fetch('/api/kanban/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageSlug: window.location.pathname,
          kanbanState: state
        })
      })
      
      if (!response.ok) {
        console.error('Failed to update kanban state:', await response.text())
      }
    } catch (error) {
      console.error('Error updating kanban state:', error)
    }
  }
}
