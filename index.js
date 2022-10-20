const canvas = document.getElementById('c1');
const collapseBtn = document.getElementById('b1');
const ctx = canvas.getContext('2d');
const COLLAPSE_DELAY = 3000;
const lines = [];
const line = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
};
let isFirstClick = true;
let points = [];

collapseBtn.disabled = true;

function render() {
  ctx.clearRect(0, 0, 600, 400);
  lines.forEach(({ x1, y1, x2, y2 }) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
  points.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2, true);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
  });
};

function handler({offsetX, offsetY}) {
  lines[0].x2 = offsetX;
  lines[0].y2 = offsetY;
  searchPoints();
  render();
};

canvas.addEventListener('click', ({ offsetX, offsetY }) => {
  if (isFirstClick) {
    lines.unshift({ ...line });
    lines[0].x1 = offsetX;
    lines[0].y1 = offsetY;
    isFirstClick = false;
    canvas.addEventListener('mousemove', handler);
  } else {
    canvas.removeEventListener('mousemove', handler);
    lines[0].x2 = offsetX;
    lines[0].y2 = offsetY;
    isFirstClick = true;
    collapseBtn.disabled = false;
    render();
  };
});

function searchPoints() {
  points = lines.reduce((acc1, line1, idx1) => {
    const a = lines.reduce((acc2, line2, idx2) => {
      if (idx1 > idx2) {
        const intersection = calculateIntersection(line1, line2);
        if (intersection) {
          return [...acc2, intersection];
        };
        return acc2;
      };
      return acc2;
    }, []);
    if (a) {
      return [...acc1, ...a]
    };
    return acc1;
  }, []);
};

function calculateIntersection(line1, line2) {
  const c2x = line2.x1 - line2.x2;
  const c3x = line1.x1 - line1.x2;
  const c2y = line2.y1 - line2.y2;
  const c3y = line1.y1 - line1.y2;
  const d  = c3x * c2y - c3y * c2x;
  
  if (d === 0 ) {
  	return null;
  };

  const u1 = line1.x1 * line1.y2 - line1.y1 * line1.x2;
  const u4 = line2.x1 * line2.y2 - line2.y1 * line2.x2; 
  const px = Math.round((u1 * c2x - c3x * u4) / d);
  const py = Math.round((u1 * c2y - c3y * u4) / d);

  if (!(((Math.min(line1.x1, line1.x2) <= px && px <= Math.max(line1.x1, line1.x2)) && (Math.min(line2.x1, line2.x2) <= px && px <= Math.max(line2.x1, line2.x2))) &&
    ((Math.min(line1.y1, line1.y2) <= py && py <= Math.max(line1.y1, line1.y2)) && (Math.min(line2.y1, line2.y2) <= py && py <= Math.max(line2.y1, line2.y2))))) {
    return null;
  };
  	
  return { x: px, y: py };
};

collapseBtn.addEventListener('click', collapseLines);

function collapseLines() {
  collapseBtn.disabled = true;
  const cutStep = 25;
  const numberOfCuts = (COLLAPSE_DELAY / cutStep);
  const slices = []
  let counter = 0;

  const cut = setInterval(() => {
    counter += cutStep;

    lines.forEach(({x1, y1, x2, y2}, idx) => {
      if (counter === cutStep) {
        const lineLength = +(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)).toFixed(2);
        slices[idx] = (lineLength / numberOfCuts / 2).toFixed(2);
      };

      const oldLength = (Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)).toFixed(2);
      const newLength = (oldLength - slices[idx]).toFixed(2);
      const x = Math.max(x1, x2) - Math.min(x1, x2)
      const y = Math.max(y1, y2) - Math.min(y1, y2)
      const tx = (x * newLength) / oldLength
      const ty = (y * newLength) / oldLength
      let newX1;
      x2 > x1 ? newX1 = x1 + (x - tx) : newX1 = x1 - (x - tx)
      let newY1;
      y2 > y1 ? newY1 = y1 + (y - ty) : newY1 = y1 - (y - ty)
      let newX2;
      x2 > x1 ? newX2 = x2 - (x - tx) : newX2 = x2 + (x - tx)
      let newY2;
      y2 > y1 ? newY2 = y2 - (y - ty) : newY2 = y2 + (y - ty)
      lines[idx] = { x1: newX1, y1: newY1, x2: newX2, y2: newY2 }

      searchPoints();
      render();
    })

    if (counter >= COLLAPSE_DELAY) {
      clearInterval(cut);
      lines.length = 0;
      ctx.clearRect(0, 0, 600, 400);
    };
    
  }, cutStep);

};