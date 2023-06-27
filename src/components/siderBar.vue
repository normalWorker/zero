<template>
  <div>
    <!-- <Menu active-name="home" @on-select="changeMennu" theme="light">
      <MenuItem name="home">home</MenuItem>
      <MenuItem name="about">about</MenuItem>
      <MenuItem name="contact">contact</MenuItem>
    </Menu> -->
  </div>
</template>

<script>
export default {
  methods: {
    changeMennu(e) {
      this.$router.push({ name: e });
    },
  },
};
</script>

<style scoped>
/* 可以添加一些样式来美化菜单 */
.contain {
  padding: 5px;
}
</style>
