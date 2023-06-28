document.addEventListener('DOMContentLoaded', () => {
    // Getting references to DOM elements
    const form = document.querySelector('#user-form');
    const userNameInput = document.querySelector('#user-name');
    const questsContainer = document.querySelector('.quests-container');
    const questList = document.querySelector('#quest-list');
    const completedQuests = document.querySelector('#completed-quests');
    const container = document.querySelector('main.container');
    const messageDisplay = document.querySelector('#messages');
    const fireworkContainers = document.querySelectorAll('.firework-container');
  
    // Load quests from localStorage on page load
    const savedData = localStorage.getItem('real-life-quest-app');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.userName) {
            questsContainer.classList.remove('hidden');
        }
        welcomeUser(data.userName);
        data.quests.forEach((quest, index) => {
                createQuest(quest.title, quest.completed, index);
        });
        if (data.quests.some(quest => quest.completed)) {
                displayMessage(2);
        } else {
                displayMessage(1);
        }
    } else {
        // Add your quests here only if there is no saved data
        createQuest('First Quest', false, 0);
        createQuest('Second Quest', false, 1);
        //...
        displayMessage(0);
    }
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      welcomeUser(userNameInput.value);
      localStorage.setItem('real-life-quest-app', JSON.stringify({
          userName: userNameInput.value,
          quests: getQuests()
      }));
      displayMessage(1);
      questsContainer.classList.remove('hidden');
      saveToCloud();
    });
  
    questList.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') {
          const checkBox = e.target;
          const questItem = checkBox.parentElement;
          const questTitle = questItem.querySelector('span');
  
          addFireworks();
  
          if (checkBox.checked) {
            questTitle.classList.add('completed');
            completedQuests.appendChild(questItem);
            saveToCloud();
          } else {
            questTitle.classList.remove('completed');
            questList.appendChild(questItem);
          }
  
          const quests = JSON.parse(localStorage.getItem('real-life-quest-app'));
          const quest = quests.quests.find(quest => quest.title === questTitle.textContent);
          quest.completed = checkBox.checked;
          localStorage.setItem('real-life-quest-app', JSON.stringify(quests));
      }
    });
  
    function welcomeUser(userName) {
        form.style.display = 'none';
    }
  
    function displayMessage(index) {
        messageDisplay.textContent = messages[index];
    }
  
    function createQuest(title, completed = false, index) {
      const questItem = document.createElement('div');
      const checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.checked = completed;
      const questTitle = document.createElement('span');
      questTitle.textContent = title;
      questItem.appendChild(checkBox);
      questItem.appendChild(questTitle);
      completed ? completedQuests.appendChild(questItem) : questList.appendChild(questItem);
    }
  
    function getQuests() {
      const allQuests = Array.from(questList.children).concat(Array.from(completedQuests.children));
      return allQuests.map(child => ({
          title: child.querySelector('span').textContent,
          completed: child.querySelector('input').checked
      }));
    }
  
    function addFireworks() {
      fireworkContainers.forEach(container => container.classList.add('firework'));
      setTimeout(() => {
          fireworkContainers.forEach(container => container.classList.remove('firework'));
      }, 1500);
    }
  
    // Local Storage Delete Button for Localhost Testing
    if (window.location.hostname === 'localhost') {
      const deleteLocalStorageButton = document.createElement('button');
      deleteLocalStorageButton.id = 'delete-local-storage';
      deleteLocalStorageButton.textContent = 'Delete Local Storage';
      document.body.prepend(deleteLocalStorageButton);
    
      deleteLocalStorageButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.reload();
      });
    }
  });
  