// Getting references to DOM elements
const form = document.querySelector('#user-form');
const userNameInput = document.querySelector('#user-name');
const questsContainer = document.querySelector('.quests-container');
const questList = document.querySelector('#quest-list');
const completedQuests = document.querySelector('#completed-quests');
const container = document.querySelector('main.container');
const messageDisplay = document.querySelector('#messages');
const fireworkContainers = document.querySelectorAll('.firework-container');

// Global quests object
let quests = {
  userName: "",
  quests: []
};

// connect to the API
const API_ENDPOINT = 'https://data.rarepepes.com/items/jquest_quests';

function welcomeUser(userName) {
  form.style.display = 'none';
}

function displayMessage(index) {
  messageDisplay.textContent = messages[index];
}

function createQuest(quest, index) {
  const questItem = document.createElement('li');
  const checkBox = document.createElement('input');
  checkBox.type = 'checkbox';
  checkBox.checked = quest.completed;
  
  // Add flexbox styling to the quest item
  questItem.classList.add('quest-item');

  const questTitleContainer = document.createElement('div');
  questTitleContainer.classList.add('quest-title-container');
  
  const questTitle = document.createElement('div');
  questTitle.classList.add('title');
  questTitle.textContent = quest.name;
  
  const questExperience = document.createElement('div');
  questExperience.classList.add('experience');
  questExperience.textContent = quest.experience;

  const questDescription = document.createElement('div');
  questDescription.classList.add('description');
  questDescription.textContent = quest.description;

  questItem.appendChild(checkBox);
  questTitleContainer.appendChild(questTitle);
  questTitleContainer.appendChild(questExperience);
  questItem.appendChild(questTitleContainer);
  questItem.appendChild(questDescription);
  
  quest.completed ? completedQuests.appendChild(questItem) : questList.appendChild(questItem);
}

function getQuests() {
  return new Promise((resolve, reject) => {
    fetch(API_ENDPOINT)
      .then(response => response.json())
      .then(data => {
        // Clear the quests array before adding new quests
        quests.quests = [];

        // Iterate over each quest in the response
        data.data.forEach((quest, index) => {
          createQuest(quest, index);
          // Add the quest to the global quests object
          quests.quests.push({
            name: quest.name,
            description: quest.description,
            experience: quest.experience,
            completed: false
          });
        });

        // Resolve the promise to indicate that the quests have been retrieved successfully
        resolve();
      })
      .catch(error => {
        console.error('Error:', error);

        // Reject the promise to indicate that there was an error retrieving the quests
        reject(error);
      });
  });
}

function addFireworks() {
  fireworkContainers.forEach(container => container.classList.add('firework'));
  setTimeout(() => {
    fireworkContainers.forEach(container => container.classList.remove('firework'));
  }, 1500);
}

function loadQuestsFromLocalStorage() {
  const savedData = localStorage.getItem('quests');
  if (savedData) {
    const data = JSON.parse(savedData);
    if (data.userName) {
      questsContainer.classList.remove('hidden');
    }
    welcomeUser(data.userName);
    data.quests.forEach((quest, index) => {
      createQuest(quest, index);
    });
    if (data.quests.some(quest => quest.completed)) {
      displayMessage(2);
    } else {
      displayMessage(1);
    }
    // Update the global quests object with the current quests data from local storage
    quests = data;
  } else {
    displayMessage(0);
  }
}

function saveToCloud() {
  localStorage.setItem('quests', JSON.stringify(quests));
}

function onSubmitForm(e) {
  e.preventDefault();
  welcomeUser(userNameInput.value);
  getQuests().then(() => {
    quests.userName = userNameInput.value;
    localStorage.setItem('quests', JSON.stringify(quests));
    displayMessage(1);
    questsContainer.classList.remove('hidden');
    addFireworks();
    saveToCloud();
  });
}

function onClickQuestList(e) {
  if (e.target.tagName === 'INPUT') {
    const checkBox = e.target;
    const questItem = checkBox.parentElement;
    const questTitleContainer = questItem.querySelector('.quest-title-container');
    const questDescription = questItem.querySelector('.description');

    addFireworks();

    if (checkBox.checked) {
      questTitleContainer.classList.add('completed');
      completedQuests.appendChild(questItem);
      saveToCloud();

      // check if it's the first completed quest and display the message
      if (!quests.quests.some(quest => quest.completed)) {
        displayMessage(2);
      }
    } else {
      questTitleContainer.classList.remove('completed');
      questList.appendChild(questItem);
    }

    const quest = quests.quests.find(quest => quest.name === questTitleContainer.firstChild.textContent);
    quest.completed = checkBox.checked;
    saveToCloud();
  }
}

function checkForLocalStorageDeleteButton() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDev = urlParams.get('dev') === '1';
  if (window.location.hostname === 'localhost' || isDev) {
    const deleteLocalStorageButton = document.createElement('button');
    deleteLocalStorageButton.classList.add('bg-gray-300', 'hover:bg-gray-400', 'text-gray-800', 'font-bold', 'py-2', 'px-4', 'rounded', 'w-full');
    deleteLocalStorageButton.id = 'delete-local-storage';
    deleteLocalStorageButton.textContent = 'Delete Local Storage';
    document.body.prepend(deleteLocalStorageButton);

    deleteLocalStorageButton.addEventListener('click', () => {
      localStorage.removeItem('quests');
      window.location.reload();
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  loadQuestsFromLocalStorage();
  form.addEventListener('submit', onSubmitForm);
  questList.addEventListener('click', onClickQuestList);
  checkForLocalStorageDeleteButton();
});
