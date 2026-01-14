/**
 * SORTABLE TABLE - P2-09
 * DataTable with column sorting
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (sort column)
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useSoundContext } from './SoundProvider';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  className = ''
}: SortableTableProps<T>) {
  const { playClick } = useSoundContext();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle column sort
  const handleSort = (columnKey: string) => {
    playClick();
    if (sortColumn === columnKey) {
      // Cycle through: asc → desc → null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Compare values
      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }

    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 text-orange-600" />;
    }

    return <ArrowDown className="w-4 h-4 text-orange-600" />;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => {
              const columnKey = String(column.key);
              const isSortable = column.sortable !== false;
              const isActive = sortColumn === columnKey;

              return (
                <th
                  key={columnKey}
                  className="px-4 py-3 text-left"
                  style={{ width: column.width }}
                >
                  {isSortable ? (
                    <button
                      onClick={() => handleSort(columnKey)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-orange-600'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <span>{column.label}</span>
                      {getSortIcon(columnKey)}
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-slate-700">
                      {column.label}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <motion.tr
                key={keyExtractor(row)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {columns.map((column) => {
                  const columnKey = String(column.key);
                  const value = row[columnKey];

                  return (
                    <td key={columnKey} className="px-4 py-3">
                      {column.render ? (
                        column.render(value, row)
                      ) : (
                        <span className="text-sm text-slate-900">
                          {value != null ? String(value) : '-'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Usage example:
 * 
 * interface Project {
 *   id: string;
 *   title: string;
 *   status: string;
 *   createdAt: Date;
 *   cost: number;
 * }
 * 
 * const columns: Column<Project>[] = [
 *   { key: 'title', label: 'Project Name', sortable: true },
 *   { 
 *     key: 'status', 
 *     label: 'Status', 
 *     sortable: true,
 *     render: (value) => (
 *       <span className={`px-2 py-1 rounded-full text-xs ${
 *         value === 'completed' ? 'bg-[var(--coconut-palm)]/10 text-[var(--coconut-palm)]' : 'bg-[var(--coconut-cream)] text-[var(--coconut-husk)]'
 *       }`}>
 *         {value}
 *       </span>
 *     )
 *   },
 *   { 
 *     key: 'createdAt', 
 *     label: 'Created', 
 *     sortable: true,
 *     render: (value) => new Date(value).toLocaleDateString()
 *   },
 *   { 
 *     key: 'cost', 
 *     label: 'Cost', 
 *     sortable: true,
 *     render: (value) => `${value} ⭐`
 *   }
 * ];
 * 
 * <SortableTable
 *   data={projects}
 *   columns={columns}
 *   keyExtractor={(row) => row.id}
 *   emptyMessage="No projects found"
 * />
 */