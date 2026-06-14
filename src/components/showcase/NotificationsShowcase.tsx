/**
 * COCONUT V14 - PHASE 4 JOUR 4
 * Notifications Showcase
 * 
 * Démo interactive du système de notifications complet
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNotify } from '../coconut-v14/NotificationProvider';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { GlassInput } from '../ui/glass-input';
import { GlassTextarea } from '../ui/glass-textarea';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '../ui-premium/AnimatedWrapper';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Volume2,
  VolumeX,
  Sparkles,
  Trash2,
  Save,
  Send,
  Download,
} from 'lucide-react';
import { setSoundsEnabled, areSoundsEnabled } from '../../lib/utils/notification-sounds';

export function NotificationsShowcase() {
  const notify = useNotify();
  const [soundsOn, setSoundsOn] = useState(areSoundsEnabled());
  const [customTitle, setCustomTitle] = useState('Custom Notification');
  const [customMessage, setCustomMessage] = useState('This is a custom notification message');
  
  const toggleSounds = () => {
    const newState = !soundsOn;
    setSoundsOn(newState);
    setSoundsEnabled(newState);
    notify.info('Sounds ' + (newState ? 'enabled' : 'disabled'));
  };
  
  // ============================================
  // DEMO FUNCTIONS
  // ============================================
  
  const handleDelete = async () => {
    const confirmed = await notify.confirm({
      title: 'Delete Project?',
      message: 'This action cannot be undone. All project data will be permanently deleted.',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    
    if (confirmed) {
      notify.success('Project deleted', 'The project has been permanently removed');
    }
  };
  
  const handleSave = async () => {
    const confirmed = await notify.confirm({
      title: 'Save Changes?',
      message: 'Do you want to save your changes before leaving?',
      variant: 'success',
      confirmText: 'Save',
      cancelText: 'Discard',
    });
    
    if (confirmed) {
      notify.success('Changes saved', 'Your changes have been saved successfully');
    } else {
      notify.warning('Changes discarded');
    }
  };
  
  const handleExport = async () => {
    notify.info('Exporting...', 'Preparing your export file', {
      duration: 2000,
    });
    
    setTimeout(() => {
      notify.success('Export complete', 'Your file is ready to download', {
        action: {
          label: 'Download',
          onClick: () => {
            notify.quickSuccess('Download started');
          },
        },
      });
    }, 2000);
  };
  
  const handleError = () => {
    notify.error('Connection Error', 'Failed to connect to the server. Please try again.', {
      duration: 7000,
      action: {
        label: 'Retry',
        onClick: () => {
          notify.info('Retrying connection...');
        },
      },
    });
  };
  
  const handleMultiple = () => {
    notify.info('Step 1 of 3', 'Analyzing your input...', { duration: 2000 });
    
    setTimeout(() => {
      notify.info('Step 2 of 3', 'Processing data...', { duration: 2000 });
    }, 500);
    
    setTimeout(() => {
      notify.info('Step 3 of 3', 'Finalizing...', { duration: 2000 });
    }, 1000);
    
    setTimeout(() => {
      notify.success('Process Complete!', 'All steps completed successfully');
    }, 3500);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 text-purple-400"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell className="w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white">
            Notifications System
          </h1>
          <p className="text-xl text-slate-300">
            Coconut V14 - Phase 4 Jour 4 - Complete Feedback System
          </p>
          
          {/* Sound Toggle */}
          <div className="flex justify-center">
            <GlassButton
              variant={soundsOn ? 'primary' : 'secondary'}
              icon={soundsOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              onClick={toggleSounds}
            >
              Sounds {soundsOn ? 'On' : 'Off'}
            </GlassButton>
          </div>
        </div>
        
        <AnimatedStaggerContainer>
          
          {/* Basic Notifications */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                Basic Notifications
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassButton
                  variant="primary"
                  icon={<CheckCircle className="w-5 h-5" />}
                  onClick={() => notify.success('Success!', 'Operation completed successfully')}
                >
                  Success
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  icon={<AlertCircle className="w-5 h-5" />}
                  onClick={() => notify.error('Error!', 'Something went wrong')}
                >
                  Error
                </GlassButton>
                
                <GlassButton
                  variant="accent"
                  icon={<AlertTriangle className="w-5 h-5" />}
                  onClick={() => notify.warning('Warning!', 'Please review this action')}
                >
                  Warning
                </GlassButton>
                
                <GlassButton
                  variant="ghost"
                  icon={<Info className="w-5 h-5" />}
                  onClick={() => notify.info('Information', 'Here is some useful information')}
                >
                  Info
                </GlassButton>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Notifications (Shorter Duration)</h3>
                <div className="flex gap-3 flex-wrap">
                  <GlassButton
                    size="sm"
                    variant="primary"
                    onClick={() => notify.quickSuccess('Saved!')}
                  >
                    Quick Success
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="secondary"
                    onClick={() => notify.quickError('Failed!')}
                  >
                    Quick Error
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="accent"
                    onClick={() => notify.quickWarning('Careful!')}
                  >
                    Quick Warning
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => notify.quickInfo('FYI')}
                  >
                    Quick Info
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>
          
          {/* Confirm Dialogs */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white">Confirm Dialogs</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassButton
                  variant="primary"
                  icon={<Save className="w-5 h-5" />}
                  onClick={handleSave}
                >
                  Save Changes
                </GlassButton>
                
                <GlassButton
                  variant="destructive"
                  icon={<Trash2 className="w-5 h-5" />}
                  onClick={handleDelete}
                >
                  Delete Project
                </GlassButton>
                
                <GlassButton
                  variant="accent"
                  icon={<Send className="w-5 h-5" />}
                  onClick={async () => {
                    const confirmed = await notify.confirm({
                      title: 'Send Message?',
                      message: 'Are you sure you want to send this message?',
                      variant: 'info',
                      confirmText: 'Send',
                    });
                    if (confirmed) {
                      notify.success('Message sent!');
                    }
                  }}
                >
                  Send Message
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  icon={<Download className="w-5 h-5" />}
                  onClick={async () => {
                    const confirmed = await notify.confirm({
                      title: 'Download File?',
                      message: 'This file is 250MB. Download now?',
                      variant: 'warning',
                      confirmText: 'Download',
                    });
                    if (confirmed) {
                      notify.info('Downloading...');
                    }
                  }}
                >
                  Download
                </GlassButton>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>
          
          {/* Advanced Features */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white">Advanced Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassButton
                  variant="primary"
                  onClick={handleExport}
                  fullWidth
                >
                  Notification with Action
                </GlassButton>
                
                <GlassButton
                  variant="secondary"
                  onClick={handleError}
                  fullWidth
                >
                  Error with Retry
                </GlassButton>
                
                <GlassButton
                  variant="accent"
                  onClick={handleMultiple}
                  fullWidth
                >
                  Multiple Sequential
                </GlassButton>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>
          
          {/* Custom Notification */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white">Custom Notification</h2>
              
              <div className="space-y-4">
                <GlassInput
                  label="Title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  fullWidth
                />
                
                <GlassTextarea
                  label="Message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  fullWidth
                  rows={3}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <GlassButton
                    variant="primary"
                    onClick={() => notify.success(customTitle, customMessage)}
                    fullWidth
                  >
                    Success
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    onClick={() => notify.error(customTitle, customMessage)}
                    fullWidth
                  >
                    Error
                  </GlassButton>
                  <GlassButton
                    variant="accent"
                    onClick={() => notify.warning(customTitle, customMessage)}
                    fullWidth
                  >
                    Warning
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    onClick={() => notify.info(customTitle, customMessage)}
                    fullWidth
                  >
                    Info
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </AnimatedStaggerItem>
          
          {/* Features List */}
          <AnimatedStaggerItem>
            <GlassCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6">System Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ 4 variants (success, error, warning, info)</li>
                    <li>✓ Auto-dismiss with progress bar</li>
                    <li>✓ Action buttons</li>
                    <li>✓ Custom duration</li>
                    <li>✓ Stack management</li>
                    <li>✓ Quick methods</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Confirm Dialogs</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ 5 variants</li>
                    <li>✓ Async/Promise based</li>
                    <li>✓ Custom buttons text</li>
                    <li>✓ Keyboard shortcuts</li>
                    <li>✓ Loading states</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Animations</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Spring animations</li>
                    <li>✓ Smooth transitions</li>
                    <li>✓ Stagger effects</li>
                    <li>✓ Exit animations</li>
                    <li>✓ GPU accelerated</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Sound Feedback</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Web Audio API</li>
                    <li>✓ Generated sounds</li>
                    <li>✓ Toggle on/off</li>
                    <li>✓ No external files</li>
                    <li>✓ Variant-specific</li>
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

export default NotificationsShowcase;
