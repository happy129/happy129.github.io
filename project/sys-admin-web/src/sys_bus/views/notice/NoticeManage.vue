<template>
	<div class="page-container">
		<section class="noticeManage">
			<div class="mt15">
				<a-form layout="inline">
					<a-form-item label="标题：">
						<a-input v-model="requestParams.announcementPage.title" />
					</a-form-item>
					<a-form-item>
						<a-button @click="searchNotice" type="primary">搜索</a-button>
					</a-form-item>
					<a-form-item>
						<a-button v-permission="20218" @click="addNotice" type="primary">添加公告</a-button>
					</a-form-item>
				</a-form>
			</div>
			<div class="mt15">
				<a-table class="mytable" bordered  :columns="table.columns" :rowKey="e => e.id" :pagination="table.pagination"
					@change="changeTablePagenation" :dataSource="table.tableData">
					<template slot="subTitle" slot-scope="text, record">
						<a-tooltip placement="top" >
							<template slot="title">
								<span>{{record.title}}</span>
							</template>
							<span>{{record.title.slice(0,30)}}</span>
						</a-tooltip>
					</template>
					<template slot="operate" slot-scope="text, record">
						<a-button v-permission="20219"  type="primary" @click="updateNotice(record)" size="small">修改</a-button>
						<a-button v-permission="20220"  type="primary" @click="deleteNotice(record)" size="small">删除</a-button>
					</template>
					<template slot="isEnabled" slot-scope="text, record">
						<span v-if="record.isEnabled == 1">启用</span>
						<span v-else>停用</span>
					</template>
					<template slot="isRoll" slot-scope="text, record">
						<span v-if="record.isRoll == 1">是</span>
						<span v-else>否</span>
					</template>
					<template slot="isPopup" slot-scope="text, record">
						<span v-if="record.isPopup == 1">是</span>
						<span v-else>否</span>
					</template>
					<template slot="isTop" slot-scope="text, record">
						<span v-if="record.isTop == 1">是</span>
						<span v-else>否</span>
					</template>
						<template slot="isPush" slot-scope="text, record">
						<span v-if="record.isPush == 1">是</span>
						<span v-else>否</span>
					</template>
					
				</a-table>
			</div>
			<!-- 弹窗 -->
			<a-modal :destroyOnClose="true" :maskClosable="false" :width="770"  :title="init.isEdit?'修改公告':'添加公告'" :visible="init.visible" @ok="submit" @cancel="handleCancel">
				<a-form :form="vform" class="modelForm" >
					<div>
						<a-form-item label="公告标题" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-input placeholder="输入公告标题"
								v-decorator="[ 'title', {rules: [{  required: true, message: '请输入公告标题!' }]} ]" />
						</a-form-item>
					</div>
					<div class="mt15">
						<a-form-item label="排序" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-input v-number placeholder="输入排序值"
								v-decorator="[ 'sortOrder', {rules: [{pattern:/^\d*$/, required: true, message: '排序值为数字' }]} ]" />
						</a-form-item>
					</div>
					<div class="mt15">
						<a-form-item label="公告内容:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
								<Editor :key="editorKey" @edit="editing" :editContent="editContent"/>
						</a-form-item>
					</div>
					<div class="mt15">
						<a-form-item label="滚动内容:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-textarea style="width:100%" placeholder="请输入滚动内容" v-decorator="[ 'rollContent', {rules: [{ required: false }]} ]" :rows="4"/>
						</a-form-item>
					</div>
					<div class="mt15">
						<a-form-item label="描述:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-input style="width:100%"  v-decorator="[ 'description', {rules: [{ required: false }]} ]"/>
						</a-form-item>
					</div>
					<div>
						<a-form-item label="状态:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-radio-group v-decorator="[ 'isEnabled']">
								<a-radio value="1">启用</a-radio>
								<a-radio value="0">停用</a-radio>
							</a-radio-group>
						</a-form-item>
						<a-form-item label="滚动:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-radio-group v-decorator="[ 'isRoll']">
								<a-radio value="1">是</a-radio>
								<a-radio value="0">否</a-radio>
							</a-radio-group>
						</a-form-item>
					</div>
					<div>
						<a-form-item label="置顶:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-radio-group v-decorator="[ 'isTop']">
								<a-radio value="1">是</a-radio>
								<a-radio value="0">否</a-radio>
							</a-radio-group>
						</a-form-item>
						<a-form-item label="弹窗:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-radio-group v-decorator="[ 'isPopup']">
								<a-radio value="1">是</a-radio>
								<a-radio value="0">否</a-radio>
							</a-radio-group>
						</a-form-item>
						
						<a-form-item  label="立即通知:" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
							<a-radio-group v-decorator="[ 'isPush']">
								<a-radio value="1">是</a-radio>
								<a-radio value="0">否</a-radio>
							</a-radio-group>
						</a-form-item>

					</div>
				</a-form>
			</a-modal>
		</section>
	</div>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Watch, InjectComponents  } from 'vue-decorators'
