let currentPolyline = null; // 临时折线

var prototypefabric = {};

// 修改当前操作类型。如果是矩形模式，选框填充透明，有个小灰框。

import { fabric } from "fabric";

//创建折线
function createPolyline(e, canvas) {
  const currentPoint = e.absolutePointer;
  currentPolyline = new fabric.Polyline(
    [
      { x: currentPoint.x, y: currentPoint.y },
      { x: currentPoint.x, y: currentPoint.y },
    ],
    {
      fill: "transparent",
      stroke: "rgba(0, 0, 0, 0.2)",
      objectCaching: false,
    }
  );
  canvas.add(currentPolyline);
}

//创建多边形
function createPolygon(e, canvas) {
  const currentPoint = e.absolutePointer;
  currentPolyline = new fabric.Polygon(
    [
      { x: currentPoint.x, y: currentPoint.y },
      { x: currentPoint.x, y: currentPoint.y },
    ],
    {
      fill: "transparent",
      stroke: "rgba(0, 0, 0, 0.2)",
      objectCaching: false,
    }
  );
  canvas.add(currentPolyline);
}

// 修改当前正在创建的折线
function changeCurrentPolyline(e, canvas) {
  const currentPoint = e.absolutePointer;

  let points = currentPolyline.points;

  points.push({
    x: currentPoint.x,
    y: currentPoint.y,
  });
  canvas.requestRenderAll();
}

// 折线橡皮带
function changePolylineBelt(e, canvas) {
  const currentPoint = e.absolutePointer;
  let points = currentPolyline.points;

  points[points.length - 1].x = currentPoint.x;
  points[points.length - 1].y = currentPoint.y;

  canvas.requestRenderAll();
}

// 完成折线绘制
function finishPolyline(e, canvas) {
  const currentPoint = e.absolutePointer;
  let points = currentPolyline.points;
  points[points.length - 1].x = currentPoint.x;
  points[points.length - 1].y = currentPoint.y;

  points.pop();
  points.pop();
  canvas.remove(currentPolyline);

  if (points.length > 1) {
    let polyline = new fabric.Polyline(points, {
      stroke: "#000",
      fill: "transparent",
    });

    canvas.add(polyline);
  }
  currentPolyline = null;

  canvas.requestRenderAll();
}

// 完成多边形绘制
function finishPolygon(e, canvas) {
  const currentPoint = e.absolutePointer;
  let points = currentPolyline.points;
  points[points.length - 1].x = currentPoint.x;
  points[points.length - 1].y = currentPoint.y;

  points.pop();
  points.pop();
  canvas.remove(currentPolyline);
  if (points.length > 1) {
    let polygon = new fabric.Polygon(points, {
      stroke: "#000",
      fill: "transparent",
    });

    canvas.add(polygon);
  }

  currentPolyline = null;
  canvas.requestRenderAll();
}

// 创建折线
prototypefabric.polyline = {
  // 鼠标在画布上按下
  canvasMouseDown: function (e, canvas) {
    if (currentPolyline === null) {
      createPolyline(e, canvas);
    } else {
      changeCurrentPolyline(e, canvas);
    }
  },

  // 鼠标在画布上移动
  canvasMouseMove: function (e, canvas) {
    if (currentPolyline) {
      changePolylineBelt(e, canvas);
    }
  },

  // 鼠标在画布上双击
  canvasMouseDblclick: function (e, canvas) {
    finishPolyline(e, canvas);
  },
};

// 创建多边形
prototypefabric.polygon = {
  // 鼠标在画布上按下
  canvasMouseDown: function (e, canvas) {
    if (currentPolyline === null) {
      createPolygon(e, canvas);
    } else {
      changeCurrentPolyline(e, canvas);
    }
  },

  // 鼠标在画布上移动
  canvasMouseMove: function (e, canvas) {
    if (currentPolyline) {
      changePolylineBelt(e, canvas);
    }
  },

  // 鼠标在画布上双击
  canvasMouseDblclick: function (e, canvas) {
    finishPolygon(e, canvas);
  },
};

export default prototypefabric;
