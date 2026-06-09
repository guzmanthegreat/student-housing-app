import './CreateChore.css'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

function EditChore() {
    const navigate = useNavigate();
  const { state } = useLocation();
  const passeduserId = state?.userId;
  const original = state?.chore;

  const [chore, setChore] = useState({
    chore_name: original.chore_name,
    description: original.description,
    user_id: original.user_id || passeduserId,
    due_date: new Date().toISOString().split('T')[0],
    is_finished: original.is_finished,
    room_num: original.room_num
  });

  // store error message for inline display
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

      
    const response = await fetch(
      `http://localhost:3000/chores/${original.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chore),
      }
    );

    const data = await response.json();  

    if (response.ok) {
      navigate("/chores");
    } else {
     setErrorMessage(data.error || "Failed to update chore.");
    }
  };
  

  useEffect(() => {
  console.log("Original chore:", original);
  console.log("Initial state:", chore);
}, []);

    return(
        <div className="text-center text-primary mt-5 create-chore-container">
            <h1 className="create-chore-title">Edit Chore</h1>
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
                      Error: {errorMessage}
                    </p>
                  )}
                    <button type="submit" className="btn btn-primary mt-5 submit-chore-btn">
                        Finish edit chore
                        </button>
            </form>
        </div>
        </div>
    )
}

export default EditChore