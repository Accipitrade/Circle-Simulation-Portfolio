import './Circle.css';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

//make the circles cycle rainbow colors through css
//make the circles shoot off in a random direction onclick
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
        backgroundColor:'red'
      }}
    //whileHover={{scale: 2.5}}
    onTapStart={() => onClick(id)}
      
    />
  );
}

export default Circle;