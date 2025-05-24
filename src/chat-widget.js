(function () {
  const style = document.createElement("style");
  style.innerHTML = `
    .bizzai-chat-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
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
      bottom: 20px;
      right: 20px;
      width: var(--bizzai-width, 320px);
      height: var(--bizzai-height, 400px);
      border: 1px solid #ccc;
      border-radius: 20px;
      background: white;
      display: none;
      flex-direction: column;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      overflow: hidden;
      font-family: sans-serif;
      z-index: 9999;
    }
    .bizzai-chat-header {
      background: white;
      color: var(--bizzai-color, #4CAF50);
      padding: 14px 10px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;
      height: 60px; /* slightly increased header height */
    }
    .bizzai-clear-button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 20px; /* increased */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--bizzai-color, #4CAF50);
      padding: 6px; /* increased */
    }
    .bizzai-clear-button svg {
      width: 21px; /* increased */
      height: 21px;
      fill: var(--bizzai-color, #4CAF50);
    }
    .bizzai-close-button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 20px; /* increased */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--bizzai-color, #4CAF50);
      padding: 6px; /* increased */
    }
    .bizzai-close-button svg {
      width: 21px; /* increased */
      height: 21px;
      fill: var(--bizzai-color, #4CAF50);
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
      margin: 10px 0;
      padding: 8px 12px 18px;
      border-radius: 12px;
      max-width: 80%;
      min-width: 60px;
      clear: both;
      word-wrap: break-word;
      position: relative;
      display: flex;
      flex-direction: column;
      font-size: 14px;
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
      bottom: 2px;
      right: 8px;
    }
    .bizzai-chat-input {
      display: flex;
      border-top: 1px solid #ddd;
      border-radius: 0 0 10px 10px;
      overflow: hidden;
    }
    .bizzai-chat-input input {
      flex: 1;
      border: none;
      padding: 10px;
      font-size: 14px;
      outline: none;
    }
    .bizzai-chat-input button {
      width: 40px;
      height: 40px;
      margin: 6px;
      border-radius: 50%;
      background: white;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bizzai-chat-input button svg {
      width: 20px;
      height: 20px;
      fill: var(--bizzai-color, #4CAF50);
    }
    .bizzai-typing-indicator {
      display: flex;
      gap: 4px;
      align-items: flex-end;
      height: 24px;
      padding: 0 10px;
    }
    .bizzai-typing-indicator div {
      width: 6px;
      height: 6px;
      background-color: #888;
      border-radius: 50%;
      animation: bizzai-bounce 1.2s infinite ease-in-out both;
    }
    .bizzai-typing-indicator div:nth-child(1) {
      animation-delay: -0.24s;
    }
    .bizzai-typing-indicator div:nth-child(2) {
      animation-delay: -0.12s;
    }
    .bizzai-typing-indicator div:nth-child(3) {
      animation-delay: 0;
    }
    @keyframes bizzai-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .bizzai-chat-footer {
      font-size: 11px;
      color: #999;
      text-align: center;
      padding: 6px;
      border-top: 1px solid #eee;
      background: #fafafa;
    }
    .bizzai-chat-footer a {
      color: #666;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .bizzai-chat-box {
      bottom: 0 !important;
      right: 0 !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      border-radius: 0 !important;
      border: none !important;
      max-width: none !important;
      max-height: none !important;
      }
    }
    @media (max-width: 1024px) {
      .bizzai-chat-box {
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      border-radius: 0 !important;
      border: none !important;
      max-width: none !important;
      max-height: none !important;
      }
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
          <span>${headerText}</span>
          <div>
            <button class="bizzai-clear-button" title="Clear chat">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z"/>
              </svg>
          </button>
            <button class="bizzai-close-button" title="Close chat">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="bizzai-chat-messages"></div>
        <div class="bizzai-chat-input">
          <input type="text" placeholder="Type a message..." />
          <button class="bizzai-send-btn" title="Send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div class="bizzai-chat-footer" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Powered by</span>
          <a href="https://convoai.chat" target="_blank" rel="noopener" style="display: inline-flex; align-items: center;">
            <img src="https://hemantchhatbar.github.io/convoai-webui/static/ConvoAi.svg" alt="Logo" style="height: 16px;" />
          </a>
        </div>
      `;
      document.body.appendChild(chatBox);

      const messages = chatBox.querySelector(".bizzai-chat-messages");
      const input = chatBox.querySelector("input");
      const sendBtn = chatBox.querySelector(".bizzai-send-btn");
      const clearBtn = chatBox.querySelector(".bizzai-clear-button");
      const closeBtn = chatBox.querySelector(".bizzai-close-button");

      chatButton.onclick = () => {
        chatBox.style.display = "flex";
        chatButton.style.display = "none";
        renderStoredMessages();
      };

      closeBtn.onclick = () => {
        chatButton.style.display = "block";
        chatBox.style.display = "none";
      };

      // UUID helpers
      function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
          ).toString(16)
        );
      }
      function uuidToNumber(uuid) {
        return parseInt(uuid.replace(/\D/g, "").slice(0, 15), 10);
      }

      let userId = localStorage.getItem("bizzai-user-id");
      if (!userId) {
        userId = uuidToNumber(uuidv4());
        localStorage.setItem("bizzai-user-id", userId);
      }

      let messageHistory = [];

      function getTimeStamp() {
        return new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

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
          appendMessage(sender, text, timestamp, false);
        });
      }

      function appendMessage(
        sender,
        text,
        timestamp = getTimeStamp(),
        save = true
      ) {
        const msg = document.createElement("div");
        msg.className = "bizzai-chat-message bizzai-" + sender + "-message";
        msg.textContent = text;

        const time = document.createElement("div");
        time.className = "bizzai-chat-timestamp";
        time.textContent = timestamp;

        msg.appendChild(time);
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;

        if (save) saveMessage(sender, text, timestamp);
      }

      function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        const timestamp = getTimeStamp();
        appendMessage("user", text, timestamp);
        input.value = "";

        const typing = document.createElement("div");
        typing.className = "bizzai-chat-message bizzai-bot-message";

        const typingIndicator = document.createElement("div");
        typingIndicator.className = "bizzai-typing-indicator";
        for (let i = 0; i < 3; i++)
          typingIndicator.appendChild(document.createElement("div"));

        typing.appendChild(typingIndicator);
        messages.appendChild(typing);
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
            messages.removeChild(typing);
            appendMessage("bot", res.data?.ReplyText || "No reply");
          })
          .catch(() => {
            messages.removeChild(typing);
            appendMessage("bot", "⚠️ Could not connect to server.");
          });
      }

      sendBtn.onclick = sendMessage;
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
