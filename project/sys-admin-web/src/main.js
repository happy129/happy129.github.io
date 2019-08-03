import Vue from 'vue'
import "@/util/crypto";
import '@/util/correct';
import '@/util/tools';
import '@/util/modal2';
import '@/util/mixin';
import moment from 'moment';

import App from '@/App.vue';
import router from '@router/index';
import AppStore from '@store/store';
import Service from '@/util/axios';
import constants from "@/constants/index";

import { 
  Tooltip, Tree, LocaleProvider, Icon, Menu, Avatar, Row, Col, Form, Divider, Breadcrumb, 
  Dropdown, Button, Table, Select, DatePicker, TimePicker, Input, InputNumber, Tabs, Switch, 
  Pagination, Badge, Modal, Radio, Checkbox, Upload, Spin, message, TreeSelect, Notification as Notice, 
  Popconfirm, Cascader, Tag, Popover, Collapse 
} from 'ant-design-vue';

// 商户后台用到mqtt推送消息
if (process.env.VUE_APP_TYPE === "sys_bus") {
  const mqtt = require("@/util/mqtt").default;
  Vue.prototype.$mqtt = mqtt;
}

// 取消生产的提示消息
Vue.config.productionTip = false

Vue.prototype.$service = Service;
Vue.prototype.$constants=constants;
Vue.prototype.$message = message;
Vue.prototype.$modal = Modal;
Vue.prototype.$notice = Notice;
Vue.prototype.$moment = moment;


Vue.prototype.$confirm = function(config = {}) {
  return new Promise(resolve => {
    Modal.confirm({ onOk: () => resolve(true), onCancel: () => resolve(false), ...config })
  })
};


function limitInputValue(e, type) {
  if (type === 'int') {
    return e.target.value = e.target.value.replace(/[^\d+]/, '');
  } else {
    let array = e.target.value.split('');
    // 找到第一个点在的索引
    const fristItemIndex = array.findIndex(item => item == '.');
    array = array.filter((elem, index) => {
      return /\d/.test(elem) || (elem === '.' && index == fristItemIndex && fristItemIndex != 0);
    });
    return e.target.value = array.join('');
  } 
}

// v-number 默认不传任何参数，验证正整数
// v-number="true" 验证带小数位的正整数
Vue.directive('number', {
  inserted: function(el, binding) {
    const event = binding.arg ?  binding.arg : 'input';
    // int代表整数, float代表浮点数
    const type = binding.value ? 'float' : 'int'; 
    // 具体处理事件
    el.addEventListener(event, (e) => limitInputValue(e, type));
  },
  unbind: function(el, binding) {
    const event = binding.arg ?  binding.arg : 'input';
    el.removeEventListener(event, limitInputValue);
  }
});


function permissonCallBack() {
  return vm.$message.warning('抱歉，您当前没有访问权限，请联系管理员');
}

// 控制权限指令
// <a href=""  v-permission="1234"></a>
Vue.directive("permission", {
  inserted: function(el, binding) {
    const permissons = vm.$store?.state?.auth.buttonPermissions || [];
    if (binding && binding?.value) {
      const value = parseInt(binding.value);
      const isLink = binding.modifiers?.link;
      // 如果说是链接类型
      if (isLink) {
        if (!permissons.includes(value)) {
          el.addEventListener("click", permissonCallBack, false);
        }
      } else {
        if (!permissons.includes(value)) {
          el.style.display = 'none'
        }
      }   
    }
  },
  unbind: function(el) {
   el.removeEventListener('click', permissonCallBack);
  }
});

// 从字典里面获取文字
Vue.prototype.$getText = (value, array) => {
  if (!value && value != 0) return '';
  if (!array || !Array.isArray(array) || array?.length === 0) return '';
  return array.find(item => item.value == value)?.name;
}

// 使用$number的原因type=number 限制不了键盘上的e按键, a-input中如果使用了v-decorator, 则不兼容v-number, ant-design的坑
// <a-input type="number" @change="$number"/>
// <a-input type="number" @change="e => $number(e, true)"/> 限制智能输入小数
Vue.prototype.$number = (e, type='int') => {
  return limitInputValue(e, type)
}

// 对提交的数据进行去空格操作, 使用场景： 如搜索用户名，输入框中有空格，导致后台搜索不出来，去掉空格的时候可以搜索出来
Vue.prototype.$trimValues = (object) => {
  if (Object.prototype.toString.call(object) !== "[object Object]") return object;
  const nobject = {};
  for (let [key, value] of Object.entries(object)) {
    if (typeof value === "string") {
      nobject[key] = value.replace(/\s+/g, '');
    } else if (typeof value === 'undefined') {
      nobject[key] = '';
    } else {
      nobject[key] = value;
    }
  }
  return nobject;
}


/* 全局公用组件 */
Vue
  .use(LocaleProvider)
	.use(Icon)
	.use(Divider)
  .use(Menu)
  .use(Avatar)
  .use(Form)
  .use(Breadcrumb)
  .use(Dropdown)
  .use(Button)
  .use(Table)
  .use(Select)
  .use(DatePicker)
  .use(TimePicker)
  .use(Input)
  .use(InputNumber)
  .use(Tabs)
	.use(Switch)
  .use(Badge)
  .use(Modal)
  .use(Radio)
	.use(Checkbox)
	.use(Upload)
	.use(Pagination)
	.use(Spin)
	.use(TreeSelect)
  .use(Row)
  .use(Col)
  .use(Tree)
  .use(Tooltip)
  .use(Popconfirm)
  .use(Cascader)
  .use(Tag)
  .use(Popover)
  .use(Collapse)

const vm = new Vue({
  router,
  store: AppStore,
  render: h => h(App)
}).$mount('#app')

/* 方便在控制台调试 */
window.vm = vm;