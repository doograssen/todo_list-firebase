import { initializeApp } from "firebase/app";
import {getDatabase} from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyAtJeip7ONTdgQvComDUE9gvqf8Zx9L9uQ",
  authDomain: "todo-list-190d1.firebaseapp.com",
  projectId: "todo-list-190d1",
  storageBucket: "todo-list-190d1.appspot.com",
  messagingSenderId: "719135356620",
  appId: "1:719135356620:web:2dd81cb2b3ddf01e7fb469",
	databaseURL: 'https://todo-list-190d1-default-rtdb.europe-west1.firebasedatabase.app/',
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
