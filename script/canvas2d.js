class Canvas2DUtility {
  constructor(canvas) {
    this.canvasElement = canvas;
    this.context2d = canvas.getContext("2d");
  }

  get canvas() {return this.canvasElement;}

  get context() {return this.context2d;}

  drawRect(x, y, width, height, color){
    if(color != null) {
      this.context2d.fillStyle = color;
    }
    this.context2d.fillRect(x, y, width, height);
  }

  drawLine(x1, y1, x2, y2, color, width = 1){
    if(color != null) {
      this.context2d.strokeStyle = color;
    }
    this.context2d.lineWidth = width;
    this.context2d.beginPath();
    this.context2d.moveTo(x1, y1);
    this.context2d.lineTo(x2, y2);
    this.context2d.closePath();
    this.context2d.stroke();
  }

  drawPolygon(points, color) {
    if(Array.isArray(points) !== true || points.length < 6) {
      return;
    }

    if(color != null) {
      this.context2d.beginPath();
      this.context2d.moveTo(points[0], points[1]);
      for(let i = 2; i < points.length; i += 2) {
        this.context2d.lineTo(points[i], points[i + 1]);
      }
      this.context2d.closePath();
      this.context2d.fill();
    }

  }
  drawCircle(x, y, radius, color) {
    if(color != null) {
      this.context2d.fillStyle = color;
    }
    this.context2d.beginPath();
    this.context2d.arc(x, y, radius, 0.0, Math.PI * 2.0);
    this.context2d.closePath();
    this.context2d.fill();
  }

  drawFan(x, y, radius, startRadian, endRadian, color) {
    if(color != null) {
      this.context2d.fillStyle = color;
    }
    this.context2d.beginPath();
    this.context2d.moveTo(x, y);
    this.context2d.arc(x, y, radius, startRadian, endRadian);
    this.context2d.closePath();
    this.context2d.fill();
  }

  drawQuadraticBezier(x1, y1, x2, y2, cx, cy, color, width = 1) {
    if(color != null) {
      this.context2d.strokeStyle = color;
    }
    this.context2d.lineWidth = width;
    this.context2d.beginPath();
    this.context2d.moveTo(x1, y1);
    this.context2d.quadraticCurveTo(cx, cy, x2, y2);
    this.context2d.closePath();
    this.context2d.stroke();
  }

  drawCubicBezier(x1, y1, x2, y2, cx1, cy1, cx2, cy2, color, width = 1) {
    if(color != null) {
      this.context2d.strokeStyle = color;
    }
    this.context2d.lineWidth = width;
    this.context2d.beginPath();
    this.context2d.moveTo(x1, y1);
    this.context2d.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    this.context2d.closePath();
    this.context2d.stroke();
  }

  drawText(text, x, y, color, width) {
    if(color != null) {
      this.context2d.fillStyle = color;
    }
    this.context2d.fillText(text, x, y, width);
  }

  imageLoader(path, callback) {
    let target = new Image();
    target.addEventListener("load", () => {
      if(callback != null) {
        callback(target);
      }
    }, false);
    target.src = path;
  }
}