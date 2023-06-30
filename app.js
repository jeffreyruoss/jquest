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
    messageDisplay.html = messages[index];
}

function createQuest(quest) {
    // Find quest in completedQuests and check if it is completed
    let completedQuestItem = quests.userProfile.completedQuests.find(item => item.questId === quest.id);
    quest.completed = completedQuestItem ? completedQuestItem.completedAt : null;

    // quest.completed = quests.userProfile.completedQuests.includes(quest.id);
    const questItemHTML = `
    <li class="quest-item">
    <div class="input-column">
    <input type="checkbox" ${quest.completed ? 'checked' : ''} data-quest-id="${quest.id}">
    </div>
    <div class="details-column">
    <div class="quest-details">
    <div class="title-experience">
    <div class="title">${quest.name}</div>
    <div class="experience text-blue-300">XP ${quest.experience}</div>
    </div>
    <div class="description">${quest.description}</div>
    <!-- Add a new div for the completed timestamp -->
    <div class="completed-time">${quest.completed ? 'Completed at ' + new Date(quest.completed).toLocaleString() : ''}</div>
    </div>
    </div>
    </li>
    `;

    if (quest.completed) {
        completedQuests.insertAdjacentHTML('beforeend', questItemHTML);
    } else {
        questList.insertAdjacentHTML('beforeend', questItemHTML);
    }
}

function markAsCompleted(questItem, questId) {
    // Find the div for the completed time
    const completedTimeDiv = questItem.querySelector('.completed-time');

    // Update the completed time
    const completedTime = Date.now();
    completedTimeDiv.textContent = 'Completed at ' + new Date(completedTime).toLocaleString();

    // Update the quest object
    let questObject = quests.userProfile.completedQuests.find(item => item.questId === questId);
    questObject.completedAt = completedTime;
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
                // Get completed quests and sort by completed timestamp
                quests.userProfile.completedQuests = JSON.parse(data.data.completed_quests);
                quests.userProfile.completedQuests.sort((a, b) =>  b.completedAt - a.completedAt );

                quests.userProfile.experience = data.data.experience;
                quests.userProfile.gold = data.data.gold;
                quests.userProfile.health = data.data.health;
                quests.userProfile.inventory = data.data.inventory;
                quests.userProfile.level = data.data.level;
                quests.userProfile.mana = data.data.mana;
                getQuests();
                updateExperienceDisplay();
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

function updateExperienceDisplay() {
    const totalExperienceElement = document.querySelector('#total-experience');
    if (totalExperienceElement.classList.contains('hidden')) {
        totalExperienceElement.classList.remove('hidden');
    }
    totalExperienceElement.textContent = 'Experience Earned: ' + quests.userProfile.experience;
}

function updateMessageDisplay(quest) {
    messageDisplay.innerHTML = quest.success_content; 
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

async function getQuest(questId) {
    try {
        const response = await fetch(`${API_ENDPOINT}jquest_quests/${questId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data;  // If your API response structure has the quest data in data property
    } catch (error) {
        console.error('Error fetching success content:', error);
    }
}

function getQuests() {
    return new Promise((resolve, reject) => {
        fetch(API_ENDPOINT + 'jquest_quests')
        .then(response => response.json())
        .then(data => {
            // Clear the quests array before adding new quests
            quests.quests = [];
            
            // Sort quests by order field
            data.data.sort((a, b) => b.order - a.order);

            data.data.forEach((quest, index) => {
                createQuest(quest, index);
                // Add the quest to the global quests object
                quests.quests.push({
                    id: quest.id,
                    name: quest.name,
                    description: quest.description,
                    experience: quest.experience,
                    completed: quests.userProfile.completedQuests.includes(quest.id)
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

async function animateExperience(oldExp, newExp) {
    let expElement = document.getElementById('total-experience');
    let step = 5; // Define increment step
    if (newExp > oldExp) {
        for (let i = oldExp; i <= newExp; i += step) {
            expElement.textContent = `Experience Earned: ${i}`;
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        // Ensure that the final value is displayed, even if the loop ends early due to the step size
        if (newExp % step !== 0) {
            expElement.textContent = `Experience Earned: ${newExp}`;
        }
    } else {
        expElement.textContent = `Experience Earned: ${newExp}`;
    }
}

async function onClickQuestList(e) {
    if (e.target.tagName === 'INPUT') {
        const checkBox = e.target;
        const questItem = checkBox.closest('.quest-item'); 
        const questTitleContainer = questItem.querySelector('.title'); 
        const questDescription = questItem.querySelector('.description');

        addFireworks();

        if (checkBox.checked) {
            questTitleContainer.classList.add('completed');
            let questId = checkBox.getAttribute('data-quest-id');
            questId = parseInt(questId);

            const quest = await getQuest(questId); // Fetch quest content

            // Add the questId and the current timestamp
            quests.userProfile.completedQuests.push({ questId: questId, completedAt: Date.now() });

            let oldExperience = quests.userProfile.experience; // Store the old experience
            quests.userProfile.experience += quest.experience; // Add quest experience to total
            animateExperience(oldExperience, quests.userProfile.experience); // Animate experience increment

            updateMessageDisplay(quest);  // Update this line to get the description from the data
            // Mark quest as completed
            markAsCompleted(questItem, questId);

            updateUserProfile();

            completedQuests.appendChild(questItem);
        } else {
            questTitleContainer.classList.remove('completed');
            questList.appendChild(questItem);
        }

        const quest = quests.quests.find(quest => quest.name === questTitleContainer.textContent);
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
