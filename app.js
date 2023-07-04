const config = {
    // eventName: 'fgm_6_30_23',
    // eventName: 'castle_graymarsh_7_3_23',
    eventName: 'schnaars_estate_7_4_23',
}

function eventThemeSetup() {
    const event_data = 
        {
            'fgm_6_30_23': {
                'logo': './img/logo-smug-pepe-all-ccff00.png',
                'subtitle': 'At Feels Good Manor',
                'location': 'Feels Good Manor',
                'date': 'June 30, 2023',
                'color': 'rgb(16,185,129)',
                'icon': ''
            },
            'fgm_7_1_23': {
                'logo': './img/logo-smug-pepe-all-ccff00.png',
                'subtitle': 'At Feels Good Manor',
                'location': 'Feels Good Manor',
                'date': 'July 1, 2023',
                'color': 'rgb(16,185,129)',
                'icon': ''
            },
            'castle_graymarsh_7_3_23': {
                'logo': './img/castle.webp',
                'subtitle': 'At Castle Graymarsh',
                'location': 'Castle Graymarsh',
                'date': 'July 3, 2023',
                'color': 'rgb(116, 119, 145)',
                'icon': ''
            },
            'disc_golf_7_2_23': {
                'logo': './img/castle.webp',
                'subtitle': 'We manipulate reality.',
                'location': 'Boyertown Park Disc Golf Course',
                'date': 'July 2, 2023',
                'color': 'rgb(116, 119, 145)',
                'icon': ''
            },
            'dmig_7_2_23': {
                'logo': './img/castle.webp',
                'subtitle': 'Game of Boards',
                'location': 'Deal Me In Games',
                'date': 'July 3, 2023',
                'color': 'rgb(116, 119, 145)',
                'icon': ''
            },
            'schnaars_estate_7_4_23': {
                'logo': './img/castle.webp',
                'subtitle': 'Schnaars in Charge',
                'location': 'Schnaars Estate',
                'date': 'July 4, 2023',
                'color': 'rgb(116, 119, 145)',
                'icon': ''
            }
        }

    document.body.classList.add(config.eventName);
    document.addEventListener('DOMContentLoaded', () => {
        const logo = document.querySelector('img#logo');
        const subtitle = document.querySelector('h2#subtitle');
        logo.src = event_data[config.eventName].logo;
        subtitle.textContent = event_data[config.eventName].subtitle;
    });
    return event_data;
}
const eventContent = eventThemeSetup();

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

