<template>
  <div class="container">
    <canvas height="1000" width="100%" id="myCanvas" ref="canvas"></canvas>

    <Dropdown @on-click="changeMenu" trigger="click" id="menu_list">
      <DropdownMenu>
        <DropdownItem name="delete">删除</DropdownItem>
        <DropdownItem name="ungroup">解组</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
      title="自定义"
      @on-ok="confirm"
      @on-cancel="cancel"
      v-model="modalOpen"
    >
      <Form :rules="customRules" :model="customObj">
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="宽度" prop="width">
              <InputNumber :min="0" v-model="customObj.width" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="高度" prop="height">
              <InputNumber :min="0" v-model="customObj.height" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="16">
          <Col span="12">
            <FormItem label="左侧距离" prop="left">
              <InputNumber :min="0" v-model="customObj.left" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="顶部高度" prop="top">
              <InputNumber :min="0" v-model="customObj.top" />
            </FormItem>
          </Col>
        </Row>
        <FormItem label="标签内容">
          <Input v-model="customObj.label" />
        </FormItem>
        <FormItem label="填充颜色">
          <Input v-model="customObj.fill" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { fabric } from "fabric";
// import window from "@/assets/窗户.png";
var canvas;

var LabeledRect = fabric.util.createClass(fabric.Rect, {
  type: "labeledRect",
  // initialize can be of type function(options) or function(property, options), like for text.
  initialize: function (options) {
    options || (options = {});

    this.callSuper("initialize", options);
    this.set("label", options.label || "");
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper("toObject"), {
      label: this.get("label"),
    });
  },

  _render: function (ctx) {
    this.callSuper("_render", ctx);

    ctx.font = "20px Helvetica";
    ctx.fillStyle = "#333";
    ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 20);
  },
});

// 自定义对象类(半圆)
var Semicircle = fabric.util.createClass(fabric.Object, {
  initialize(options) {
    this.callSuper("initialize", options);
    this.width = 100;
    this.height = 100;
  },

  // 重写绘制方法
  _render(ctx) {
    ctx.strokeStyle = this.stroke || "#333"; // 初始化描边颜色
    ctx.lineWidth = this.lineWidth || 1; // 初始化描边宽度
    ctx.fillStyle = this.fill || "#333"; // 初始化填充色
    ctx.beginPath(); // 开始绘制路径
    ctx.arc(0, 0, 50, -(90 * Math.PI) / 180, (90 * Math.PI) / 180); // 绘制半圆
    ctx.closePath(); // 结束绘制路径
    ctx.stroke(); // 描边
    ctx.fill(); // 填充
  },
});

