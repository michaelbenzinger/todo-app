import './meyerreset.css';
import './style.css';
import { format } from 'date-fns';

const todoFactory = (name, notes, dueDate, list, duration, priority, id) => {
  const startDate = new Date(Date.now());
  let completed = false;
  const getDuedateShorthand = () => {
    const now = new Date(Date.now());
    const difference = (dueDate.getTime() - now.getTime()) / 1000 / 60 / 60 / 24;
    if (difference < -1) {
      return 'Overdue'
    } else if (difference < 0) {
      return 'Today'
    } else if (difference < 1) {
      return 'Tomorrow'
    } else if (difference < 6) {
      return format(dueDate, 'EEEE')
    } else {
      return format(dueDate, 'MMM d')
    }
  };
  const getDurationShorthand = () => {

  };
  return {name, notes, dueDate, list, duration, priority, id, startDate, completed, getDuedateShorthand, getDurationShorthand};
};

const listFactory = (name, description, id) => {
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
  const getTaskFromId = id => {
    return todos[getIndexFromId(id)];
  }
  const getPercentCompleted = () => {
    let completedCount = 0;
    todos.forEach(todo => {
      if (todo.completed) completedCount ++;
    });
    return completedCount/todos.length;
  }
  return {name, description, id, todos, addTodo, removeTodo, toggleCompleted, getTaskFromId, getPercentCompleted};
}

const validation = (() => {
  const validateInput = (name, notes, dueDate, list, priority, duration) => {
    return true;
  }
  const convertDuration = duration => {
    let convertedDuration = null;

    const runTestStrings = (input, testArray, addOn) => {
      testArray.forEach(testString => {
        if (input.endsWith(testString)) {
          let substring = parseFloat(input.substring(0,input.length-testString.length));
          if (Number.isFinite(substring) && substring >= 0) {
            convertedDuration = substring + addOn;
          }
        }
      });
    }

    runTestStrings(duration, ['m', 'min', 'minute', 'minutes'], 'min');
    runTestStrings(duration, ['h', 'hr', 'hrs', 'hour', 'hours'], 'hr');

    return convertedDuration;
  }
  return {
    validateInput,
    convertDuration,
  }
})();

