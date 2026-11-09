export default function DataTable({ columns, rows, empty = 'কোনো ডেটা নেই', loading }) {
  if (loading) {
    return (
      <div className="card space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-surface2 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-muted">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id || i} className="border-b border-line/60 hover:bg-surface2/50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-middle">
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
