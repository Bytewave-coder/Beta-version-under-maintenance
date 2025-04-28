document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatBtn = document.querySelector('.new-chat-btn');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const modeToggle = document.querySelector('.mode-toggle');
    const promptTemplatesBtn = document.getElementById('prompt-templates-btn');
    const rightPanel = document.getElementById('right-panel');
    const closePanelBtn = document.querySelector('.close-panel-btn');
    const settingsModal = document.getElementById('settings-modal');
    const filePreviewModal = document.getElementById('file-preview-modal');
    const markdownHelpModal = document.getElementById('markdown-help-modal');
    const loadingOverlay = document.getElementById('loading-overlay');
    const chatHistory = document.getElementById('chat-history');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const voiceInputBtn = document.getElementById('voice-input-btn');
    const markdownBtn = document.getElementById('markdown-btn');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const deleteHistoryBtn = document.getElementById('delete-history-btn');
    const openSettingsBtn = document.getElementById('open-settings-btn');

    // State
    let currentChatId = generateChatId();
    let chats = JSON.parse(localStorage.getItem('gemini-chats')) || {};
    let settings = JSON.parse(localStorage.getItem('gemini-settings')) || {
        apiKey: '',
        apiEndpoint: '',
        modelVersion: 'gemini-1.5-pro-latest',
        temperature: 0.7,
        maxTokens: 2048,
        safetySettings: {
            HARASSMENT: 'BLOCK_ONLY_HIGH',
            HATE_SPEECH: 'BLOCK_ONLY_HIGH'
        },
        autoScroll: true,
        markdownRender: true,
        syntaxHighlight: true,
        voiceFeedback: false
    };
    let uploadedFiles = [];
    let recognition = null;

    // Initialize
    initChat();
    renderChatHistory();
    loadSettings();
    setupEventListeners();
    checkDarkModePreference();
    initVoiceRecognition();

    function initChat() {
        if (!chats[currentChatId]) {
            chats[currentChatId] = {
                id: currentChatId,
                title: 'New Chat',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            saveChats();
        }
    }

    function setupEventListeners() {
        // Message sending
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
                
            }
        });

       

        // UI Interactions
        newChatBtn.addEventListener('click', createNewChat);
        sidebarToggle.addEventListener('click', toggleSidebar);
        mobileMenuBtn.addEventListener('click', toggleSidebar);
        modeToggle.addEventListener('click', toggleDarkMode);
        promptTemplatesBtn.addEventListener('click', toggleRightPanel.bind(null, 'templates'));
        closePanelBtn.addEventListener('click', closeRightPanel);
        markdownBtn.addEventListener('click', showMarkdownHelp);
        openSidebarBtn.addEventListener('click', () => sidebar.classList.remove('hidden-sidebar'));
        closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('hidden-sidebar'));
        deleteHistoryBtn.addEventListener('click', deleteChatHistory);
        openSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');

        // File handling
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);

        // Voice input
        voiceInputBtn.addEventListener('click', toggleVoiceRecognition);

        // Settings modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                settingsModal.style.display = 'none';
                filePreviewModal.style.display = 'none';
                markdownHelpModal.style.display = 'none';
            });
        });

       document.querySelectorAll('.copy-code-btn').forEach(button => {
  button.addEventListener('click', () => {
    const codeBlock = button.parentElement.nextElementSibling;
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
      button.classList.add('copied');
      setTimeout(() => {
        button.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  });
});

      document.addEventListener('DOMContentLoaded', function() {
  // Copy functionality
  document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', function() {
      const codeBlock = this.closest('.code-toolbar').nextElementSibling;
      const code = codeBlock.querySelector('code').textContent;
      
      navigator.clipboard.writeText(code).then(() => {
        const tooltip = this.querySelector('.tooltip');
        const originalText = tooltip.textContent;
        tooltip.textContent = 'Copied!';
        
        setTimeout(() => {
          tooltip.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });

  // Language switching
  document.querySelectorAll('.language-selector').forEach(select => {
    select.addEventListener('change', function() {
      const codeBlock = this.closest('.code-toolbar').nextElementSibling;
      const codeElement = codeBlock.querySelector('code');
      
      // Remove all language classes
      codeElement.className = '';
      // Add new language class
      codeElement.classList.add(`language-${this.value}`);
      
      // Re-highlight the code
      if (window.Prism) {
        Prism.highlightElement(codeElement);
      }
    });
  });
});
        document.getElementById('save-settings').addEventListener('click', saveSettings);
        document.getElementById('reset-settings').addEventListener('click', resetSettings);
        document.getElementById('test-api-btn').addEventListener('click', testApiConnection);

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Temperature slider
        document.getElementById('temperature').addEventListener('input', function() {
            document.getElementById('temperature-value').textContent = this.value;
        });

        // Click outside modals to close
        window.addEventListener('click', function(event) {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
            if (event.target === filePreviewModal) {
                filePreviewModal.style.display = 'none';
            }
            if (event.target === markdownHelpModal) {
                markdownHelpModal.style.display = 'none';
            }
        });

        // Load chat when clicking on history item
        chatHistory.addEventListener('click', function(e) {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem) {
                const chatId = chatItem.dataset.chatId;
                loadChat(chatId);
            }
        });

        // Handle prompt suggestion clicks
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('suggestion-btn')) {
                userInput.value = e.target.textContent;
                userInput.focus();
            }
        });

        // Auto-resize textarea
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    async function sendMessage() {
  const messageText = userInput.value.trim();
  if (messageText === '' && uploadedFiles.length === 0) return;

  function playSendSound() {
  const sound = document.getElementById('msg-sound');
  if (sound) {
    sound.currentTime = 0; // rewind to start
    sound.play().catch(err => console.warn('Sound play blocked:', err));
  }
  }

  // Check for secret /dev console command
  if (handleDevCommand(messageText) || handleHiddenCommand(messageText)) {
  userInput.value = '';
  return;
  }

  // Play sound
  playSendSound();

  // Apply personality style
  const personality = document.getElementById('personality')?.value || "default";
  const finalPrompt = getPromptStyle(personality, messageText);

  // Convert uploaded files to inlineData
  const fileParts = await Promise.all(uploadedFiles.map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          inlineData: {
            mimeType: file.type,
            data: e.target.result.split(',')[1]
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }));

  // Format user message
  const userMessage = {
    role: 'user',
    content: finalPrompt,
    files: [...uploadedFiles],
    timestamp: new Date().toISOString()
  };

  addMessageToChat(userMessage);
  renderMessages();
  userInput.value = '';
  uploadedFiles = [];
  userInput.style.height = 'auto';
  showTypingIndicator();

  try {
    const response = await callGeminiAPI(finalPrompt, fileParts);
    hideTypingIndicator();

    if (response && response.candidates && response.candidates[0]) {
      const botResponse = response.candidates[0].content.parts[0].text;
      const botMessage = {
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      };
      addMessageToChat(botMessage);
      renderMessages();
    }
  } catch (err) {
    hideTypingIndicator();
    console.error('Error during Gemini API call:', err);
  }
                }

     async function callGeminiAPI(prompt, fileParts = []) {
    if (!settings.apiKey) {
        throw new Error('API key is not configured. Please set it in Settings.');
    }

    const endpoint = settings.apiEndpoint || 'https://generativelanguage.googleapis.com/v1beta';
    const model = settings.modelVersion || 'gemini-1.5-pro-latest';
    const url = `${endpoint}/models/${model}:generateContent?key=${settings.apiKey}`;

    // Prepare the conversation history with proper role mapping
    const conversationHistory = chats[currentChatId].messages.map(msg => {
        return {
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        };
    });

    // Add the new user message including fileParts
   const userMessage = {
    role: 'user',
    parts: [{ text: prompt }, ...fileParts]
    };
    conversationHistory.push(userMessage);

    // Prepare the request payload with safety settings
    const payload = {
        contents: conversationHistory,
        generationConfig: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxTokens,
            topP: 0.8,
            topK: 40
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: settings.safetySettings.HARASSMENT
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: settings.safetySettings.HATE_SPEECH
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE" // Additional safety category
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE" // Additional safety category
            }
        ]
    };

    // Add file data if any files were uploaded
    if (uploadedFiles.length > 0) {
        const filePromises = uploadedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        inlineData: {
                            mimeType: file.type,
                            data: e.target.result.split(',')[1] // Remove data URL prefix
                        }
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        const fileParts = await Promise.all(filePromises);
        userMessage.parts.push(...fileParts);
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Enhanced error handling for safety blocks
            if (errorData.error && errorData.error.details) {
                const safetyDetails = errorData.error.details.find(
                    detail => detail["@type"] === "type.googleapis.com/google.ai.generativelanguage.v1beta/SafetyFeedback"
                );
                
                if (safetyDetails) {
                    const blockedCategories = safetyDetails.safetyFeedback.rating.categories
                        .filter(cat => cat.blocked)
                        .map(cat => cat.category);
                    
                    throw new Error(`Content blocked due to: ${blockedCategories.join(', ')}`);
                }
            }
            
            throw new Error(errorData.error?.message || 'Failed to get response from API');
        }

        const responseData = await response.json();
        
        // Check for safety ratings in successful responses
        if (responseData.promptFeedback && responseData.promptFeedback.safetyRatings) {
            const safetyIssues = responseData.promptFeedback.safetyRatings
                .filter(rating => rating.blocked)
                .map(rating => rating.category);
            
            if (safetyIssues.length > 0) {
                console.warn('Safety concerns detected (not blocked):', safetyIssues);
            }
        }

        return responseData;
    } catch (error) {
        console.error('API Error Details:', {
            prompt: prompt,
            error: error.message,
            payload: payload
        });
        throw error;
    }
}

    function addMessageToChat(message) {
        chats[currentChatId].messages.push(message);
        chats[currentChatId].updatedAt = new Date().toISOString();
        saveChats();
    }

    // ——————————————————————————————
