export default class Trait {
    constructor(name) {
        this.NAME = name;
    }

    update({ entity, deltaTime }) {
        console.warn('unhandled trait update');
    }

}

