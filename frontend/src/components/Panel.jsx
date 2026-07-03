export default function Panel({ title, subtitle, span = 1, children, action }) {
  return (
    <section className={`panel panel-span-${span}`}>
      <header className="panel-header">
        <div>
          <h3 className="panel-title">{title}</h3>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
