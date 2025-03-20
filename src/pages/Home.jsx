import { useState } from 'react';
import './Home.scss';

const Home = () => {
  const [screenshot, setScreenshot] = useState(null);
  const [rizzLine, setRizzLine] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(URL.createObjectURL(file)); // Preview image
      setRizzLine(''); // Reset line
      setError('');
    }
  };

  const getRizz = async () => {
    if (!screenshot) {
      setError('Upload a screenshot first, bro!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', document.querySelector('input[type="file"]').files[0]);

    try {
      const res = await fetch('/rizzing', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.line) {
        setRizzLine(data.line);
      } else {
        setError('Something went wrong—try again!');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>Rizz Up Your Game</h1>
      <p>Drop a Hinge/Bumble screenshot, get a killer opening line.</p>

      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        {screenshot && (
          <img src={screenshot} alt="Profile preview" className="preview" />
        )}
      </div>

      <button onClick={getRizz} disabled={loading} className="rizz-button">
        {loading ? 'Generating...' : 'Get My Line'}
      </button>

      {rizzLine && (
        <div className="result">
          <h3>Your Rizz:</h3>
          <p>{rizzLine}</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Home;