import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ============================================
// VITE CONFIGURATION - OPTIMIZED FOR PRODUCTION
// ============================================

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh for development
      fastRefresh: true,
      
      // Babel configuration for optimizations
      babel: {
        plugins: [
          // Remove console.log in production
          process.env.NODE_ENV === 'production' && [
            'transform-remove-console',
            { exclude: ['error', 'warn'] }
          ],
        ].filter(Boolean),
      },
    }),
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },

  // Build optimization
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',
    
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for production debugging
    sourcemap: true,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true, // Remove debugger
        pure_funcs: ['console.log'], // Remove specific functions
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // KB
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // React Flow (heavy library)
          'reactflow': ['reactflow'],
          
          // Motion/Framer Motion (animation library)
          'motion': ['motion/react'],
          
          // Lucide icons
          'icons': ['lucide-react'],
          
          // UI components (our premium components)
          'ui-premium': [
            './components/ui-premium/Button',
            './components/ui-premium/Badge',
            './components/ui-premium/Card',
            './components/ui-premium/Input',
            './components/ui-premium/Modal',
            './components/ui-premium/Toast',
          ],
          
          // Coconut components
          'coconut': [
            './components/coconut-v3/CocoboardCanvasV3',
            './components/coconut-v3/nodes/PremiumNodeCard',
            './components/coconut-v3/sidebar/NodeInspector',
          ],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inline threshold (10kb)
    assetsInlineLimit: 10240,
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'reactflow',
      'motion/react',
      'lucide-react',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
    ],
  },

  // Server configuration for development
  server: {
    port: 3000,
    host: true,
    open: true,
    
    // HMR
    hmr: {
      overlay: true,
    },
    
    // Proxy for API (if needed)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //   },
    // },
  },

  // Preview server (for testing build)
  preview: {
    port: 4173,
    host: true,
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    
    // PostCSS (Tailwind is configured via postcss.config.js)
  },

  // Performance hints
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    
    // Drop console in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
