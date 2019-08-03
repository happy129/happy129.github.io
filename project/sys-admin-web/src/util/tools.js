import Vue from 'vue';
import moment from 'moment';
import { debounce, clone, cloneDeep, isPlainObject, throttle } from 'lodash';

Vue.prototype.$tools = {
  clone, cloneDeep, isPlainObject, 
  /** 
   * 序列化/深拷贝
   * @param {any} value 序列化值
   * @return {any} 返回序列化值
  */
  serialize(value) {
    return cloneDeep(value);
  },
  /** 
   * 防抖
   * func （功能）：去抖动的功能。
   * [wait=0] （number）：延迟的毫秒数。
   * [options={}] （对象）：选项对象。
   * [options.leading=false] （布尔值）：指定超时前沿的调用。
   * [options.maxWait] （数字）：func允许在调用之前延迟最长时间。
   * [options.trailing=true] （布尔值）：指定在超时的后沿调用。
   */
  debounce,
    /**
     * 节流函数
     */
  throttle,
  /**
   * 普通数据转树
   * @param {Array} array 数据
   * @param {Object} options 配置 {childKey: 'id', parentKey: 'pid', childrenKey: 'children'}
   * @return {TreeArray} 树形列表
   */
  arrayToTreeArray(array, options) {
    options = options || {};
    const childKey    = options.childKey    || 'id';
    const parentKey   = options.parentKey   || 'pid';
    const childrenKey = options.childrenKey || 'children';

    /** 缓存树 */
    const treeCache = array.reduce((tree, node) => {
      if (!node[childrenKey]) node[childrenKey] = [];
      tree[node[childKey]] = node;
      return tree;
    }, {});

    return array.reduce((tree, node) => {
      if (treeCache[node[parentKey]]) {
        treeCache[node[parentKey]][childrenKey].push(node)
        return tree;
      }
      tree.push(node);
      return tree;
    }, []);
  },
  /**
   * 解析时间
   * @param {String} dateStr 时间字符串 2019-02-19 20:40:03
   * @param {String} formatStr 格式化字符串 YYYY-MM-DD HH:mm:ss
   * @return {Date} 返回解析时间
   */
  parseDate(dateStr, formatStr = 'YYYY-MM-DD HH:mm:ss') {
    return moment(dateStr, formatStr).toDate();
  },
  /**
   * 解析时间
   * @param {String} dateStr 时间字符串 2019-02-19 20:40:03
   * @param {String} formatStr 格式化字符串 YYYY-MM-DD HH:mm:ss
   * @return {Moment} 返回解析时间
   */
  parseMoment(dateStr, formatStr = 'YYYY-MM-DD HH:mm:ss') {
    return moment(dateStr, formatStr);
  },
  /**
   * 格式化时间
   * @param {Date/Moment} dateOrMoment 
   * @param {String} formatStr 格式化字符串 YYYY-MM-DD HH:mm:ss
   * @return {String} 返回格式化字符串
   */
  formatDate(dateOrMoment, formatStr = 'YYYY-MM-DD HH:mm:ss') {
    if (!dateOrMoment) return dateOrMoment;
    if (typeof dateOrMoment != 'object') return dateOrMoment;
    if (dateOrMoment instanceof Date) return moment(dateOrMoment).format(formatStr);
    if (dateOrMoment instanceof moment) return dateOrMoment.format(formatStr);
    return dateOrMoment;
  },
  /**
   * 批量解析时间
   * @param {Object} targetObj 源对象
   * @param {String/Array<String>} keys 需要格式化键字符串或数组
   * @param {String} formatSt 格式化字符串 YYYY-MM-DD HH:mm:ss
   * @return {Object} 源对象
   */
  parseMomentObj(targetObj, keys = [], formatStr = 'YYYY-MM-DD HH:mm:ss') {
    if (!targetObj || typeof targetObj != 'object') return targetObj;
    if (typeof keys == 'string') keys = keys.split(',');
    else if (!(keys && keys instanceof Array)) return targetObj;

    keys.forEach(key => {
      if (!targetObj[key]) return;
      try {
        targetObj[key] = this.parseMoment(targetObj[key], formatStr);
      } catch(e) { console.warn('解析时间报错', e) }
    });
    return targetObj;
  },
  /**
   * 批量格式时间
   * @param {Object} targetObj 源对象
   * @param {String/Array<String>} keys 需要格式化键字符串或数组
   * @param {String} formatSt 格式化字符串 YYYY-MM-DD HH:mm:ss
   * @return {Object} 源对象
   */
  formatDateObj(targetObj, keys = [], formatStr = 'YYYY-MM-DD HH:mm:ss') {
    if (!targetObj || typeof targetObj != 'object') return targetObj;
    if (typeof keys == 'string') keys = keys.split(',');
    else if (!(keys && keys instanceof Array)) return targetObj;
    keys.forEach(key => {
      if (!targetObj[key]) return;
      try {
        targetObj[key] = this.formatDate(targetObj[key], formatStr);
      } catch(e) { console.warn('格式化时间报错', e) }
    });
    return targetObj;
  },
  /**
   * 格式化数字，处理数字精度问题
   * @param {Number} number 需要处理的数字数据
   * @param {Number} fractionDigits=2 保留小数
   * @param {Boolean} isrounded=true 是否四舍五入
   * @return {Number} 已处理的数字数据
   */
  toFixed(number, fractionDigits = 2, isrounded = true) {
    number = +number || 0;
    if (!number) return number;
    fractionDigits = +fractionDigits || 2;
    if (typeof isrounded != 'boolean') isrounded = true;
    const multiple = Math.pow(10, fractionDigits);
    return (isrounded ? Math.round(number * multiple) : Math.floor(number * multiple)) / multiple;
  },
  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  },
  /**
 * 转换数字
 * @param num 转化后的数字
 * @return 转化后的数字
 */
  toNumber(num) {
    if (typeof num === "number" && !isNaN(num)) return num;
    const number = +num;
    if (!isNaN(number)) return number;
    const str = `${num}`.replace(/[^0-9]/g, "");
    return +str || 0;
  },
  /** 千位分割符号 */
  thoundSep(num) {
    if (typeof +num !== "number" || isNaN(num)) return num;
    return (+num).toLocaleString('en-US');
  },
  /** 解决js计算错误的问题 */
  calc(n1, n2, type) {
    var result, y, a, b, len1, len2, max;
		if (n2 == 0 && type == 4) { return 0 }
		a = String(n1);
		b = String(n2);
		len1 = a.split(".")[1] ? a.split(".")[1].length : 0;
		len2 = b.split(".")[1] ? b.split(".")[1].length : 0;
		max = len1 > len2 ? len1 : len2;
		a = Math.round(a * Math.pow(10, max));
		b = Math.round(b * Math.pow(10, max));
		switch (type) {
			case 1:
				result = a + b;
				break;
			case 2:
				result = a - b;
				break;
			case 3:
				result = a * b;
				break;
			case 4:
				result = a / b;
				break;
		}
		if (type == 1 || type == 2) {
			y = max;
		} else if (type == 3) {
			y = max * 2;
		} else {
			y = 0;
		}
		return result / Math.pow(10, y);
  },

  add(a, b) {
    return this.calc(a, b, 1);
  },

  subtract(a, b) {
    return this.calc(a, b, 2)
  },

  multiply(a, b) {
    return this.calc(a, b, 3)
  },

  divide(a, b) {
    return this.calc(a, b, 4)
  }

}