import Vue from 'vue';
import moment from 'moment';
import { getToken } from "@/util/auth"

(() => {
  Vue.mixin({
    computed: {
      // 用户登录信息
      userInfo() { return this.$store.state.auth.userInfo || {}; },
      // 平台id
      platformId() { return (this.userInfo || {}).platformId },
      // 权限控制列表
      premissions() { return this.$store.state.auth.tags || [] },
      // 登录token
      token() { return getToken() || '' },
      // 是否开启谷歌验证码
      isEnabledGoogleCode() { return this.$store.state.auth.isGoogleVerficationEnabled || false},
      // 按钮权限
      $btns() { return this.$store.state.auth.buttonPermissions || [] }
    }
  });
})();


(function(){
  const dictionaryStore = {};
  const emptyArray = [];

  /** 
   * 包装数据子弹
   * @param {Array} 数据字典数组
   */
  function toWrapperArray(array) {
    array.get = value => {
      if (value == null || typeof value == 'undefined' || isNaN(value)) return value;
      const data = array.find(d => `${d.value}` === `${value}`);
      if (!data) return value;
      return data.name;
    }
    return array;
  }

  // 添加内置weeks字典
  dictionaryStore._weeks = toWrapperArray([
    {name: '星期一', value: '1' },
    {name: '星期二', value: '2' },
    {name: '星期三', value: '3' },
    {name: '星期四', value: '4' },
    {name: '星期五', value: '5' },
    {name: '星期六', value: '6' },
    {name: '星期天', value: '7' }
  ]);


  emptyArray.get = () => undefined;
  Vue.mixin({
    // data() { return { dictionary: null } },
    created() {
      let {dictionary} = this.$options;
      if (!dictionary) return;
      if (typeof dictionary == 'string') dictionary = dictionary.split(',')
      if (!(dictionary instanceof Array)) return;
      this.dictionary = this.$data.dictionary = Vue.observable({});
      dictionary = Object.keys(dictionary.reduce((m, d) => {
        if (d) m[d] = 1;
        return m;
      }, {}));
      
      dictionary.forEach(groupCode => {
        Vue.set(this.dictionary, groupCode, dictionaryStore[groupCode] || emptyArray);
      });

      dictionary.forEach(async groupCode => {
        if (groupCode == '_weeks') return;
        let res = {};
        if (process.env.VUE_APP_TYPE === 'sys_share_agent') {
          res = await this.$service.fetch('/config-api/dictionaryItem/queryByGroupCode', { groupCode });
        } else {
          res = await this.$service.fetch('/config-admin-api/dictionaryItem/queryByGroupCode', { groupCode });
        }
        // /config-admin-api/dictionaryItem/queryByGroupCode
        if (1 != res.code) return res.message && this.$message.error(res.message);
        // await new Promise(resolve => setTimeout(resolve, 2000));
        const array = dictionaryStore[groupCode] = (res.data || emptyArray).map(d => {
          const { itemKey: value, itemValue: name, sortOrder } = d;
          return {name, value, sortOrder};
        });
        array.sort(({sortOrder: s1}, {sortOrder: s2}) => {
          s1 = +s1 || 0; s2 = +s2 || 0;
          return s1 - s2;
        });
        toWrapperArray(array)
        Vue.set(this.dictionary, groupCode, array);
      });
    }
  });

})();

/** 异步数据store */
(function(){
  const dsstoreGlobal = {};
  Vue.mixin({
    // data() { return { dictionary: null } },
    created() {
      let {dsstore} = this.$options;
      if (!dsstore) return;
      const dsstoreObj = this.dsstore = this.$data.dsstore = Vue.observable({});
      Object.keys(dsstore).map(key => {
        let config = dsstore[key];
        if (typeof dsstore[key] == 'string') config = { url: config, value: [], params: {}};
        if (!config.params) config.params = {};
        if (!config.value) config.value = [];
        if (false !== config.autoload) {
          const sign = JSON.stringify(config);
          if (!dsstoreGlobal[sign]) {
            dsstoreGlobal[sign] = config.value || [];
          }
          let disstoredata = dsstoreGlobal[sign];
          if (disstoredata instanceof Array) disstoredata = [...disstoredata];
          else if (disstoredata instanceof Object) disstoredata = {...disstoredata};
          this.toWrapper(key, config, disstoredata);
          Vue.set(dsstoreObj, key, disstoredata);
          this.$nextTick(() => dsstoreObj[key].fetch());
        } else {
          const disstoredata = config.value || [];
          this.toWrapper(key, config, disstoredata);
          Vue.set(dsstoreObj, key, disstoredata);
        }
      });
    },
    methods: {
      /** 
       * 包装数据
       * @param {Stirng} varkey 变量名称
       * @param {Object} config 配置对象
       * @param {Object} dsstoredata 配置对象
       * @return {void}
       */
      toWrapper(varkey, config, dsstoredata) {
        // if (typeof dsstoredata.fetch == 'function') return;
        const sign = JSON.stringify(config);
        /**
         * 查询
         * @param {Object} params 查询条件
         * @return {void}
         */
        dsstoredata.fetch = async (params = {}) => {
          // if (this.dsstore[varkey] && this.dsstore[varkey] instanceof Array) this.dsstore[varkey].splice(0);
          Object.assign(config.params, params);
          // await new Promise(r => setTimeout(r, 1000));
          this.$service.fetch(config.url, config.params).then(res => {
            if (1 != res.code) return res.message && this.$message.error(res.message);
            const dsstoredata2 = res.data || config.value;
            this.toWrapper(varkey, config, dsstoredata2);
            // console.log(varkey, dsstoredata2);
            Vue.set(this.$data.dsstore, varkey, dsstoredata2);
            this.dsstore[varkey] = dsstoredata2;
            // 签名一致，并且初始化查询的数据做全局缓存
            if (false !== config.autoload && sign == JSON.stringify(config)) dsstoreGlobal[sign] = dsstoredata2;
          });
        };
        /** 刷新 */
        dsstoredata.refresh = () => dsstoredata.fetch();
        /** 重置 */
        dsstoredata.reset = () => {
          this.toWrapper(varkey, config, config.value);
          this.dsstore[varkey] = config.value;
        };
      },
      /**
       * 金额数目千分位显示
       * @param {num} varkey 变量名称
       *
       */
      getThousandNum(num) {
        if (num === undefined) return;
        return num.toString().replace(/\d+/, function (n) {
          return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
            return $1 + ",";
          })
        })
      }
    }
  });
})();

