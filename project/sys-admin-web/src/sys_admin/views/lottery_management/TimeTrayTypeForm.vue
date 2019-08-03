	<style lang="scss" scoped>
.mymodal {
  .avatar-uploader {
    display: inline-block;
    &+span { position: relative; top: -24px; }
  }
  .avatar-uploader img {
    width: 20px!important; height: 20px!important;
  }
  .avatar-uploader /deep/ .ant-upload-select-picture-card{
    width: 40px!important; height: 40px!important;
  }
  .no-valid /deep/ {
    .ant-form-item-label, .ant-form-item-control { line-height: 21px!important; }
  }
  .layout1 {
    > div { width: 49.5%;  display: inline-block; }
  }

  .table1 { width: 100%; line-height: 20px; margin: 0 0 10px 0; }
  .table1 thead td {  padding: 10px 10px 10px 0; }

  .layout3 { margin-left: 30px; }

  // .myform /deep/ .ant-form-item-label { min-width: 140px; }
}
</style>

<template>
  <a-modal class="mymodal" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading" :width="700">
    <a-form  class="myform" :form="vform" style="margin: 0 20px;">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      <div class="layout1">
        <!-- 周期类型|0:每天|1:每年 -->
        <a-form-item label="类型名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
          <a-input placeholder="请输入" v-decorator="[ 'name', {  rules: [{ required: true, message: '请请输入' }] }]"/>
        </a-form-item>
        <a-form-item label="周期类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select :disabled="Boolean(vform.data.id)" placeholder="请选择" v-decorator="[ 'cycleType', { rules: [{ required: true, message: '请选择周期类型' }] }]">
            <a-select-option v-for="(d, i) in dictionary.cycleType" :value="`${d.value}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="期号格式" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select :disabled="Boolean(vform.data.id)" placeholder="请选择" v-decorator="[ 'issueFormatType', {  rules: [{ required: true, message: '请选择期号格式' }] }]">
            <a-select-option v-for="(d, i) in dictionary.issueFormatType" :value="`${d.value}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时区类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select :disabled="Boolean(vform.data.id)" placeholder="请选择" v-decorator="[ 'timeZoneType', {  rules: [{ required: true, message: '请选择时区类型' }] }]">
            <a-select-option v-for="(d, i) in dictionary.timeZoneType" :value="`${d.value}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="时间类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select :disabled="Boolean(vform.data.id)" placeholder="请选择" v-decorator="[ 'timeType', {  rules: [{ required: true, message: '请选择时间类型' }] }]">
            <a-select-option v-for="(d, i) in dictionary.timeType" :value="`${d.value}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="封单时间(秒)" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-input-number placeholder="请输入秒" style="width: 180px;" :min="0" v-decorator="[ 'sealSeconds', {  rules: [{ required: true, message: '请输入封单时间' }] }]"/>
        </a-form-item>
      </div>
      <div class="layout3">
        <h4>周期规则</h4>
         <!-- 每天 -->
        <table class="table1" v-if="0 == vformdata.cycleType">
          <colgroup>
            <col width="25%"/><col width="25%"/><col width="25%"/><col width="25%"/>
          </colgroup>
          <thead>
            <tr>
              <td>周期开始时间</td>
              <td>周期结束时间</td>
              <td>开奖周期</td>
              <td>&nbsp;</td>
            </tr>
          </thead>
          <tr v-for="(d, i) in vformdata.cycleList" :key="i">
            <td><a-form-item><a-time-picker format="HH:mm:ss" placeholder="请选择" v-decorator="[`cycleList[${i}].cycleStartTime`, { initialValue: (vformdata.cycleList[i]||{}).cycleStartTime, rules: [{ required: true, message: '请选择' }] }]"/></a-form-item></td>
            <td><a-form-item><a-time-picker format="HH:mm:ss" placeholder="请选择" v-decorator="[`cycleList[${i}].cycleEndTime`, { initialValue: (vformdata.cycleList[i]||{}).cycleEndTime,  rules: [{ required: true, message: '请选择' }] }]"/></a-form-item></td>
            <td><a-form-item>
              <a-input-number placeholder="请输入秒" v-decorator="[ `cycleList[${i}].cycleInterval`, { initialValue: (vformdata.cycleList[i]||{}).cycleInterval, rules: [{ required: true, message: '请输入秒' }] }]" :min="0"/>&nbsp;期/秒
            </a-form-item></td>
            <td>
              <a-form-item>
                <a-button type="default" style="margin: 0 5px;" v-if="i != 0" @click="() => vformdata.cycleList.splice(i, 1)">删除</a-button>
                <a-button type="primary" v-if="i + 1 == vformdata.cycleList.length" @click.native="vformdata.cycleList.push({cycleInterval: ''})">添加</a-button>
              </a-form-item>
            </td>
          </tr>
        </table>
        <!-- 每年 -->
        <table class="table1" v-else-if="1 == vformdata.cycleType">
          <colgroup>
            <col width="25%"/><col width="25%"/><col width="25%"/><col width="25%"/>
          </colgroup>
           <thead>
            <tr>
              <td>本期结束时间</td>
              <td>下期开始时间</td>
              <td>开奖周期</td>
              <td>&nbsp;</td>
            </tr>
          </thead>
          <tr v-for="(d, i) in vformdata.cycleList" :key="i">
             <td><a-form-item><a-time-picker format="HH:mm:ss" placeholder="请选择" v-decorator="[`cycleList[${i}].cycleEndTime`, { initialValue: (vformdata.cycleList[i]||{}).cycleEndTime,  rules: [{ required: true, message: '请选择' }] }]"/></a-form-item></td>
            <td><a-form-item><a-time-picker format="HH:mm:ss" placeholder="请选择" v-decorator="[`cycleList[${i}].cycleStartTime`, { initialValue: (vformdata.cycleList[i]||{}).cycleStartTime, rules: [{ required: true, message: '请选择' }] }]"/></a-form-item></td>
            <td><a-form-item>
              <a-select placeholder="请选择" v-decorator="[`cycleList[${i}].cycleInterval`, { initialValue: `${(vformdata.cycleList[i]||{}).cycleInterval}`, rules: [{ required: true, message: '请选择星期' }] }]">
                <a-select-option v-for="(d, i) in dictionary._weeks" :value="`${d.value}`" :key="i">{{d.name}}</a-select-option>
              </a-select>
            </a-form-item></td>
            <td>
              <a-form-item>
                <a-button type="default" style="margin: 0 5px;" v-if="i != 0" @click="() => vformdata.cycleList.splice(i, 1)">删除</a-button>
                <a-button type="primary" v-if="i + 1 == vformdata.cycleList.length" @click.native="vformdata.cycleList.push({cycleInterval: ''})">添加</a-button>
              </a-form-item>
            </td>
          </tr>
        </table>
      </div>
      <a-form-item label="期号缩写" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
        <a-checkbox style="width: 60px; margin-right: 150px; " :checked="!issueAbbrDigitsStatus" @click.stop="issueAbbrDigitsStatus = false">全显</a-checkbox>
        <a-checkbox :checked="issueAbbrDigitsStatus" @click.stop="issueAbbrDigitsStatus = true">
          <a-input :disabled="!issueAbbrDigitsStatus" style="width: 160px;"
            addonBefore="后" addonAfter="位"
            v-decorator="['issueAbbrDigits', {  rules: issueAbbrDigitsRules } ]"/>
        </a-checkbox>
      </a-form-item>
      <!-- 期号格式为累加时 -->
      <div v-if="6 == vformdata.issueFormatType">
        <a-form-item style="display:inline-block; position: relative; left: -20px;" label="累加期号起点" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }" >
          <a-date-picker howTime format="YYYY-MM-DD" placeholder="请选择日期" v-decorator="['initDate', {  rules: [{ required: true, message: '请选择累加初始日期' }] }]"/>
        </a-form-item>
        <a-form-item style="display:inline-block; width: 215px;" >
          <a-input placeholder="请输入期号" v-decorator="['initIssue', {  rules: [{ required: true, message: '请输入累加初始期号' }] }]"/>
        </a-form-item>
      </div>
      <a-form-item title="每年国庆休市" label="休市时间1" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-checkbox :checked="vformdata.isBusinessSuspended" @click="toChangeIsBusinessSuspended()">休市</a-checkbox>
        <a-range-picker :disabled="!vformdata.isBusinessSuspended" showTime format="YYYY-MM-DD HH:mm:ss" :placeholder="['请选择', '请选择']" v-decorator="[ 'nationalDay', {  rules: [{ required: vformdata.isBusinessSuspended, message: '请选择休市时间1' }] }]"/>
      </a-form-item>
      <a-form-item title="每年过年休市" label="休市时间2" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-checkbox :checked="vformdata.isBusinessSuspended" @click="toChangeIsBusinessSuspended()">休市</a-checkbox>
        <a-range-picker :disabled="!vformdata.isBusinessSuspended" showTime format="YYYY-MM-DD HH:mm:ss" :placeholder="['请选择', '请选择']" v-decorator="[ 'newYear', {  rules: [{ required: vformdata.isBusinessSuspended, message: '请选择休市时间2' }] }]"/>
      </a-form-item>
      <a-form-item label="备注" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-textarea :rows="4" placeholder="请输入" v-decorator="[ 'remark', {  rules: [{ required: true, message: '请输入备注' }] }]"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = '_weeks,cycleType,issueFormatType,timeZoneType,timeType'
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id,isBusinessSuspended'; // const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

