import type { ReactNode } from 'react'

type PageTemplateProps = {
  header: ReactNode
  map: ReactNode
  sheet?: ReactNode
  legend?: ReactNode
}

const PageTemplate = ({ header, map, sheet, legend }: PageTemplateProps) => (
  <div className="page">
    {header}
    <main className="map-shell">
      {map}
      {sheet}
      {legend}
    </main>
  </div>
)

export default PageTemplate
