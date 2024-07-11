import './Circle.css';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function Circle({ id, radius, pos, onClick, image }) {
  const [position, setPosition] = useState({x: pos.x, y: pos.y});  

  useEffect(()=>{
    setPosition({x: pos.x, y: pos.y});
  }, [pos])  
  
  return (
    <motion.div className={`circle${id}`}
      style={{ 
        position: 'absolute',
        transform: `translate(-50%, -50%)`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${2*radius}px`,
        height: `${2*radius}px`,
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Centering the child img element
        overflow: 'hidden', // Ensuring that the circular shape is maintained
        willChange: 'transform',
      }}
    onTapStart={() => {onClick(id);}}
    >
      <img src={image} alt="" draggable="false" style={{ borderRadius: '100%', width: '80%', height: '80%', objectFit: 'contain'}} />
    </motion.div>
  );
}

export default Circle;
