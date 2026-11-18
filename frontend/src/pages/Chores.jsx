import Chorecard from "../components/ChoreCard";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Modal from '../components/Modal'
import './Chores.css';
import { api } from "../lib/api";

function Chores({ userId, room_num}) {
  const navigate = useNavigate();
  const [chores, setChores] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [choreToDelete, setChoreToDelete] = useState(null);

  const handleDeleteChore = (chore) =>{
    setChoreToDelete(chore);
    setIsModalOpen(true);
  }

  const confirmDelete = async() =>{
    if(!choreToDelete) return;
    try{
      const response = await api(`/chores/${choreToDelete.id}`, {
        method: 'DELETE',
      });
        if (response.ok){
            setChores(prev => prev.filter(c => c.id !== choreToDelete.id));
        } 
        else {
          console.error('Failed to delete chore');
        }
      } 
      catch (err) {
        console.error('Error deleting chore:', err);
       } 
      finally {
        setIsModalOpen(false);
        setChoreToDelete(null);
      }
    };

    const handleMarkComplete = async (choreId) => {
        try {
          const response = await api(`/chore/completed/${choreId}`, {
            method: 'PUT',
          });

          if (response.ok) {
            // Update state so the UI shows it as complete
            setChores(prev =>
              prev.map(chore =>
                chore.id === choreId
                  ? { ...chore, is_finished: !chore.is_finished }
                  : chore
              )
            );
          } else {
            console.error('Failed to mark chore complete');
          }
        } catch (err) {
          console.error('Error marking chore complete:', err);
        }
      };

  
  useEffect(() => {
   async function fetchChores() {
      try {
        const response = await api(`/get/chores/${room_num}`);
        const data = await response.json();
        setChores(data);
      } catch (err) {
        console.error("Failed to fetch chores", err);
      }
    }

    fetchChores();

  }, [room_num]);

  let displayedChores = chores;

  if (selectedFilter === "unfinished-chores") {
    displayedChores = [...chores]
      .filter(chore => !chore.is_finished)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  } else if (selectedFilter === "due-date") {
    displayedChores = [...chores].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  } else {
    displayedChores = [...chores]; // no filter
  }
  return (
    <div className="chore-container">
      <div className="chores-header">
        <div>
          <p className="section-kicker">YOUR HOUSE TO-DO LIST</p>
          <h1 className="chore-title">Keep the apartment moving.</h1>
          <p className="section-subtitle">Everyone sees what needs doing. Nobody has to chase the group chat.</p>
        </div>
        <button className="create-chore-btn" onClick={() => navigate("/create-chore", { state: { userId, room_num } })}>+ Add chore</button>
      </div>
      
      <div className="filter-container">
        <span className="fw-bold">Filter by:</span>
      <button
        className={`btn filter-btn ${selectedFilter === "unfinished-chores" ? "active" : ""}`}
        onClick={() =>
          setSelectedFilter(prev =>
            prev === "unfinished-chores" ? null : "unfinished-chores"
          )}
      >
        Unfinished Chores
      </button>

      <button
        className={`btn filter-btn ${selectedFilter === "due-date" ? "active" : ""}`}
        onClick={() => setSelectedFilter(prev => 
          prev === "due-date" ? null : "due-date"
       )}
      >
        Due Date
      </button>

     
      </div>
      <div className="chores-list">
          {
  
        displayedChores.map((chore)=>(
        <Chorecard 
          key={chore.id}
          title={chore.chore_name} 
          dueDate={chore.due_date}
          description={chore.description}
          onDelete={() => handleDeleteChore(chore)}
          onMarkComplete={() => handleMarkComplete(chore.id)}
          isFinished={chore.is_finished}
          onEdit={() => navigate("/edit-chore", { state: { chore, userId } })}

          />
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        >
      </Modal>
    </div>
  )
}

export default Chores
