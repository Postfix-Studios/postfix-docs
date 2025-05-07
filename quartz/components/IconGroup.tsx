import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import styles from "./styles/theme-icons.scss"
import SocialIcons from "./SocialIcons"

const IconGroup: QuartzComponent = (props: QuartzComponentProps) => {
  return (
    <div class="icon-group">
      <div class="icon-group-header">
        <h3>Theme & Socials</h3>
      </div>
      <div class="icon-container">
        <SocialIcons {...props} />
      </div>
    </div>
  )
}

IconGroup.css = styles

export default (() => IconGroup) satisfies QuartzComponentConstructor