function createQuest(quest, eventName) {
    console.log(quest); // Log the quest object

    // if (eventContent[eventName].location===undefined) {
    //     eventContent[eventName].location = "General";  // assigning a default value if location is undefined
    // }
    // Find quest in completedQuests and check if it is completed
    let completedQuestItem = quests.userProfile.completedQuests.find(item => item.questId === quest.id);
    console.log(eventContent[eventName].location);
    let eventLocation = eventContent[eventName].location;
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
                    <div class="gold text-yellow-300">Gold ${quest.gold}</div> <!-- Add this line -->
                </div>
                <div class="description">${quest.description}</div>
                <div class="completed-time">${quest.completed ? 'Completed at ' + new Date(quest.completed).toLocaleString() : ''}</div>
            </div>
        </div>
    </li>
    `;

    // Find or create the UL element for this event_name
    let eventUl = questList.querySelector(`ul[data-event-name="${eventName}"]`);
    if (!eventUl) {
        eventUl = document.createElement('ul');
        eventUl.dataset.eventName = eventName;
        eventUl.innerHTML = `<h2>${eventLocation}</h2>`;
        questList.appendChild(eventUl);
    }

    // Add the quest to the correct UL element
    eventUl.insertAdjacentHTML('beforeend', questItemHTML);
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
                updateStatsDisplay();
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

function updateStatsDisplay() {
    const totalExperienceElement = document.querySelector('#total-experience .value');
    const totalGoldElement = document.querySelector('#total-gold .value');
    const totalLevelElement = document.querySelector('#total-level .value');
    const totalHealthElement = document.querySelector('#total-health .value');
    const totalManaElement = document.querySelector('#total-mana .value');

    if (totalExperienceElement.classList.contains('hidden')) {
        totalExperienceElement.classList.remove('hidden');
    }
    totalExperienceElement.innerHTML = `<span class="value">${quests.userProfile.level}</span>`;
    totalExperienceElement.innerHTML = `<span class="value">${quests.userProfile.experience}</span>
    `;
    totalGoldElement.innerHTML = `<span class="value">${quests.userProfile.gold}</span>`;
    
    totalHealthElement.innerHTML = `<span class="value">${quests.userProfile.health}</span>`;
    totalManaElement.innerHTML = `<span class="value">${quests.userProfile.mana}</span>`;
}


function updateMessageDisplay(quest) {
    messageDisplay.innerHTML = quest.success_content; 
}

async function updateUserProfile() {
    const userData = {
        username: quests.userProfile.username,
        experience: quests.userProfile.experience,
        gold: quests.userProfile.gold,
        level: quests.userProfile.level,
        health: quests.userProfile.health,
        mana: quests.userProfile.mana,
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
    return fetch(`${API_ENDPOINT}jquest_quests`)
    .then(response => response.json())
    .then(data => {
        // Create an object where the keys are event_names, and the values are arrays of quests.
        let questsByEvent = data.data.reduce((groups, quest) => {
            let group = (groups[quest.event_name] = groups[quest.event_name] || []);
            group.push(quest);
            return groups;
        }, {});

        // Now, questsByEvent is an object where the keys are event_names, and the values are arrays of quests.
        // For each array of quests, we want to sort the quests by order or date created.
        for (let event_name in questsByEvent) {
            questsByEvent[event_name].sort((a, b) => b.order - a.order);
        }

        // Store the organized quests in the quests object
        quests.quests = questsByEvent;

        // Now, when we want to display quests, we can iterate through each event_name,
        // and for each event_name, iterate through each quest.
        
        for (let eventName in quests.quests) {
            for (let quest of quests.quests[eventName]) {
                createQuest(quest, eventName);
                
                // After creating the quest, if it's completed, move it to the completed quests section
                if (quest.completed) {
                    const questItem = questList.querySelector(`input[data-quest-id="${quest.id}"]`).closest('.quest-item');
                    completedQuests.appendChild(questItem);
                }
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
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
    let expElement = document.querySelector('#total-experience .value');
    let step = 5; // Define increment step
    if (newExp > oldExp) {
        for (let i = oldExp; i <= newExp; i += step) {
            expElement.innerHTML = `${i}`;
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        // Ensure that the final value is displayed, even if the loop ends early due to the step size
        if (newExp % step !== 0) {
            expElement.innerHTML = `${newExp}`;
        }
    } else {
        expElement.innerHTML = `${newExp}`;
    }
}

async function animateGold(oldGold, newGold) {
    let totalGold = document.querySelector('#total-gold .value');
    let step = 5; // Define increment step
    if (newGold > oldGold) {
        for (let i = oldGold; i <= newGold; i += step) {
            totalGold.innerHTML = `${i}`;
            await new Promise(resolve => setTimeout(resolve, 2));
        }
        // Ensure that the final value is displayed, even if the loop ends early due to the step size
        if (newGold % step !== 0) {
            totalGold.innerHTML = `${newGold}`;
        }
    } else {
        totalGold.innerHTML = `
        <span class="ui-icon">
            <img src="./img/ui-icons/gold-coin-icon.png">
        </span>
        Gold: ${newGold}`;
    }
}

function showOverlay(quest) {
    const overlay = document.getElementById('overlay');
    const message = `
        <h2>Congratulations!</h2>
        <p>You have completed: <strong>${quest.name}</strong></p>
        <p>Experience gained: <strong>${quest.experience}</strong></p>
        <p>Gold earned: <strong>${quest.gold}</strong></p>
    `;
    overlay.innerHTML = message;
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 2000);
}


function flashMessage(message) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = message;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 5000);
    }, 5000);
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
            
            window.scrollTo(0, 0); // Scroll to top
            flashMessage(`
            <div>Quest Complete!</div>
            <div class="quest-completed-name">${quest.name}</div>
                
            <div>
                <span class="gain-xp">+<span class="ui-icon">&#9733;</span>${quest.experience}</span> XP
            </div>
            <div>
                <span class="gain-gold">+ <span class="ui-icon">
                    <img src="./img/ui-icons/gold-coin-icon.png">
                </span>${quest.gold}</span> Gold!
            </div>
            `);


            let oldExperience = quests.userProfile.experience; // Store the old experience
            quests.userProfile.experience += quest.experience; // Add quest experience to total
            animateExperience(oldExperience, quests.userProfile.experience); // Animate experience increment

            let oldGold = quests.userProfile.gold; // Store the old gold amount
            quests.userProfile.gold += quest.gold; // Add quest gold to total
            animateGold(oldGold, quests.userProfile.gold); // Animate gold increment

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
            const confirmation = confirm("Are you sure you want to delete local storage? This action can't be undone.");
            if (confirmation) {
                localStorage.removeItem('questsUserId');
                window.location.reload();
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    getUserProfile();
    form.addEventListener('submit', onSubmitForm);
    questList.addEventListener('click', onClickQuestList);
    localStorageDeleteButton();
});
