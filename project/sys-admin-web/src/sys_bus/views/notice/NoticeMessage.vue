<template>
  <div class="page-container">
    <div class="mt15">
      <a-form layout="inline">
        <a-form-item  v-permission="20224">
          <a-button type="primary" @click="()=>{init.visible=true;this.isViewContent=true;this.details={}}">发布站内信</a-button>
        </a-form-item>
        <a-form-item  v-permission="20225">
          <a-button type="primary" @click="deleteMsg">删除</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="mt15">
      <a-table class="mytable" bordered :rowSelection="table.rowSelection" :rowKey="e => e.id" 
			:columns="table.columns" @change="changeTablePagenation" :dataSource="table.tableData" :pagination="table.pagination" >
        <template slot="isPopup" slot-scope="text, record">
           {{dictionary.booleanType.get(record.isPopup)}}
        </template>
        <template slot="groupType" slot-scope="text, record">
          {{dictionary.targetType.get(record.targetType)}}
        </template>
        <template slot="isPush" slot-scope="text, record">
          {{dictionary.booleanType.get(record.isPush)}}
        </template>
        <template slot="content" slot-scope="text, record">
         <a v-permission.link="20226" @click="$btns.includes(20226) && _viewContent(record)">{{text}}</a>
        </template>
        <template slot="type" slot-scope="text, record">
          <!-- <span>共发送{{record.sendCount}}条</span> -->
          <span>已读<b style="display: inline-block; margin: 0 4px;">{{record.readedCount}}</b>条,</span>
          <span>未读<b style="display: inline-block; margin: 0 4px;">{{record.sendCount - record.readedCount}}</b>条</span>
        </template>
      </a-table>
    </div>
    <!-- 弹窗 -->
    <a-modal title="发布站内信" :visible="init.visible" @ok="submit" @cancel="handleCancel" :maskClosable="false" :destroyOnClose="true">
      <a-form :form="formEl" class="modelForm" layout="inline">
        <div class="mt15">
          <a-form-item label="标题">
            <a-input :disabled="!isViewContent" placeholder="输入站内信标题" v-decorator="[ 'title', {initialValue:details.title||'',rules: [{ required: true, message: '请输入站内信标题' }]} ]" />
          </a-form-item>
        </div>
        <div class="mt15">
          <a-form-item label="站内信内容:">
            <a-textarea :disabled="!isViewContent" placeholder v-decorator="['content', {initialValue:details.content||'',rules: [{ required: true, message: '请输入站内信内容' }]} ]" :rows="4" />
          </a-form-item>
        </div>
        <div>
          <a-form-item  label="选中会员:">
            <a-radio-group :disabled="!isViewContent" v-decorator="['groupType',{initialValue:details.groupType?details.groupType:0}]" @change="onChangeNames">
              <a-radio :value="0">所有会员</a-radio>
              <a-radio :value="1">部分会员</a-radio>
            </a-radio-group>
          </a-form-item>
					<a-form-item style="margin-left:90px;">
            <a-textarea :disabled="!isViewContent" placeholder="以逗号隔开会员名" :rows="4" v-decorator="['userNames',{initialValue:details.userNames||''}]" v-if="details.groupType?details.groupType:showNamesArea" />
					</a-form-item>
        </div>
        <div v-if="isViewContent">
          <a-form-item label="弹窗:">
            <a-radio-group v-decorator="[ 'isPopup',{initialValue:1}]">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-form-item>
					<br/>
          <a-form-item label="立即通知">
            <a-radio-group v-decorator="[ 'isPush',{initialValue:1}]">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, State } from "vue-decorators";
import * as Api from "@api/notice";
import { formatDate } from "@/util/date";
import { Modal } from "ant-design-vue";
/** 数据字典 */
const dictionary = 'groupType,booleanType,targetType';

@Component({dictionary})
export default class NoticeMessage extends Vue {
	@State(s => s.auth.userInfo) userInfo;
	showNamesArea = false;
	isViewContent=true;
  onChangeNames(v) {
    this.showNamesArea = v.target.value === 1 ? true : false;
  }
	init = { visible: false };
	details={};
  // 接口请求参数
  requestParams = {
    letterPage: {
      pageNo: 1,
      pageSize: 10
    },
    letterAdd: {
      adminId: this.userInfo?.adminId,
      targetType: 0
    }
  };
  //表格
  table = {
    columns: [
      { title: "发布时间", dataIndex: "createTime", width: 140 },
      { title: "消息标题", dataIndex: "title" },
      { title: "通知内容", dataIndex: "content",scopedSlots: { customRender: "content" } },
      { title: "通知", scopedSlots: { customRender: "isPush" } },
      { title: "消息类型", scopedSlots: { customRender: "groupType" } },
      { title: "是否弹窗", scopedSlots: { customRender: "isPopup" } },
      { title: "状态", scopedSlots: { customRender: "type" }, width: 200 }
    ],
    selectedNumbers: [],
    rowSelection: {
      onChange: selectedRowKeys => {
        this.table.selectedNumbers = selectedRowKeys;
      }
    },
    tableData: [],
    pagination: {
      total: 0,
      current: 1
    }
  };
  @Lifecycle mounted() {
    this.letterPage();
  }
  @Lifecycle created() {
    this.formEl = this.$form.createForm(this);
	}
	/** 查看通知内容 */
	_viewContent(Content){
		this.details=Content;
		this.isViewContent=false;
		this.init.visible=true;
	}
  // 切换分页
  changeTablePagenation(pagination) {
    this.table.pagination.current = pagination.current;
    this.requestParams.letterPage.pageNo = pagination.current;
    this.letterPage();
  }
  handleCancel(e) {
		this.init.visible = false;
		this.showNamesArea = false;
  }
  // 获取站内信列表
  async letterPage() {
    const { data: response } = await Api.letterPage(
      this.requestParams.letterPage
    );
    if ( response?.body?.code === 1 && response?.body?.data?.records instanceof Array ) {
      this.table.tableData = response.body.data.records;
      this.table.pagination.total = response.body.data.totalCount;
    }
  }
  // 新增站内信
  async letterAdd() {
    const { data: response } = await Api.letterPage(
      this.requestParams.letterAdd
    );
    if (
      response?.body?.code === 1 &&
      response?.body?.data?.records instanceof Array
    ) {
      this.table.tableData = response.body.data.records;
      this.table.pagination.total = response.body.data.totalCount;
    }
  }

  async submit() {
    this.formEl.validateFields(async (err, values) => {
		this.requestParams.letterAdd.adminId = this.userInfo.adminId;
      if (err) return;
      const { data: response } = await Api.letterAdd( Object.assign(values, this.requestParams.letterAdd) );
      if (response?.body?.code === 1) {
        this.letterPage();
        this.init.visible = false;
				this.showNamesArea = false;
      }
    });
  }
  deleteMsg() {
		if(!this.table.selectedNumbers.length)return this.$message.error("请选择要删除的内容");
    Modal.confirm({
      content: "确定要删除选中的站内信吗?",
      onOk: async () => {
        const { data: response } = await Api.letterRemove({
          ids: this.table.selectedNumbers
        });
        if (response?.body?.code === 1) {
					this.letterPage();
					this.$message.success(response.body.message);
        }
      }
    });
  }
}
</script>
<style lang="scss" >
.ant-btn-primary {
  margin-right: 5px;
}
.modelForm {
  .ant-form-item-label {
    label {
      width: 80px;
      display: inline-block;
      text-align: right;
      margin-right: 10px;
    }
  }

  textarea {
    width: 300px;
  }
}
</style>