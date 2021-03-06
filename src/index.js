import './meyerreset.css';
import './style.css';
import { format } from 'date-fns';

const todoFactory = (name, notes, dueDate, list, duration, priority, id, completed) => {
  const startDate = new Date(Date.now());
  completed = completed || false;
  // dueDate = todoFactoryFns.unparseDate(dueDate);
  return {name, notes, dueDate, list, duration, priority, id, startDate, completed};
};

const todoFactoryFns = (() => {
  const unparseDate = (date) => {
    if (typeof date == 'string') {
      return new Date(date);
    }
    else {
      return date;
    }
  }
  const getDueDateShorthand = (task) => {
    const now = new Date(Date.now());
    const unparsedDate = unparseDate(task.dueDate);
    const difference = (unparsedDate.getTime() - now.getTime()) / 1000 / 60 / 60 / 24;
    if (difference < -0.9) {
      return 'Overdue'
    } else if (difference < 0.1) {
      return 'Today'
    } else if (difference < 1.1) {
      return 'Tomorrow'
    } else if (difference < 6.1) {
      return format(unparsedDate, 'EEEE')
    } else {
      return format(unparsedDate, 'MMM d')
    }
  };
  const getDueDateInputFormat = (task) => {
    if (task.dueDate) {
      const unparsedDate = unparseDate(task.dueDate);
      let month = unparsedDate.getMonth() + 1;
      if (month.toString().length == 1) {
        month = `0${month}`;
      }
      let formatted = `${unparsedDate.getFullYear()}-${month}-${unparsedDate.getDate()}`;
      return formatted;
    } else {
      return "";
    }
  }
  return { unparseDate, getDueDateShorthand, getDueDateInputFormat }
})();

const listFactory = (name, description, id) => {
  const todos = [];
  return {name, description, id, todos};
}

const listFactoryFns = (() => {
  const addTodo = (task, list) => {
    list.todos.push(task);
  }
  const removeTodo = (id, list) => {
    const index = getIndexFromId(id, list);
    list.todos.splice(index, 1);
  }
  const toggleCompleted = (id, list) => {
    const index = getIndexFromId(id, list);
    if (list.todos[index].completed == false) {
      list.todos[index].completed = true;
      return true;
    } else {
      list.todos[index].completed = false;
      return false;
    }
  }
  const getIndexFromId = (id, list) => {
    const index = list.todos.findIndex(todo => {
      if (todo.id == id) {
        return true;
      }
    });
    return index;
  }
  const getTaskFromId = (id, list) => {
    return list.todos[getIndexFromId(id, list)];
  }
  const getPercentCompleted = (list) => {
    let completedCount = 0;
    list.todos.forEach(todo => {
      if (todo.completed) completedCount ++;
    });
    return completedCount/list.todos.length;
  }
  return { addTodo, removeTodo, toggleCompleted, getIndexFromId, getTaskFromId, getPercentCompleted }
})();

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
  const addTask = ({name, notes, dueDate, list, duration, priority, completed}, targetList) => {
    const newTask = todoFactory(name, notes, dueDate, list, duration, priority, id, completed);
    listFactoryFns.addTodo(newTask, targetList);
    id ++;
  }
  const changeTask = ({name, notes, dueDate, list, duration, priority}, targetList, existingId) => {
    const newTask = todoFactory(name, notes, dueDate, list, duration, priority, id);
    newTask.completed = listFactoryFns.getTaskFromId(existingId, targetList).completed;
    targetList.todos[listFactoryFns.getIndexFromId(existingId, targetList)] = newTask;
    id ++;
  }
  const removeTask = (id, list) => {
    listFactoryFns.removeTodo(id, list);
    displayHandler.displayList(list);
  }
  const getId = () => {
    return id;
  }
  const setId = (newId) => {
    id = newId;
  }
  return {
    addTask,
    changeTask,
    removeTask,
    getId,
    setId,
  };
})();

