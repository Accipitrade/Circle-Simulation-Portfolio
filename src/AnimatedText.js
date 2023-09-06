import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Popup from './Popup'; // Ensure the path is correct

const FadeInChunk = ({ chunk, delay, isLink, onClick, href }) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const content = isLink ? (
    <a onClick={onClick} href={href} target={href ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration: 'underline', cursor: 'pointer' }}>
      {chunk}
    </a>
  ) : chunk;

  return (
    <motion.span
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {content}{' '}
    </motion.span>
  );
};

const AnimatedText = ({isPaused}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const sentences = [
    ['Hey!'],
    ["I'm", 'Josh Slavin'],
    ['Click', {chunk: 'here', isLink: true, onClick: () => {setPopupOpen(true); isPaused.current = true;}}, 'to learn more about me'],
    ['and', {chunk: 'here', isLink: true, href: 'path-to-your-pdf.pdf'}, 'to view my full resume.'],
    ['Or,', 'click a circle to find out more about my projects.'],
    ['This page is a full physics simulation. Have fun!'],
  ];

  let cumulativeDelay = 0;

  return (
    <div className="center-container">
      {sentences.map((chunks, i) => {
        const renderedChunks = chunks.map((chunk, j) => {
          const chunkProps = typeof chunk === 'object' ? chunk : {chunk};
          const chunkDelay = cumulativeDelay;
          cumulativeDelay += 0.83; // Increment delay for next chunk
          return <FadeInChunk key={j} {...chunkProps} delay={chunkDelay} />;
        });

        return (
          <h1 key={i} style={{ userSelect: 'none' }}>
            {renderedChunks}
          </h1>
        );
      })}
      <Popup isOpen={isPopupOpen} setIsOpen={() => { setPopupOpen(false); isPaused.current = false;}}>
        {/* Your image and about me content goes here */}
        <img src="path-to-your-image.jpg" alt="Josh Slavin" />
        <p>About me content...</p>
      </Popup>
    </div>
  );
};

export default AnimatedText;
