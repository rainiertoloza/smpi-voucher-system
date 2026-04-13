'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${type}`}>
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`btn-confirm ${type}`}>
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease-out;
          /* iOS fixes */
          -webkit-overflow-scrolling: touch;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h2 {
          margin: 0;
          color: white;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-header.danger h2::before {
          content: '⚠️';
        }

        .modal-header.warning h2::before {
          content: '⚠️';
        }

        .modal-header.info h2::before {
          content: 'ℹ️';
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-body p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1.6;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-cancel,
        .btn-confirm {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          /* Better touch targets */
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          -webkit-user-select: none;
          user-select: none;
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-confirm {
          color: white;
        }

        .btn-confirm.danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .btn-confirm.danger:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }

        /* Active state for mobile */
        .btn-confirm.danger:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);
        }

        .btn-confirm.warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .btn-confirm.warning:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        }

        .btn-confirm.warning:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
        }

        .btn-confirm.info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .btn-confirm.info:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }

        .btn-confirm.info:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 1rem;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-confirm {
            width: 100%;
            padding: 1rem;
          }
        }

        /* iOS Safari specific */
        @supports (-webkit-touch-callout: none) {
          .modal-content {
            margin-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
}
