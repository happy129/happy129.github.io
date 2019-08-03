<template>
	<div class="page-container">
		<div class="mt15">
			<a-form layout="inline">
				<a-form-item>
					<a-button v-permission="20222" type="primary" @click="init.visible=true">发布通知</a-button>
				</a-form-item>
			</a-form>
		</div>
		<div class="mt15">
			<a-table class="mytable" bordered  :columns="table.columns" :rowKey="e => e.id" :dataSource="table.tableData"
				@change="changeTablePagenation" :pagination="table.pagination">
				<template slot="isIosPushed" slot-scope="text, record">
					<span v-if="record.isIosPushed == 1">是</span>
					<span v-else>否</span>
				</template>
				<template slot="isAndroidPushed" slot-scope="text, record">
					<span v-if="record.isAndroidPushed == 1">是</span>
					<span v-else>否</span>
				</template>
			</a-table>
		</div>
		<!-- 弹窗 -->
		<a-modal title="发布通知" :confirmLoading="confirmLoading" :visible="init.visible" @ok="submit" @cancel="handleCancel" :destroyOnClose="true" :maskClosable="false">
			<a-form :form="formEl" class="modelForm" layout="inline">
				<a-form-item label="友盟通知:">
					<a-checkbox :defaultChecked="true" @change="onChangeIOS">IOS</a-checkbox>
					<a-checkbox :defaultChecked="true" @change="onChangeAndroid">Android</a-checkbox>
				</a-form-item>
				<div class="mt15">
					<a-form-item label="通知内容:">
						<a-textarea placeholder="" v-decorator="[ 'content', {rules: [{ required: true, message: '请输入通知内容'}]} ]" :rows="4" />
					</a-form-item>
				</div>

			</a-form>
		</a-modal>
	</div>
</template>

<script>
	import Vue from 'vue'
	import { Component, Lifecycle, State, Computed } from 'vue-decorators'
	import * as Api from '@api/notice'
	import { formatDate } from '@/util/date'
	import { Modal } from 'ant-design-vue';

@Component
	export default class NoticeRealtime extends Vue {
		init = {
			visible: false
		}
		//表格
		table = {
			columns: [{
					title: 'ID',
					dataIndex: 'id',
				},
				{
					title: '作者',
					dataIndex: 'author',
				},
				{
					title: '通知内容',
					dataIndex: 'content',
				},
				{
					title: 'IOS',
					scopedSlots: {
						customRender: 'isIosPushed'
					}
				},
				{
					title: 'Android',
					scopedSlots: {
						customRender: 'isAndroidPushed'
					}
				},
				{
					title: '创建时间',
					dataIndex: 'createTime'
					, width: 140
					
				}
			],
			tableData: [],
			pagination: {
				total: 0,
				current: 1
			}
		}
		// 接口请求参数
		requestParams = {
			pushNoticePage: {
				pageNo: 1,
				pageSize: 10,
			},
			pushNoticeAdd: {
				createTime: formatDate(new Date()),
				isIosPushed: 1,
				isAndroidPushed: 1,
				author: '',
				id: '',
			}
			//  TODO: author和id先写的静态数据
		};
	
		confirmLoading = false;

		@State(e => e.auth.userInfo) userInfo;

		@Lifecycle mounted() {
			this.requestParams.pushNoticeAdd.author= this.userInfo?.userName
			this.pushNoticePage();
		}

		@Lifecycle created() {
			this.formEl = this.$form.createForm(this);
		  this.requestParams.pushNoticeAdd.author = this.userInfo?.userName;
		}

		onChangeIOS(e) {
			this.requestParams.pushNoticeAdd.isIosPushed = e.target.checked * 1
		}
		onChangeAndroid(e) {
			this.requestParams.pushNoticeAdd.isAndroidPushed = e.target.checked * 1
		}

		// 切换分页 
		changeTablePagenation(pagination) {
			this.table.pagination.current = pagination.current;
			this.requestParams.pushNoticePage.pageNo = pagination.current;
			this.pushNoticePage();
		}
		handleCancel(e) {
			this.init.visible = false
		}

		// 获取通知列表
		async pushNoticePage() {
			const {
				data: response
			} = await Api.pushNoticePage(this.requestParams.pushNoticePage);
			if (response?.body?.code === 1 && response?.body?.data?.records instanceof Array) {
				this.table.tableData = response.body.data.records;
				this.table.pagination.total = response.body.data.totalCount;
			}
		}
		async submit() {
			this.formEl.validateFields(async (err, values) => {
				if(err) return
				this.confirmLoading = true;
				const { data: response } = await Api.pushNoticeAdd(Object.assign(values, this.requestParams.pushNoticeAdd));
				this.confirmLoading = false;
				if (response?.body?.code === 1) {
					this.pushNoticePage()
					this.init.visible = false
				}
			});
		}
	}
</script>
<style lang="scss">
	.ant-btn-primary {
		margin-right: 5px
	}

	textarea {
		width: 300px;
	}
</style>