import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'নিশ্চিত করুন'}>
      <p className="text-ink-muted">{message}</p>
      <div className="flex justify-end gap-3 mt-6">
        <button className="btn-ghost" onClick={onClose}>
          বাতিল
        </button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          হ্যাঁ, নিশ্চিত
        </button>
      </div>
    </Modal>
  );
}
