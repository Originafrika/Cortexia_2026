import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScrollToTopProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToTop({ show, onClick }: ScrollToTopProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={onClick}
          className="fixed bottom-24 sm:bottom-6 right-6 z-50 p-4 rounded-full bg-[#6366f1] hover:bg-[#5558e3] text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}