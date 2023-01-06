
export type TableOfContent = {
  level: string,
  title: string,
  href: string,
}

export type DocsProps = {
  html: string,
  tableOfContent: TableOfContent[]
}

