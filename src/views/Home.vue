<template>
  <div class="canvasContainer">
    <Card>
      <div style="display: grid; grid-template-columns: 90% 10%">
        <div style="display: inline-block">
          <fabric-canvas ref="fabricCanvas"></fabric-canvas>
        </div>
        <div style="width: 150px">
          <div class="grid-menu">
            <Button @click="drawRectangle">绘制矩形</Button>
            <Button @click="drawCircle">绘制圆形</Button>
            <Button @click="addText">添加文本</Button>
            <Button @click="drawEllipse">绘制椭圆</Button>
            <Button @click="drawPink">绘制自定义图形</Button>
            <Button @click="drawSemi">绘制半圆</Button>
            <Button @click="gradient">渐变图形</Button>

            <Upload
              style="display: grid; width: 100%"
              :before-upload="handleUpload"
              action="//jsonplaceholder.typicode.com/posts/"
            >
              <Button style="width: 100%" icon="ios-cloud-upload-outline">
                添加图片
              </Button>
            </Upload>
          </div>
          <div style="margin-top: 32px">
            <p slot="content">
              <Tooltip
                disabled
                v-for="(shape, index) in Shapes"
                :key="shape.key"
                style="
                  width: 33.3%;
                  height: 70px;
                  vertical-align: top;
                  padding: 7px 0;
                  position: relative;
                "
                :class="{
                  active: activeIndex == index && activeKey == shape.key,
                }"
              >
                <div @click="selectIndex(index, shape.key, shape.type)">
                  <img
                    style="margin-left: 10px"
                    draggable="true"
                    @dragstart="onDragstart(shape.type, index, shape.key)"
                    :src="shape.imgName"
                    :alt="shape.name"
                    class="img-shape"
                  />
                  <div
                    style="
                      text-align: center;
                      white-space: nowrap;
                      font-size: 12px;
                      margin-top: 5px;
                    "
                  >
                    {{ shape.name }}
                  </div>
                </div>
              </Tooltip>
            </p>
          </div>
          <div style="margin-top: 32px">
            <span>自由绘画模式：</span>

            <i-switch
              @on-change="drawLine"
              v-model="value"
              size="large"
            ></i-switch>
          </div>

          <div style="margin-top: 32px">
            <span>自由绘制图形：</span>

            <i-switch @on-change="turnOn" v-model="on" size="large"></i-switch>

            <Select
              @on-change="drawGraph"
              style="margin-top: 16px"
              v-model="type"
            >
              <Option v-for="item in freeObj" :value="item.id" :key="item.name">
                {{ item.name }}
              </Option>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import FabricCanvas from "@/components/drawFab.vue";

export default {
  components: {
    FabricCanvas,
  },
  data() {
    return {
      clickClass: "",
      value: false,

      activeIndex: null,
      activeKey: null,

      Shapes: [
        {
          name: "直线",
          type: "line",
          key: "a_1",
          imgName: require("@/assets/images/line.svg"),
        },
        {
          name: "圆",
          type: "circle",
          key: "a_2",
          imgName: require("@/assets/images/circle.png"),
        },
        {
          name: "矩形",
          type: "rect",
          key: "a_3",
          imgName: require("@/assets/images/rectangle.svg"),
        },
        {
          name: "文本",
          type: "i-text",
          key: "a_4",
          imgName: require("@/assets/images/text.svg"),
        },
        {
          name: "图片",
          type: "image",
          key: "a_5",
          imgName: require("@/assets/images/image.svg"),
        },
        {
          name: "折线",
          type: "polyline",
          key: "a_6",
          imgName: require("@/assets/images/polyline.svg"),
        },
        {
          name: "多边形",
          type: "polygon",
          key: "a_7",
          imgName: require("@/assets/images/polygon.svg"),
        },
        {
          name: "表格",
          type: "table",
          key: "a_8",
          imgName: require("@/assets/images/table.svg"),
        },
      ],

      //自由绘制图形
      on: false,
      type: "",
      freeObj: [
        {
          name: "矩形",
          id: "rect",
        },
        {
          name: "圆",
          id: "circle",
        },
        {
          name: "椭圆",
          id: "ellipse",
        },
        {
          name: "线段",
          id: "line",
        },
      ],
    };
  },
  methods: {
    drawRectangle() {
      this.$refs.fabricCanvas.drawRectangle();
    },
    drawCircle() {
      this.$refs.fabricCanvas.drawCircle();
    },
    addText() {
      this.$refs.fabricCanvas.addText();
    },
    drawEllipse() {
      this.$refs.fabricCanvas.drawEllipse();
    },
    drawPink() {
      this.$refs.fabricCanvas.modalOpen = true;
    },

    onDragstart(event, index, key) {
      this.activeIndex = index;
      this.activeKey = key;
      this.$refs.fabricCanvas.currentTypeGo(event);
    },
    selectIndex(index, key, type) {
      this.activeIndex = index;
      this.activeKey = key;
      if (type == "polyline") {
        this.$refs.fabricCanvas.drawPolyline();
      } else if (type == "polygon") {
        this.$refs.toolbar.drawPolygon();
      } else if (type == "newPipe") {
        this.$refs.toolbar.drawPipe();
      }
    },

    drawLine(status) {
      if (status) {
        this.on = false;
        this.turnOn(this.on);
      }
      this.$Message.info("自由绘画模式：" + (status ? "开启" : "关闭"));
      this.$refs.fabricCanvas.drawLine(status);
    },

    turnOn(status) {
      if (status) {
        this.value = false;
        this.drawLine(false);
        this.drawGraph(this.type);
      } else {
        this.type = "";
        this.drawGraph(this.type);
      }
      this.$Message.info("自由绘制图形模式：" + (status ? "开启" : "关闭"));
    },

    drawGraph(e) {
      this.$refs.fabricCanvas.clearEvent();
      this.$refs.fabricCanvas.drawGraph(this.on, e);
    },
    gradient() {
      this.$refs.fabricCanvas.gradient();
    },
    drawSemi() {
      this.$refs.fabricCanvas.drawSemi();
    },

    handleUpload(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); //转成 base64

      reader.onload = () => {
        const base64Img = reader.result; //获取读取的结果（base64）
        this.$refs.fabricCanvas.addPic(base64Img);
      };
    },
  },
};
</script>
<style scoped lang="less">
.canvasContainer {
  width: 100%;
  padding: 10px;
  height: 100%;
}

.grid-menu {
  display: grid;
  grid-row-gap: 10px;
}

.img-shape {
  display: block;
  margin: 0 auto;
  height: 28px;
}

/deep/ .ivu-tooltip-rel {
  width: 100%;
}

&.active {
  border: 2px solid #57a3f3;
  border-radius: 4px;
}
</style>
