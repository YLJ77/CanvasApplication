export default class Timer {
    constructor({ deltaTime = 1/60, update }) {
        this.accumulatedTime = 0;
        this.lastTime = 0;
        this.deltaTime = deltaTime;
        this.update = update;
    }
    updateProxy(time) {
        let { lastTime, deltaTime } = this;
        this.accumulatedTime += (time - lastTime) / 1000;
        while (this.accumulatedTime > deltaTime) {
            this.update(deltaTime);
            this.accumulatedTime -= deltaTime;
        }
        this.start();
        this.lastTime = time;
    }
    start() {
        requestAnimationFrame(this.updateProxy.bind(this));
        // setTimeout(update, 1000/140, performance.now());
    }
}