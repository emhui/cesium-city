<template>
  <div id="app">
    <router-link to="/"></router-link> 
    <router-view/>
  </div>
</template>

<style lang="scss">
*,
*::after,
*::before{
  padding: 0;
  margin: 0;
  box-sizing: inherit;
}

html{
  font-size: 62.5%;
}

body{
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
