document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#user-form');
  const userNameInput = document.querySelector('#user-name');
  const questList = document.querySelector('#quest-list');
  const container = document.querySelector('main.container');
  const messageDisplay = document.querySelector('#messages');

  // Load data from localStorage if it exists
  const savedData = localStorage.getItem('real-life-quest-app');
  if (savedData) {
      const data = JSON.parse(savedData);
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
      checkBox.addEventListener('change', () => {
          localStorage.setItem('real-life-quest-app', JSON.stringify({
              userName: userNameInput.value,
              quests: getQuests()
          }));
          if (index === 0 && checkBox.checked) {
              displayMessage(2);
          }
      });
      const questTitle = document.createElement('span');
      questTitle.textContent = title;
      questItem.appendChild(checkBox);
      questItem.appendChild(questTitle);
      questList.appendChild(questItem);
  }

  function getQuests() {
      return Array.from(questList.children).map(child => ({
          title: child.querySelector('span').textContent,
          completed: child.querySelector('input').checked
      }));
  }
});

const addDeleteLocalStorageButton = () => {
  const deleteLocalStorageButton = document.createElement('button');
  deleteLocalStorageButton.id = 'delete-local-storage';
  deleteLocalStorageButton.textContent = 'Delete Local Storage';
  document.body.prepend(deleteLocalStorageButton);
};

const deleteLocalStorage = () => {
  localStorage.clear();
  window.location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname === 'localhost') {
    addDeleteLocalStorageButton();

    document
      .getElementById('delete-local-storage')
      .addEventListener('click', deleteLocalStorage);
  }
});




document.addEventListener('DOMContentLoaded', () => {
    const fireworkContainers = document.querySelectorAll('.firework-container');
    const questList = document.querySelector('#quest-list');
    questList.addEventListener('click', addFireworksOnClick(fireworkContainers));
});

const addFireworksOnClick = (fireworkContainers) => {
    return (e) => {
        if (e.target.tagName === 'INPUT') {
            fireworkContainers.forEach(container => container.classList.add('firework'));
            setTimeout(() => {
                fireworkContainers.forEach(container => container.classList.remove('firework'));
            }
            , 1500);
        }
    };
};





