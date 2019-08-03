<template>
    <ul class="tab-switch-list" :class="[this.level === '1' ? 'tab-sty1' : 'tab-sty2']">
        <li v-for="(item, index) in columns" :key="index">
            <template v-if="typeof item === 'object'">
                <button @click="switchAction(item,index)" :class="{active: index == defaultSelected}">{{item.categoryName||item.lotteryName}}</button>
            </template>
            <template v-else>
                <button @click="switchAction(item,index)" :class="{active: index == defaultSelected}">{{item}}</button>
            </template>
        </li>
    </ul>
</template>

<script>
/**
 * copy直接使用
 * <tab-switch :columns="[]" level="2" :defaultSelected="1" @changeTabs="changeTabsCallBack"/>
 */
import Vue from 'vue'
import { Component, Lifecycle, Prop } from 'vue-decorators'

@Component
export default class TabSwitch extends Vue {
    @Prop({ type: Array, default: () => [] }) columns;
    @Prop({ type: String, default: '1'}) level;
    @Prop({ type: Number, default: 0}) defaultSelected;
    // 点击切换tab 
    switchAction(text,index) { this.$emit('changeTabs', text,index);}
}

</script>

<style lang="scss">
$-blue: #009688;

.tab-switch-list {
    display: flex;
    flex-wrap: wrap;
    &.tab-sty1 { 
        border-bottom: 1px solid $-blue; 
        li > button {
            border: none; padding: 4px 10px; cursor: pointer; background-color: transparent;
            letter-spacing: 1px;
            &.active { background-color: $-blue; color: #fff;}
            &:hover { background-color: #27b9ab; color: #fff;}
        }
    }
    &.tab-sty2 { 
        border-bottom: 1px solid #f2f2f2; 
        li > button {
            border: none; padding: 4px 10px; cursor: pointer; background-color: transparent;
            position: relative; letter-spacing: 1px;
            &.active { 
                &::after {
                    content: '';  position: absolute; right: 0; left: 0; bottom: -1px; height: 1px;
                    background-color: $-blue;
                } 
            }
        }
    }
}
</style>


