window.vertexInit = function (config = {}) {
  const token = config.token || "";
  // Create the shadow host
  const host = document.createElement("div");
  host.id = "vertex-ai-assistant";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles from external file
  const styles = document.createElement("link");
  styles.rel = "stylesheet";
  styles.href = config.cssPath || "styles.css";
  shadow.appendChild(styles);

  // Inject Material Symbols if not present
  if (!document.querySelector('link[href*="Material+Symbols"]')) {
    const symbolLink = document.createElement("link");
    symbolLink.rel = "stylesheet";
    symbolLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=send,chat,close";
    document.head.appendChild(symbolLink);
  }

  // Create the HTML structure
  const root = document.createElement("div");
  const theme = config.theme || "light";
  const accentColor = config.accentColor || "#3b82f6"; // Default blue
  root.className = `vertex-widget-root theme-${theme}`;
  root.style.setProperty("--vertex-accent", accentColor);
  root.innerHTML = `
        <div class="vertex-window" id="window">
            <div class="vertex-header">Vertex AI Assistant</div>
            <div class="vertex-messages" id="messages">
                <div class="msg msg-ai">Hi! I'm Vertex. Ask me anything about this portfolio!</div>
            </div>
            <div class="vertex-input-area">
                <input type="text" id="input" placeholder="Ask about me">
                <button id="send-btn" class="vertex-send-btn">
                   <span class="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
        <button class="vertex-trigger" id="trigger">
            <span class="material-symbols-outlined" id="trigger-icon">chat</span>
        </button>
    `;
  shadow.appendChild(root);

  // Elements
  const trigger = shadow.getElementById("trigger");
  const window = shadow.getElementById("window");
  const input = shadow.getElementById("input");
  const messages = shadow.getElementById("messages");

  // Toggle Chat
  trigger.onclick = () => {
    const isActive = window.classList.toggle("active");
    const icon = shadow.getElementById("trigger-icon");
    icon.textContent = isActive ? "close" : "chat";
  };

  // Handle Messages
  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage("user", text);
    input.value = "";

    try {
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
  };

  shadow.getElementById("send-btn").onclick = sendMessage;
  input.onkeydown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  function addMessage(type, text) {
    const div = document.createElement("div");
    div.className = `msg msg-${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
};