export default {
  mounted() {
    this.initCanvas();
  },

  data() {
    return {
      downPoint: {},
      isDragging: false,

      currentType: "",

      modalOpen: false,

      customObj: {
        width: null,
        height: null,
        left: null,
        top: null,
        label: "",
        fill: "",
      },

      customRules: {
        width: [
          {
            type: "number",
            required: true,
            message: "The width cannot be empty",
            trigger: "blur",
          },
        ],
        height: [
          {
            type: "number",
            required: true,
            message: "The height cannot be empty",
            trigger: "blur",
          },
        ],
        left: [
          {
            type: "number",
            required: true,
            message: "The left cannot be empty",
            trigger: "blur",
          },
        ],
        top: [
          {
            type: "number",
            required: true,
            message: "The top cannot be empty",
            trigger: "blur",
          },
        ],
      },
    };
  },

  methods: {
    initCanvas() {
      canvas = new fabric.Canvas(this.$refs.canvas, {
        fireRightClick: true, //启用右键
        stopContextMenu: true, //禁止默认右键菜单
        height: 968,
        width: 1600,
        // backgroundColor:"",
      });

      this.canvasAction();
      // canvas.setBackgroundImage(
      //   "",
      //   canvas.renderAll.bind(canvas),

      // );

      //穿透
      // canvas.setOverlayImage(
      //   window,
      //   canvas.renderAll.bind(canvas),
      //   {
      //     left: -160,
      //     scaleX: 0.8,
      //     scaleY: 0.8,
      //   }
      // );
    },

    //画布操作
    canvasAction() {
      if (canvas) {
        //监听滚轮实现画布缩放

        canvas.on("mouse:wheel", (opt) => {
          let delta = opt.e.deltaY; //滚轮向上是-，向下是+
          let zoom = canvas.getZoom();

          zoom *= 0.999 ** delta; //缩放系数，delta为负值则大于1，否则小于1，实现上滑放大反之缩小
          zoom = Math.max(0.01, zoom); //最小为原来的0.01
          zoom = Math.min(20, zoom); //最大为原来的20

          //以鼠标坐标为基点缩放
          canvas.zoomToPoint(
            {
              x: opt.e.offsetX, // 鼠标x轴坐标
              y: opt.e.offsetY, // 鼠标y轴坐标
            },
            zoom
          );
        });
      }

      //监听鼠标点击实现画布拖动
      if (canvas) {
        canvas.on("mouse:down", (opt) => {
          if (opt.button === 3 && opt.e && canvas.getActiveObject()) {
            let menu = document.getElementById("menu_list");

            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;

            let pointX = opt.pointer.x;
            let pointY = opt.pointer.y;

            // 计算菜单出现的位置
            // 如果鼠标靠近画布右侧，菜单就出现在鼠标指针左侧
            if (canvas.width - pointX <= menuWidth) {
              pointX -= menuWidth;
            }
            // 如果鼠标靠近画布底部，菜单就出现在鼠标指针上方
            if (canvas.height - pointY <= menuHeight) {
              pointY -= menuHeight;
            }

            menu.style.left = pointX + "px";
            menu.style.top = pointY + "px";
            menu.style.zIndex = 100;
            menu.style.position = "absolute";

            menu.style.display = "block";
          } else {
            let evt = opt.e;
            let menu = document.getElementById("menu_list");
            menu.style.display = "none";
            if (evt.ctrlKey === true) {
              canvas.isDragging = true; //自定义参数isDragging
              canvas.lastPosX = evt.clientX; //自定义lastPosX
              canvas.lastPosY = evt.clientY; //自定义lastPosY
            } else {
              // this.animate(opt, 1);
            }
          }
        });

        canvas.on("mouse:move", (opt) => {
          if (canvas.isDragging) {
            let evt = opt.e;

            /**
             * viewportTransform是一个数组，用于获取当前视角变化矩阵
             * [a,b,c,d,e,f,g]
             * a和d控制水平垂直方向缩放比例
             * b和c控制水平垂直方向倾斜效果
             * e和f控制水平垂直方向平移效果
             */
            let vpt = canvas.viewportTransform; //聚焦视图的转换
            vpt[4] += evt.clientX - canvas.lastPosX; //现在的坐标与上一个坐标的差值
            vpt[5] += evt.clientY - canvas.lastPosY;
            canvas.requestRenderAll();

            canvas.lastPosX = evt.clientX;
            canvas.lastPosY = evt.clientY;
          }
        });

        canvas.on("mouse:up", () => {
          canvas.setViewportTransform(canvas.viewportTransform); //聚焦视图设定
          canvas.isDragging = false;
          // this.animate(e, 0); //抬起后缩小
        });

        //拖动事件
        canvas.on("drop", (opt) => {
          // 画布元素距离浏览器左侧和顶部的距离
          let offset = {
            left: canvas.getSelectionElement().getBoundingClientRect().left,
            top: canvas.getSelectionElement().getBoundingClientRect().top,
          };

          let point = {
            x: opt.e.x - offset.left,
            y: opt.e.y - offset.top,
          };

          let pointerVpt = canvas.restorePointerVpt(point);

          switch (this.currentType) {
            case "rect":
              this.addRect(pointerVpt.y, pointerVpt.x);
              break;
            case "circle":
              this.addCircle(pointerVpt.y, pointerVpt.x);
              break;
            case "i-text":
              this.addText2(pointerVpt.y, pointerVpt.x);
              break;
          }
        });

        canvas.on("mouse:dblclick", () => {
          // 取消折线模式
          canvas.polylineMode = false;
        });

        //框选事件
        fabric.util.addListener(document, "keydown", (e) => {
          if (e.keyCode === 13) {
            if (!canvas.getActiveObject()) {
              return;
            }
            if (canvas.getActiveObject().type !== "activeSelection") {
              return;
            }
            canvas.getActiveObject().toGroup();
            canvas.requestRenderAll();
          }
        });
      }
    },

    currentTypeGo(e) {
      this.currentType = e;
    },

    //单击对象时添加特效
    animate(e, dir) {
      let that = this;
      if (e.target) {
        // fabric.util.animate({
        //   startValue: e.target.get("angle"),
        //   endValue: e.target.get("angle") + (dir ? 10 : -10),
        //   duration: 100,
        // });
        fabric.util.animate({
          startValue: e.target.get("scaleX"),
          //点击后放大一半
          endValue: e.target.get("scaleX") + (dir ? 0.2 : -0.2),
          duration: 100,
          onChange: (value) => {
            e.target.scale(value);
            that.canvas.renderAll();
          },
          onComplete: function () {
            // 调用 setCoords 方法更新对象的坐标和边界框
            e.target.setCoords();
          },
        });
      }
    },

    drawPolyline() {
      this.canvas.polylineMode = true;
    },

    addRect(a, b) {
      var rect = new fabric.Rect({
        left: b,
        top: a,
        width: 200,
        height: 200,
        fill: "red",
      });
      canvas.add(rect);
    },

    addCircle(a, b) {
      var circle = new fabric.Circle({
        left: b,
        top: a,
        radius: 50,
        fill: "blue",
      });
      canvas.add(circle);
    },

    addText2(a, b) {
      var text = new fabric.IText("Hello Fabric!", {
        left: b,
        top: a,
        fill: "black",
      });
      canvas.add(text);
    },

    drawRectangle() {
      var rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "red",
      });
      canvas.add(rect);
    },
    drawCircle() {
      var circle = new fabric.Circle({
        left: 300,
        top: 100,
        radius: 100,
        fill: "blue",
      });
      canvas.add(circle);
    },
    addText() {
      var text = new fabric.IText("Hello Fabric!", {
        left: 100,
        top: 300,
        fill: "black",
      });
      canvas.add(text);
    },
    drawEllipse() {
      var ellipse = new fabric.Ellipse({
        left: 100,
        top: 400,
        rx: 100, // 水平半径
        ry: 50, // 垂直半径
        fill: "yellow",
      });
      canvas.add(ellipse);
    },

    drawPink() {
      this.modalOpen = true;
      var labeledRect = new LabeledRect(this.customObj);
      canvas.add(labeledRect);
    },

    drawGraph(status, type) {
      if (status) {
        canvas.selectionColor = "transparent"; //框选内样式
        canvas.selectionBorderColor = "rgba(0, 0, 0, 0.2)"; //框选样式
        canvas.skipTargetFind = true; // 禁止选中

        canvas.on("mouse:down", (e) => {
          this.downPoint = e.absolutePointer;
        });
        canvas.on("mouse:up", (e) => {
          if (type === "rect") {
            this.createRect(e.absolutePointer);
          } else if (type === "circle") {
            this.createCircle(e.absolutePointer);
          } else if (type === "ellipse") {
            this.createEllipse(e.absolutePointer);
          } else if (type === "line") {
            this.createLine(e.absolutePointer);
          }
        });
      } else {
        this.clearEvent();
      }
    },

    //清除
    clearEvent() {
      if (canvas.__eventListeners["mouse:down"]) {
        canvas.off("mouse:down");
      }
      if (canvas.__eventListeners["mouse:up"]) {
        canvas.off("mouse:up");
      }

      canvas.selection = true;
      canvas.selectionColor = "rgba(100, 100, 255, 0.3)";
      canvas.selectionBorderColor = "rgba(255, 255, 255, 0.3)";
      canvas.skipTargetFind = false; // 允许选中

      this.canvasAction();
    },

    createRect(pointer) {
      let top = Math.min(this.downPoint.y, pointer.y);
      let left = Math.min(this.downPoint.x, pointer.x);
      let width = Math.abs(this.downPoint.x - pointer.x);
      let height = Math.abs(this.downPoint.y - pointer.y);
      const freeRect = new fabric.Rect({
        top,
        left,
        width,
        height,
        fill: "transparent",
        stroke: "#000",
      });

      canvas.add(freeRect);
      this.downPoint = {};
    },

    createCircle(pointer) {
      let deltaX = pointer.x - this.downPoint.x;
      let deltaY = pointer.y - this.downPoint.y;
      let width = Math.abs(deltaX);
      let height = Math.abs(deltaY);
      let r = Math.min(width, height) / 2;

      if (width < height) {
        let x2, y2;
        if (deltaY < 0) {
          x2 = deltaX / 2 + this.downPoint.x - r;
          y2 = this.downPoint.y - 2 * r;
        } else {
          x2 = deltaX / 2 + this.downPoint.x - r;
          y2 = this.downPoint.y;
        }

        var circle = new fabric.Circle({
          left: x2,
          top: y2,
          radius: r,
          fill: "transparent",
          stroke: "#000",
        });
        canvas.add(circle);
      } else {
        let x2, y2;

        if (deltaX < 0) {
          x2 = this.downPoint.x - 2 * r;
          y2 = deltaY / 2 + this.downPoint.y - r;
        } else {
          x2 = this.downPoint.x;
          y2 = deltaY / 2 + this.downPoint.y - r;
        }

        var circle2 = new fabric.Circle({
          left: x2,
          top: y2,
          radius: r,
          fill: "transparent",
          stroke: "#000",
        });
        canvas.add(circle2);
      }
      this.downPoint = {};
    },

    createEllipse(pointer) {
      let top = Math.min(this.downPoint.y, pointer.y);
      let left = Math.min(this.downPoint.x, pointer.x);
      let width = Math.abs(this.downPoint.x - pointer.x);
      let height = Math.abs(this.downPoint.y - pointer.y);
      const ellipse = new fabric.Ellipse({
        left: left,
        top: top,
        rx: width / 2, // 水平半径
        ry: height / 2, // 垂直半径
        fill: "transparent",
        stroke: "#000",
      });

      canvas.add(ellipse);
      this.downPoint = {};
    },

    createLine(pointer) {
      let line = new fabric.Line(
        [this.downPoint.x, this.downPoint.y, pointer.x, pointer.y],
        {
          stroke: "#000",
          strokeWidth: 3,
        }
      );
      canvas.add(line);
    },

    drawLine(status) {
      //自由绘画
      if (status) {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = "#11999e";
        canvas.freeDrawingBrush.shadow = new fabric.Shadow({
          blur: 8,
          offsetX: 5,
          offsetY: 5,
          affectStroke: true,
          color: "#30e3ca",
        });
      } else {
        canvas.isDrawingMode = false;
      }
    },

    addPic(e) {
      //添加图片缩放0.5倍
      fabric.Image.fromURL(e, (oImg) => {
        oImg.scale(0.5); // 缩放
        canvas.add(oImg); // 将图片加入到画布
      });
    },

    drawSemi() {
      let semicircle = new Semicircle({
        left: 50,
        top: 50,
        lineWidth: 10,
        fill: "#ed5736",
        stroke: "#7bcfa6",
      });
      canvas.add(semicircle);
    },

    gradient() {
      let circle = new fabric.Circle({
        left: 300,
        top: 300,
        radius: 50,
      });

      let gradient = new fabric.Gradient({
        type: "linear",
        gradientUnits: "pixels",
        coords: { x1: 0, y1: 0, x2: 2 * circle.radius, y2: 0 },
        colorStops: [
          { offset: 0, color: "red" },
          { offset: 0.2, color: "yellow" },
          { offset: 0.6, color: "blue" },
          { offset: 0.8, color: "green" },
          { offset: 1, color: "purple" },
        ],
      });

      let gradient2 = new fabric.Gradient({
        type: "radial",
        coords: {
          r1: 50, // 该属性仅径向渐变可用，外圆半径
          r2: 0, // 该属性仅径向渐变可用，内圆半径
          x1: 50, // 焦点的x坐标
          y1: 50, // 焦点的y坐标
          x2: 50, // 中心点的x坐标
          y2: 50, // 中心点的y坐标
        },
        colorStops: [
          { offset: 0, color: "orange" },

          { offset: 0.2, color: "#fee140" },
          { offset: 0.4, color: "pink" }, //偏移量

          { offset: 0.6, color: "#fa709a" }, //偏移量

          { offset: 1, color: "#ff709a" }, //偏移量
        ],
      });

      circle.set("fill", gradient);

      circle.on("mousedown", (e) => {
        if (e.target.fill.type == "linear") {
          circle.set("fill", gradient2);
        } else {
          this.clock(circle);
        }
      });

      circle.hasBorders = false; //禁用边框
      circle.hasControls = false; //禁用控制角

      canvas.add(circle);
    },

    clock(circle) {
      circle.animate("angle", "+=60", {
        onChange: canvas.renderAll.bind(canvas), // 每次刷新的时候都会执行
        duration: 2000, // 执行时间
        easing: fabric.util.ease.easeOutBounce, // 缓冲效果
      });
    },

    confirm() {
      this.modalOpen = false;
      this.drawPink();
    },
    cancel() {
      this.modalOpen = false;
      this.customObj.resetFields();
    },

    changeMenu(e) {
      let menu = document.getElementById("menu_list");

      if (e == "delete") {
        menu.style.display = "none";

        if (!canvas.getActiveObject()) {
          return;
        } else {
          canvas.getActiveObjects().forEach(function (obj) {
            //循环删除多个
            canvas.remove(obj);
          });
          canvas.requestRenderAll();
        }
      } else if (e == "ungroup") {
        menu.style.display = "none";

        if (!canvas.getActiveObject()) {
          return;
        }
        if (canvas.getActiveObject().type !== "group") {
          return;
        }
        canvas.getActiveObject().toActiveSelection(); //解组
        canvas.requestRenderAll();
      }
    },
  },
};
</script>

<style lang="less" scoped>
::v-deep .ivu-input-number-handler-wrap {
  display: none;
}
/deep/ .ivu-input-number {
  width: 100%;
}
/deep/ .ivu-dropdown-rel {
  min-width: 80px;
}
#menu_list {
  display: none;
  min-width: 80px;
  height: auto;
  top: 0;
  left: 0;
  border: 1px solid #dcdee2;
  /deep/ .ivu-select-dropdown {
    display: none;
  }
  /deep/ .ivu-dropdown-item {
    background: white;
  }
  /deep/ .ivu-dropdown-item:hover {
    background: whitesmoke;
  }
}
.container {
  width: 100%;
  height: 100%;
}
canvas {
  border: 1px solid rgb(214, 214, 214);
}
</style>
