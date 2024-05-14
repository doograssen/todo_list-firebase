import {
	ERRORS,
	INITIAL_FORM_STATE,
	SORT_INDEX,
} from '../utils/constants';
import { useState, useEffect } from 'react';
import {ref, onValue, push, set, remove} from 'firebase/database';
import {db} from '../firebase';

export const useStore = () => {
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [todoList, setTodoList] = useState([]);
	const [searchState, setSearchState] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [updatedItem, setUpdatedItem] = useState({});
	const [needUpdate, setNeedUpdate] = useState(false);
	const [isCreated, setIsCreated] = useState(false);
	const [isDeleted, setIsDeleted] = useState(false);
	const [isUpdated, setIsUpdated] = useState(false);
	const [sortStatus, setSortStatus] = useState('DEFAULT');

	const sortList = (list, index) => {
		list.sort((a, b) => (a.text < b.text ? index : index * -1));
		return list;
	};

	const responseToArray = (obj) => {
		let result = [];
		for (const [key, value] of Object.entries(obj)) {
			result.push({
				id: key,
				text: value.text});
		}
		return result;
	};

	const loaderStatus = () => {
		return isLoading || isCreated || isDeleted || isUpdated;
	};

	const postData = (data) => {
		setIsCreated(true);
		const todoListDbRef = ref(db, 'todos');

		push(todoListDbRef, {
			text: data,
		})
		.then((response) => {
			setIsCreated(false);
		});
	};

	const deleteData = (id) => {
		setIsDeleted(true);

		const itemDbRef = ref(db, 'todos/' + id);

		remove(itemDbRef)
		.then((response) => {
			console.log(response);
		})
		.finally(() => setIsDeleted(false));
	};

	const getTodoList = () => {
		const todoListDbRef = ref(db, 'todos');
		return onValue(todoListDbRef, (snapshot) => {
				let loadedTodos = snapshot.val() || {};
				loadedTodos = responseToArray(loadedTodos);
				loadedTodos = sortList(loadedTodos, SORT_INDEX[sortStatus]);
				if (searchState) {
					searchTask(formData.task, loadedTodos);
				}
				else {
					setTodoList(loadedTodos);
				}
				setIsLoading(false);
			});
	};

	useEffect(() => {
		return getTodoList();
		},[]);

	useEffect(() => {
		let loadedTodos = [...todoList];
		loadedTodos = sortList(loadedTodos, SORT_INDEX[sortStatus]);
		if (searchState && sortStatus !== 'DEFAULT') {
			searchTask(formData.task, loadedTodos);
		}
		else {
			getTodoList();
		}
	}, [sortStatus, searchState]);

	useEffect(() => {
		if (!updatedItem.id) return;
		setIsUpdated(true);
		const itemDbRef = ref(db, 'todos/' + updatedItem.id);
		set(itemDbRef, {
			text: updatedItem.text,
		})
		.then((response) => {
			setIsUpdated(false);
		});
	}, [needUpdate]);

	const addTask = (event) => {
		event.preventDefault();
		const currentState = { ...formData };
		if (!currentState.task.length) {
			currentState.error = ERRORS.EMPTY;
		} else if (currentState.task.length <= 3) {
			currentState.error = ERRORS.MIN_LENGTH;
		} else if (currentState.task.length > 30) {
			currentState.error = ERRORS.MAX_LENGTH;
		}
		if (!currentState.error) {
			setFormData({ ...currentState, task: '' });
			postData(currentState.task);
		} else {
			setFormData(currentState);
		}
	};

	const searchTask = (text, list) => {
		const result = list.filter((element) => {
			return element.text.includes(text);
		});
		if (!result.length) {
			setFormData({ ...formData, error: ERRORS.NO_RESULT });
		}
		else {
			setSearchState(true);
			setTodoList(result);
		}
	};

	const onSearch = (event) => {
		event.preventDefault();
		const currentState = { ...formData };
		if (!currentState.task.length) {
			currentState.error = ERRORS.EMPTY;
		}
		setFormData(currentState);
		if (!currentState.error) {
			searchTask(currentState.task, todoList);
		}
	};

	return {
		form: {
			getData: () => formData,
			setData: setFormData,
		},
		events: {
			add: addTask,
			search: onSearch,
			delete: deleteData,
		},
		getList: () => todoList,
		getStatus: (name) => {
			switch (name) {
				case 'search': return searchState;
				case 'sort': return sortStatus;
				case 'update': return needUpdate;
				default:
					return false;
			}
		},
		setNewItem: setUpdatedItem,
		setStatus: (name) => {
			switch (name) {
				case 'search': return setSearchState;
				case 'sort': return setSortStatus;
				case 'update': return setNeedUpdate;
				default:
					return undefined;
			}
		},
		getLoader: loaderStatus,
	};
};
