import { useState } from 'react';
import './Home.scss';

const Home = () => {
  const [screenshot, setScreenshot] = useState(null);
  const [rizzLine, setRizzLine] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationInput, setConversationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [toast, setToast] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(URL.createObjectURL(file));
      setError('');
      getRizz(file);
    }
  };

  const getRizz = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:3000/rizzing', {
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startChat = () => {
    setMessages([{ text: rizzLine, sender: 'user', id: Date.now() }]);
    setShowChat(true);
  };

  const handleConversationChange = (e) => {
    setConversationInput(e.target.value);
    setError('');
  };

  const getReply = async () => {
    if (!conversationInput.trim()) {
      setError('Type something she said first!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: conversationInput }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { text: conversationInput, sender: 'her', id: Date.now() },
          { text: data.reply, sender: 'user', id: Date.now() + 1 },
        ]);
        setConversationInput('');
      } else {
        setError('Failed to get a reply—try again!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div className="home-container">
      {!screenshot ? (
        <div className="upload-screen">
          <h1>Rizz Up Your Game</h1>
          <p>Drop a Hinge/Bumble screenshot to start the chat.</p>
          <div className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              id="screenshot-upload"
            />
            <label htmlFor="screenshot-upload">Choose Screenshot</label>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      ) : !showChat ? (
        <div className="rizz-preview">
          <h1>Your Opening Line</h1>
          {loading ? (
            <p className="loading">Generating...</p>
          ) : (
            <>
              <div className="rizz-line">
                <p>{rizzLine}</p>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(rizzLine)}
                >
                  Copy
                </button>
              </div>
              <button onClick={startChat} className="rizz-button">
                Start Conversation Help
              </button>
            </>
          )}
          {error && <p className="error">{error}</p>}
          {toast && <div className="toast">Copied to clipboard</div>}
        </div>
      ) : (
        <div className="chat-screen">
          <div className="chat-header">
            <h2>Chat Rizz</h2>
            <img src={screenshot} alt="Profile" className="profile-preview" />
          </div>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === 'user' ? 'user-message' : 'her-message'}`}
              >
                <p>{msg.text}</p>
                {msg.sender === 'user' && (
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(msg.text)}
                  >
                    Copy
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <textarea
              value={conversationInput}
              onChange={handleConversationChange}
              placeholder="What did she say?"
              className="conversation-input"
            />
            <button onClick={getReply} disabled={loading} className="reply-button">
              {loading ? 'Thinking...' : 'Get Reply'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          {toast && <div className="toast">Copied to clipboard</div>}
        </div>
      )}
    </div>
  );
};

export default Home;