const taskHandler = (() => {
  let id = 0;
  const addTask = ({name, notes, dueDate, list, duration, priority}, currentList) => {
    const newTask = todoFactory(name, notes, dueDate, list, duration, priority, id);
    currentList.addTodo(newTask);
    id ++;
  }
  const removeTask = (id, list) => {
    list.removeTodo(id);
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
  const newListButton = document.querySelector('.app-sidebar-footer');
  newListButton.addEventListener('click', () => {
    makeListModal();
  })

  const makeAddArea = () => {
    // console.log(document.querySelector('.add-area'));
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
        if (validation.validateInput(aDName.value, aDNotes.value, aDDate.value, aDList.value, aDPriority.value, aDDuration.value)) {
          taskHandler.addTask(exportTaskInput(), database.getCurrentList());
          displayList(database.getCurrentList());
          // removeAddArea(); - not necessary because it's taken out with clearList
        }
      }
      const exportTaskInput = () => {
        const name = aDName.value;
        const notes = aDNotes.value;
        let dueDate = null;
        if (aDDate.value) {
          dueDate = new Date(convertDateString(aDDate.value));
        }
        const list = aDList.value;
        const priority = aDPriority.value;
        const duration = validation.convertDuration(aDDuration.value);
        return {name, notes, dueDate, list, duration, priority};
      }
      const convertDateString = date => {
        let newDate = "";
        newDate += date.slice(5)
        newDate += "-";
        newDate += date.slice(0,4);
        return newDate;
      }
      return true;
    }
  }
  const removeAddArea = () => {
    const addArea = document.querySelector('.add-area');
    addArea.remove();
  }
  const makeListModal = () => {
    const listModal = document.createElement('div');
    listModal.classList.add('list-modal');
    const listModalContent = document.createElement('div');
    listModalContent.classList.add('list-modal-content');
    const listModalPrompt = document.createElement('h2');
    listModalPrompt.classList.add('list-modal-prompt');
    listModalPrompt.innerText = 'New List';
    const listModalName = document.createElement('input');
    listModalName.classList.add('list-modal-name');
    listModalName.placeholder = 'Name';
    const listModalDescription = document.createElement('textarea');
    listModalDescription.classList.add('list-modal-description');
    listModalDescription.placeholder = 'Description';
    const listModalButton = document.createElement('button');
    listModalButton.classList.add('list-modal-button');
    listModalButton.innerText = 'Create';

    listModalButton.addEventListener('click', () => {
      addTaskFromModal();
    });

    const appContainer = document.querySelector('.app-container');

    listModalContent.appendChild(listModalPrompt);
    listModalContent.appendChild(listModalName);
    listModalContent.appendChild(listModalDescription);
    listModalContent.appendChild(listModalButton);
    listModal.appendChild(listModalContent);
    appContainer.appendChild(listModal);

    listModalName.focus();

    listModal.addEventListener('click', function(e) {
      if (e.target == listModal) {
        listModal.remove();
      }
    });
    listModal.addEventListener('keydown', function(e) {
      if (e.key == 'Enter') {
        addTaskFromModal();
      } else if (e.key == 'Escape') {
        removeListModal();
      }
    });

    const addTaskFromModal = () => {
      if (listModalName.value) {
        database.addList(listModalName.value, listModalDescription.value);
        removeListModal();
      }
    }
  }
  const removeListModal = () => {
    const listModal = document.querySelector('.list-modal');
    listModal.remove();
  }
  const clearSidebar = () => {
    const appLists = document.querySelector('.app-lists');
    if (appLists) {
      appLists.remove();
    }
  }
  const displaySidebar = () => {
    clearSidebar();
    let lists = database.getLists();
    const appLists = document.createElement('div');
    appLists.classList.add('app-lists')
    lists.forEach(list => {
      const sidebarList = document.createElement('div');
      sidebarList.classList.add('sidebar-list');

      if (list.id == database.getCurrentList().id) {
        sidebarList.classList.add('sidebar-list-selected');
      }

      const sidebarListLeft = document.createElement('div');
      sidebarListLeft.classList.add('sidebar-list-left');
      const sidebarListProgress = document.createElement('div');
      sidebarListProgress.classList.add('sidebar-list-progress');
      const sidebarListTitle = document.createElement('div');
      sidebarListTitle.classList.add('sidebar-list-title');
      sidebarListTitle.innerText = list.name;

      sidebarListProgress.dataset.id = list.id;
      sidebarListTitle.dataset.id = list.id;
      sidebarListLeft.dataset.id = list.id;
      sidebarList.dataset.id = list.id;

      sidebarListLeft.appendChild(sidebarListProgress);
      sidebarListLeft.appendChild(sidebarListTitle);
      sidebarList.appendChild(sidebarListLeft);
      appLists.appendChild(sidebarList);

      sidebarList.addEventListener('click', function(e) {
        database.setCurrentList(e.target.dataset.id);
        displayList(database.getCurrentList());
        displaySidebar();
        // console.log(database.getCurrentList().getPercentCompleted());
      });
    });
    const appSidebar = document.querySelector('.app-sidebar');
    const appSidebarFooter = document.querySelector('.app-sidebar-footer');
    appSidebar.insertBefore(appLists, appSidebarFooter)
  }
  const clearList = () => {
    const listContent = document.querySelector('.list-content');
    if (listContent) {
      listContent.remove();
    }
  }
  const displayList = list => {
    clearList();
    const appMain = document.querySelector('.app-main');
    const listContent = document.createElement('div');
    listContent.classList.add('list-content');
    const listContentHeader = document.createElement('div');
    listContentHeader.classList.add('list-content-header');

    const currentList = database.getCurrentList();

    const listTitle = document.createElement('h1');
    listTitle.classList.add('list-title');
    listTitle.innerText = currentList.name;
    listContentHeader.appendChild(listTitle);

    if (currentList.description) {
      const listDescription = document.createElement('p');
      listDescription.classList.add('list-description');
      listDescription.innerText = currentList.description;
      listContentHeader.appendChild(listDescription);
    }

    const listContentMain = document.createElement('div');
    listContentMain.classList.add('list-content-main');
    const listItems = document.createElement('div');
    listItems.classList.add('list-items')


    listContentMain.appendChild(listItems);
    listContent.appendChild(listContentHeader);
    listContent.appendChild(listContentMain);
    appMain.appendChild(listContent);

    list.todos.forEach(task => {
      displayTask(task);
    })
  }
  const displayTask = task => {
    // console.log(task.dueDate);
    const listItems = document.querySelector('.list-items');
    const listItem = document.createElement('div');
    listItem.classList.add('list-item');
    listItem.dataset.id = task.id;

    const itemBox = document.createElement('div');
    itemBox.classList.add('list-item-box');
    itemBox.dataset.id = task.id;
    const itemInfo = document.createElement('div');
    itemInfo.classList.add('item-info');
    itemInfo.dataset.id = task.id;
    const itemName = document.createElement('div');
    itemName.classList.add('item-name');
    itemName.innerText = task.name;
    itemName.dataset.id = task.id;
    const itemDetails = document.createElement('div');
    itemDetails.classList.add('item-details');
    itemDetails.dataset.id = task.id;

    if (task.dueDate) {
      const itemDueDate = document.createElement('div');
      itemDueDate.classList.add('item-due-date');
      itemDueDate.innerText = task.getDuedateShorthand();
      itemDueDate.dataset.id = task.id;
      itemDetails.appendChild(itemDueDate);
    }
    if (task.duration) {
      const itemDuration = document.createElement('div');
      itemDuration.classList.add('item-duration');
      itemDuration.innerText = task.duration;
      itemDuration.dataset.id = task.id;
      itemDetails.appendChild(itemDuration);
    }
    if (task.notes) {
      const itemNotes = document.createElement('div');
      itemNotes.classList.add('item-notes');
      itemNotes.innerText = 'Notes';
      itemNotes.dataset.id = task.id;
      itemNotes.addEventListener('mouseover', function(e) {
        displayItemNotes(e);
      });
      itemNotes.addEventListener('mouseleave', function(e) {
        hideItemNotes(e);
      });
      itemDetails.appendChild(itemNotes);
    }

    itemInfo.appendChild(itemName);

    if (itemDetails.hasChildNodes()) { itemInfo.appendChild(itemDetails); }

    listItem.appendChild(itemBox);
    listItem.appendChild(itemInfo);
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
  const displayItemNotes = (event) => {
    const previousNotesPopUp = document.querySelector('.notes-pop-up');
    if (!previousNotesPopUp) {
      const notesPopUp = document.createElement('div');
      notesPopUp.classList.add('notes-pop-up');
      const listItems = document.querySelector('.list-items');
      listItems.appendChild(notesPopUp);
      const thisTodoId = event.target.parentElement.parentElement.parentElement.dataset.id;
      notesPopUp.innerText = database.getCurrentList().getTaskFromId(thisTodoId).notes;

      const targetRect = event.target.getBoundingClientRect();
      const notesRect = notesPopUp.getBoundingClientRect();
      const x = targetRect.left - notesRect.width/2 + targetRect.width/2;
      const y = targetRect.top + targetRect.height*1.5;
      
      notesPopUp.style.top = `${y}px`;
      notesPopUp.style.left = `${x}px`;
    }
  }
  const hideItemNotes = (event) => {
    const notesPopUp = document.querySelector('.notes-pop-up');
    if (notesPopUp) {
      notesPopUp.classList.add('notes-pop-up-leave');
      setTimeout(() => {
        notesPopUp.remove();
        // const notesPopUpAll = document.querySelectorAll('.notes-pop-up');
        // notesPopUpAll.forEach(note => {
        //   note.remove();
        // });
      }, 200);
    }
  }
  const displayItemContextMenu = (event) => {
    const existingContextMenu = document.querySelector('.context-menu');
    if (existingContextMenu != null) {
      existingContextMenu.remove();
    }
    // Select the list-item element, not the checkbox or the task name span
    let target = event.target;
    if (target.classList[0] != 'list-item') target = target.parentElement;
    if (target.classList[0] != 'list-item') target = target.parentElement;
    if (target.classList[0] != 'list-item') target = target.parentElement;
    // console.log(target.classList[0]);
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    const contextMenuDelete = document.createElement('div');
    contextMenuDelete.classList.add('context-menu-delete');
    contextMenuDelete.innerText = 'Delete';

    console.log(target);

    contextMenuDelete.addEventListener('click', function(e) {
      console.log("You are deleting " + target.dataset.id);
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
    clearSidebar,
    displaySidebar,
    displayList,
    displayTask,
    makeAddArea,
  }
})();

const database = (() => {
  let id = 0;
  let currentList = null;
  const lists = [];
  const addList = (name, description) => {
    const list = listFactory(name, description, id);
    lists.push(list);
    setCurrentList(id);
    id++;
    displayHandler.displayList(currentList);
    displayHandler.displaySidebar();
    return list;
  }
  const removeList = id => {
    const index = getListIndexFromId(id);
    lists.splice(index, 1);
  }
  const getListIndexFromId = id => {
    const index = lists.findIndex(list => {
      if (list.id == id) {
        return true;
      }
    });
    return index;
  }
  const getLists = () => {
    return lists;
  }
  const getCurrentList = () => {
    return currentList;
  }
  const setCurrentList = id => {
    currentList = lists[getListIndexFromId(id)];
    return currentList;
  }
  // let currentList = listFactory('Inbox', 'The best inbox ever');
  // addList('Today', "It's better than yesterday");
  // taskHandler.addTask({'name': `Book flights`, 'dueDate': new Date('07-13-2021'), 'notes': "I have literally written the longest note in the history of notes. If you wish to defeat me, you must challenge me to a note-making note-taking duel to the death."}, currentList);
  // taskHandler.addTask({'name': `Read about the metro`}, currentList);
  // taskHandler.addTask({'name': `Borrow Sarah's travel guide`, 'duration': '45min'}, currentList);
  // taskHandler.addTask({'name': `Book a hotel room`}, currentList);

  return {
    getLists,
    getCurrentList,
    setCurrentList,
    addList,
    removeList,
  }
})();

database.addList('Today', "It's better than yesterday");
taskHandler.addTask({'name': `Book flights`, 'dueDate': new Date('07-13-2021'), 'notes': "I have literally written the longest note in the history of notes. If you wish to defeat me, you must challenge me to a note-making note-taking duel to the death."}, database.getCurrentList());
taskHandler.addTask({'name': `Read about the metro`}, database.getCurrentList());
taskHandler.addTask({'name': `Borrow Sarah's travel guide`, 'duration': '45min'}, database.getCurrentList());
taskHandler.addTask({'name': `Book a hotel room`}, database.getCurrentList());

database.addList('Tomorrow');
taskHandler.addTask({'name': `Eat Macaroni`, 'dueDate': new Date(Date.now())}, database.getCurrentList());
taskHandler.addTask({'name': `Eat some cheese`, 'duration': '60min'}, database.getCurrentList());
taskHandler.addTask({'name': `Go to bed with a full stomach`, 'notes': 'Sweet dreams!'}, database.getCurrentList());

database.setCurrentList(0);

displayHandler.displayList(database.getCurrentList());
displayHandler.displaySidebar();

console.log(database.getCurrentList());

// setTimeout(() => {
//   displayHandler.clearSidebar();
// }, 2000)
//testing

// const sampleTodo = todoFactory('Power adapter', 'Buy from Ace Hardware', new Date(2021, 6, 15));
// const sampleList = listFactory('Vacation in Rome', `We'll go from June 14-22 and stop through London on the way back to visit Jane and Paolo. Monti looks like a great place to stay. Maybe do a night out in Trastevere.`);

// console.log({sampleTodo});
// console.log({sampleList});

// sampleList.addTodo(sampleTodo);
// sampleList.addTodo(sampleTodo);

// console.log({sampleList});