const displayHandler = (() => {
  const addButton = document.querySelector('#add-task');
  addButton.addEventListener('click', () => {
    makeAddArea("add");
  });
  document.addEventListener('keydown', function(e) {
    if (e.shiftKey && e.key == 'N') {
      if (document.querySelector('.add-area') == null) {
        e.preventDefault();
        makeAddArea("add");
      }
    }
  });
  const newListButton = document.querySelector('.app-sidebar-footer');
  newListButton.addEventListener('click', () => {
    makeListModal('add');
  })

  const makeAddArea = (type, target) => {
    let id;
    if (target) {
      id = target.dataset.id;
    }
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
      
      const aDList = document.createElement('select');
      aDList.name = 'list';
      aDList.classList.add('a-d-list');

      let lists = database.getLists();
      lists.forEach(list => {
        const aDListInstance = document.createElement('option');
        aDListInstance.value = list.id;
        aDListInstance.innerText = list.name;
        aDListInstance.classList.add('a-d-list-instance');
        aDListInstance.dataset.id = list.id;
        aDList.appendChild(aDListInstance);
      });

      const aDPriority = document.createElement('select');
      aDPriority.name = 'priority';
      aDPriority.classList.add('a-d-priority');
      
      const aDPriorityLabel = document.createElement('option');
      aDPriorityLabel.value = "";
      aDPriorityLabel.innerText = "priority";
      aDPriorityLabel.disabled = true;
      aDPriorityLabel.selected = true;
      const aDPriorityNone = document.createElement('option');
      aDPriorityNone.value = "";
      aDPriorityNone.innerText = "none";
      const aDPriority1 = document.createElement('option');
      aDPriority1.value = "1"
      aDPriority1.innerText = "1";
      const aDPriority2 = document.createElement('option');
      aDPriority2.value = "2"
      aDPriority2.innerText = "2";
      const aDPriority3 = document.createElement('option');
      aDPriority3.value = "3"
      aDPriority3.innerText = "3";

      aDPriority.appendChild(aDPriorityLabel);
      aDPriority.appendChild(aDPriority1);
      aDPriority.appendChild(aDPriority2);
      aDPriority.appendChild(aDPriority3);
      aDPriority.appendChild(aDPriorityNone);

      const aDDuration = document.createElement('input');
      aDDuration.classList.add('a-d-duration');
      aDDuration.placeholder = 'duration';

      if (type == "edit") {
        const thisTodo = listFactoryFns.getTaskFromId(id, database.getCurrentList());
        aDName.value = thisTodo.name;
        aDNotes.value = thisTodo.notes || "";
        aDDate.value = todoFactoryFns.getDueDateInputFormat(thisTodo);
        aDList.value = "";
        aDPriority.value = thisTodo.priority || "";
        aDDuration.value = thisTodo.duration || "";
      }

      aDFooter.appendChild(aDDate);
      aDFooter.appendChild(aDList);
      aDFooter.appendChild(aDPriority);
      aDFooter.appendChild(aDDuration);
      addDialog.appendChild(aDName);
      addDialog.appendChild(aDNotes);
      addDialog.appendChild(aDFooter);
      addArea.appendChild(addDialog);

      if (type == "add") {
        const addTaskBtn = document.createElement('button');
        addTaskBtn.classList.add('add-task-btn');
        addTaskBtn.innerText = 'Add task';
        addTaskBtn.addEventListener('click', () => {
          addInputtedTask();
        });

        const cancelTaskBtn = document.createElement('button');
        cancelTaskBtn.classList.add('cancel-task-btn');
        cancelTaskBtn.innerText = 'Cancel';
        cancelTaskBtn.addEventListener('click', () => {
          removeAddArea();
        });

        addArea.appendChild(addTaskBtn);
        addArea.appendChild(cancelTaskBtn);

        addArea.addEventListener('keydown', function(e) {
          if (e.key == 'Enter') {
            addInputtedTask();
          } else if (e.key == 'Escape') {
            removeAddArea();
          }
        });

        document.querySelector('.list-items').appendChild(addArea);

      } else if (type == "edit") {
        const changeTaskBtn = document.createElement('button');
        changeTaskBtn.classList.add('change-task-btn');
        changeTaskBtn.innerText = 'Save changes';
        changeTaskBtn.addEventListener('click', () => {
          changeInputtedTask();
        });

        const cancelTaskBtn = document.createElement('button');
        cancelTaskBtn.classList.add('cancel-task-btn');
        cancelTaskBtn.innerText = 'Cancel';
        cancelTaskBtn.addEventListener('click', () => {
          removeAddArea();
          target.classList.remove('hidden');
        });

        addArea.appendChild(changeTaskBtn);
        addArea.appendChild(cancelTaskBtn);

        addArea.addEventListener('keydown', function(e) {
          if (e.key == 'Enter') {
            changeInputtedTask();
          } else if (e.key == 'Escape') {
            removeAddArea();
            target.classList.remove('hidden');
          }
        });

        document.querySelector('.list-items').insertBefore(addArea, target);
      }

      const listInstances = document.querySelectorAll('.a-d-list-instance');
      listInstances.forEach(listInstance => {
        if (listInstance.dataset.id == database.getCurrentList().id) {
          listInstance.selected = true;
        }
      });

      aDName.focus();

      const addInputtedTask = () => {
        if (validation.validateInput(aDName.value, aDNotes.value, aDDate.value, aDList.value, aDPriority.value, aDDuration.value)) {
          taskHandler.addTask(exportTaskInput(), database.getLists()[database.getListIndexFromId(aDList.value)]);
          displayList(database.getCurrentList());
        }
      }
      const changeInputtedTask = () => {
        if (validation.validateInput(aDName.value, aDNotes.value, aDDate.value, aDList.value, aDPriority.value, aDDuration.value)) {
          let completed = listFactoryFns.getTaskFromId(id, database.getCurrentList()).completed;
          if (aDList.value != database.getCurrentList().id) {
            taskHandler.removeTask(id, database.getCurrentList());
            taskHandler.addTask(exportTaskInput(completed), database.getLists()[database.getListIndexFromId(aDList.value)]);
          } else {
            taskHandler.changeTask(exportTaskInput(completed), database.getCurrentList(), id);
            displayList(database.getCurrentList());
          }
          // removeAddArea(); - not necessary because it's taken out with clearList
        }
      }
      const exportTaskInput = (completed) => {
        const name = aDName.value;
        const notes = aDNotes.value;
        let dueDate = null;
        if (aDDate.value) {
          dueDate = new Date(convertDateString(aDDate.value));
        }
        const list = aDList.value;
        const priority = aDPriority.value;
        const duration = validation.convertDuration(aDDuration.value);
        return {name, notes, dueDate, list, duration, priority, completed};
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
  const makeListModal = (type, target) => {
    const listModal = document.createElement('div');
    listModal.classList.add('list-modal');
    const listModalContent = document.createElement('div');
    listModalContent.classList.add('list-modal-content');
    const listModalPrompt = document.createElement('h2');
    listModalPrompt.classList.add('list-modal-prompt');
    const listModalName = document.createElement('input');
    listModalName.classList.add('list-modal-name');
    listModalName.placeholder = 'Name';
    const listModalDescription = document.createElement('textarea');
    listModalDescription.classList.add('list-modal-description');
    listModalDescription.placeholder = 'Description';
    const listModalButtons = document.createElement('div');
    listModalButtons.classList.add('list-modal-buttons');
    const listModalButton = document.createElement('button');
    listModalButton.classList.add('list-modal-button');
    const listModalCancelButton = document.createElement('button');
    listModalCancelButton.classList.add('list-modal-cancel-button');
    if (type == "add") {
      listModalPrompt.innerText = 'New List';
      listModalButton.innerText = 'Create';
      listModalButton.addEventListener('click', () => {
        addListFromModal();
      });
      listModalCancelButton.innerText = 'Cancel';
      listModalCancelButton.addEventListener('click', () => {
        removeListModal();
      });
      listModal.addEventListener('keydown', function(e) {
        if (e.key == 'Enter') {
          addListFromModal();
        } else if (e.key == 'Escape') {
          removeListModal();
        }
      });
    }
    else if (type == "edit") {
      listModalPrompt.innerText = 'Edit List';
      listModalButton.innerText = 'Confirm';
      listModalCancelButton.innerText = 'Cancel';
      listModalCancelButton.addEventListener('click', () => {
        removeListModal();
      });
      listModalName.value = database.getLists()[database.getListIndexFromId(target.dataset.id)].name;
      listModalDescription.value = database.getLists()[database.getListIndexFromId(target.dataset.id)].description || "";
      listModalButton.addEventListener('click', () => {
        editListFromModal(target);
      });
      listModal.addEventListener('keydown', function(e) {
        if (e.key == 'Enter') {
          editListFromModal(target);
        } else if (e.key == 'Escape') {
          removeListModal();
        }
      });
    }




    const appContainer = document.querySelector('.app-container');

    listModalContent.appendChild(listModalPrompt);
    listModalContent.appendChild(listModalName);
    listModalContent.appendChild(listModalDescription);
    listModalButtons.appendChild(listModalButton);
    listModalButtons.appendChild(listModalCancelButton);
    listModalContent.appendChild(listModalButtons);
    listModal.appendChild(listModalContent);
    appContainer.appendChild(listModal);

    listModalName.focus();

    listModal.addEventListener('mousedown', function(e) {
      if (e.target == listModal) {
        listModal.remove();
      }
    });


    const addListFromModal = () => {
      if (listModalName.value) {
        database.addList(listModalName.value, listModalDescription.value);
        displayList(database.getCurrentList());
        displaySidebar();
        removeListModal();
      }
    }
    const editListFromModal = target => {
      if (listModalName.value) {
        database.getLists()[database.getListIndexFromId(target.dataset.id)].name = listModalName.value;
        database.getLists()[database.getListIndexFromId(target.dataset.id)].description = listModalDescription.value;
        displayList(database.getCurrentList());
        displaySidebar();
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
      });
      sidebarList.addEventListener('contextmenu', function(e) {
        displayListContextMenu(e);
        e.preventDefault();
      }, false);
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


    const appMainFooter = document.querySelector('.app-main-footer');

    listContentMain.appendChild(listItems);
    listContent.appendChild(listContentHeader);
    listContent.appendChild(listContentMain);
    appMain.insertBefore(listContent, appMainFooter);

    list.todos.forEach(task => {
      displayTask(task);
    })

    database.setLocalStorage();
  }
  const displayTask = task => {
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
      itemDueDate.innerText = todoFactoryFns.getDueDateShorthand(task);
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
    if (task.priority) {
      const itemPriority = document.createElement('div');
      itemPriority.classList.add('item-priority');
      itemPriority.innerText = `P${task.priority}`;
      itemPriority.dataset.id = task.id;
      if (task.priority == 1) itemPriority.classList.add('priority-1');
      else if (task.priority == 2) itemPriority.classList.add('priority-2');
      else if (task.priority == 3) itemPriority.classList.add('priority-3');
      itemDetails.appendChild(itemPriority);
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
    itemInfo.addEventListener('click', function(e) {
      if (document.querySelector('.add-area') == null) {
        getTargetListItem(e.target).classList.add('hidden');
        makeAddArea('edit', getTargetListItem(e.target));
      }
    });
    itemBox.addEventListener('click', function(e) {
      if (listFactoryFns.toggleCompleted(e.target.parentElement.dataset.id, database.getCurrentList())) {
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
      notesPopUp.innerText = listFactoryFns.getTaskFromId(thisTodoId, database.getCurrentList()).notes;

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
    let target = getTargetListItem(event.target);
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    const contextMenuEdit = document.createElement('div');
    contextMenuEdit.classList.add('context-menu-edit');
    contextMenuEdit.innerText = 'Edit';
    const contextMenuDelete = document.createElement('div');
    contextMenuDelete.classList.add('context-menu-delete');
    contextMenuDelete.innerText = 'Delete';

    contextMenuEdit.addEventListener('click', function(e) {
      target.classList.add('hidden');
      makeAddArea("edit", target);
    });
    contextMenuDelete.addEventListener('click', function(e) {
      taskHandler.removeTask(target.dataset.id, database.getCurrentList());
      contextMenu.remove();
    });

    contextMenu.appendChild(contextMenuEdit);
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
  const displayListContextMenu = (event) => {
    const existingContextMenu = document.querySelector('.context-menu');
    if (existingContextMenu != null) {
      existingContextMenu.remove();
    }

    let target = event.target;
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    const contextMenuEdit = document.createElement('div');
    contextMenuEdit.classList.add('context-menu-edit');
    contextMenuEdit.innerText = 'Edit';
    const contextMenuDelete = document.createElement('div');
    contextMenuDelete.classList.add('context-menu-delete');
    contextMenuDelete.innerText = 'Delete';

    contextMenuEdit.addEventListener('click', function(e) {
      makeListModal('edit', target);
      e.stopPropagation();
      contextMenu.remove();
    });
    contextMenuDelete.addEventListener('click', function(e) {
      database.removeList(target.dataset.id);
      displayList(database.getCurrentList());
      displaySidebar();
      contextMenu.remove();
    });

    contextMenu.appendChild(contextMenuEdit);
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
  }
  const getTargetListItem = target => {
    if (target.classList[0] != 'list-item') target = target.parentElement;
    if (target.classList[0] != 'list-item') target = target.parentElement;
    if (target.classList[0] != 'list-item') target = target.parentElement;
    return target;
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
  let lists = [];
  const addList = (name, description) => {
    const list = listFactory(name, description, id);
    lists.push(list);
    setCurrentList(id);
    id++;
    return list;
  }
  const removeList = id => {
    const index = getListIndexFromId(id);
    const removedList = lists.splice(index, 1);
    if (currentList == removedList[0]) currentList = lists[0];
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
  const setLocalStorage = () => {
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('currentList', JSON.stringify(currentList));
    localStorage.setItem('listId', id);
    localStorage.setItem('taskId', taskHandler.getId());
  }
  const getLocalStorage = () => {
    lists = JSON.parse(localStorage.getItem('lists'));
    setCurrentList(JSON.parse(localStorage.getItem('currentList')).id);
    id = localStorage.getItem('listId');
    taskHandler.setId(localStorage.getItem('taskId'));
  }

  return {
    getLists,
    getCurrentList,
    setCurrentList,
    getListIndexFromId,
    addList,
    removeList,
    setLocalStorage,
    getLocalStorage,
  }
})();

// localStorage.clear();

if (localStorage.getItem('lists')) {
  database.getLocalStorage();
} else {
  database.addList('Inbox');
  taskHandler.addTask({'name': `Add tasks with the + button or with [ Shift + N ].`}, database.getCurrentList());
  taskHandler.addTask({'name': `Click on a task to edit its contents.`, 'priority': '3', 'duration': '45min'}, database.getCurrentList());
  taskHandler.addTask({'name': `You can right-click a task or a list to edit or delete it.`}, database.getCurrentList());
  taskHandler.addTask({'name': `Visit michaelbenzinger on GitHub`, 'dueDate': new Date(Date.now()), 'notes': "Thanks for using my app. You'll find my other projects on GitHub.", 'priority': '1'}, database.getCurrentList());

  database.addList('New List', 'You can add a description for your list by right-clicking its title in the sidebar.');
  taskHandler.addTask({'name': `Nothing to see here.`, 'notes': 'Nothing to see here, either.'}, database.getCurrentList());

  database.setCurrentList(0);
}

displayHandler.displayList(database.getCurrentList());
displayHandler.displaySidebar();