// Message utilities
// ——————————————————————————————

// Edit a message in-place
function editMessage(index) {
  const chat = chats[currentChatId];
  const msg = chat.messages[index];
  const newText = prompt("Edit this message:", msg.content);
  if (newText !== null) {
    msg.content = newText;
    saveChats();
    renderMessages();
  }
}

// Copy message text to clipboard
function copyMessage(text) {
  navigator.clipboard.writeText(text)
    .then(() => console.log("Copied:", text))
    .catch(err => console.error("Copy failed:", err));
}

    // 1) renderMessages now passes an index (idx) to createMessageElement
function renderMessages() {
  chatMessages.innerHTML = '';

  chats[currentChatId].messages.forEach((message, idx) => {
    const messageElement = createMessageElement(message, idx);
    chatMessages.appendChild(messageElement);
  });

  if (settings.autoScroll) {
    scrollToBottom(true);
  }
}

function createMessageElement(message, idx) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${message.role}-message`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = message.role === 'user'
    ? '<i class="fas fa-user"></i>'
    : '<i class="fas fa-robot"></i>';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  if (settings.markdownRender && message.content) {
    textDiv.innerHTML = marked.parse(message.content);
  } else {
    textDiv.textContent = message.content || '';
  }

  // File previews
  if (message.files && message.files.length > 0) {
    message.files.forEach(file => {
      const fileElement = createFileElement(file);
      textDiv.appendChild(fileElement);
    });
  }

  // Time
  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = formatTime(message.timestamp);

  contentDiv.appendChild(textDiv);
  contentDiv.appendChild(timeDiv);

  // === Button container ===
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '8px';
  btnContainer.style.marginTop = '6px';

  // Only add Edit button for user messages
  if (message.role === 'user') {
    const editBtn = document.createElement('i');
    editBtn.className = 'fas fa-edit';
    editBtn.title = 'Edit this message';
    editBtn.style.cursor = 'pointer';
    editBtn.onclick = () => {
      const newText = prompt('Edit your message:', message.content);
      if (newText !== null) {
        chats[currentChatId].messages[idx].content = newText;
        saveChats();
        renderMessages();
      }
    };
    btnContainer.appendChild(editBtn);
  }

  // Copy button for all messages
  const copyBtn = document.createElement('i');
  copyBtn.className = 'fas fa-copy';
  copyBtn.title = 'Copy message text';
  copyBtn.style.cursor = 'pointer';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => console.log('Copied:', message.content))
      .catch(err => console.error('Copy failed:', err));
  };
  btnContainer.appendChild(copyBtn);

  contentDiv.appendChild(btnContainer);

  // Syntax highlight if needed
  if (settings.syntaxHighlight) {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  return messageDiv;
      }
    
    function createFileElement(file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-preview';
        
        const icon = document.createElement('i');
        icon.className = getFileIconClass(file.type);
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'file-info';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'file-name';
        nameSpan.textContent = file.name;
        
        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'file-size';
        sizeSpan.textContent = formatFileSize(file.size);
        
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(document.createElement('br'));
        infoDiv.appendChild(sizeSpan);
        
        fileDiv.appendChild(icon);
        fileDiv.appendChild(infoDiv);
        
        return fileDiv;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        contentDiv.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        uploadedFiles = files;
        showFilePreviewModal(files);
    }
  
    function showFilePreviewModal(files) {
        const previewContent = document.getElementById('file-preview-content');
        previewContent.innerHTML = '';
        
        const fileList = document.createElement('div');
        fileList.className = 'file-preview';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = document.createElement('i');
            icon.className = getFileIconClass(file.type);
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'file-info';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-name';
            nameSpan.textContent = file.name;
            
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'file-size';
            sizeSpan.textContent = formatFileSize(file.size);
            
            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(document.createElement('br'));
            infoDiv.appendChild(sizeSpan);
            
            fileItem.appendChild(icon);
            fileItem.appendChild(infoDiv);
            fileList.appendChild(fileItem);
        });
        
        previewContent.appendChild(fileList);
        filePreviewModal.style.display = 'flex';
        
        document.getElementById('send-file-btn').addEventListener('click', () => {
            filePreviewModal.style.display = 'none';
        });
    }

    function getFileIconClass(fileType) {
        if (!fileType) return 'fas fa-file';
        
        const typeMap = {
            'image/': 'fas fa-image',
            'application/pdf': 'fas fa-file-pdf',
            'text/': 'fas fa-file-alt',
            'application/msword': 'fas fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
            'application/vnd.ms-excel': 'fas fa-file-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint'
        };
        
        for (const [prefix, icon] of Object.entries(typeMap)) {
            if (fileType.startsWith(prefix)) {
                return icon;
            }
        }
        
        return 'fas fa-file';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function createNewChat() {
        currentChatId = generateChatId();
        initChat();
        renderMessages();
        renderChatHistory();
        showToast('New chat created');
    }

    // Prompt user to rename a chat
function renameChat(chatId) {
  const chat = chats[chatId];
  const newTitle = prompt('Enter new chat name:', chat.title);
  if (newTitle !== null && newTitle.trim() !== '') {
    chats[chatId].title = newTitle.trim();
    saveChats();
    renderChatHistory();
  }
}

// Delete a single chat
function deleteChat(chatId) {
  if (confirm('Delete this chat? This cannot be undone.')) {
    delete chats[chatId];
    // if we deleted the current chat, pick another or create new
    if (currentChatId === chatId) {
      const remaining = Object.keys(chats);
      currentChatId = remaining.length ? remaining[0] : generateChatId();
      if (!chats[currentChatId]) initChat();
    }
    saveChats();
    renderMessages();
    renderChatHistory();
  }
}
    
    function loadChat(chatId) {
        currentChatId = chatId;
        renderMessages();
        closeRightPanel();
        
        // Update active state in chat history
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    }

    function renderChatHistory() {
        chatHistory.innerHTML = '';
        
        // Sort chats by updatedAt (newest first)
        const sortedChats = Object.values(chats).sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        sortedChats.forEach(chat => {
  const chatItem = document.createElement('div');
  chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
  chatItem.dataset.chatId = chat.id;

  // icon + title
  const icon = document.createElement('i');
  icon.className = 'chat-item-icon fas fa-comment';
  const title = document.createElement('span');
  title.className = 'chat-item-title';
  title.textContent = chat.title;

  // rename button
  const renameBtn = document.createElement('i');
  renameBtn.className = 'fas fa-pencil-alt';
  renameBtn.title = 'Rename chat';
  renameBtn.style.marginRight = '8px';
  renameBtn.onclick = e => {
    e.stopPropagation();
    renameChat(chat.id);
  };

  // delete button
  const deleteBtn = document.createElement('i');
  deleteBtn.className = 'fas fa-trash-alt';
  deleteBtn.title = 'Delete chat';
  deleteBtn.onclick = e => {
    e.stopPropagation();
    deleteChat(chat.id);
  };

  // assemble
  chatItem.appendChild(icon);
  chatItem.appendChild(title);
  chatItem.appendChild(renameBtn);
  chatItem.appendChild(deleteBtn);
  chatHistory.appendChild(chatItem);
});
    }

    function updateChatTitle(firstMessage) {
        if (chats[currentChatId].title === 'New Chat') {
            // Generate a title from the first message
            const title = firstMessage.length > 30 
                ? firstMessage.substring(0, 30) + '...' 
                : firstMessage;
            chats[currentChatId].title = title;
            saveChats();
            renderChatHistory();
        }
    }

    function toggleSidebar() {
        sidebar.classList.toggle('visible');
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        modeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i> Light Mode' 
            : '<i class="fas fa-moon"></i> Dark Mode';
        localStorage.setItem('darkMode', isDark);
    }

    function checkDarkModePreference() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            modeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }

    function toggleRightPanel(panelType) {
        if (rightPanel.style.display === 'flex' && document.getElementById('panel-title').textContent === panelType) {
            closeRightPanel();
            return;
        }
        
        const panelTitle = document.getElementById('panel-title');
        const panelContent = document.getElementById('panel-content');
        
        rightPanel.style.display = 'flex';
        
        switch (panelType) {
            case 'templates':
                panelTitle.textContent = 'Prompt Templates';
                panelContent.innerHTML = `
                    <div class="suggestion-category">
                        <h3>Creative Writing</h3>
                        <div class="suggestion-buttons">
                            <button class="suggestion-btn">Write a poem about technology</button>
                            <button class="suggestion-btn">Generate a short story idea</button>
                            <button class="suggestion-btn">Create a blog post outline</button>
                        </div>
                    </div>
                    <div class="suggestion-category">
                        <h3>Code Assistance</h3>
                        <div class="suggestion-buttons">
                            <button class="suggestion-btn">Explain this Python code</button>
                            <button class="suggestion-btn">Help me debug this issue</button>
                            <button class="suggestion-btn">Optimize this SQL query</button>
                        </div>
                    </div>
                     <div class="suggestion-category">
                        <h3>Business advice</h3>
                        <div class="suggestion-buttons">
                            <button class="suggestion-btn">How to grow business </button>
                            <button class="suggestion-btn">how to expand business</button>
                            <button class="suggestion-btn">How can I increase my business reputation</button>
                        </div>
                    </div>
                     <div class="suggestion-category">
                        <h3>Good parenting</h3>
                        <div class="suggestion-buttons">
                            <button class="suggestion-btn">I need parenting advice</button>
                            <button class="suggestion-btn">How to make your child a good well being</button>
                            <button class="suggestion-btn">Help me to make my child a good boy</button>
                        </div>
                    </div>
                     <div class="suggestion-category">
                        <h3>Today's media</h3>
                        <div class="suggestion-buttons">
                            <button class="suggestion-btn">Tell me the latest News</button>
                            <button class="suggestion-btn">How to stay away from internet controversy</button>
                            <button class="suggestion-btn">How can I stay away from internet fake News</button>
                        </div>
                    </div>
                `;
                break;
        }
    }

    function closeRightPanel() {
        rightPanel.style.display = 'none';
    }

    function showMarkdownHelp() {
        markdownHelpModal.style.display = 'flex';
    }

    function showLoading(message = 'Processing your request') {
        document.getElementById('loading-text').textContent = message;
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    function switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    }

    function loadSettings() {
        // API Settings
        document.getElementById('api-key').value = settings.apiKey;
        document.getElementById('api-endpoint').value = settings.apiEndpoint || '';
        
        // Model Settings
        document.getElementById('model-version').value = settings.modelVersion;
        document.getElementById('temperature').value = settings.temperature;
        document.getElementById('temperature-value').textContent = settings.temperature;
        document.getElementById('max-tokens').value = settings.maxTokens;
        
        // Safety Settings
        Object.entries(settings.safetySettings).forEach(([category, level]) => {
            const select = document.querySelector(`.safety-select[data-category="${category}"]`);
            if (select) select.value = level;
        });
        
        // UI Settings
        document.getElementById('auto-scroll-checkbox').checked = settings.autoScroll;
        document.getElementById('markdown-render-checkbox').checked = settings.markdownRender;
        document.getElementById('syntax-highlight-checkbox').checked = settings.syntaxHighlight;
        document.getElementById('voice-feedback-checkbox').checked = settings.voiceFeedback;
        
        // Update UI based on settings
        if (settings.markdownRender) {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
        }
    }

    function saveSettings() {
        // API Settings
        settings.apiKey = document.getElementById('api-key').value;
        settings.apiEndpoint = document.getElementById('api-endpoint').value;
        
        // Model Settings
        settings.modelVersion = document.getElementById('model-version').value;
        settings.temperature = parseFloat(document.getElementById('temperature').value);
        settings.maxTokens = parseInt(document.getElementById('max-tokens').value);
        
        // Safety Settings
        settings.safetySettings = {};
        document.querySelectorAll('.safety-select').forEach(select => {
            const category = select.getAttribute('data-category');
            settings.safetySettings[category] = select.value;
        });
        
        // UI Settings
        settings.autoScroll = document.getElementById('auto-scroll-checkbox').checked;
        settings.markdownRender = document.getElementById('markdown-render-checkbox').checked;
        settings.syntaxHighlight = document.getElementById('syntax-highlight-checkbox').checked;
        settings.voiceFeedback = document.getElementById('voice-feedback-checkbox').checked;
        
        localStorage.setItem('gemini-settings', JSON.stringify(settings));
        settingsModal.style.display = 'none';
        
        // Show confirmation
        showToast('Settings saved successfully');
    }

    function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem('gemini-settings');
            settings = {
                apiKey: '',
                apiEndpoint: '',
                modelVersion: 'gemini-1.5-pro-latest',
                temperature: 0.7,
                maxTokens: 2048,
                safetySettings: {
                    HARASSMENT: 'BLOCK_ONLY_HIGH',
                    HATE_SPEECH: 'BLOCK_ONLY_HIGH'
                },
                autoScroll: true,
                markdownRender: true,
                syntaxHighlight: true,
                voiceFeedback: false
            };
            loadSettings();
            showToast('Settings reset to defaults');
        }
    }

    async function testApiConnection() {
        const apiKey = document.getElementById('api-key').value.trim();
        if (!apiKey) {
            showToast('Please enter your API key first');
            return;
        }

        showLoading('Testing API connection...');
        
        try {
            const testEndpoint = document.getElementById('api-endpoint').value || 
                                'https://generativelanguage.googleapis.com/v1beta';
            const testUrl = `${testEndpoint}/models/gemini-1.5-pro-latest?key=${apiKey}`;
            
            const response = await fetch(testUrl);
            if (!response.ok) {
                throw new Error('API connection failed');
            }
            
            showToast('API connection successful!');
        } catch (error) {
            showToast(`API test failed: ${error.message}`);
            console.error('API Test Error:', error);
        } finally {
            hideLoading();
        }
    }

    function deleteChatHistory() {
        if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
            localStorage.removeItem('gemini-chats');
            chats = {};
            createNewChat();
            renderChatHistory();
            renderMessages();
            showToast('Chat history deleted');
        }
    }

    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                userInput.focus();
            };

            recognition.onerror = function(event) {
                showToast('Voice recognition error: ' + event.error);
            };
        } else {
            voiceInputBtn.style.display = 'none';
        }
    }

    function toggleVoiceRecognition() {
        if (!recognition) return;

        if (recognition.isListening) {
            recognition.stop();
            voiceInputBtn.classList.remove('active');
        } else {
            recognition.start();
            voiceInputBtn.classList.add('active');
            showToast('Listening... Speak now');
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    function saveChats() {
        localStorage.setItem('gemini-chats', JSON.stringify(chats));
    }

    function generateChatId() {
        return 'chat-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Initialize with first chat if none exists
    if (Object.keys(chats).length === 0) {
        createNewChat();
    } else {
        renderMessages();
    }
});

// Add toast styles to the head
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4285f4;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
}
.toast.show {
    opacity: 1;
}
`;
document.head.appendChild(toastStyles);
    
