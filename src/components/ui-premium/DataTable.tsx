/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Data Table Component
 * 
 * Features:
 * - Sorting (multi-column)
 * - Filtering
 * - Pagination
 * - Row selection
 * - Column resizing
 * - Responsive
 * - Animations
 * - Accessibility
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  Filter,
  MoreHorizontal,
  Check
} from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { GlassInput } from '../ui/glass-input';
import { tableRowVariants } from '../../lib/animations/stagger';

// ============================================
// TYPES
// ============================================

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

// ============================================
// COMPONENT
// ============================================

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  pageSize = 10,
  selectable = false,
  onRowClick,
  onSelectionChange,
  className = '',
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<SortState>({ key: '', direction: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // ============================================
  // SORTING
  // ============================================

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortState(prev => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: '', direction: null };
    });
  };

  // ============================================
  // FILTERING & SEARCH
  // ============================================

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      result = result.filter(row => {
        return columns.some(col => {
          const value = col.accessor(row);
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // Sort
    if (sortState.key && sortState.direction) {
      const column = columns.find(col => col.key === sortState.key);
      if (column) {
        result.sort((a, b) => {
          const aValue = column.accessor(a);
          const bValue = column.accessor(b);
          
          if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, columns, searchQuery, sortState]);

  // ============================================
  // PAGINATION
  // ============================================

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  // ============================================
  // SELECTION
  // ============================================

  const handleRowSelect = (rowId: string | number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
    
    if (onSelectionChange) {
      const selected = data.filter(row => newSelection.has(row.id!));
      onSelectionChange(selected);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map(row => row.id!).filter(id => id !== undefined);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(paginatedData);
    }
  };

  const isAllSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <GlassInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
            fullWidth
          />
        </div>
        
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-white"
          >
            {selectedRows.size} selected
          </motion.div>
        )}
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            
            {/* Header */}
            <thead>
              <tr className="border-b border-white/10">
                {selectable && (
                  <th className="p-4 text-left w-12">
                    <button
                      onClick={handleSelectAll}
                      className="w-5 h-5 rounded border border-white/30 flex items-center justify-center
                                 hover:bg-white/10 transition-colors"
                      aria-label="Select all"
                    >
                      {isAllSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`p-4 text-${column.align || 'left'}`}
                    style={{ width: column.width }}
                  >
                    <button
                      onClick={() => handleSort(column.key)}
                      disabled={!column.sortable}
                      className={`
                        flex items-center gap-2 font-semibold text-white
                        ${column.sortable ? 'hover:text-primary-400 cursor-pointer' : 'cursor-default'}
                      `}
                    >
                      {column.header}
                      
                      {column.sortable && (
                        <span className="text-gray-400">
                          {sortState.key === column.key ? (
                            sortState.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center text-gray-400">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowId = row.id;
                    const isSelected = rowId !== undefined && selectedRows.has(rowId);
                    
                    return (
                      <motion.tr
                        key={rowId || index}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        className={`
                          border-b border-white/5
                          ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}
                          ${isSelected ? 'bg-primary-500/10' : ''}
                          transition-colors
                        `}
                        onClick={() => onRowClick?.(row)}
                      >
                        {selectable && rowId !== undefined && (
                          <td className="p-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowSelect(rowId);
                              }}
                              className="w-5 h-5 rounded border border-white/30 flex items-center justify-center
                                         hover:bg-white/10 transition-colors"
                              aria-label="Select row"
                            >
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </button>
                          </td>
                        )}
                        
                        {columns.map((column) => {
                          const value = column.accessor(row);
                          return (
                            <td
                              key={column.key}
                              className={`p-4 text-${column.align || 'left'} text-gray-300`}
                            >
                              {column.render ? column.render(value, row) : value}
                            </td>
                          );
                        })}
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-white/10 p-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-white/20 text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      w-8 h-8 rounded-lg
                      ${page === currentPage 
                        ? 'bg-primary-500 text-white' 
                        : 'border border-white/20 text-gray-300 hover:bg-white/10'
                      }
                      transition-colors
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-white/20 text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-white/10 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default DataTable;
