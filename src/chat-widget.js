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
      display: none;
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
    .bizzai-clear-button {
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
      position: absolute;
      bottom: -14px;
      right: 8px;
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
      chatBox.innerHTML = `
        <div class="bizzai-chat-header">
          ${headerText}
          <button class="bizzai-clear-button">Clear</button>
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
      const clearBtn = chatBox.querySelector(".bizzai-clear-button");

      chatButton.onclick = () => {
        const isOpen = chatBox.style.display === "flex";
        chatBox.style.display = isOpen ? "none" : "flex";
        chatButton.innerText = isOpen ? "💬" : "✖";
        if (!isOpen) renderStoredMessages(); // Load only once per open
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

      let messageHistory = [];

      function saveMessage(sender, text, timestamp) {
        messageHistory.push({ sender, text, timestamp });
        localStorage.setItem("bizzai-history", JSON.stringify(messageHistory));
      }

      function renderStoredMessages() {
        messages.innerHTML = "";
        messageHistory = JSON.parse(
          localStorage.getItem("bizzai-history") || "[]"
        );
        messageHistory.forEach(({ sender, text, timestamp }) => {
          appendMessage(sender, text, timestamp);
        });
      }

      function getTimeStamp() {
        return new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      function appendMessage(sender, text, timestamp = getTimeStamp()) {
        const msg = document.createElement("div");
        msg.className = `bizzai-chat-message bizzai-${sender}-message`;
        msg.textContent = text;

        const time = document.createElement("div");
        time.className = "bizzai-chat-timestamp";
        time.textContent = timestamp;

        msg.appendChild(time);
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
        saveMessage(sender, text, timestamp);
      }

      function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        const timestamp = getTimeStamp();
        appendMessage("user", text, timestamp);
        input.value = "";

        const botTyping = document.createElement("div");
        botTyping.className = "bizzai-chat-message bizzai-bot-message";
        botTyping.textContent = "Typing...";
        messages.appendChild(botTyping);
        messages.scrollTop = messages.scrollHeight;

        const messagePayload = {
          userId,
          messageId: uuidv4(),
          messageType: "text",
          product: "ConvoAi-WebUI",
          category: "DM",
          messageText: text,
        };

        fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(messagePayload),
        })
          .then((res) => res.json())
          .then((res) => {
            messages.removeChild(botTyping);
            appendMessage("bot", res.reply || "No reply");
          })
          .catch(() => {
            messages.removeChild(botTyping);
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

      clearBtn.onclick = () => {
        localStorage.removeItem("bizzai-history");
        messageHistory = [];
        messages.innerHTML = "";
      };
    },
  };

  window.BizzAIChat = BizzAIChat;
})();
