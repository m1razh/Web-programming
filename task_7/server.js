const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/calculate', (req, res) => {
    const { N, n, d, R, sX, sY } = req.body;
    let vertices = calculateVertices(N, R, sX, sY);
    let points = [vertices[0]];
    let rs = [];

    for (let i = 0; i < n; i++) {
        let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];
        let randomPoint = points[Math.floor(Math.random() * points.length)];

        let newPoint = calculateNewPoint(randomVertex, randomPoint, d);
        rs.push({ x: newPoint.x, y: newPoint.y });
        points.push([newPoint.x, newPoint.y]);
    }

    res.json(rs);
});

function calculateVertices(N, R, sX, sY) {
    let vertices = [];
    for (let i = 0; i < N; i++) {
        let angle = 2 * Math.PI * i / N;
        let x = R * Math.cos(angle) + sX;
        let y = R * Math.sin(angle) + sY;
        vertices.push([x, y]);
    }
    return vertices;
}

function calculateNewPoint(vertex, point, d) {
    let dx = Math.abs(vertex[0] - point[0]) / d;
    let dy = Math.abs(vertex[1] - point[1]) / d;
    let nx = vertex[0] > point[0] ? point[0] + dx : point[0] - dx;
    let ny = vertex[1] > point[1] ? point[1] + dy : point[1] - dy;

    return { x: nx, y: ny };
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});