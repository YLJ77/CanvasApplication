import Trait from './Trait'

export default class Velocity extends Trait {
    constructor() {
        super('velocity');
    }

    update({ entity, deltaTime }) {
        if (deltaTime > 0.1) return;
        entity.pos.x += entity.vel.x * deltaTime;
        entity.pos.y += entity.vel.y * deltaTime;
    }
}
