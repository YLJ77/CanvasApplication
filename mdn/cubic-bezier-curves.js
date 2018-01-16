function draw() {
    let canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        let points;
        let ctx = canvas.getContext('2d');
        let curPoint = [75, 40];
        ctx.beginPath();
        ctx.moveTo(...curPoint);
        points = [
            {
                controlPoint: [
                    [75, 37],
                    [70, 25]
                ],
                endPoint: [50, 25],
            },
            {
                controlPoint: [
                    [20, 25],
                    [20, 62.5]
                ],
                endPoint: [20, 62.5],
            },
            {
                controlPoint: [
                    [20, 80],
                    [40, 102]
                ],
                endPoint: [75, 120],
            },
            {
                controlPoint: [
                    [110, 102],
                    [130, 80]
                ],
                endPoint: [130, 62.5],
            },
            {
                controlPoint: [
                    [130, 62.5],
                    [130, 25]
                ],
                endPoint: [100, 25],
            },
            {
                controlPoint: [
                    [85, 25],
                    [75, 37]
                ],
                endPoint: [75, 40],
            },
        ]
        
        for (let item of points) {
            ctx.bezierCurveTo(...item.controlPoint[0], ...item.controlPoint[1], ...item.endPoint);
        }
        //ctx.fill();
        ctx.stroke();
        for (let i=0; i<points.length; i++) {
            curPoint = i === 0 ? curPoint : points[i -1].endPoint;
            drawGuide({
                ctx,
                curPoint: curPoint,
                endPoint: points[i].endPoint,
                controlPoint: points[i].controlPoint,
            });
        }
    }
}

function drawGuide({
    ctx,
    curPoint,
    endPoint,
    controlPoint,
    pointSize = 5,
    controlPointColor='red',
    pointColor='blue'
}) {
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(...curPoint);
    ctx.lineTo(...controlPoint[0]);
    ctx.moveTo(...endPoint);
    ctx.lineTo(...controlPoint[1]);
    //ctx.strokeStyle = 'pink';
    ctx.stroke();
    ctx.fillStyle = pointColor;
    ctx.fillRect(...curPoint, pointSize, pointSize);
    ctx.fillRect(...endPoint, pointSize, pointSize);
    ctx.fillStyle = controlPointColor;
    ctx.fillRect(...controlPoint[0], pointSize, pointSize);
    ctx.fillRect(...controlPoint[1], pointSize, pointSize);
}
