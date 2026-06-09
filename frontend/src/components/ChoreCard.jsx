import React from 'react';
import './ChoreCard.css'
import bin from '../assets/bin.png'
import kiss from '../assets/kiss.png'
import pencil from '../assets/pencil.png'
import { useState } from 'react'

export default function ChoreCard({ title, dueDate, description, onDelete, onMarkComplete, isFinished, onEdit, user_id, room_num}) {
  const [checked, setChecked] = useState(isFinished || false);
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'short', 
    year: 'numeric', 
    month: 'short',  
    day: 'numeric'   
});


  const handleCheckboxClick = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onMarkComplete(newChecked);
  };

  return (
    <div
      className="card shadow rounded choreCard"  
      style={{ width: '42rem', height:'21rem' }}
    >
      <div className="card-body" >
        <h5 className="card-title">{title}</h5>
        <h4 className="card-due-date">Due: {formattedDueDate}</h4>
        <p className="card-text">{description}</p>
      </div>

       <button className="checkbox" style={{ padding: '1rem' }} onClick={handleCheckboxClick}>
        {checked && (
          <img
            src={kiss}
            alt="checked"
            className="checkbox-img"
          />
        )}
      </button>
      <button className="delete-btn" style={{padding:'1rem'}} onClick={onDelete}>
        <img src={bin} alt="delete" />
      </button>

      <button className="edit-btn" style={{padding:'1rem'}} onClick={onEdit}>
        <img src={pencil} alt="edit" />
      </button>

    </div>
  );
}