<template>
	<div style="overflow:auto" class="page-container">
		<a-tabs>
			<a-tab-pane tab="聊天室设置" key="1" v-if="premissions.includes('chatManager:chatSetting:set')">
				<SettingIndex />
			</a-tab-pane>
			<a-tab-pane tab="聊天室客服管理" key="2" v-if="premissions.includes('chatManager:chatSetting:service')">
				<ServiceManage />
			</a-tab-pane>
		</a-tabs>
	</div>
</template>

<script>
	import Vue from 'vue'
	import {
		Component,
		InjectComponents,
		Lifecycle
	} from 'vue-decorators'
	import {
		ServiceManage,
		SettingIndex
	} from './Setting'

	@Component
	@InjectComponents({
		ServiceManage,
		SettingIndex
	})
	export default class ChatSetting extends Vue {
	
	}
</script>