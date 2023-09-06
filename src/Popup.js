import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Popup({ children, isOpen, setIsOpen }) {
  const closeModal = () => {
    setIsOpen();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            height: '100px',
            width: '100px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            zIndex: '10'
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
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Popup;
