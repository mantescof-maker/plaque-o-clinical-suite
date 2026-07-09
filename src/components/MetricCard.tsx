type MetricCardProps = {
  title: string
  value: string
  detail: string
  accent?: 'green' | 'blue' | 'gray'
}

function MetricCard({ title, value, detail, accent = 'green' }: MetricCardProps) {
  return (
    <article className={`metric-card ${accent}`}>
      <div className="metric-header">
        <p>{title}</p>
        <span>↗</span>
      </div>
      <h3>{value}</h3>
      <p className="metric-detail">{detail}</p>
    </article>
  )
}

export default MetricCard
