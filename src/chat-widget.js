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
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bizzai-chat-clear {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 14px;
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
      position: relative;
    }
    .bizzai-user-message {
      align-self: flex-end;
      background-color: #DCF8C6;
    }
    .bizzai-bot-message {
      align-self: flex-start;
      background-color: #F1F0F0;
    }
    .bizzai-chat-timestamp {
      font-size: 10px;
      color: #888;
      margin-top: 4px;
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
        <div class="bizzai-chat-header">
          <span>${headerText}</span>
          <button class="bizzai-chat-clear">🗑️</button>
        </div>
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
      const clearBtn = chatBox.querySelector(".bizzai-chat-clear");

      chatButton.onclick = () => {
        const isOpen = chatBox.style.display === "flex";
        chatBox.style.display = isOpen ? "none" : "flex";
        chatButton.innerText = isOpen ? "💬" : "✖";
      };

      clearBtn.onclick = () => {
        messages.innerHTML = "";
        localStorage.removeItem("bizzai-chat-history");
      };

      function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
          ).toString(16)
        );
      }

      let userId = localStorage.getItem("bizzai-user-id");
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem("bizzai-user-id", userId);
      }

      function appendMessage(sender, text, timestamp = new Date()) {
        const msg = document.createElement("div");
        msg.className = `bizzai-chat-message bizzai-${sender}-message`;
        msg.innerHTML = `${text}<div class="bizzai-chat-timestamp">${new Date(
          timestamp
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</div>`;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;

        saveMessageToHistory(sender, text, timestamp);
      }

      function saveMessageToHistory(sender, text, timestamp) {
        const history = JSON.parse(
          localStorage.getItem("bizzai-chat-history") || "[]"
        );
        history.push({ sender, text, timestamp });
        localStorage.setItem("bizzai-chat-history", JSON.stringify(history));
      }

      function loadMessageHistory() {
        const history = JSON.parse(
          localStorage.getItem("bizzai-chat-history") || "[]"
        );
        history.forEach(({ sender, text, timestamp }) =>
          appendMessage(sender, text, timestamp)
        );
      }

      function showTypingIndicator() {
        const typing = document.createElement("div");
        typing.className = "bizzai-chat-message bizzai-bot-message";
        typing.id = "bizzai-typing";
        typing.textContent = "Bot is typing...";
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
      }

      function removeTypingIndicator() {
        const typing = document.getElementById("bizzai-typing");
        if (typing) typing.remove();
      }

      function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        appendMessage("user", text);
        input.value = "";

        showTypingIndicator();

        const payload = {
          userId,
          messageId: uuidv4(),
          messageType: "text",
          product: "ConvoAi-WebUI",
          category: "DM",
          message: text,
        };

        fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((res) => {
            removeTypingIndicator();
            appendMessage("bot", res.reply || "No reply");
          })
          .catch(() => {
            removeTypingIndicator();
            appendMessage("bot", "⚠️ Could not connect to server.");
          });
      }

      button.onclick = sendMessage;
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage();
        }
      });

      loadMessageHistory();
    },
  };

  window.BizzAIChat = BizzAIChat;
})();
