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
  // Assuming the stylesheet is in the same directory as this script or relative to the page
  // A better way would be to get the base path of the current script, 
  // but for simplicity we'll use a relative path or a configurable one.
  styles.href = config.cssPath || "styles.css";
  shadow.appendChild(styles);

  // Create the HTML structure
  const root = document.createElement("div");
  const theme = config.theme || "light";
  root.className = `vertex-widget-root theme-${theme}`;
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
