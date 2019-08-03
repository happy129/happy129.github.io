<template>
    <div style="overflow:auto" class="page-container">
		<a-tabs>
			<a-tab-pane tab="常见问题分类" key="1" v-if="premissions.includes('productManager:FAQ:FQACatogrey')">
				<problems-classification />
			</a-tab-pane>
			<a-tab-pane tab="常见问题内容" key="2" v-if="premissions.includes('productManager:FAQ:FQAcContent')">
				<problems-content />
			</a-tab-pane>
		</a-tabs>
	</div>
</template>
<script>
import Vue from 'vue';
import {
	Component,
	InjectComponents,
	Lifecycle
} from 'vue-decorators';
import { ProblemsClassification, ProblemsContent } from './problem/index';
@Component
@InjectComponents({
    ProblemsClassification,
    ProblemsContent
})
export default class commonprolems extends Vue {
    
}
</script>