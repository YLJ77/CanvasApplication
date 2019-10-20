const PRESSED = 1;
const RELEASED = 0;
export default class Keyboard {
    constructor() {
        // Holds the current state of a given key
        this.keyStates = new Map();

        // Holds the callback functions for a key code
        this.keyMap = new Map();
    }

    addMapping({ keyCode, callback }) {
        this.keyMap.set(keyCode, callback);
    }

    handleEvent(e) {
        const { keyCode } = e;
        const keyState = event.type === 'keydown' ? PRESSED : RELEASED;
        e.preventDefault();
        if (!this.keyMap.has(keyCode)) return;
        if (this.keyStates.get(keyCode) === keyState) return;
        this.keyStates.set(keyCode, keyState);
        this.keyMap.get(keyCode)(keyState);
    }

    listenTo(window) {
        ['keydown', 'keyup'].forEach(eventName => {
           window.addEventListener(eventName, e => {
              this.handleEvent(e);
           });
        });
    }
}