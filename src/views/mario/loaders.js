export function loadImg(url) {
    const img = new Image();
    img.src = url;
    return new Promise(resolve => {
        img.addEventListener('load', () => {
            resolve(img);
        })
    });
}
export function loadJson({ url }) {
    return new Promise(resolve => {
        fetch(url).then(r => {
            resolve(r.json());
        });
    });
}
