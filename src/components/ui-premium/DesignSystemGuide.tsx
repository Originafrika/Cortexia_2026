/**
 * DESIGN SYSTEM GUIDE - Interactive documentation
 * 
 * Showcases all UI components and design tokens
 */

import { useState } from 'react';
import { 
  Button, IconButton, Badge, StatusBadge, Card, CardHeader, CardTitle, CardDescription, 
  Input, Textarea, Tooltip, Dropdown, DropdownButton 
} from './index';
import { 
  Sparkles, Download, Settings, Trash2, Edit, Copy, Plus, Search, 
  AlertCircle, CheckCircle, Info, X 
} from 'lucide-react';

export function DesignSystemGuide() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Coconut Design System
          </h1>
          <p className="text-gray-400 text-lg">
            Premium UI components for production-ready applications
          </p>
        </div>

        {/* Buttons */}
        <Section title="Buttons" description="Interactive buttons with multiple variants and states">
          <div className="space-y-6">
            {/* Variants */}
            <SubSection title="Variants">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </SubSection>

            {/* Sizes */}
            <SubSection title="Sizes">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </SubSection>

            {/* With Icons */}
            <SubSection title="With Icons">
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<Sparkles />}>Generate</Button>
                <Button rightIcon={<Download />}>Download</Button>
                <IconButton><Settings /></IconButton>
                <Button isLoading>Loading...</Button>
              </div>
            </SubSection>

            {/* States */}
            <SubSection title="States">
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button glass>Glass Effect</Button>
                <Button fullWidth>Full Width</Button>
              </div>
            </SubSection>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges" description="Status indicators and labels">
          <div className="space-y-6">
            {/* Variants */}
            <SubSection title="Variants">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="purple">Purple</Badge>
              </div>
            </SubSection>

            {/* With Dots */}
            <SubSection title="With Dots">
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" dot>Online</Badge>
                <Badge variant="warning" dot>Pending</Badge>
                <Badge variant="error" dot>Offline</Badge>
              </div>
            </SubSection>

            {/* With Icons */}
            <SubSection title="With Icons">
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" icon={<CheckCircle />}>Completed</Badge>
                <Badge variant="warning" icon={<AlertCircle />}>Warning</Badge>
                <Badge variant="info" icon={<Info />}>Information</Badge>
              </div>
            </SubSection>

            {/* Status Badges */}
            <SubSection title="Status Badges">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="placeholder" />
                <StatusBadge status="ready" />
                <StatusBadge status="generating" />
                <StatusBadge status="generated" />
                <StatusBadge status="validated" />
                <StatusBadge status="error" />
              </div>
            </SubSection>

            {/* Removable */}
            <SubSection title="Removable">
              <div className="flex flex-wrap gap-2">
                <Badge variant="info" onRemove={() => alert('Removed!')}>
                  Removable Badge
                </Badge>
              </div>
            </SubSection>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards" description="Container components with glassmorphism">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Basic Card */}
            <Card>
              <CardHeader className="mb-4">
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>Simple card with content</CardDescription>
              </CardHeader>
              <p className="text-gray-400 text-sm">
                This is a basic card with default styling and glassmorphism effect.
              </p>
            </Card>

            {/* Interactive Card */}
            <Card interactive hover>
              <CardHeader className="mb-4">
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover and click me!</CardDescription>
              </CardHeader>
              <p className="text-gray-400 text-sm">
                This card has hover effects and can be clicked.
              </p>
            </Card>

            {/* Card with Header/Footer */}
            <Card
              header={
                <CardHeader>
                  <CardTitle>Advanced Card</CardTitle>
                  <IconButton><Settings /></IconButton>
                </CardHeader>
              }
              footer={
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Cancel</Button>
                  <Button size="sm" variant="primary">Save</Button>
                </div>
              }
            >
              <p className="text-gray-400 text-sm">
                Card with custom header and footer sections.
              </p>
            </Card>

            {/* Card Variations */}
            <Card padding="lg" elevation="lg">
              <CardHeader className="mb-4">
                <CardTitle>Large Padding & Elevation</CardTitle>
              </CardHeader>
              <p className="text-gray-400 text-sm">
                Custom padding and shadow elevation.
              </p>
            </Card>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs" description="Form inputs with validation and icons">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Input */}
            <Input
              label="Basic Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="This is a helper text"
            />

            {/* With Left Icon */}
            <Input
              label="With Icon"
              placeholder="Search..."
              leftIcon={<Search />}
            />

            {/* With Error */}
            <Input
              label="With Error"
              placeholder="Enter email..."
              error="This field is required"
            />

            {/* Textarea */}
            <Textarea
              label="Textarea"
              placeholder="Enter description..."
              rows={4}
              helperText="Maximum 500 characters"
            />
          </div>
        </Section>

        {/* Tooltips */}
        <Section title="Tooltips" description="Contextual information on hover">
          <div className="flex flex-wrap gap-6">
            <Tooltip content="Top tooltip" position="top">
              <Button>Hover me (top)</Button>
            </Tooltip>

            <Tooltip content="Bottom tooltip" position="bottom">
              <Button>Hover me (bottom)</Button>
            </Tooltip>

            <Tooltip content="Left tooltip" position="left">
              <Button>Hover me (left)</Button>
            </Tooltip>

            <Tooltip content="Right tooltip" position="right">
              <Button>Hover me (right)</Button>
            </Tooltip>
          </div>
        </Section>

        {/* Dropdowns */}
        <Section title="Dropdowns" description="Menu components with actions">
          <div className="flex flex-wrap gap-4">
            <Dropdown
              trigger={
                <Button variant="ghost" rightIcon={<Settings />}>
                  Options
                </Button>
              }
              items={[
                { label: 'Edit', icon: <Edit />, onClick: () => alert('Edit') },
                { label: 'Copy', icon: <Copy />, onClick: () => alert('Copy') },
                { type: 'divider' },
                { label: 'Delete', icon: <Trash2 />, onClick: () => alert('Delete'), danger: true },
              ]}
            />

            <DropdownButton
              label="Actions"
              icon={<Plus />}
              items={[
                { label: 'New Project', onClick: () => alert('New Project') },
                { label: 'New Folder', onClick: () => alert('New Folder') },
                { type: 'divider' },
                { label: 'Import', onClick: () => alert('Import') },
              ]}
            />
          </div>
        </Section>

        {/* Design Tokens */}
        <Section title="Design Tokens" description="Colors, spacing, and typography">
          <div className="space-y-6">
            {/* Colors */}
            <SubSection title="Accent Colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch color="var(--coconut-accent-primary)" label="Primary" />
                <ColorSwatch color="var(--coconut-accent-success)" label="Success" />
                <ColorSwatch color="var(--coconut-accent-warning)" label="Warning" />
                <ColorSwatch color="var(--coconut-accent-error)" label="Error" />
              </div>
            </SubSection>

            {/* Shadows */}
            <SubSection title="Shadows">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ShadowSwatch level="sm" />
                <ShadowSwatch level="md" />
                <ShadowSwatch level="lg" />
                <ShadowSwatch level="xl" />
              </div>
            </SubSection>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>
      <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="space-y-2">
      <div 
        className="h-16 rounded-lg border border-gray-700" 
        style={{ backgroundColor: color }}
      />
      <p className="text-sm text-gray-400 text-center">{label}</p>
    </div>
  );
}

function ShadowSwatch({ level }: { level: 'sm' | 'md' | 'lg' | 'xl' }) {
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <div className="space-y-2">
      <div className={`h-16 bg-gray-700 rounded-lg ${shadows[level]}`} />
      <p className="text-sm text-gray-400 text-center">{level.toUpperCase()}</p>
    </div>
  );
}
