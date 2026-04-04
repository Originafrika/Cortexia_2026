import { useState } from 'react';
import { X, Copy, Facebook, Twitter, Linkedin, Mail, Link2, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShareModalProps {
  postId: string;
  postUrl: string;
  onClose: () => void;
}

export function ShareModal({ postId, postUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      icon: Copy,
      label: 'Copy Link',
      onClick: handleCopyLink,
      primary: true
    },
    {
      icon: Twitter,
      label: 'Twitter',
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      icon: Facebook,
      label: 'Facebook',
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: () => {
        window.location.href = `mailto:?subject=Check this out&body=${encodeURIComponent(postUrl)}`;
        onClose();
      }
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Share</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Share Options */}
          <div className="p-6 space-y-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.label}
                  onClick={option.onClick}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl transition-all
                    ${option.primary
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${option.primary ? 'bg-white/20' : 'bg-white'}
                  `}>
                    {option.label === 'Copy Link' && copied ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="font-semibold">
                    {option.label === 'Copy Link' && copied ? 'Copied!' : option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
