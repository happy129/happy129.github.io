<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <div class="mt15">
        <a-form-item label="用户名">
          <a-input placeholder="请输入用户名" v-model.trim="form.userName"/>
        </a-form-item>
        <!-- <a-form-item label="用户ID"> 需求隐藏
          <a-input placeholder="请输入用户ID" v-model.trim="form.userId"/>
        </a-form-item> -->
        <a-form-item>
			<div>
				<a-button @click='()=>{this.form.userName="";this.form.userId=""}'>重置</a-button>&nbsp;
        <a-button type='primary' :loading="loading" @click="_vipUpgradeQueryCurrentProgress(true)">查询</a-button>
			</div>
        </a-form-item>
      </div>
    </a-form>
    <div class="g-gray-border mt15">
      <div class="mt15">
        <div class="mt15">
          <a-table :loading="loading" :rowKey="(r,i)=>i" @change="changeTablePagenation" :pagination="paginationParams" :columns="table.columns" :dataSource="table.dataSource" size="small">
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
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';
import moment from 'moment';
@Component({
	methods:{
		moment
	}
})
@InjectComponents({ DateSwitch })
export default class DepositTotal extends Vue {
  // 表格
  table = {
    rowSelection: {},
    dataSource: [],
    columns: [
      {title: '用户名', dataIndex: 'userName'},
      {title: '等级', dataIndex: 'vipLevel'},
      {title: 'VIP等级名', dataIndex: 'vipLevelName'},
      {title: '当前进度', dataIndex: 'totalBetAmount'},
      {title: '距下次升级所需打码量', dataIndex: 'remainlBetAmount'},
      {title: '创建时间', dataIndex: 'createTime'},
    ]
  }
  // 弹窗里面用到的数据

	form={pageNo:1,pageSize:10, userId:"",userName:"" }
	paginationParams={ pageNo: 1, total:0 };
  loading = false;

// 切换分页 
  changeTablePagenation(pagination) {
	this.form.pageNo = pagination.current;
	this.paginationParams.pageNo = pagination.current;
	this._vipUpgradeQueryCurrentProgress();
	}


  resetPagination() {
    this.form.pageNo = 1;
    this.paginationParams.pageNo = 1;
  }

/* 获取首充列表 */
async _vipUpgradeQueryCurrentProgress(refresh){
    if (refresh) this.resetPagination();
    this.loading = true;
    let { data: req } =	await Api.vipUpgradeQueryCurrentProgress(this.form);
    this.loading = false;
		  if (req?.body?.code == 1 &&req?.body?.data) {
			   this.table.dataSource=req.body.data.records
			   this.paginationParams.total=req.body.data.totalCount;
		   }
	}



	@Lifecycle() created(){
		this._vipUpgradeQueryCurrentProgress();
	}

  
}
</script>
