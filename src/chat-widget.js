(function () {
  const style = document.createElement("style");
  style.innerHTML = `
    .bizzai-chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      width: 60px;
      height: 60px;
      background-color: var(--bizzai-color, #4CAF50);
      border-radius: 50%;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      color: white;
      font-size: 30px;
      text-align: center;
      line-height: 60px;
      cursor: pointer;
    }
    .bizzai-chat-box {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: var(--bizzai-width, 320px);
      height: var(--bizzai-height, 400px);
      border: 1px solid #ccc;
      border-radius: 10px;
      background: white;
      display: flex;
      flex-direction: column;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      overflow: hidden;
      font-family: sans-serif;
      z-index: 9999;
    }
    .bizzai-chat-header {
      background: var(--bizzai-color, #4CAF50);
      color: white;
      padding: 10px;
      font-weight: bold;
    }
    .bizzai-chat-messages {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      font-size: 14px;
      display: flex;
      flex-direction: column;
    }
    .bizzai-chat-message {
      margin: 6px 0;
      padding: 8px 12px;
      border-radius: 12px;
      max-width: 80%;
      clear: both;
      word-wrap: break-word;
    }
    .bizzai-user-message {
      align-self: flex-end;
      background-color: #DCF8C6;
    }
    .bizzai-bot-message {
      align-self: flex-start;
      background-color: #F1F0F0;
    }
    .bizzai-chat-input {
      display: flex;
      border-top: 1px solid #ddd;
    }
    .bizzai-chat-input input {
      flex: 1;
      border: none;
      padding: 10px;
      font-size: 14px;
      outline: none;
    }
    .bizzai-chat-input button {
      background: var(--bizzai-color, #4CAF50);
      color: white;
      border: none;
      padding: 10px 16px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const BizzAIChat = {
    init({
      apiKey,
      backendUrl,
      color = "#4CAF50",
      headerText = "Chat with us",
      width = "320px",
      height = "400px",
    }) {
      // Apply CSS variables
      document.documentElement.style.setProperty("--bizzai-color", color);
      document.documentElement.style.setProperty("--bizzai-width", width);
      document.documentElement.style.setProperty("--bizzai-height", height);

      const chatButton = document.createElement("div");
      chatButton.className = "bizzai-chat-button";
      chatButton.innerText = "💬";
      document.body.appendChild(chatButton);

      const chatBox = document.createElement("div");
      chatBox.className = "bizzai-chat-box";
      chatBox.style.display = "none";
      chatBox.innerHTML = `
        <div class="bizzai-chat-header">${headerText}</div>
        <div class="bizzai-chat-messages" id="bizzai-chat-messages"></div>
        <div class="bizzai-chat-input">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      `;
      document.body.appendChild(chatBox);

      const messages = chatBox.querySelector("#bizzai-chat-messages");
      const input = chatBox.querySelector("input");
      const button = chatBox.querySelector("button");

      chatButton.onclick = () => {
        const isOpen = chatBox.style.display === "flex";
        chatBox.style.display = isOpen ? "none" : "flex";
        chatButton.innerText = isOpen ? "💬" : "✖";
      };

      function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        appendMessage("user", text);
        input.value = "";

        fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ message: text }),
        })
          .then((res) => res.json())
          .then((res) => appendMessage("bot", res.reply || "No reply"))
          .catch(() => appendMessage("bot", "⚠️ Could not connect to server."));
      }

      button.onclick = sendMessage;

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage();
        }
      });

      function appendMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `bizzai-chat-message bizzai-${sender}-message`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
      }
    },
  };

  window.BizzAIChat = BizzAIChat;
})();
