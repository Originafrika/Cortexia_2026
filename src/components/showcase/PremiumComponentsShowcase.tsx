/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Components Showcase
 * 
 * Démo interactive de tous les composants premium améliorés
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { DataTable, DataTableColumn } from '../ui-premium/DataTable';
import { PremiumSelect, SelectOption } from '../ui-premium/PremiumSelect';
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable,
  SkeletonText 
} from '../ui-premium/SkeletonLoader';
import { 
  ProgressIndicator,
  LinearProgress,
  CircularProgress,
  RingProgress 
} from '../ui-premium/ProgressIndicator';
import { StatsCard } from '../ui-premium/StatsCard';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '../ui-premium/AnimatedWrapper';
import { 
  Sparkles,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Database,
  Zap,
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react';

// ============================================
// MOCK DATA
// ============================================

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

const mockProducts: Product[] = [
  { id: 1, name: 'Flux 2 Pro', category: 'Image Gen', price: 115, stock: 1000, status: 'active' },
  { id: 2, name: 'Veo 3.1 Fast', category: 'Video Gen', price: 280, stock: 500, status: 'active' },
  { id: 3, name: 'DALL-E 3', category: 'Image Gen', price: 40, stock: 750, status: 'active' },
  { id: 4, name: 'Stable Diffusion', category: 'Image Gen', price: 25, stock: 2000, status: 'inactive' },
  { id: 5, name: 'Midjourney V6', category: 'Image Gen', price: 60, stock: 1500, status: 'active' },
  { id: 6, name: 'Runway Gen-3', category: 'Video Gen', price: 350, stock: 300, status: 'active' },
  { id: 7, name: 'Pika Labs', category: 'Video Gen', price: 180, stock: 600, status: 'active' },
  { id: 8, name: 'Leonardo AI', category: 'Image Gen', price: 35, stock: 900, status: 'active' },
];

const selectOptions: SelectOption[] = [
  { value: 'all', label: 'All Categories', icon: <Database className="w-4 h-4" /> },
  { value: 'image', label: 'Image Generation', icon: <Star className="w-4 h-4" /> },
  { value: 'video', label: 'Video Generation', icon: <Activity className="w-4 h-4" /> },
  { value: 'audio', label: 'Audio Generation', icon: <Zap className="w-4 h-4" /> },
];

const multiSelectOptions: SelectOption[] = [
  { value: 'active', label: 'Active', icon: <Heart className="w-4 h-4" /> },
  { value: 'popular', label: 'Popular', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'new', label: 'New Arrivals', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'sale', label: 'On Sale', icon: <ShoppingCart className="w-4 h-4" /> },
];

// ============================================
// COMPONENT
// ============================================

export function PremiumComponentsShowcase() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Table columns
  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      accessor: (row) => row.name,
      sortable: true,
      filterable: true,
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) => row.category,
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 rounded-lg bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm">
          {value}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      accessor: (row) => row.price,
      sortable: true,
      align: 'right',
      render: (value) => <span className="font-mono">{value} credits</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      accessor: (row) => row.stock,
      sortable: true,
      align: 'right',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      sortable: true,
      render: (value) => (
        <span className={`
          px-2 py-1 rounded-lg text-sm
          ${value === 'active' 
            ? 'bg-success-500/20 border border-success-500/30 text-success-300' 
            : 'bg-gray-500/20 border border-gray-500/30 text-gray-300'
          }
        `}>
          {value}
        </span>
      ),
    },
  ];

  // Simulate loading
  const handleLoadData = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 text-purple-400"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white">
            Premium Components
          </h1>
          <p className="text-xl text-slate-300">
            Coconut V14 - Phase 4 Jour 5 - Enhanced UI Library
          </p>
        </div>

        <AnimatedStaggerContainer>
          
          {/* Stats Cards */}
          <AnimatedStaggerItem>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Stats Cards</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Users"
                  value={12458}
                  previousValue={11234}
                  icon={Users}
                  iconColor="text-primary-400"
                  trend="up"
                  sparklineData={[10, 15, 12, 18, 20, 25, 30]}
                  variant="glow"
                />
                
                <StatsCard
                  title="Revenue"
                  value={45678}
                  unit="€"
                  prefix="$"
                  previousValue={42000}
                  icon={DollarSign}
                  iconColor="text-success-400"
                  trend="up"
                  sparklineData={[30, 35, 32, 40, 38, 42, 45]}
                  variant="gradient"
                />
                
                <StatsCard
                  title="Active Projects"
                  value={234}
                  previousValue={256}
                  icon={Activity}
                  iconColor="text-amber-400"
                  trend="down"
                  sparklineData={[40, 38, 35, 33, 30, 28, 25]}
                />
                
                <StatsCard
                  title="Conversion Rate"
                  value={3.8}
                  unit="%"
                  previousValue={3.5}
                  icon={TrendingUp}
                  iconColor="text-blue-400"
                  trend="up"
                  sparklineData={[2, 2.5, 3, 3.2, 3.5, 3.6, 3.8]}
                />
              </div>
            </div>
          </AnimatedStaggerItem>

          {/* Select Components */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white">Premium Select</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Single Select */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Single Select</h3>
                  <PremiumSelect
                    options={selectOptions}
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value as string)}
                    placeholder="Select a category"
                    label="Category"
                    searchable
                    fullWidth
                  />
                </div>

                {/* Multi Select */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Multi Select</h3>
                  <PremiumSelect
                    options={multiSelectOptions}
                    value={selectedFilters}
                    onChange={(value) => setSelectedFilters(value as string[])}
                    placeholder="Select filters"
                    label="Filters"
                    multiple
                    searchable
                    fullWidth
                  />
                </div>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>

          {/* Progress Indicators */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Progress Indicators</h2>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={handleLoadData}
                >
                  Simulate Loading
                </GlassButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Linear */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Linear</h3>
                  <LinearProgress
                    value={loading ? progress : 75}
                    color="primary"
                    showValue
                    label="Upload Progress"
                  />
                  <LinearProgress
                    value={loading ? progress : 60}
                    color="success"
                    showValue
                    size="lg"
                  />
                  {!loading && (
                    <LinearProgress
                      color="warning"
                      size="sm"
                    />
                  )}
                </div>

                {/* Circular */}
                <div className="space-y-4 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-white">Circular</h3>
                  <CircularProgress
                    value={loading ? progress : 85}
                    color="primary"
                    size="lg"
                  />
                  <div className="flex gap-4">
                    <CircularProgress
                      value={loading ? progress : 60}
                      color="success"
                      size="md"
                    />
                    <CircularProgress
                      value={loading ? progress : 45}
                      color="warning"
                      size="md"
                    />
                  </div>
                </div>

                {/* Ring */}
                <div className="space-y-4 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-white">Ring</h3>
                  <RingProgress
                    value={loading ? progress : 92}
                    color="primary"
                    size="lg"
                    label="Completion"
                  />
                </div>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>

          {/* Data Table */}
          <AnimatedStaggerItem>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Data Table</h2>
              
              <DataTable
                data={mockProducts}
                columns={columns}
                pageSize={5}
                selectable
                onRowClick={(row) => console.log('Clicked:', row)}
                onSelectionChange={(selected) => console.log('Selected:', selected)}
              />
            </div>
          </AnimatedStaggerItem>

          {/* Skeleton Loaders */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white">Skeleton Loaders</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card Skeleton */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Card</h3>
                  <SkeletonCard />
                </div>

                {/* List Skeleton */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">List</h3>
                  <SkeletonList items={3} />
                </div>

                {/* Text Skeleton */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Text</h3>
                  <SkeletonText lines={5} />
                </div>
              </div>

              {/* Table Skeleton */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Table</h3>
                <SkeletonTable rows={3} />
              </div>
            </GlassCard>
          </AnimatedStaggerItem>

          {/* Enhanced Glass Card */}
          <AnimatedStaggerItem>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Enhanced Glass Cards</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <GlassCard
                  variant="light"
                  hover
                  tilt
                  className="p-6"
                >
                  <div className="space-y-3">
                    <Sparkles className="w-8 h-8 text-primary-400" />
                    <h3 className="text-xl font-bold text-white">Hover & Tilt</h3>
                    <p className="text-gray-300">Interactive card with tilt effect</p>
                  </div>
                </GlassCard>

                <GlassCard
                  variant="colored"
                  glow
                  glowColor="secondary"
                  hover
                  className="p-6"
                >
                  <div className="space-y-3">
                    <Star className="w-8 h-8 text-secondary-400" />
                    <h3 className="text-xl font-bold text-white">Colored Glow</h3>
                    <p className="text-gray-300">Gradient with glow effect</p>
                  </div>
                </GlassCard>

                <GlassCard
                  variant="dark"
                  onClick={() => alert('Card clicked!')}
                  hover
                  className="p-6"
                  role="button"
                  aria-label="Clickable card"
                >
                  <div className="space-y-3">
                    <Zap className="w-8 h-8 text-amber-400" />
                    <h3 className="text-xl font-bold text-white">Clickable</h3>
                    <p className="text-gray-300">With keyboard support</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </AnimatedStaggerItem>

          {/* Features Summary */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Component Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-slate-300">
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Enhanced Glass Card</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Tilt effects on hover</li>
                    <li>✓ Advanced animations</li>
                    <li>✓ Keyboard navigation</li>
                    <li>✓ ARIA compliance</li>
                    <li>✓ Multiple variants</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Data Table</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Multi-column sorting</li>
                    <li>✓ Global search</li>
                    <li>✓ Pagination</li>
                    <li>✓ Row selection</li>
                    <li>✓ Custom rendering</li>
                    <li>✓ Animated rows</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Premium Select</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Single/Multi select</li>
                    <li>✓ Search/filter</li>
                    <li>✓ Keyboard navigation</li>
                    <li>✓ Custom icons</li>
                    <li>✓ Smooth animations</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Progress Indicators</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Linear/Circular/Ring</li>
                    <li>✓ Indeterminate state</li>
                    <li>✓ Color themes</li>
                    <li>✓ Animated transitions</li>
                    <li>✓ Labels & values</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Stats Card</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Animated counters</li>
                    <li>✓ Trend indicators</li>
                    <li>✓ Sparkline charts</li>
                    <li>✓ Multiple variants</li>
                    <li>✓ Icon support</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Skeleton Loaders</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Shimmer animation</li>
                    <li>✓ Multiple variants</li>
                    <li>✓ Preset patterns</li>
                    <li>✓ Customizable shapes</li>
                    <li>✓ Performance optimized</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>
        </AnimatedStaggerContainer>
      </div>
    </div>
  );
}

export default PremiumComponentsShowcase;
