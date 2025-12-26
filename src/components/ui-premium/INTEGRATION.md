# 🎨 UI Premium - Integration Guide

This guide shows how to integrate all premium UI components into Coconut V3.

## 📦 Setup

### 1. Wrap your app with UIProvider

```tsx
// App.tsx
import { UIProvider } from '@/components/ui-premium';

function App() {
  return (
    <UIProvider toastPosition="top-right">
      <YourApp />
    </UIProvider>
  );
}
```

## 🎯 Usage Examples

### Notifications

```tsx
import { useNotifications } from '@/components/ui-premium';

function MyComponent() {
  const notifications = useNotifications();

  const handleGenerate = async () => {
    try {
      notifications.info('Generating...', 'Please wait');
      const result = await generateAsset();
      notifications.success('Success!', 'Asset generated');
    } catch (error) {
      notifications.error('Error', error.message);
    }
  };
}
```

### Confirm Dialogs

```tsx
import { useConfirm } from '@/components/ui-premium';

function MyComponent() {
  const confirm = useConfirm();

  const handleDelete = async (nodeId: string) => {
    confirm.danger(
      'Delete Node',
      'Are you sure? This cannot be undone.',
      async () => {
        await deleteNode(nodeId);
      }
    );
  };
}
```

### Context Menus

```tsx
import { NodeContextMenu } from '@/components/coconut-v3/canvas/NodeContextMenu';

function NodeComponent({ node }) {
  return (
    <NodeContextMenu
      node={node}
      onGenerate={handleGenerate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    >
      <NodeCard {...node} />
    </NodeContextMenu>
  );
}
```

### Modals

```tsx
import { Modal, ModalFooter, Button } from '@/components/ui-premium';

function EditModal({ isOpen, onClose, node }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Node"
      size="lg"
      footer={
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </ModalFooter>
      }
    >
      <YourForm />
    </Modal>
  );
}
```

### Animations

```tsx
import { 
  HoverScale, 
  HoverGlow, 
  ParticleEffect,
  AnimatedTransition 
} from '@/components/ui-premium';

function AnimatedNode({ node }) {
  const [showParticles, setShowParticles] = useState(false);

  return (
    <HoverScale scale={1.05}>
      <HoverGlow color="rgba(99, 102, 241, 0.4)">
        <div className="relative">
          {showParticles && (
            <ParticleEffect
              type="confetti"
              count={20}
              trigger={true}
            />
          )}
          <NodeCard {...node} />
        </div>
      </HoverGlow>
    </HoverScale>
  );
}
```

### Loading States

```tsx
import { LoadingSpinner, Progress } from '@/components/ui-premium';

function GeneratingOverlay({ progress }) {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-center h-full">
        <div className="space-y-4">
          <LoadingSpinner 
            variant="orbit" 
            size="lg" 
            text="Generating..."
          />
          {progress !== undefined && (
            <Progress 
              value={progress} 
              variant="linear"
              color="primary"
              gradient
              showLabel
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Stagger Animations

```tsx
import { StaggerContainer, StaggerItem } from '@/components/ui-premium';

function NodeList({ nodes }) {
  return (
    <StaggerContainer staggerDelay={0.1}>
      {nodes.map((node) => (
        <StaggerItem key={node.id}>
          <NodeCard {...node} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

## 🎨 Complete Integration Example

```tsx
// CoconutCanvas.tsx
import { UIProvider, useNotifications, useConfirm } from '@/components/ui-premium';
import { NodeContextMenu } from '@/components/coconut-v3/canvas/NodeContextMenu';
import { NodeEditModal } from '@/components/coconut-v3/modals/NodeEditModal';
import { CanvasLoading } from '@/components/coconut-v3/canvas/CanvasLoading';

function CoconutCanvas() {
  const notifications = useNotifications();
  const confirm = useConfirm();
  const [isLoading, setIsLoading] = useState(false);
  const [editingNode, setEditingNode] = useState(null);

  const handleGenerate = async (nodeId: string) => {
    try {
      notifications.info('Generating...', 'Please wait');
      setIsLoading(true);
      
      await generateNode(nodeId);
      
      notifications.success('Success!', 'Asset generated');
    } catch (error) {
      notifications.error('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (nodeId: string) => {
    confirm.danger(
      'Delete Node',
      'Are you sure? This cannot be undone.',
      async () => {
        await deleteNode(nodeId);
        notifications.success('Deleted', 'Node deleted successfully');
      }
    );
  };

  return (
    <>
      <CanvasLoading isLoading={isLoading} />
      
      <ReactFlow nodes={nodes} edges={edges}>
        {/* Canvas content */}
      </ReactFlow>

      <NodeEditModal
        isOpen={!!editingNode}
        onClose={() => setEditingNode(null)}
        node={editingNode}
        onSave={handleSave}
      />
    </>
  );
}

// Wrap with UIProvider in App.tsx
function App() {
  return (
    <UIProvider>
      <CoconutCanvas />
    </UIProvider>
  );
}
```

## 🚀 Best Practices

1. **Always wrap with UIProvider** at the root of your app
2. **Use hooks** instead of importing components directly when possible
3. **Centralize notifications** using the notification hook
4. **Confirm destructive actions** using the confirm hook
5. **Add animations** to enhance UX but don't overdo it
6. **Show loading states** for async operations
7. **Use context menus** for secondary actions
8. **Keep modals focused** on a single task

## 📚 Available Hooks

- `useUI()` - Access all managers
- `useNotifications()` - Toast notifications
- `useConfirm()` - Confirmation dialogs
- `useToastContext()` - Raw toast manager
- `useConfirmContext()` - Raw confirm manager
- `useAlertContext()` - Raw alert manager

## 🎯 Component Checklist

- [x] UIProvider setup
- [x] Context menus on nodes
- [x] Edit modals
- [x] Confirm dialogs for destructive actions
- [x] Toast notifications for all operations
- [x] Loading states and progress bars
- [x] Particle effects for generation
- [x] Hover animations
- [x] Stagger animations for lists
