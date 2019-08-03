<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <date-switch @changeTab="changeTabTime" />
      <div class="mt15">
		  <a-form-item class="sign-reset"  label="发放时间">
          <!-- <a-range-picker v-model="defaultValueTime" format="YYYY-MM-DD HH:mm:ss"/> -->
           <DateRange title='' @change="changeDate" ref="rg"/>
        </a-form-item>
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <!-- <a-form-item label="用户ID">
          <a-input placeholder="请输入用户ID" v-model.trim="form.userId"/>
        </a-form-item> -->
        <a-form-item>
			<div>
				<a-button @click='reset'>重置</a-button>&nbsp;
        <a-button type='primary' :loading="loading" @click="_vipUpgradeQueryByPage(true)">查询</a-button>
			</div>
        </a-form-item>
      </div>
    </a-form>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <div class="mt15">
          <a-table :loading="loading" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource"  size="small">
            <template slot="operation" slot-scope="text,record">
              <a-button type='primary' size='small' @click="showPormotionDialog({title:'首充赠送详情',data:record})">详情</a-button>
            </template>
          </a-table>
        </div>
      </div>
    </div>

  </section>
</template>

<script>
import Vue from 'vue'
import { Component,Computed, InjectComponents, Lifecycle } from 'vue-decorators'
import { DateSwitch } from '@/components/switch'
import DateRange from '@/components/date-range/DateRange'
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';


@Component()
@InjectComponents({ DateSwitch, DateRange })
export default class DepositTotal extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
      {title: '用户名', dataIndex: 'userName'},
      {title: '礼金', dataIndex: 'bonus'},
      {title: '等级', dataIndex: 'vipLevelName'},
      {title: '发放时间', dataIndex: 'createTime'},
    ]
  }
  // 弹窗里面用到的数据
	defaultValueTime=[];
	form={beginTime:"",endTime: "",pageNo:1,pageSize:10, userId:"",userName:"" }
	paginationParams={ pageNo: 1, total:0 };
  loading = false;

// 切换分页 
  changeTablePagenation(pagination) {
    this.form.pageNo = pagination.current;
    this.paginationParams.pageNo = pagination.current;
    this._vipUpgradeQueryByPage();
  }
  
  reset() {
    this.defaultValueTime=[];
    this.form.userName="";
    this.form.userId="";
    this.form.beginTime = "";
    this.form.endTime = "";
    this.$refs.rg.clear();
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.beginTime = datestring
    } else {
      this.form.endTime = datestring
    }
  }

	changeTabTime(startDate, endDate){
		this.form.beginTime=startDate;
    this.form.endTime=endDate;
    this.$refs.rg.setDateRangeValues(startDate, endDate);
	}

  resetPagination() {
    this.paginationParams.pageNo = 1;
    this.form.pageNo = 1;
  }

/* 获取首充列表 */
async _vipUpgradeQueryByPage(refresh){
		// this.form.beginTime=this.defaultValueTime.length?this.defaultValueTime[0].format('YYYY-MM-DD hh:mm:ss'):"";
    // this.form.endTime=this.defaultValueTime.length?this.defaultValueTime[1].format('YYYY-MM-DD hh:mm:ss'):"";
    if (refresh) this.resetPagination();

    this.loading = true;
    let { data: req } =	await Api.vipUpgradeQueryByPage(this.form);
    this.loading = false;
		  if (req?.body?.code == 1 &&req?.body?.data) {
			   this.table.dataSource=req.body.data.records
			   this.paginationParams.total=req.body.data.totalCount;
		   }
	}



	@Lifecycle() created(){
		this._vipUpgradeQueryByPage();
	}

  
}
</script>

<style lang="scss" scoped>
/deep/ .sign-reset {
  .ant-form-item {
    margin-right: 0;
  }
}
</style>