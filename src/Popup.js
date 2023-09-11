import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: -3;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: start; /* Align to the top */
  padding-top: 10%;

  z-index: 10;
`;

const PopupContainer = styled(motion.div)`
  background-color: lightblue;
  border-radius: 10px;
  position: relative;
  max-width: 50%;
  max-height: 80%;
  padding: 20px;
  overflow-y: auto;
  
  display: flex;
  flex-direction: column; /* Make it column to prevent stretch */
  text-align: left;
  align-items: start;

  h2, h4 {
    font-family: 'Brandon Grotesque', sans-serif;
    font-size: calc(20px + 2vmin);
  }

  p, li {
    font-family: 'Montserrat', sans-serif;
    font-size: calc(14px + 1vmin);
  }

  @media (max-width: 600px) {
    .image {
      display: none;
    }
    
    h2, p, li {
      text-align: center; /* Center align the text when the image is not displayed. */
    }

  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Popup = ({ isOpen, setIsOpen, children }) => {
  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <PopupContainer onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setIsOpen(false)}>X</CloseButton>
            {children}
          </PopupContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default Popup;

