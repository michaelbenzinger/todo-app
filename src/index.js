import './meyerreset.css';
import './style.css';
import { format } from 'date-fns';

const todoFactory = (name, notes, dueDate, list, duration, priority, id) => {
  const startDate = new Date(Date.now());
  let completed = false;
  return {name, notes, dueDate, list, duration, priority, id, startDate, completed};
};

const listFactory = (name, description) => {
  const todos = [];
  const addTodo = (task) => {
    todos.push(task);
  }
  const removeTodo = id => {
    const index = getIndexFromId(id);
    todos.splice(index, 1);
  }
  const toggleCompleted = id => {
    const index = getIndexFromId(id);
    if (todos[index].completed == false) {
      todos[index].completed = true;
      return true;
    } else {
      todos[index].completed = false;
      return false;
    }
  }
  const getIndexFromId = id => {
    const index = todos.findIndex(todo => {
      if (todo.id == id) {
        return true;
      }
    });
    return index;
  }
  return {name, description, todos, addTodo, removeTodo, toggleCompleted};
}

const taskHandler = (() => {
  let id = 0;
  const addTask = ({name, notes, dueDate, list, duration, priority}, currentList) => {
    const newTask = todoFactory(name, notes, dueDate, list, duration, priority, id);
    currentList.addTodo(newTask);
    id ++;
  }
  const removeTask = (id, list) => {
    list.removeTodo(id);
    displayHandler.clearList();
    displayHandler.displayList(list);
  }
  const getId = () => {
    return id;
  }
  return {
    addTask,
    removeTask,
    getId
  };
})();

const displayHandler = (() => {
  const addButton = document.querySelector('#add-task');
  addButton.addEventListener('click', () => {
    makeAddArea();
  });
  document.addEventListener('keydown', function(e) {
    if (e.shiftKey && e.key == 'N') {
      if (document.querySelector('.add-area') == null) {
        e.preventDefault();
        makeAddArea();
      }
    }
  });

  const makeAddArea = () => {
    console.log(document.querySelector('.add-area'));
    if (document.querySelector('.add-area') != null) {
      return false;
    } else {
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
        addInputtedTask();
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

      addArea.addEventListener('keydown', function(e) {
        if (e.key == 'Enter') {
          addInputtedTask();
        } else if (e.key == 'Escape') {
          removeAddArea();
        }
      });

      document.querySelector('.list-content-main').appendChild(addArea);

      aDName.focus();

      const addInputtedTask = () => {
        if (aDName.value != "") {
          taskHandler.addTask(exportTaskInput(), database.getCurrentList());
          clearList();
          displayList(database.getCurrentList());
          removeAddArea();
        }
      }
      const exportTaskInput = () => {
        const name = aDName.value;
        const notes = aDNotes.value;
        const dueDate = aDDate.value;
        const list = aDList.value;
        const priority = aDPriority.value;
        const duration = aDDuration.value;
        return {name, notes, dueDate, list, duration, priority};
      }
      return true;
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
    listItem.dataset.id = task.id;
    const itemBox = document.createElement('div');
    itemBox.classList.add('list-item-box');
    const itemName = document.createElement('div');
    itemName.classList.add('item-name');
    itemName.innerText = task.name;
    listItem.appendChild(itemBox);
    listItem.appendChild(itemName);
    listItems.appendChild(listItem);

    if (task.completed == true) {
      listItem.classList.add('list-item-completed');
    }

    listItem.addEventListener('contextmenu', function(e) {
      displayItemContextMenu(e);
      e.preventDefault();
    }, false);
    itemBox.addEventListener('click', function(e) {
      if (database.getCurrentList().toggleCompleted(e.target.parentElement.dataset.id)) {
        itemBox.parentElement.classList.add('list-item-completed');
      } else {
        itemBox.parentElement.classList.remove('list-item-completed');
      }
    });
  }
  const displayItemContextMenu = (event) => {
    const existingContextMenu = document.querySelector('.context-menu');
    if (existingContextMenu != null) {
      existingContextMenu.remove();
    }
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
      console.log('You are deleting ' + target.dataset.id);
      taskHandler.removeTask(target.dataset.id, database.getCurrentList());
      contextMenu.remove();
    });

    contextMenu.appendChild(contextMenuDelete);
    target.parentElement.appendChild(contextMenu);

    const rect = target.parentElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    document.addEventListener('click', function(e) {
      if (e.target != contextMenu) {
        contextMenu.remove();
      }
    });

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
  taskHandler.addTask({'name': `Book flights`}, currentList);
  taskHandler.addTask({'name': `Read about the metro`}, currentList);
  taskHandler.addTask({'name': `Borrow Sarah's travel guide`}, currentList);
  taskHandler.addTask({'name': `Book a hotel room`}, currentList);
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