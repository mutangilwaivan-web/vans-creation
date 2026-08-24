import React, { useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { Creation } from '../types';
import { ImmersiveProductSheet } from './ImmersiveProductSheet';

interface CreationDetailModalProps {
  creation?: Creation | null;
  onClose?: () => void;
}

export const CreationDetailModal: React.FC<CreationDetailModalProps> = ({ 
  creation: propCreation, 
  onClose: propOnClose 
}) => {
  const { 
    selectedCreationForDetail, 
    setSelectedCreationForDetail, 
  } = useStudio();

  // Resolve creation from props or StudioContext
  const creation = propCreation || selectedCreationForDetail;

  // Close helper
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setSelectedCreationForDetail(null);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (creation) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [creation]);

  if (!creation) return null;

  return (
    <div 
      id="creation-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        id="creation-detail-modal-container"
        className="bg-[#FAF8F5] w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-3xl shadow-2xl border border-[#EAE3DA] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <ImmersiveProductSheet 
          creation={creation} 
          onClose={handleClose} 
        />
      </div>
    </div>
  );
};