import * as Api from '@api/notice'
import { Modal } from 'ant-design-vue';
import { formatDate } from '@/util/date'
import Editor from "@/components/editor";

	@Component({ formOptions: "el" })
	@InjectComponents({ Editor })
	export default class NoticeManage extends Vue {
		editorKey = 1;

		init = {
			record: {},
			visible : false,
			checkType : 1,
			selectId : '',
			isEdit : false
		}
		// 表格
		table = {
			columns: [{ title: 'ID', dataIndex: 'id' },
				{ title: '公告标题', dataIndex: 'title',scopedSlots: { customRender: 'subTitle' }  },
				{ title: '排序', dataIndex: 'sortOrder' },
				{ title: '状态', scopedSlots: { customRender: 'isEnabled' } },
				{ title: '滚动', scopedSlots: { customRender: 'isRoll' } },
				{ title: '弹窗', scopedSlots: { customRender: 'isPopup' } },
				{ title: '置顶', scopedSlots: { customRender: 'isTop' } },
				{ title: '通知', scopedSlots: { customRender: 'isPush' } },
				{ title: '创建时间', dataIndex: 'createTime', width: 140 },
				{ title: '操作', scopedSlots: { customRender: 'operate' }, width: 140 }
			],
			tableData: [],
			pagination: {
				total: 0,
				current: 1
			}
		}
		// 切换分页 
		changeTablePagenation(pagination) {
			this.table.pagination.current = pagination.current;
			this.requestParams.announcementPage.pageNo = pagination.current;
			this.announcementPage();
		}
		// 接口请求参数
		requestParams = {
			announcementPage: {
				pageNo: 1,
				pageSize: 10,
				title: ""
			},
		};

		editContent = "";
		description = "";
		//  富文本编辑内容
		editing(content) {
			this.description = content;
		}

		@Watch('init.visible') changeModal(news, olds) {
			if (news && !this.init.isEdit) {
				this.setInitialValue();
			}
		}

		@Lifecycle mounted() {
			this.announcementPage();
		}

		setInitialValue() {
			this.vform.setValues({
				isEnabled: '1',
				isRoll: 1,
				isTop: 1,
				isPopup: 1,
				isPush: 1
			}, true);
		}

		updateNotice(record) {
			this.init.record = record;
			this.init.isEdit = true;
			// 设置表单选中的值
			this.vform.setValues(record, true);
			this.editContent = record.content;
			this.init.selectId = record.id
			this.init.visible = true
		}
		showModal() {
			this.init.visible = true
		}
		handleCancel(e) {
			this.init.visible = false
		}

		async submit() {
				let apiUrl = 'announcementAdd'
				const form  = await this.vform.validate();

				if(form.errors) return;
					
				if(this.init.isEdit){
					form.values.id = this.init.selectId
					apiUrl = 'announcementEdit'
				}

				form.values.createTime = formatDate(new Date())
				form.values.content = this.description;

				if (form.values.content == "") {
					return this.$message.error("请先填写公告内容");
				}

				const { data: res } = await Api[apiUrl](form.values);

				if (res.body?.code != 1) return res.body?.message && this.$message.error(res.body?.message);
				this.$message.success(res.body?.message);

				this.announcementPage()
				this.init.visible = false;
				
		}
		// 新增公告
		addNotice() {
			this.init.isEdit = false;
			this.init.visible = true
			this.editContent = "";
		}
		//搜索
		searchNotice() {
			this.announcementPage()
		}
		deleteNotice(item) {
			Modal.confirm({
				content: '确定要删除选中的组别吗?',
				onOk: async () => {
					const {
						data: response
					} = await Api.announcementRemove({
						id: item.id
					});
					if (response ?.body?.code === 1) {
						this.announcementPage()
					}
				}
			});
		}
		// 获取公告管理
		async announcementPage() {
			const { pageNo, pageSize, title } = this.requestParams.announcementPage;
			const { data: response } = await Api.announcementPage({ pageNo, pageSize, title });
			if (response ?.body?.code === 1 && response?.body?.data?.records instanceof Array) {
				this.table.tableData = response.body.data.records;
				this.table.pagination.total = response.body.data.totalCount;
			}
		}
	}
</script>
<style lang="scss">
	.ant-btn-primary {
		margin-right: 5px
	}
	.modelForm {
		.ant-form-item {
			margin-bottom: 0
		}
		.ant-form-item-label {
			label {
				width: 80px;
				display: inline-block;
				text-align: right;
			}
		}

		textarea {
			width: 300px;
		}
	}
</style>