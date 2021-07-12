import './meyerreset.css';
import './style.css';
import { format } from 'date-fns';

const todoFactory = (name, notes, dueDate, list, duration, priority) => {
  const startDate = new Date(Date.now());
  const completed = false;
  return {name, notes, dueDate, list, duration, priority, startDate, completed};
};

const listFactory = (name, description) => {
  const todos = [];
  const addTodo = (task) => {
    todos.push(task);
  }
  return {name, description, todos, addTodo};
}

const taskHandler = (() => {
  const addTask = ({name, notes, dueDate, list, duration, priority}) => {
    const newTask = todoFactory(name, notes, dueDate, list, duration, priority);
    database.getCurrentList().addTodo(newTask);
  };
  return {
    addTask,
  };
})();

const displayHandler = (() => {
  const addButton = document.querySelector('#add-task');
  addButton.addEventListener('click', () => {
    makeAddArea();
  });

  const makeAddArea = () => {
    const addArea = document.createElement('div');
    addArea.classList.add('add-area');

    const addDialog = document.createElement('div');
    addDialog.classList.add('add-dialog');

    const aDName = document.createElement('input');
    aDName.classList.add('a-d-name');
    aDName.autocomplete = 'chrome-off';
    aDName.placeholder = 'Name';

    const aDNotes = document.createElement('textarea');
    aDNotes.classList.add('a-d-notes');
    aDNotes.placeholder = 'Notes'
    aDNotes.maxLength = '200';

    const aDFooter = document.createElement('div');
    aDFooter.classList.add('a-d-footer');

    const aDDate = document.createElement('input');
    aDDate.classList.add('a-d-date');
    aDDate.type = 'date';
    
    const aDList = document.createElement('input');
    aDList.classList.add('a-d-list');
    aDList.placeholder = 'list';

    const aDPriority = document.createElement('input');
    aDPriority.classList.add('a-d-priority');
    aDPriority.placeholder = 'priority';

    const aDDuration = document.createElement('input');
    aDDuration.classList.add('a-d-duration');
    aDDuration.placeholder = 'duration';

    const addTaskBtn = document.createElement('button');
    addTaskBtn.classList.add('add-task-btn');
    addTaskBtn.innerText = 'Add task';
    addTaskBtn.addEventListener('click', () => {
      // console.log(getTaskFromInput());
      taskHandler.addTask(exportTaskInput());
      clearList();
      displayList(database.getCurrentList());
      removeAddArea();
    });

    const cancelTaskBtn = document.createElement('button');
    cancelTaskBtn.classList.add('cancel-task-btn');
    cancelTaskBtn.innerText = 'Cancel';
    cancelTaskBtn.addEventListener('click', () => {
      removeAddArea();
    });

    aDFooter.appendChild(aDDate);
    aDFooter.appendChild(aDList);
    aDFooter.appendChild(aDPriority);
    aDFooter.appendChild(aDDuration);
    addDialog.appendChild(aDName);
    addDialog.appendChild(aDNotes);
    addDialog.appendChild(aDFooter);
    addArea.appendChild(addDialog);
    addArea.appendChild(addTaskBtn);
    addArea.appendChild(cancelTaskBtn);

    document.querySelector('.list-content-main').appendChild(addArea);

    aDName.focus();

    const exportTaskInput = () => {
      const name = aDName.value;
      const notes = aDNotes.value;
      const dueDate = aDDate.value;
      const list = aDList.value;
      const priority = aDPriority.value;
      const duration = aDDuration.value;
      return {name, notes, dueDate, list, duration, priority};
    }
  }
  const removeAddArea = () => {
    const addArea = document.querySelector('.add-area');
    addArea.remove();
  }
  const clearList = () => {
    const listArea = document.querySelector('.list-items');
    listArea.remove();
  }
  const displayList = list => {
    const listContentMain = document.querySelector('.list-content-main');
    const listItems = document.createElement('div');
    listItems.classList.add('list-items')
    listContentMain.appendChild(listItems);
    list.todos.forEach(task => {
      displayTask(task);
    })
  }
  const displayTask = task => {
    const listItems = document.querySelector('.list-items');
    const listItem = document.createElement('div');
    listItem.classList.add('list-item');
    const itemBox = document.createElement('div');
    itemBox.classList.add('list-item-box');
    const itemName = document.createElement('span');
    itemName.innerText = task.name;
    listItem.appendChild(itemBox);
    listItem.appendChild(itemName);
    listItems.appendChild(listItem);

    listItem.addEventListener('contextmenu', function(e) {
      displayItemContextMenu(e);
      e.preventDefault();
    }, false);
  }
  const displayItemContextMenu = (event) => {
    // Select the list-item element, not the checkbox or the task name span
    let target = event.target;
    if (target.classList[0] != 'list-item') target = target.parentElement;
    // console.log(target.classList[0]);
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    const contextMenuDelete = document.createElement('div');
    contextMenuDelete.classList.add('context-menu-delete');
    contextMenuDelete.innerText = 'Delete';

    contextMenuDelete.addEventListener('click', function(e) {
      console.log('You are deleting ' + target.childNodes[1].innerText);
      contextMenu.remove();
    });

    contextMenu.appendChild(contextMenuDelete);
    target.parentElement.appendChild(contextMenu);

    const rect = target.parentElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    // contextMenu.style.bottom = `${-y + contextMenu.offsetHeight/4}px`;
    // contextMenu.style.left = `${x - contextMenu.offsetWidth/2}px`;
  }
  return {
    clearList,
    displayList,
    displayTask,
    makeAddArea,
  }
})();

const database = (() => {
  let currentList = listFactory('Inbox', 'Description of inbox');
  currentList.addTodo(todoFactory(`Book flights`));
  currentList.addTodo(todoFactory(`Read about the metro`));
  currentList.addTodo(todoFactory(`Borrow Sarah's travel guide`));
  currentList.addTodo(todoFactory(`Book a hotel room`));
  const getCurrentList = () => {
    return currentList;
  }
  displayHandler.displayList(currentList);
  return {
    getCurrentList,
  }
})();



//testing

// const sampleTodo = todoFactory('Power adapter', 'Buy from Ace Hardware', new Date(2021, 6, 15));
// const sampleList = listFactory('Vacation in Rome', `We'll go from June 14-22 and stop through London on the way back to visit Jane and Paolo. Monti looks like a great place to stay. Maybe do a night out in Trastevere.`);

// console.log({sampleTodo});
// console.log({sampleList});

// sampleList.addTodo(sampleTodo);
// sampleList.addTodo(sampleTodo);

// console.log({sampleList});