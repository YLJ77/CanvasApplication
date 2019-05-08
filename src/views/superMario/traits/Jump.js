import { Trait } from "../Class/Entity";

export default class Jump extends Trait{
    constructor() {
        super('jump');

        this.ready = 0;
        this.duration = 0.5;
        this.velocity = 400;
        this.engageTime = 0;
    }

    get falling() {
        return this.ready < 0;
    }

    start() {
        if (this.ready > 0) {
            this.engageTime = this.duration;
        }
    }

    cancel() {
        this.engageTime = 0;
    }

    obstruct(entity, side) {
        if (side === 'bottom') {
            this.ready = 1;
        } if (side === 'top') {
            this.cancel();
        }
    }

    update(entity, deltaTime) {
        if (this.engageTime > 0) {
            entity.vel.y = -this.velocity;
            this.engageTime -= deltaTime;
        }
        this.ready--;
    }
}
