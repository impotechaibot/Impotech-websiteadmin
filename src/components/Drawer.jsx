import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-surface
        border-l border-line flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-semibold">{title}</h3>
          <button className="text-ink-muted hover:text-ink" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-line flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
