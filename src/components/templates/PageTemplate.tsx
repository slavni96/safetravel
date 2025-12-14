import type { ReactNode } from 'react'

type PageTemplateProps = {
  header: ReactNode
  map: ReactNode
  sheet?: ReactNode
}

const PageTemplate = ({ header, map, sheet }: PageTemplateProps) => (
  <div className="page">
    {header}
    <main className="map-shell">
      {map}
      {sheet}
    </main>
  </div>
)

export default PageTemplate
