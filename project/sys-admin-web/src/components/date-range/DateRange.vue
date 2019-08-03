<template>
  <a-form-item>
    <a-form-item :label="title">
      <a-date-picker 
        :showTime="showTime" 
        :disabledDate="disabledStartDate" 
        :format="`${ showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD 00:00:00' }`" 
        :class="[ showTime ? 'w170' : 'time-picker']"
        v-model="form.startTime" 
        @change="(date, datestring) => onChangeDate(date, datestring, 'start')" 
        placeholder="开始时间"
      />
    </a-form-item>
    <a-form-item><span>-</span></a-form-item>
    <a-form-item>
      <a-date-picker 
        :showTime="showTime" 
        :disabledDate="disabledEndDate" 
        :format="`${ showTime ?  'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD 23:59:59' }`" 
        :class="[ showTime ? 'w170' : 'time-picker']"
        v-model="form.endTime" 
        @change="(date, datestring) => onChangeDate(date, datestring, 'end')" 
        placeholder="结束时间" 
      />
    </a-form-item>
  </a-form-item>
</template>

<script>
import Vue from 'vue'
import { Component, Prop, Lifecycle } from 'vue-decorators'
import moment from "moment"

@Component
export default class DateRange extends Vue {
  // 标题
  @Prop({ type: String, default: '时间'}) title;
  // 是否设置今天为默认时间
  @Prop({ type: Boolean, default: false }) defaultDate;
  // 是否可选择具体时间
  @Prop({ type: Boolean, default: false }) showTime;
  // 设置当前日期为00:00:00 - 23:59:59
  @Prop({ type: Boolean, default: false }) isToday;

  form = {
    startTime: null,
    endTime: null,
    formatStartTime: '',
    formatEndTime: ''
  }

  @Lifecycle mounted() {
    if (this.defaultDate) {
      this.setCurrentDate();
    }
  }

  disabledStartDate(startValue) {
    const endValue = this.form.endTime;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate (endValue) {
    const startValue = this.form.startTime;
    if (!endValue || !startValue) {
      return false;
    }
    return startValue.valueOf() >= endValue.valueOf();
  }

  onChangeDate(date, datestring, type) {
    if (type === 'start') {
      // 组件上有清空操作
      this.form.formatStartTime = datestring ? datestring : '';
    } else {
      this.form.formatEndTime = datestring ? datestring : '';
    }
    this.$emit('change', this.form.formatStartTime, this.form.formatEndTime, datestring, type);
  }

  // 设置初始值
  setDateRangeValues(startTime, endTime) {
    this.form.startTime = moment(startTime);
    this.form.endTime = moment(endTime);
  }


  setCurrentDate() {
    const date = new Date();
    const myyear = date.getFullYear();
    const mymonth = date.getMonth() + 1;
    const myweekday = date.getDate();
    const start = `${myyear}/${mymonth}/${myweekday} 00:00:00`;
    const end = `${myyear}/${mymonth}/${myweekday} 23:59:59`;
    const startDate = new Date(start);
    const endDate = new Date(end);
    //const year = date.getFullYear();
    this.form.startTime = moment(startDate);
    this.form.endTime = moment(endDate);

    const startTime = this.form.startTime.format('YYYY-MM-DD HH:mm:ss');
    const endTime = this.form.endTime.format('YYYY-MM-DD HH:mm:ss');
    
    this.$emit('current', startTime, endTime);
  }

  clear() {
    this.form.startTime = null;
    this.form.endTime = null;
  }
  
}
</script>

<style lang="scss" scoped>
.w170 {
  width: 170px !important;
}
</style>