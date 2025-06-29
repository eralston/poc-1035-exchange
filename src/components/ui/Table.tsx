import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  sortKey,
  sortDirection,
  onSort,
  className = '',
  emptyMessage = 'No data available'
}: TableProps<T>) {
  const getValue = (row: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], row);
    }
    return row[key as keyof T];
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-6 py-4 text-left text-sm font-semibold text-slate-700
                    ${column.sortable && onSort ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}
                    ${column.className || ''}
                  `}
                  onClick={() => column.sortable && onSort && onSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && onSort && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortKey === column.key && sortDirection === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-slate-400'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortKey === column.key && sortDirection === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-slate-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={index}
                  className="hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 transition-all duration-200"
                >
                  {columns.map((column) => (
                    <td 
                      key={String(column.key)}
                      className={`px-6 py-4 text-sm text-slate-900 ${column.className || ''}`}
                    >
                      {column.render 
                        ? column.render(getValue(row, column.key), row)
                        : getValue(row, column.key)
                      }
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