// 此文件作为修正错误信息组件
import Vue from 'vue';
import { message } from 'ant-design-vue';


message.errorOriginal = message.error;
message.errorStore = {};
message.error = async function(...args) {
    let fn = null;
    if (typeof args[args.length - 1] == 'function') {
        fn = args.pop();
    }
    if (!message.errorStore[args[0]]) {
        message.errorStore[args[0]] = new Promise(resolve => {
            message.errorOriginal(...args, () => {
                message.errorStore[args[0]] = null;
                resolve();
            });
        })
    }

    await message.errorStore[args[0]];
    if (fn) fn();
}