@Component({ dictionary, formOptions })
export default class TimeTrayTypeForm extends Vue {

  vformdata = {cycleType: '0', nationalDay: [], newYear: [], cycleList: [] };
  issueAbbrDigitsStatus = false

  visible = true;
  loading = false;

  @Computed() title() {
    return this.vform.data.id ? `修改时间盘口类型` : `添加时间盘口类型`;
  }

  @Computed() issueAbbrDigitsRules() {
    if (!this.issueAbbrDigitsStatus) return [];
    return [{ required: true, message: '请输入' }, this.$rules.range(1, 100) ];
  }

  @Watch('vformdata.cycleList', {immediate: true}) 
  onWatchCycleList(cycleList) {
    if (this.vformdata.cycleList.length == 0) this.vformdata.cycleList.push({cycleInterval: ''});
  }

  /** 改变是否休市 */
  toChangeIsBusinessSuspended() {
    this.vform.setValue('isBusinessSuspended', !this.vform.data.isBusinessSuspended);
  }

  /** 提交 */
  async submit() {
    this.vform.cleanUpUselessFields();
    const form = await this.vform.validate();
    if (form.errors) return;
    this.loading = true;
    const apiName = this.vform.data.id ? '/config-admin-api/lotteryCycle/editLotteryCycle' : '/config-admin-api/lotteryCycle/addLotteryCycle';

    const [nationalDayStartTime, nationalDayEndTime] = this.$tools.formatDateObj(form.original.nationalDay, '0,1');
    const [newYearStartTime, newYearEndTime] = this.$tools.formatDateObj(form.original.newYear, '0,1');
    const initDate = this.$tools.formatDate(form.original.initDate, 'YYYY-MM-DD');
    const cycleList = form.original.cycleList.map(d => this.$tools.formatDateObj(d, 'cycleStartTime,cycleEndTime', 'HH:mm:ss'));
    if (!this.issueAbbrDigitsStatus) form.vals.issueAbbrDigits = 0;

    form.vals = {...form.vals, initDate, nationalDay: undefined, nationalDayStartTime, nationalDayEndTime, newYear: undefined, newYearStartTime, newYearEndTime, cycleList};

    const res = await this.$service.fetch(apiName, form.vals);
    this.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close', true);
  }

  @Lifecycle() async created() {
    this.vform.vbind('vformdata', 'cycleList');
    
    //设定初始值
    const data = this.params.data || {};
    this.$tools.parseMomentObj(data, 'initDate,nationalDayEndTime,nationalDayStartTime,newYearEndTime,newYearStartTime');
    data.isBusinessSuspended = typeof data.isBusinessSuspended == 'undefined' ? true : Boolean(data.isBusinessSuspended);
    data.nationalDay = [data.nationalDayStartTime, data.nationalDayEndTime].filter(d => d);
    data.newYear = [data.newYearStartTime, data.newYearEndTime].filter(d => d);
    // 此处有坑，如果新增表单，赋值，提示没有效果
    if (data.id) this.issueAbbrDigitsStatus = 0 != data.issueAbbrDigits;
    data.cycleList && data.cycleList.forEach(d => this.$tools.parseMomentObj(d, 'cycleStartTime,cycleEndTime', 'HH:mm:ss'));
    this.vform.setValues(data, true);
  }
}
</script>

