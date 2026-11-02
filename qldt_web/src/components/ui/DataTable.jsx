import clsx from "clsx";
import { EmptyState } from "./EmptyState";

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
};

function getCellValue(column, row, index) {
  return column.render ? column.render(row, index) : row[column.key];
}

export function DataTable({ columns, rows, rowKey = 'id', caption, minWidth = 640, busy = false, footer, empty, className }) {
  if(rows.length === 0) {
    return <EmptyState title="Không có dữ liệu" {...empty} />;
  }

  const getRowKey = typeof rowKey === 'function' ? rowKey : row => row[rowKey];

  return (
    <div aria-busy={busy || undefined} className={clsx('relative overflow-x-auto transition-opacity duration-150', busy && 'opacity-60', className)}>
      <table className="w-full border-collapse" style={{ minWidth }}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} scope="col" className={clsx('border-b border-line bg-canvas/60 px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-muted', alignClass[column.align ?? 'left'])}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row)} className="border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-canvas/50">
              {columns.map(column => (
                <td key={column.key} className={clsx(
                  'px-3 py-2.75 align-top',
                  alignClass[column.align ?? 'left'],
                  column.align === 'right' && 'tabular-nums',
                  column.nowrap && 'whitespace-nowrap',
                  column.className
                )}>
                  {getCellValue(column, row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot className="border-t border-line bg-canvas/60 font-semibold">{footer}</tfoot>}
      </table>
    </div>
  )
} 