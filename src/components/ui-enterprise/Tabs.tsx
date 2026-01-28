/**
 * 🏢 ENTERPRISE TABS COMPONENT
 * Clean navigation tabs - Figma/Notion style
 * BDS: Grammaire (Art 1) + Géométrie (Art 5)
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}: TabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  if (variant === 'underline') {
    return (
      <div className={`border-b border-gray-800 ${className}`}>
        <div className={`flex ${fullWidth ? 'w-full' : 'gap-8'} relative`}>
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  ${sizeStyles[size]}
                  relative pb-3 font-medium transition-colors
                  ${fullWidth ? 'flex-1' : ''}
                  ${isActive 
                    ? 'text-white' 
                    : tab.disabled 
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`
                      px-1.5 py-0.5 text-xs rounded-full
                      ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}
                    `}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`
                ${sizeStyles[size]}
                ${fullWidth ? 'flex-1' : ''}
                rounded-lg font-medium transition-all
                ${isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : tab.disabled
                    ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`
                    px-1.5 py-0.5 text-xs rounded-full
                    ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}
                  `}>
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`inline-flex gap-1 bg-gray-900 p-1 rounded-lg ${className}`}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={`
              ${sizeStyles[size]}
              ${fullWidth ? 'flex-1' : ''}
              rounded-md font-medium transition-all relative
              ${isActive 
                ? 'bg-gray-800 text-white shadow-sm' 
                : tab.disabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`
                  px-1.5 py-0.5 text-xs rounded-full
                  ${isActive ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'}
                `}>
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
