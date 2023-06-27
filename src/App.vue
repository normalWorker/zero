<template>
  <div>
    <sidebar-menu></sidebar-menu>
    <router-view></router-view>
  </div>
</template>

<script>
import SidebarMenu from './components/siderBar.vue';

export default {
  components: {
    SidebarMenu
  }
}
</script>

<style>
/* 可以添加

