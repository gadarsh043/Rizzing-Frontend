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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [useCustomApi, setUseCustomApi] = useState(false);

  const correctPassword = 'Z@ak2024!';

  const handlePasswordSubmit = () => {
    if (useCustomApi && customApiKey.trim()) {
      localStorage.setItem('deepseekApiKey', customApiKey);
      setShowPasswordDialog(false);
    } else if (passwordInput === correctPassword) {
      localStorage.removeItem('deepseekApiKey');
      console.log('Using default API key from backend');
      setShowPasswordDialog(false);
    } else {
      setError('Wrong password, bro!');
    }
  };

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
    const apiKey = localStorage.getItem('deepseekApiKey');

    try {
      const res = await fetch('https://rizzing-backend-production.up.railway.app/rizzing', {
        method: 'POST',
        body: formData,
        headers: apiKey ? { 'X-API-Key': apiKey } : {},
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
    const apiKey = localStorage.getItem('deepseekApiKey');

    try {
      const res = await fetch('https://rizzing-backend-production.up.railway.app/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-API-Key': apiKey } : {}),
        },
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
      {showPasswordDialog ? (
        <div className="password-dialog">
          <div className="dialog-content">
            <h2>My room wifi password is?</h2>
            {!useCustomApi ? (
              <>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="password-input"
                />
                <button onClick={handlePasswordSubmit} className="submit-button">
                  Submit
                </button>
                <p className="switch-option" onClick={() => setUseCustomApi(true)}>
                  Use your own API key instead
                </p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Enter your DeepSeek API key"
                  className="password-input"
                />
                <button onClick={handlePasswordSubmit} className="submit-button">
                  Submit
                </button>
                <p className="switch-option" onClick={() => setUseCustomApi(false)}>
                  Use default API key instead
                </p>
                <div className="api-help">
                  <h3>How to Get Your DeepSeek API Key</h3>
                  <ol>
                    <li>Go to <a href="https://platform.deepseek.com/usage" target="_blank" rel="noopener noreferrer">deepseek.com</a>.</li>
                    <li>Sign up or log in with your account.</li>
                    <li>Navigate to the API section in your dashboard.</li>
                    <li>Generate and copy your API key.</li>
                    <li>Paste it here and submit!</li>
                  </ol>
                </div>
              </>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      ) : !screenshot ? (
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