import sourceMapSupport from "source-map-support"
sourceMapSupport.install(options)
import cfg from "../quartz.config"
import { Argv, BuildCtx } from "./util/ctx"
import { FilePath, FullSlug } from "./util/path"
import {
  createFileParser,
  createHtmlProcessor,
  createMarkdownParser,
  createMdProcessor,
} from "./processors/parse"
import { options } from "./util/sourcemap"
import { MarkdownContent, ProcessedContent } from "./plugins/vfile"

export async function parseMarkdown(
  buildId: string,
  argv: Argv,
  fps: FilePath[],
): Promise<[MarkdownContent[], FullSlug[]]> {
  // NOTE: THIS IS A HACK!
  // Here we assume all markdown parsers can add to `allSlugs` but dont use them.
  const allSlugs: FullSlug[] = []
  const ctx: BuildCtx = {
    buildId,
    cfg,
    argv,
    allSlugs,
  }
  return [await createFileParser(ctx, fps)(createMdProcessor(ctx)), allSlugs]
}

export function processHtml(
  buildId: string,
  argv: Argv,
  mds: MarkdownContent[],
  allSlugs: FullSlug[],
): Promise<ProcessedContent[]> {
  const ctx: BuildCtx = {
    buildId,
    cfg,
    argv,
    allSlugs,
  }
  return createMarkdownParser(ctx, mds)(createHtmlProcessor(ctx))
}
