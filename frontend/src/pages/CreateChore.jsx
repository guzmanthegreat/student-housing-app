import './CreateChore.css'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

function CreateChore() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, room_num } = location.state || {};
    const [ errorMessage, setErrorMessage] = useState("");

    const [chore, setChore] = useState({
        chore_name: "",
        description: "",
        user_id: userId || null,
        due_date: "",
        is_finished: false,
        room_num: room_num || ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

    const response = await fetch('http://localhost:3000/chores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
     },
    body: JSON.stringify({ ...chore})
  });

   const data = await response.json();
  if (response.ok) {
        setChore({ chore_name: '', description: '', user_id:'', due_date:'', is_finished: false});
        navigate("/chores");
  } else {
        setErrorMessage('Error: ' + (data.error || 'Unknown error'));
  }
};

    return(
        <div className="text-center text-primary mt-5 create-chore-container">
            
            <h1 className="create-chore-title">Add A New Chore!</h1>
                    <button className="back-button" onClick={()=> navigate('../chores')}>Back to Chores</button>

        <div className="container shadow rounded p-4 input-container"
            style={{
                minHeight: '80vh',
                maxWidth: '600px',
                margin: '20px auto',
            }}
            >


            <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start mt-3 chore-input">
                    <label htmlFor="choreTitle" className="form-label">
                        Chore Title:
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="choreTitle"
                        placeholder="Enter chore name!"
                        value={chore.chore_name}
                        onChange={(e) => setChore({ ...chore, chore_name: e.target.value })}
                        />
                </div>

                <div className="mb-3 text-start chore-input">
                    <label htmlFor="dueDate" className="form-label">
                        Due Date:
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        id="dueDate"
                        value={chore.due_date}
                        onChange={(e) => setChore({ ...chore, due_date: e.target.value })}
                        />
                </div>

                   <div className="mb-3 text-start chore-input">
                    <label htmlFor="description" className="form-label">
                        Description:
                    </label>
                    <textarea
                        className="form-control"
                        id="description"
                        rows="5"
                        placeholder="Enter details about the chore!"
                        value={chore.description}
                        onChange={(e) => setChore({ ...chore, description: e.target.value })}
                        />
                        </div>

                    {errorMessage && (
                    <p className="error-message">
                      {errorMessage}
                    </p>
                  )}

                    <button type="submit" className="btn btn-primary mt-5 submit-chore-btn">
                        Add Chore!
                        </button>
            </form>
        </div>
        </div>
    )
}

export default CreateChore