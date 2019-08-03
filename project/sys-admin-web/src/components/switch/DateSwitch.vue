<template>
    <ul class="c-date-switch">
        <li v-for="(item, index) in columns" :key="index" :class="className">
            <button :class="{active: currentSelected === index}" @click.prevent="changeTab(item, index)">{{item}}</button>
        </li>
        <li v-if="cleanButton" :class="className">
            <button @click="cleanAction">清除</button>
        </li>
    </ul>
</template>
<script>
/**
 * copy直接使用
 * <date-switch :columns="[]" :cleanButton="true" :defaultSelected="1" @changeTab="changeTabCallBack"/>
 */

import Vue from 'vue'
import { Component, Prop, Lifecycle } from 'vue-decorators'
import { getDateByText } from '@/util/helper';

@Component
export default class DateSwitch extends Vue {
    currentSelected = 0;
    // 配置按钮
    @Prop({type: Array, default: () => ['今天', '昨天', '本周', '上周', '本月', '上月']}) columns;
    // 配置清除button
    @Prop({type: Boolean, default: false}) cleanButton; 
    // 默认选中
    @Prop({type: Number, default: 0}) defaultSelected;
    // 设置样式
    @Prop({type: String, default: "" }) className;
    // 点击清除， 回调函数
    cleanAction() { 
        this.currentSelected = -1;
        this.$emit('cleanSelected'); 
    };
    // 点击按钮 回调
    changeTab(text, index) {
       this.currentSelected = index;
       const {startDate, endDate} = getDateByText(text);
       this.$emit('changeTab', startDate, endDate); 
    };

    // 父组件直接获取子组件内部返回的时间
    getTime() {
      const text = this.columns[this.currentSelected];
      const {startDate, endDate} = getDateByText(text);
      return { startDate, endDate}
    }   
    //  根据父组件传递过来的属性进行选中
    @Lifecycle created() {
        if (this.defaultSelected !== this.currentSelected) this.currentSelected = this.defaultSelected;
    }

    resetKey() {
        this.currentSelected = 0
    }
}

</script>

<style lang="scss">
$-blue: #009688;

.c-date-switch {
    display: flex; 
    li > button {
        margin-right: 10px; background: transparent; border: 1px solid #d9d9d9;
        padding: 3px 12px; font-size: 12px; letter-spacing: 2px; border-radius: 2px; cursor: pointer;
        
        &.active { background-color: $-blue; border-color: $-blue; color: #fff; }
    }
}
</style>

