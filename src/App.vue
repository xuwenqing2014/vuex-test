<template>
  <div id="app">
    age:{{$store.state.age}}
    <br />
    a-age:{{$store.state.a.age}}
    <br />
    b-c-age:{{$store.state.b.c.age}}
    <br />
    d-age:{{$store.state.d.age}}
    <br />
    myAge:{{$store.getters.myAge}}
    <br>
    <button @click="$store.commit('syncChange', 10)">同步更改</button>
    <br>
    <button @click="$store.dispatch('asyncChange', 10)">异步更改</button>
  </div>
</template>

<script>

export default {
}
</script>

<style>
</style>
