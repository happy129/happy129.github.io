<template>
  <!--报表 注单管理 -->
  <div class="page-container">
    <section class="report-order">
      <div class="mt15">
        <a-form layout="inline">
          <a-form-item label="会员账号">
            <a-input v-model.trim="params.userName"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="_memberQuery">查询</a-button>
            <span style="color:red;"
              >&emsp;查询当前账号的所有上级，最上面的为顶级代理。</span
            >
          </a-form-item>
          <hr style="border-top:1px solid #eee;" />
          <a-form-item>
            <div>&emsp;统计:{{ pagination.total }}人</div>
          </a-form-item>
        </a-form>
      </div>
      <div class="mt15">
        <a-table
          :rowKey="(r, i) => i"
          :pagination="false"
          :columns="table.columns"
          :dataSource="table.data"
        >
        </a-table>
        <div
          style="display:flex;justify-content:space-between;margin-top:10px;"
        >
          <strong></strong>
          <a-pagination
            :current="pagination.pageNo"
            :total="pagination.total"
            @change="changeTablePagenation"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import { TabSwitch, DateSwitch } from '@/components/switch'
import XCascader from './components/XCascader'
import DateRange from "@/components/date-range/DateRange"
import moment from "moment";
import { error } from 'util';
import axios from "axios";
@Component
@InjectComponents({
	TabSwitch,
	DateSwitch,
	DateRange,
	XCascader
})
export default class ChatRecord extends Vue {
	
	buttonloading = false;
	/** 表格数据 */		
	table ={
		data:[],
		columns:[
		{title: 'ID',dataIndex: 'id'},
		{title: '上级账号',dataIndex: 'userName'},
		{title: '昵称',dataIndex: 'nickName'},
		{title: '注册时间',dataIndex: 'registerTime'},
	]
	};
	pagination={ pageNo: 1, total:0,pageSize:10};
	params={userId: 0, userName:""};
	// 切换分页 
	changeTablePagenation(current) {
		this.pagination.pageNo = current;
		this._memberQuery();
	}
	
	/** 点击显示直推业绩列表 */
	async _memberQuery(){
		const res = await this.$service.fetch( "/lottery-api/member/query", Object.assign(this.params,this.pagination) );
		if (res.code !== 1){ this.table.data=[]; this.pagination.total=0; this.$message.error(res.message); return; }
		this.table.data=res.data?.records;
		this.pagination.total=res.data?.totalCount;
	}
	@Lifecycle() created(){
		// this._memberQuery();
	}
}
</script>

<style lang="scss" scoped>
.page-container {
  .report-order {
    height: 100%;
    overflow-y: auto;
  }
}
.report-order-text {
  margin: 15px 0;

  span {
    margin-right: 10px;
  }
}
</style>