// app.js

// Getting references to DOM elements
const form = document.querySelector('#user-form');
const userNameInput = document.querySelector('#user-name');
const questsContainer = document.querySelector('.quests-container');
const questList = document.querySelector('#quest-list');
const completedQuests = document.querySelector('#completed-quests');
const container = document.querySelector('main.container');
const messageDisplay = document.querySelector('#messages');
const fireworkContainers = document.querySelectorAll('.firework-container');

// connect to the API
const API_ENDPOINT = 'https://data.rarepepes.com/items/jquest_quests';

function welcomeUser(userName) {
    form.style.display = 'none';
}

function displayMessage(index) {
    messageDisplay.textContent = messages[index];
}

function createQuest(quest) {
    // console.log(quest);
    const questItem = document.createElement('li');
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = quest.completed;
    
    const questTitle = document.createElement('span');
    questTitle.textContent = quest.name;
    
    questItem.appendChild(checkBox);
    questItem.appendChild(questTitle);
    console.log(quest.completed)
    quest.completed ? completedQuests.appendChild(questItem) : questList.appendChild(questItem);
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

function loadQuestsFromLocalStorage() {
    const savedData = localStorage.getItem('real-life-quest-app');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.userName) {
            questsContainer.classList.remove('hidden');
        }
        welcomeUser(data.userName);
        data.quests.forEach((quest, index) => {
            // createQuest(quest.title, quest.completed, index);
        });
        if (data.quests.some(quest => quest.completed)) {
            displayMessage(2);
        } else {
            displayMessage(1);
        }
    } else {
        createQuest({'name':'First Quest', 'completed':false, 'index':0});
        createQuest({'name':'Second Quest', 'completed':false, 'index':0});
        displayMessage(0);
    }
}

function onSubmitForm(e) {
    e.preventDefault();
    welcomeUser(userNameInput.value);
    localStorage.setItem('real-life-quest-app', JSON.stringify({
        userName: userNameInput.value,
        quests: getQuests()
    }));
    displayMessage(1);
    questsContainer.classList.remove('hidden');
    addFireworks();
    saveToCloud();
}

function onClickQuestList(e) {
    if (e.target.tagName === 'INPUT') {
        const checkBox = e.target;
        const questItem = checkBox.parentElement;
        const questTitle = questItem.querySelector('span');
        
        addFireworks();
        
        if (checkBox.checked) {
            questTitle.classList.add('completed');
            completedQuests.appendChild(questItem);
            saveToCloud();
            
            // check if it's the first completed quest and display the message
            const quests = JSON.parse(localStorage.getItem('real-life-quest-app'));
            if (!quests.quests.some(quest => quest.completed)) {
                displayMessage(2);
            }
        } else {
            questTitle.classList.remove('completed');
            questList.appendChild(questItem);
        }
        
        const quests = JSON.parse(localStorage.getItem('real-life-quest-app'));
        const quest = quests.quests.find(quest => quest.title === questTitle.textContent);
        quest.completed = checkBox.checked;
        localStorage.setItem('real-life-quest-app', JSON.stringify(quests));
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
            localStorage.clear();
            window.location.reload();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuestsFromLocalStorage();
    form.addEventListener('submit', onSubmitForm);
    questList.addEventListener('click', onClickQuestList);
    checkForLocalStorageDeleteButton();
});




window.onload = function() {
    console.log('onload we load all quests from the API');
    fetch(API_ENDPOINT)
    .then(response => response.json())
    .then(data => {
        const questsContainer = document.querySelector('.quests-container');
        
        // Iterate over each quest in the response
        data.data.forEach((quest, index) => {
            createQuest(quest);
        });
        
    })
    .catch(error => {
        console.error('Error:', error);
    });
};