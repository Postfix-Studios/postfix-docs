import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/kanban.scss"

export interface KanbanData {
  lanes: {
    id: string
    title: string
    cards: {
      id: string
      content: string
      metadata?: Record<string, string>
    }[]
  }[]
}

export const Kanban: QuartzComponentConstructor = () => {
  function KanbanComponent({ fileData }: QuartzComponentProps) {
    const kanbanData = fileData.kanban as KanbanData | undefined
    if (!kanbanData) return null

    return (
      <div className="kanban-board">
        {kanbanData.lanes.map((lane) => (
          <div key={lane.id} className="kanban-lane" data-lane-id={lane.id}>
            <div className="kanban-lane-header">
              <h3>{lane.title}</h3>
            </div>
            <div className="kanban-lane-cards">
              {lane.cards.map((card) => (
                <div 
                  key={card.id} 
                  className="kanban-card" 
                  data-card-id={card.id}
                  draggable={true}
                >
                  <div className="kanban-card-content" dangerouslySetInnerHTML={{ __html: card.content }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  KanbanComponent.css = style
  return KanbanComponent
}

export default Kanban
