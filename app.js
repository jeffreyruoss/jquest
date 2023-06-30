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
    userProfile: {
        userID: null,
        username: "",
        experience: 0,
        level: 1,
        health: 100,
        mana: 100,
        gold: 0,
        inventory: [],
        completedQuests: [],
    }
};

const API_ENDPOINT = 'https://data.rarepepes.com/items/';

function welcomeUser(userName) {
    form.style.display = 'none';
}

function displayMessage(index) {
    messageDisplay.textContent = messages[index];
}

function createQuest(quest, index) {
  
  if (quests.userProfile.completedQuests.includes(quest.id)) {
    // console.log(quest.name);
    // add to the completed list in the UI
    return;
  }

  const questItemHTML = `
  <li class="quest-item">
  <div class="input-column">
  <input type="checkbox" ${quest.completed ? 'checked' : ''} data-quest-id="${quest.id}">
  </div>
  <div class="details-column">
  <div class="quest-details">
  <div class="title-experience">
  <div class="title">${quest.name}</div>
  <div class="experience">XP ${quest.experience}</div>
  </div>
  <div class="description">${quest.description}</div>
  </div>
  </div>
  </li>
  `;
    
  quest.completed 
  ? completedQuests.insertAdjacentHTML('beforeend', questItemHTML) 
  : questList.insertAdjacentHTML('beforeend', questItemHTML);
}


function getUserProfile(userID) {
    if (localStorage.getItem('questsUserId')) {
        quests.userProfile.userID = JSON.parse(localStorage.getItem('questsUserId'));
        userID = quests.userProfile.userID;
        return new Promise((resolve, reject) => {
            fetch(API_ENDPOINT + 'jquest_user/' + userID)
            .then(response => response.json())
            .then(data => {
                questsContainer.classList.remove('hidden');
                form.classList.add('hidden');
                quests.userProfile.completedQuests = JSON.parse(data.data.completed_quests);
                quests.userProfile.experience = data.data.experience;
                quests.userProfile.gold = data.data.gold;
                quests.userProfile.health = data.data.health;
                quests.userProfile.inventory = data.data.inventory;
                quests.userProfile.level = data.data.level;
                quests.userProfile.mana = data.data.mana;
                getQuests();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    } else {
        // There is questUserId in local storage so this is a new user
        // So proceed to the form
    }
}

async function createUserProfile() {
    const userData = {
        username: userNameInput.value,
        experience: quests.userProfile.experience,
        level: quests.userProfile.level,
        health: quests.userProfile.health,
        mana: quests.userProfile.mana,
        gold: quests.userProfile.gold,
        inventory: quests.userProfile.inventory,
        completed_quests: quests.userProfile.completedQuests,
    };
    
    try {
        const response = await fetch(API_ENDPOINT + '/jquest_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        localStorage.setItem('questsUserId', JSON.stringify(data.data.id));
        quests.userProfile.userID = data.data.id;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateUserProfile() {
    const userData = {
        username: quests.userProfile.username,
        experience: quests.userProfile.experience,
        level: quests.userProfile.level,
        health: quests.userProfile.health,
        mana: quests.userProfile.mana,
        gold: quests.userProfile.gold,
        inventory: quests.userProfile.inventory,
        completed_quests: quests.userProfile.completedQuests,
    };
    
    try {
        const response = await fetch(`${API_ENDPOINT}jquest_user/${quests.userProfile.userID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        localStorage.setItem('questsUserId', JSON.stringify(data.data.id));
    } catch (error) {
        console.error('Error:', error);
    }
}

function getQuests() {
    return new Promise((resolve, reject) => {
        fetch(API_ENDPOINT + 'jquest_quests')
        .then(response => response.json())
        .then(data => {
            // Clear the quests array before adding new quests
            quests.quests = [];
            
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
            resolve();
        })
        .catch(error => {
            console.error('Error:', error);
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

function onSubmitForm(e) {
    e.preventDefault();
    createUserProfile();
    welcomeUser(userNameInput.value);
    getQuests().then(() => {
        quests.userProfile.username = userNameInput.value;
        displayMessage(1);
        questsContainer.classList.remove('hidden');
        addFireworks();
    });
}

function onClickQuestList(e) {
    if (e.target.tagName === 'INPUT') {
        const checkBox = e.target;
        const questItem = checkBox.closest('.quest-item'); // Update this line to find the closest parent element with class 'quest-item'
        const questTitleContainer = questItem.querySelector('.title'); // Update this line to select the element with class '.title'
        const questDescription = questItem.querySelector('.description');
        
        addFireworks();
        
        if (checkBox.checked) {
            questTitleContainer.classList.add('completed');
            let questId = checkBox.getAttribute('data-quest-id');
            questId = parseInt(questId);
            
            quests.userProfile.completedQuests.push(questId);
            console.log(quests.userProfile.completedQuests);
            updateUserProfile();
            
            completedQuests.appendChild(questItem);
            
            if (!quests.quests.some(quest => quest.completed)) {
                displayMessage(2);
            }
        } else {
            questTitleContainer.classList.remove('completed');
            questList.appendChild(questItem);
        }
        
        const quest = quests.quests.find(quest => quest.name === questTitleContainer.textContent); // Update this line to get the text content
        quest.completed = checkBox.checked;
    }
}

function localStorageDeleteButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === '1';
    if (window.location.hostname === 'localhost' || isDev) {
        const deleteLocalStorageButton = document.createElement('button');
        deleteLocalStorageButton.classList.add('bg-gray-300', 'hover:bg-gray-400', 'text-gray-800', 'font-bold', 'py-2', 'px-4', 'rounded', 'w-full');
        deleteLocalStorageButton.id = 'delete-local-storage';
        deleteLocalStorageButton.textContent = 'Delete Local Storage';
        document.body.prepend(deleteLocalStorageButton);
        
        deleteLocalStorageButton.addEventListener('click', () => {
            localStorage.removeItem('questsUserId');
            window.location.reload();
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    getUserProfile();
    form.addEventListener('submit', onSubmitForm);
    questList.addEventListener('click', onClickQuestList);
    localStorageDeleteButton();
});
