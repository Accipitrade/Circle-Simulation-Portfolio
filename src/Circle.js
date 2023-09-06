import './Circle.css';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function Circle({ id, radius, pos, onClick }) {
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
      }}
    onTapStart={() => {onClick(id);}}
    />
  );
}

export default Circle;