import { Trait } from "../Class/Entity";

export default class Go extends Trait{
    constructor() {
        super('go');

        this.dir = 0;
        this.speed = 12000;
    }

    update(entity, deltaTime) {
        entity.vel.x = this.speed * this.dir * deltaTime;
    }
}
