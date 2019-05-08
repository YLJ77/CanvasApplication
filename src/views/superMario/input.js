import Keyboard from './Class/KeyBoardState'

export function setupKeyboard(mario) {
    const SPACE = 'Space';
    const RIGHT = 'ArrowRight';
    const LEFT = 'ArrowLeft';
    const UP = 'ArrowUp';
    const input = new Keyboard();
    input.addMapping(SPACE, keyState => {
        if (keyState) {
            mario.jump.start();
        } else {
            mario.jump.cancel();
        }
    });
    input.addMapping(RIGHT, keyState => {
        mario.go.dir += keyState ? 1 : -1;
    });
    input.addMapping(LEFT, keyState => {
        mario.go.dir += -keyState ? -1 : 1;
    });
    input.addMapping(UP, keyState => {
        mario.turbo(keyState);
    });
    return input;
}