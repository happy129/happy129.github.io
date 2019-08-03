<template>
  <div>
    <a-modal :closable="false"  v-model="modalShow" :footer="null" :destroyOnClose="true" :maskClosable="false" >
      <template slot="title">
				<div style="display:flex;justify-content:space-between;">
					<div>总后台通知</div>
					<a style="color:#fff;" @click="_cancel">X</a>
				</div>
			</template>
			<div style="text-align:left;">
        <a-form>
          <a-form-item  label="消息标题" v-bind="formItemLayout">
            <a-input :disabled="true" placeholder="消息标题" v-model="details.title" ></a-input>
          </a-form-item>
          <a-form-item  label="消息类别" v-bind="formItemLayout">
           <a-select :disabled="true" placeholder="选择消息类别" v-model="details.messageTypeId">
            <a-select-option v-for="(item, index) in queryAllMessageTypeList" :key="index" :value="item.id">{{item.typeName}}</a-select-option>
          </a-select>
          </a-form-item>
					<a-form-item  label="发送时间" v-bind="formItemLayout">
            <a-input :disabled="true" placeholder="发送时间" v-model="details.createTime" ></a-input>
          </a-form-item>
          <a-form-item label="消息内容" v-bind="formItemLayout">
            <a-textarea :disabled="true" :rows="4" placeholder="消息内容" v-model="details.content" ></a-textarea>
          </a-form-item>
          <!-- <div style="text-indent:110px;">
            <a-button type="primary" @click="">确定</a-button>
          </div> -->
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Computed, Lifecycle, Watch,Prop } from "vue-decorators";

@Component({})
@InjectComponents({})
export default class ChangeRecord extends Vue {
	modalShow=false;
	formItemLayout={ labelCol: { span: 6 }, wrapperCol: { span: 15 }, };
	details={};
	queryAllMessageTypeList=[];
	/** 获取消息类别 */
	async _queryAllMessageType(obj) {
		let res = await this.$service.fetch("/config-admin-api/messageType/queryAllMessageType");
		if (1!==res.code) return res.message && this.$message.error(res.message);
		this.queryAllMessageTypeList=res.data;
	}
	/** 获取详细消息 */
	async _getMessage(obj) {
		let res = await this.$service.fetch("/config-admin-api/message/getMessage",{id:obj.data});
			if (1!==res.code) return res.message && this.$message.error(res.message);
			this.details=res.data;
			this.modalShow=true;
	}
	_cancel(e){
		this.$modal.confirm({
          title: "提示",
          content: "尊敬的客户，您可以在消息管理中继续查看本条通知。",
          onOk: () => this.modalShow=false
        });
	}
  @Lifecycle() async created() {
		this._queryAllMessageType();
	}
}
</script>
