import Vue from 'vue';

const rootElement = document.body;
Vue.prototype.$modal2 = function(component, params = {}) {
  const Component = Vue.extend({props: ['params'], ...component});
  const el = rootElement.appendChild(document.createElement('div'));
  const store = this.$store;
  return new Promise(resolve => {
    const $vm = new Component({
      propsData: { params }, store
    }).$mount(el);
    $vm.$once('close', async(...args) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      el.parentNode && el.parentNode.removeChild(el);
      $vm.$destroy();
      resolve({ closed: args.length > 0, data: args[0] })
    })
    // if (typeof $vm.open == 'function') $vm.open(...params);
  });
}