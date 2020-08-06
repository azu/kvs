export const kvstrage = () => {
    return window.indexedDB.open("toDoList", 1);
};