(function(){
  Vue.prototype.$rules = {
    required(message = '请输入') {
      return {  rules: [{ required: true, message }] }
    },
    requiredSelect(message = '请选择') {
      return { rules: [{ required: true}] }
    },
    range(min = 0, max = 100) {
      return {type: 'number', validator(rule, value, callback) {
        if (value.length == 0) return callback();
        value = +value;
        if (isNaN(value) || value < min || value > max)
         return callback(`请输入[${min}-${max}]区间值`);
        
        return callback();
      }}
    }
  };
  Vue.mixin({
    // data() { return { vform: null, vformdata: null, vformhidden: null }; },
    created() {
      let { formOptions } = this.$options;
      if (!formOptions) return;
      
      if (typeof formOptions == 'string') formOptions = { vform: formOptions };
      else if (typeof formOptions != 'object') return;
      // 规则

      Object.keys(formOptions).forEach(vformVarName => this.createForm(vformVarName, formOptions[vformVarName]));

      // let forms = formOptions.reduce((d, i) => {
      //   if (!d) return merge;
      //   if (typeof d == 'string') return merge.push({ [`vform${i}`]: d }), merge;
      //   if (typeof d == 'object' && d)
      //   return merge
      // }, [])
      
    },
    methods: {
      /**
       * 创建ant-d AForm对象(已修正的)
       * @param {String} vformVarName 变量名称
       * @param {String/Array<String>} hiddens 隐藏字段名称
       * @return {AForm} ant-d AForm对象(已修正的)
       */
      createForm(vformVarName, hiddens) {
        const vform = this[vformVarName] = this.$data[vformVarName] = this.$form.createForm(this, {
          onFieldsChange: (_, changedFields) => this.$emit('changedFields', changedFields),
          onValuesChange: (_, values) => {
            
            Object.keys(values).forEach(key => {
              if (values[key] && typeof values[key] == 'object' && vform.data[key] && typeof vform.data[key] == typeof values[key]) {
                if (values[key] instanceof Array) {
                  return values[key].forEach((d, i) => {
                    if (values[key][i] && this.$tools.isPlainObject(values[key][i])) return vform.data[key][i] = {...vform.data[key][i], ...values[key][i]};
                    vform.data[key][i] = values[key][i];
                  })
                }
              } 
              vform.data[key] = values[key];
            });
            Vue.set(vform, 'data', {...vform.data})
            this.$emit('changedValues', {...vform.data})
          }
        });
        vform.hiddens = vform.$data.hiddens = Vue.observable(hiddens ? hiddens.split(',') : []);
        vform.data = vform.$data.data = Vue.observable({});
        vform.hiddens.forEach(key => vform.data[key] = '');

        /**
         * 赋值
         * @param {Object} 表单Values 表单Values
         * @param {Boolean} isInitialValue=false, 是否初始化值
         * @param {besides} 不想放入vform中进行设置值 "clientType,isEnabled"
         */
        vform.setValues = (values = {}, isInitialValue = false, besides) => {
          // if (typeof isInitialValue != 'boolean') isInitialValue = false;
          if (typeof besides === 'string' && besides.length > 0) {
            const keys = besides.split(',');
            Object.keys(values).forEach(item => {
              for(let i = 0; i < keys.length; i++) {
                if (item === keys[i]) {
                  delete values[item];
                  break;
                }
              }
            })
          }

          // 初始化设定
          if (isInitialValue !== false) {
            Object.keys(values).forEach(name => {
              vform.setValue(name, values[name], isInitialValue);
            });
            return;
          }

          (vform.vbind.keys||[]).forEach(key => this[key] = {...this[key], ...values});
          values = Object.keys(values).reduce((mergin, name) => {
            let value = values[name];
            if (typeof value == 'undefined') {
              if (typeof vform.data[name] != 'undefined') vform.data[name] = value;
              return mergin;
            }
            if (typeof value === 'number') { value = `${value}`; }
            vform.data[name] = value;
            if (vform.ignorekeys && vform.ignorekeys instanceof Array && vform.ignorekeys.includes(name)) {
              vform.data[name] = value;
              (vform.vbind.keys||[]).forEach(key => this[key][name] = value);
              return mergin;
            }
            mergin[name] =value;
            return mergin;
          }, {});
          vform.setFieldsValue(values);
        }
        /**
         * 赋值
         * @param {string} name 表单Key
         * @param {any} value 表单Value
         * @param {Boolean} isInitialValue=false, 是否初始化值
         */
        vform.setValue = (name, value, isInitialValue = false) => {
          if (typeof value == 'undefined') {
            if (typeof vform.data[name] != 'undefined') vform.data[name] = value;
            return;
          }
          if (typeof value === 'number') {
            value = `${value}`;
          }
          vform.data[name] = value;
          if (vform.ignorekeys && vform.ignorekeys instanceof Array && vform.ignorekeys.includes(name)) {
            vform.data[name] = value;
            (vform.vbind.keys||[]).forEach(key => this[key][name] = value);
            return;
          }
          if (typeof vform.getFieldsValue()[name] == 'undefined') {
            Vue.set(vform.data, name, value);
            vform.getFieldDecorator(name, { initialValue: value, rules: [] });
            vform.setFieldsValue({[name]: value });
            if (!isInitialValue) return;
          }
          vform.setFieldsValue({[name]: value});
        }
        /**
         * 获取所有表单的值
         * @return {Object} values
         */
        vform.getValues = () => {
          return Object.assign(vform.data, vform.getFieldsValue());
        }
        /**
         * 获取所有表单指定Key的值
         * @param {string} name 表单Key
         * @return {Object} values
         */
        vform.getValue = (name) => {
          return vform.getFieldsValue()[name];
        }

        /** 
         * 格式化特殊值
         * @param {any} value
         * @return {any} 格式化值
         */
        const toformatValue = (value) => {
          const type = typeof value;
          if ('boolean' == type) return value ? 1 : 0;
          if (!value || typeof value != 'object') return value;
          if (value instanceof Date) return this.$tools.formatDate(value);
          if (value instanceof moment) return this.$tools.formatDate(value);
          // if (value instanceof Array) return value.join(',');
          return value;
        }

        /**
         * 验证表单
         * @param {Array<String>} fieldNames 可选
         * @param {Object} options 可选
         * @return Promise.resolve({error, values});
         */
        vform.validate = async (...args) => {
          const form = await new Promise(resolve =>
            vform.validateFields(...args, (errors, values) => resolve({errors, values}))
          );
          const { domFields } = vform;
          form.vals = {};
          form.original = this.$tools.serialize(form.values);
          form.values = Object.keys(domFields).reduce((merge, name) => {
            if (name.includes('.') || (name.includes('[') && name.includes[']'])) return merge;
            let value = form.values[name];
            form.vals[name] = toformatValue(value);
            return merge[name] = value, merge;
          }, {});
          return form;
        }
        /**
         * 验证表单
         * @param {Array<String>} fieldNames 可选
         * @param {Object} options 可选
         * @return Promise.resolve({error, values});
         */
        vform.validateScroll = async (...args) => {
          const form = await new Promise(resolve =>
            vform.validateFieldsAndScroll(...args, (errors, values) => resolve({errors, values}))
          );
          const { domFields } = this.vform;
          form.vals = {};
          form.original = {...form.values};
          form.values = Object.keys(domFields).reduce((merge, name) => {
            if (name.includes('.') || (name.includes('[') && name.includes[']'])) return merge;
            let value = form.values[name];
            form.vals[name] = toformatValue(value);
            return merge[name] = value, merge;
          }, {});
          return form;
        }
        
        /**
         * 绑定值
         * @param {String} bindValuesKey 绑定值属性名称
         * @param {String|Array<String>} ignorekeys 忽略的键
         * @param {Boolean} isFormatValue = false 是否格式值
         * @return {void} 返回空值
         */
        vform.vbind = (bindValuesKey, ignorekeys, isFormatValue = false) => {
          if (!vform.vbind.keys) vform.vbind.keys = [];
          vform.vbind.keys.push(bindValuesKey);
          if (typeof ignorekeys == 'boolean') {
            isFormatValue = ignorekeys; ignorekeys = [];
          } else if (ignorekeys && typeof ignorekeys == 'string') ignorekeys = ignorekeys.split(',');

          vform.ignorekeys = ignorekeys;

          // Vue.set(this, bindValuesKey, {...this[bindValuesKey], ...vform.data});
          vform.setValues(this[bindValuesKey] || {}, true);
          this.$on('changedValues', values => {
            const data = {...this[bindValuesKey], ...vform.data};
            const vals = !isFormatValue ? data : Object.keys(data).reduce((m, k) => (m[k]=toformatValue(data[k]), m), {});
            Vue.set(this, bindValuesKey, vals);
          });
        }
      }
    }
  });
})();