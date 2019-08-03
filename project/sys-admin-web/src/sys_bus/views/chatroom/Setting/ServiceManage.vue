 <template>
 	<!--报表 注单管理 -->
 	<div class="page-container">
 		<section class="gameManage">
 			<a-form layout="inline">
 				<a-form-item label="添加客服:">
 					<a-input placeholder="输入用户名" />
 				</a-form-item>
 				<a-form-item>
 					<a-button type="primary" v-permission="20280">授权</a-button>
 				</a-form-item>
 				<a-form-item>
 					<p style="color:#FF0000;">*授权的用户必须是后台添加的测试用户，聊天室后台地址：https://102.374.34.34/login</p>
 				</a-form-item>
 			</a-form>
 			<div class="mt15">
 				<a-table :columns="table.columns" :dataSource="tableData" :pagination="true">
 					<template slot="operate">
 						<a-button type="primary" v-permission="20281" size="small">删除</a-button>
 					</template>
 				</a-table>
 			</div>
 		</section>
 	</div>
 </template>

 <script>
 	import Vue from 'vue'
 	import {
 		Component,
 		InjectComponents
 	} from 'vue-decorators'
 	@Component
 	export default class ServiceManage extends Vue {
 		// 表格
 		table = {
 			columns: [{
 					title: 'ID',
 					dataIndex: 'user',
 				},
 				{
 					title: '用户名',
 					dataIndex: 'uuid',
 				},
 				{
 					title: '昵称',
 					dataIndex: 'adid',
 				},
 				{
 					title: '头像地址',
 					dataIndex: 'hot',
 				},
 				{
 					title: '操作',
 					scopedSlots: {
 						customRender: 'operate'
 					}
 				}
 			]
 		}
 		tableData = [{
 				key: 1,
 				id: 12344324324,
 				user: '张三',
 				uuid: 'bd1676164f52114dabcd9edb1',
 				adid: 'bd1676164f52114dabcd9edb1',
 				startTime: '2018/02/14 13:14:52',
 				hot: '是',
 				tags: ['nice', 'developer'],
 			},
 			{
 				key: 2,
 				id: 1234432224324,
 				user: '张三',
 				uuid: 'bd1676164f52114dabcd9edb1',
 				adid: 'bd1676164f52114dabcd9edb1',
 				startTime: '2018/02/14 13:14:52',
 				hot: '是',
 				tags: ['nice', 'developer'],
 			}
 		]

 		changeTabs(text) {
 			this.TabSelected = this.TabColumns.findIndex(v => v === text);
 		}

 	}
 </script>

 <style lang="scss" scoped>
 	.report-order-text {
 		margin: 15px 0;

 		span {
 			margin-right: 10px;
 		}
 	}

 	.gameManage {
 		.tab-switch-list.tab-sty1 {
 			width: 35%;
 			float: left;
 			padding-top: 10px;
 			margin-right: 30px;
 		}
 	}
 </style>