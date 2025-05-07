import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <div class="footer-content">
          <div class="footer-links">
            <ul>
              {Object.entries(links).map(([text, link]) => (
                <li>
                  <a href={link} target="_blank" rel="noopener noreferrer">{text}</a>
                </li>
              ))}
            </ul>
          </div>
          <div class="footer-credit">
            <p>
              © {year} Postfix Studios | {i18n(cfg.locale).components.footer.createdWith}{" "}
              <a href="https://quartz.jzhao.xyz/" target="_blank" rel="noopener noreferrer">Quartz v{version}</a>
            </p>
          </div>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
