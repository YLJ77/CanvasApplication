export function loadImage(src) {
    return new Promise(resolve => {
        let image = new Image();
        image.src = src;
        image.onload = () => {
            resolve(image);
        }
    });
}

export function loadLevel(name) {
    return fetch(`/levels/${name}.json`)
        .then(r => r.json());
}
