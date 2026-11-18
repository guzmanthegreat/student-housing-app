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
    <article className={`card choreCard ${checked ? "is-finished" : ""}`}>
      <div className="card-body" >
        <h5 className="card-title">{title}</h5>
        <p className="card-due-date">Due {formattedDueDate}</p>
        <p className="card-text">{description || "No details added yet."}</p>
      </div>

       <button className="checkbox" onClick={handleCheckboxClick} aria-label={checked ? "Mark chore incomplete" : "Mark chore complete"}>
        {checked && (
          <img
            src={kiss}
            alt="checked"
            className="checkbox-img"
          />
        )}
      </button>
      <button className="delete-btn" onClick={onDelete} aria-label="Delete chore">
        <img src={bin} alt="delete" />
      </button>

      <button className="edit-btn" onClick={onEdit} aria-label="Edit chore">
        <img src={pencil} alt="edit" />
      </button>

    </article>
  );
}
