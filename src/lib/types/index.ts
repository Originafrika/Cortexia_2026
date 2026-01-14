/**
 * COCONUT V14 - CENTRALIZED TYPE DEFINITIONS
 * Single source of truth for all types
 */

// Re-export from coconut types
export type { 
  Generation,
  GenerationStatus,
  CoconutPrompt,
  ProjectNode,
  NodeStatus,
  NodeType
} from './coconut';

// Re-export from API client
export type {
  DashboardStats,
  UsageAnalytics,
  Transaction,
  UserSettings,
  CreditPackage
} from '../api/client';

// ✅ Re-export from Gemini types
export type {
  GeminiAnalysisRequest,
  GeminiAnalysisResponse,
  FileUpload,
  ReferenceImage,
  ReferenceVideo,
  FluxPromptJSON,
  CreativeConcept,
  ColorPalette,
  CompositionPlan,
  CompositionZone,
  MissingAsset,
  AssetRequirements,
  TechnicalSpecs,
  EstimatedCost,
  Recommendations,
  ReplicateGeminiRequest,
  ReplicateGeminiResponse,
  GeminiAnalysisError,
} from './gemini';

// Re-export Gemini constraints
export { GEMINI_CONSTRAINTS } from './gemini';

// ✅ Re-export from Coconut V14 components
export type { IntentData } from '../components/coconut-v14';

// ============================================
// COCONUT V14 APP TYPES
// ============================================

export type Screen = 
  | 'dashboard' 
  | 'cocoboard' 
  | 'credits' 
  | 'settings' 
  | 'history' 
  | 'profile';

export type NavigationItem = {
  id: Screen;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

// ============================================
// UI COMPONENT TYPES
// ============================================

export type GlassVariant = 'default' | 'gradient' | 'bordered';
export type GlassBlur = 'ultra' | 'heavy' | 'medium' | 'light';
export type GlassGlowColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

// ============================================
// ANIMATION TYPES
// ============================================

export type MotionVariant = {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
};

export type TransitionConfig = {
  duration: number;
  ease: number[] | string;
  delay?: number;
};

export type SpringConfig = {
  type: 'spring';
  bounce?: number;
  damping?: number;
  stiffness?: number;
  duration?: number;
};

// ============================================
// FORM TYPES
// ============================================

export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
};

export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

// ============================================
// DATA TABLE TYPES
// ============================================

export type SortDirection = 'asc' | 'desc' | null;

export type TableColumn<T> = {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
};

// ============================================
// CHART TYPES
// ============================================

export type ChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

export type SparklineData = number[];

// ============================================
// CREDIT TYPES
// ============================================

export type Credits = {
  free: number;
  paid: number;
  total: number;
};

export type CreditTransaction = {
  id: string;
  type: 'purchase' | 'usage' | 'bonus';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
};

// ============================================
// USER TYPES
// ============================================

export type User = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
  createdAt: Date;
  settings: UserSettings;
};

export type UserProfile = {
  user: User;
  stats: {
    totalGenerations: number;
    totalLikes: number;
    totalFollowers: number;
    totalFollowing: number;
  };
  posts: Post[];
};

export type Post = {
  id: string;
  username: string;
  verified: boolean;
  caption: string;
  mediaUrl: string;
  likes: string;
  comments: string;
  remixes: string;
  avatarUrl: string;
  liked: boolean;
  following?: boolean;
  remixVariants?: string[];
  currentVariant: number;
};

// ============================================
// ERROR TYPES
// ============================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AppError = {
  code: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  stack?: string;
};

// ============================================
// SETTINGS TYPES
// ============================================

export type Theme = 'light' | 'dark' | 'coconut';
export type Language = 'en' | 'fr' | 'es' | 'de';
export type Timezone = 'utc' | 'est' | 'pst' | 'cet';

// ============================================
// FILTER TYPES
// ============================================

export type FilterStatus = 'all' | 'complete' | 'processing' | 'error' | 'favorites';
export type DateRange = 'all' | 'today' | 'week' | 'month';
export type SortBy = 'date' | 'cost' | 'duration';

// ============================================
// MODAL TYPES
// ============================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: NotificationVariant;
};

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type VoidFunction = () => void;