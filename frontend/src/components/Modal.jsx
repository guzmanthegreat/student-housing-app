import React from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, onConfirm, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-message">
        <h3> Are you sure you want to delete this chore? </h3>
        </div>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;