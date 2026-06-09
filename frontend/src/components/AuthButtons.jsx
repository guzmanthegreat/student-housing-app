import { useState } from 'react';
export default function AuthButtons() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    // Placeholder for your login logic
    // e.g. send data to your backend: fetch('/api/login', { method: 'POST', ... })
    console.log('Logging in with:', username, password);

   // TEMP: just mock a login check
    if (!username || !password) {
      setError('Please fill in both fields');
    } else {
      alert(`Welcome, ${username}!`);
    }
  };

  return (
   <form
      onSubmit={handleLogin}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '250px',
        margin: '0 auto',
      }}
    >
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#ff69b4',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Log In
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
