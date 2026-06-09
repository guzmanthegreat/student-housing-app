import Chorecard from "../components/ChoreCard";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Modal from '../components/Modal'
import './Chores.css';

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
      const response = await fetch(`http://localhost:3000/chores/${choreToDelete.id}`, {
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
          const response = await fetch(`http://localhost:3000/chore/completed/${choreId}`, {
            method: 'PUT',
          });

          if (response.ok) {
            // Update state so the UI shows it as complete
            setChores(prev =>
              prev.map(chore =>
                chore.id === choreId ? { ...chore, is_finished: true } : chore
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
        const response = await fetch(`http://localhost:3000/get/chores/${room_num}`);
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
    <div className="chore-container mt- main-container">
       <button className="create-chore-btn" onClick={() => navigate("/create-chore", { state: { userId, room_num } })}> Add a new <br/>chore! </button>
      <h1 className="text-center mt-4 fs-1 mb-5 chore-title">Your Chore List</h1>
      
      <div className="mb-4 d-flex flex-row align-items-center gap-4 justify-content-center mx-auto mt-4 mb-5 filter-container" style={{ maxWidth: '700px' }}>
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
       <div>

      <div className="d-flex flex-column align-items-center gap-5">
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