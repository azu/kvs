export const kv = () => {
    return window.indexedDB.open("toDoList", 1);
};
