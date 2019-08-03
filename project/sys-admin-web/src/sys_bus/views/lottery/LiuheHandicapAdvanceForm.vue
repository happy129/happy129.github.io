<style lang="scss" scoped>
.wrapper {
  h1 { font-size: 16px; font-weight: bold; }
  .input { width: 200px; }
  .span1 { display: inline-block; min-width: 80px; margin-right: 20px }
  .panel2 {
    margin: 10px -15px 0;  width: 100%; border-top: 1px solid #ddd;
    padding: 15px 15px 0; 
    > button { margin-right: 15px; }
  }
  /deep/ {
    .ant-form {
      margin: 20px 0 20px 40px;
    }
    .ant-form-item-label {
      min-width: 120px;
    }
    .ant-form-item-control { min-width: 200px; margin-right: 40px; }
    .ant-calendar-picker-input {
      width: 200px;
    }
  }
}
</style>
<template>
  <div class="wrapper">
    <a-form :form="vform" layout="inline">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      <a-form-item label="期号" >
        <a-input :disabled="true" v-decorator="['issueNo']"/>
      </a-form-item>
      <a-form-item label="状态" v-if="vform.data.status">
		<template>{{dictionary.marksixStatus.get(vform.data.status)}}</template>
        <!-- <a-button ref="btnChangeStatus" @click.native="toChangeStatus()" size="small" ghost type="primary">{{dictionary.marksixStatus.get(vform.data.status)}}</a-button> -->
      </a-form-item>
      <br>
      <a-form-item label="自动开盘时间">
        <a-date-picker :disabled="true" showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择" v-decorator="['beginTime', $rules.requiredSelect()]"/>
      </a-form-item>
      <a-form-item label="自动封单时间">
        <a-date-picker :disabled="true" showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择" v-decorator="['endTime', $rules.requiredSelect()]"/>
      </a-form-item>
    </a-form>
    <!-- <div style="width: 790px; text-align: center;">
      <a-button type="primary" ref="btnSave" :disabled="endTimeDisabled" @click.native="toSubmit()">保存设置</a-button>
    </div> -->
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';


const dictionary = 'marksixStatus';
const formOptions = 'id,status';

@Component({ dictionary, formOptions })
@InjectComponents({ })
export default class LiuheHandicapCurrentForm extends Vue {

  vformdata = {};

  @Computed() endTimeDisabled() {
    let {status} = this.vformdata;
    status = +status;
    if (!status) return false;
    if (status >= 3) return true;
    return false;
  }

  /** 抓取盘口信息 */
  async fetchCurrentCap() {
    // this.$refs.btnSave.sLoading = true;
    const res = await this.$service.fetch('/config-admin-api/marksixIssue/getNextIssueInfo', { });
    // this.$refs.btnSave.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);

    this.$tools.parseMomentObj(res.data||{}, 'beginTime,endTime');
    this.vform.setValues(res.data||{}, true);
  }

  /** 更改状态 */
  async toChangeStatus() {
    if (!await this.$confirm({title:'溫馨提示',content:'请确定你的操作'})) return;
	let {status, id} = this.vformdata;
	if (+status >= 3) return;
	status = +status + 1;
	// this.$refs.btnSave.sLoading = false;
	const res = await this.$service.fetch('/config-admin-api/marksixIssue/editStatus', { status, id });
	// this.$refs.btnSave.sLoading = true;
	if (1 != res.code) return res.message && this.$message.error(res.message);
	this.$message.success(res.message);
	this.fetchCurrentCap();
  }

  /** 保存设置 */
  async toSubmit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    this.$tools.formatDateObj(form.values, 'beginTime,endTime');
    // this.$refs.btnSave.sLoading = true;
    const apiName = '/config-admin-api/marksixIssue/editMarksixIssue';
    const res = await this.$service.fetch(apiName, form.values);
    // this.$refs.btnSave.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fetchCurrentCap();
  }

  @Lifecycle() mounted() {
    this.vform.vbind('vformdata');
    this.fetchCurrentCap();
  }
}
</script>
