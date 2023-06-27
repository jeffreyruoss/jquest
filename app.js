document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#user-form');
  const userNameInput = document.querySelector('#user-name');
  const questList = document.querySelector('#quest-list');

  // Load data from localStorage if it exists
  const savedData = localStorage.getItem('real-life-quest-app');
  if (savedData) {
      const data = JSON.parse(savedData);
      userNameInput.value = data.userName;
      data.quests.forEach(quest => {
          createQuest(quest.title, quest.completed);
      });
  } else {
      // Add your quests here only if there is no saved data
      createQuest('First Quest');
      createQuest('Second Quest');
      //...
  }

  form.addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('real-life-quest-app', JSON.stringify({
          userName: userNameInput.value,
          quests: getQuests()
      }));
  });

  function createQuest(title, completed = false) {
      const questItem = document.createElement('div');
      const checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.checked = completed;
      checkBox.addEventListener('change', () => {
          localStorage.setItem('real-life-quest-app', JSON.stringify({
              userName: userNameInput.value,
              quests: getQuests()
          }));
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
