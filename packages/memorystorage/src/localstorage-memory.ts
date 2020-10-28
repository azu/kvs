// another implements by https://github.com/gr2m/localstorage-memory/blob/master/lib/localstorage-memory.js
class LocalStorageMemory {
    cache: { [k: string]: string } = {};
    length = 0;
    getItem(key: string) {
        if (key in this.cache) {
            return this.cache[key];
        }
        return null;
    }
    setItem(key: string, value: string) {
        if (typeof value === "undefined") {
            this.removeItem(key);
        } else {
            if (!this.cache.hasOwnProperty(key)) {
                this.length++;
            }
            this.cache[key] = "" + value;
        }
    }
    removeItem(key: string) {
        if (this.cache.hasOwnProperty(key)) {
            delete this.cache[key];
            this.length--;
        }
    }
    key(index: any) {
        return Object.keys(this.cache)[index] || null;
    }
    clear() {
        this.cache = {};
        this.length = 0;
    }
}
export default new LocalStorageMemory();
