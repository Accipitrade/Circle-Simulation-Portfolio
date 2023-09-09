import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Popup({ children, isOpen, setIsOpen }) {
  const closeModal = () => {
    setIsOpen(false); // Ensure that the modal is closed when this is called
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#87a9b2',
            maxWidth: '90%',  
            maxHeight: '90%', 
            zIndex: '10',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto', // for content that might exceed the max sizes
            borderRadius: '0%'
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              cursor: 'pointer'
            }}
            onClick={closeModal}
          >
            X
          </div>
          <div style={{ padding: '20px', textAlign: 'left' }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Popup;
