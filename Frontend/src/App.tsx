import './App.css';
import UserMainPage from './UserPages/UserMainPage';

function App() {
  const mode = import.meta.env.MODE;
  const isDev = import.meta.env.DEV;

  return (
    <div className="app-container">
      {isDev && (
        <div style={{ background: '#ff4444', color: 'white', padding: '5px', textAlign: 'center' }}>
          Running in {mode} mode
        </div>
      )}

      <UserMainPage />
    </div>
  );
}

export default App;