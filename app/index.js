import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Vue from "vue";
import App from "./components/App.vue";
import store from "./store";

// eslint-disable-next-line no-new
new Vue({
  el: "#app",
  render: h => h(App),
  store
});
