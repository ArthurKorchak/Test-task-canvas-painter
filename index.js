"use strict";
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    ;
    setPoint(x, y) {
        this.x = x;
        this.y = y;
    }
    ;
    getPoint() {
        return { x: this.x, y: this.y };
    }
    ;
}
;
class Line {
    constructor(x, y) {
        this.a = new Point(0, 0);
        this.b = new Point(0, 0);
        this.a.setPoint(x, y);
    }
    ;
    setPointA(x, y) {
        this.a.setPoint(x, y);
    }
    ;
    setPointB(x, y) {
        this.b.setPoint(x, y);
    }
    ;
    getCoordinates() {
        return { a: this.a.getPoint(), b: this.b.getPoint() };
    }
    ;
}
;
class graphicEngine {
    constructor() {
        this.COLLAPSE_DELAY = 3000;
        this.points = [];
        this.lines = [];
        this.isFirstClick = true;
        this.canvas = document.getElementById('c1');
        this.ctx = this.canvas.getContext('2d');
        this.collapseBtn = document.getElementById('b1');
    }
    ;
    start() {
        const handlerMouse = this.handlerMouseMove.bind(this);
        const collapse = this.collapseLines.bind(this);
        this.collapseBtn.disabled = true;
        this.collapseBtn.addEventListener('click', collapse);
        this.canvas.addEventListener('click', ({ offsetX, offsetY }) => {
            if (this.isFirstClick) {
                this.lines.unshift(new Line(+offsetX.toFixed(2), +offsetY.toFixed(2)));
                this.isFirstClick = false;
                this.canvas.addEventListener('mousemove', handlerMouse);
            }
            else {
                this.canvas.removeEventListener('mousemove', handlerMouse);
                this.lines[0].setPointB(+offsetX.toFixed(2), +offsetY.toFixed(2));
                this.isFirstClick = true;
                this.collapseBtn.disabled = false;
                this.render();
            }
            ;
        });
    }
    ;
    handlerMouseMove(ev) {
        this.lines[0].setPointB(ev.offsetX, ev.offsetY);
        this.searchPoints();
        this.render();
    }
    ;
    searchPoints() {
        this.points = this.lines.reduce((acc1, line1, idx1) => {
            const deepPoints = this.lines.reduce((acc2, line2, idx2) => {
                const coordL1 = line1.getCoordinates();
                const coordL2 = line2.getCoordinates();
                if (idx1 > idx2) {
                    const c2x = coordL2.a.x - coordL2.b.x;
                    const c3x = coordL1.a.x - coordL1.b.x;
                    const c2y = coordL2.a.y - coordL2.b.y;
                    const c3y = coordL1.a.y - coordL1.b.y;
                    const d = c3x * c2y - c3y * c2x;
                    if (d === 0) {
                        return acc2;
                    }
                    ;
                    const u1 = coordL1.a.x * coordL1.b.y - coordL1.a.y * coordL1.b.x;
                    const u4 = coordL2.a.x * coordL2.b.y - coordL2.a.y * coordL2.b.x;
                    const px = +((u1 * c2x - c3x * u4) / d).toFixed(2);
                    const py = +((u1 * c2y - c3y * u4) / d).toFixed(2);
                    if (!(((Math.min(coordL1.a.x, coordL1.b.x) <= px && px <= Math.max(coordL1.a.x, coordL1.b.x)) &&
                        (Math.min(coordL2.a.x, coordL2.b.x) <= px && px <= Math.max(coordL2.a.x, coordL2.b.x))) &&
                        ((Math.min(coordL1.a.y, coordL1.b.y) <= py && py <= Math.max(coordL1.a.y, coordL1.b.y)) &&
                            (Math.min(coordL2.a.y, coordL2.b.y) <= py && py <= Math.max(coordL2.a.y, coordL2.b.y))))) {
                        return acc2;
                    }
                    ;
                    return [...acc2, new Point(px, py)];
                }
                ;
                return acc2;
            }, []);
            if (deepPoints) {
                return [...acc1, ...deepPoints];
            }
            ;
            return acc1;
        }, []);
    }
    ;
    render() {
        this.ctx.clearRect(0, 0, 600, 400);
        this.lines.forEach((line) => {
            const coordL = line.getCoordinates();
            this.ctx.beginPath();
            this.ctx.moveTo(coordL.a.x, coordL.a.y);
            this.ctx.lineTo(coordL.b.x, coordL.b.y);
            this.ctx.stroke();
        });
        this.points.forEach((point) => {
            const coordP = point.getPoint();
            this.ctx.beginPath();
            this.ctx.arc(coordP.x, coordP.y, 4, 0, Math.PI * 2, true);
            this.ctx.fillStyle = "red";
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
    ;
    collapseLines() {
        this.collapseBtn.disabled = true;
        const cutStep = 25;
        const numberOfCuts = (this.COLLAPSE_DELAY / cutStep);
        const slices = [];
        let counter = 0;
        const cut = setInterval(() => {
            counter += cutStep;
            this.lines.forEach((line, idx) => {
                const coordL = line.getCoordinates();
                if (counter === cutStep) {
                    const lineLength = +(Math.sqrt((coordL.b.x - coordL.a.x) ** 2 + (coordL.b.y - coordL.a.y) ** 2)).toFixed(2);
                    slices[idx] = +(lineLength / numberOfCuts / 2).toFixed(2);
                }
                ;
                const oldLength = +(Math.sqrt((coordL.b.x - coordL.a.x) ** 2 + (coordL.b.y - coordL.a.y) ** 2)).toFixed(2);
                const newLength = +(oldLength - slices[idx]).toFixed(2);
                const x = Math.max(coordL.a.x, coordL.b.x) - Math.min(coordL.a.x, coordL.b.x);
                const y = Math.max(coordL.a.y, coordL.b.y) - Math.min(coordL.a.y, coordL.b.y);
                const tx = (x * newLength) / oldLength;
                const ty = (y * newLength) / oldLength;
                let newX1;
                coordL.b.x > coordL.a.x ? newX1 = coordL.a.x + (x - tx) : newX1 = coordL.a.x - (x - tx);
                let newY1;
                coordL.b.y > coordL.a.y ? newY1 = coordL.a.y + (y - ty) : newY1 = coordL.a.y - (y - ty);
                let newX2;
                coordL.b.x > coordL.a.x ? newX2 = coordL.b.x - (x - tx) : newX2 = coordL.b.x + (x - tx);
                let newY2;
                coordL.b.y > coordL.a.y ? newY2 = coordL.b.y - (y - ty) : newY2 = coordL.b.y + (y - ty);
                this.lines[idx].setPointA(newX1, newY1);
                this.lines[idx].setPointB(newX2, newY2);
                this.searchPoints();
                this.render();
            });
            if (counter >= this.COLLAPSE_DELAY) {
                clearInterval(cut);
                this.lines.length = 0;
                this.ctx.clearRect(0, 0, 600, 400);
            }
            ;
        }, cutStep);
    }
    ;
}
;
const engine = new graphicEngine;
engine.start();
