window.vertexInit = function (config = {}) {
  const token = config.token || "";
  // Create the shadow host
  const host = document.createElement("div");
  host.id = "vertex-ai-assistant";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles
  const styles = document.createElement("style");
  styles.textContent = `
.vertex-widget-root {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 10000;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Floating Action Button (FAB) */
.vertex-trigger {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #1a1a1a; /* Professional dark theme */
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.vertex-trigger:hover {
  transform: scale(1.05);
}

/* Chat Window */
.vertex-window {
  display: none;
  flex-direction: column;
  width: 350px;
  height: 450px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 70px;
  right: 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.vertex-window.active {
  display: flex;
}

.vertex-header {
  background: #1a1a1a;
  color: white;
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
}

.vertex-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  background: #f9fafb;
}

.msg {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 80%;
}
.msg-user {
  background: #e5e7eb;
  align-self: flex-end;
  margin-left: auto;
}
.msg-ai {
  background: #1a1a1a;
  color: white;
  align-self: flex-start;
}

.vertex-input-area {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.vertex-input-area input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 12px;
  outline: none;
}`;
  shadow.appendChild(styles);

  // Create the HTML structure
  const root = document.createElement("div");
  root.className = "vertex-widget-root";
  root.innerHTML = `
        <div class="vertex-window" id="window">
            <div class="vertex-header">Vertex AI Assistant</div>
            <div class="vertex-messages" id="messages">
                <div class="msg msg-ai">Hi! I'm Vertex. Ask me anything about this portfolio!</div>
            </div>
            <div class="vertex-input-area">
                <input type="text" id="input" placeholder="Type a message...">
            </div>
        </div>
        <button class="vertex-trigger" id="trigger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
        </button>
    `;
  shadow.appendChild(root);

  // Elements
  const trigger = shadow.getElementById("trigger");
  const window = shadow.getElementById("window");
  const input = shadow.getElementById("input");
  const messages = shadow.getElementById("messages");

  // Toggle Chat
  trigger.onclick = () => window.classList.toggle("active");

  // Handle Messages
  input.onkeydown = async (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const text = input.value;
      addMessage("user", text);
      input.value = "";

      try {
        // Change URL to your deployed Python API
        const response = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, token: token }),
        });
        const data = await response.json();
        addMessage("ai", data.response);
      } catch (err) {
        addMessage(
          "ai",
          "I'm having trouble connecting to my brain. Is the backend running?",
        );
      }
    }
  };

  function addMessage(type, text) {
    const div = document.createElement("div");
    div.className = `msg msg-${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
};
