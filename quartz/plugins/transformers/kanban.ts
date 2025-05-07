import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"

interface KanbanCard {
  id: string
  content: string
  metadata?: Record<string, string>
}

interface KanbanLane {
  id: string
  title: string
  cards: KanbanCard[]
}

interface KanbanData {
  lanes: KanbanLane[]
}

const KANBAN_REGEX = /```kanban\s*([\s\S]*?)```/g

export const Kanban: QuartzTransformerPlugin = () => {
  return {
    name: "Kanban",
    markdownPlugins() {
      return [
        () => {
          return (tree: any, file: VFile) => {
            const kanbanData: KanbanData = { lanes: [] }
            let kanbanFound = false

            visit(tree, "code", (node: any) => {
              if (node.lang === "kanban") {
                kanbanFound = true
                const content = node.value
                
                const lanes = parseKanbanContent(content)
                kanbanData.lanes = lanes

                node.type = "html"
                node.value = `<div class="kanban-container" data-kanban-id="${Math.random().toString(36).substring(2, 9)}"></div>`
              }
            })

            if (kanbanFound) {
              file.data.kanban = kanbanData
            }
          }
        },
      ]
    },
  }
}

function parseKanbanContent(content: string): KanbanLane[] {
  const lanes: KanbanLane[] = []
  const laneRegex = /## (.+?)(?=\n## |$)/gs

  let laneMatch
  let laneId = 0

  while ((laneMatch = laneRegex.exec(content)) !== null) {
    const laneContent = laneMatch[0]
    const laneHeaderMatch = laneContent.match(/^## (.+)$/m)
    
    if (!laneHeaderMatch) continue
    
    const laneTitle = laneHeaderMatch[1].trim()
    const cards: KanbanCard[] = []
    
    const cardRegex = /- (.+?)(?=\n- |$)/gs
    let cardMatch
    let cardId = 0
    
    const cardContent = laneContent.replace(/^## .+$/m, "").trim()
    
    while ((cardMatch = cardRegex.exec(cardContent)) !== null) {
      const cardText = cardMatch[1].trim()
      
      cards.push({
        id: `card-${laneId}-${cardId}`,
        content: processCardContent(cardText)
      })
      
      cardId++
    }
    
    lanes.push({
      id: `lane-${laneId}`,
      title: laneTitle,
      cards
    })
    
    laneId++
  }
  
  return lanes
}

function processCardContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

export default Kanban
