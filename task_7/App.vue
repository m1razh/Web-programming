<template>
  <div id="app">
    <FractalComponent />
  </div>
</template>

<script>
import FractalComponent from './components/FractalComponent.vue';

export default {
  name: 'App',
  components: {
    FractalComponent
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>