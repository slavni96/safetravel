type Stat = {
  label: string
  value: string
}

const StatList = ({ items }: { items: Stat[] }) => (
  <div className="sheet__content">
    {items.map((item) => (
      <div className="stat" key={item.label}>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
      </div>
    ))}
  </div>
)

export default StatList
