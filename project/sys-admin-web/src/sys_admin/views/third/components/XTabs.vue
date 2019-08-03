<template>
  <div>
    <a-tabs v-if="allGs[0]" :defaultActiveKey="isAll?'':allGs[0].id" @change="changeTab">
      <a-tab-pane tab="全部" :key="''" v-if="isAll"></a-tab-pane>
      <a-tab-pane v-for="v of allGs" :tab="v.thirdGameTypeName" :key="v.id"></a-tab-pane>
    </a-tabs>
		<a-spin :spinning="spinning">
			<a-tabs v-if="typeGs[0]" :defaultActiveKey="typeGs[0].id"  @change="changeSubTab" >
      <a-tab-pane v-for="item of typeGs" :tab="item.thirdGameName" :key="item.id"></a-tab-pane>
    	</a-tabs>
    </a-spin>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Computed, Lifecycle, Watch,Prop } from "vue-decorators";

@Component({})
@InjectComponents({})

export default class XTabs extends Vue {

	@Prop({type:Boolean,default:true}) isAll;
	// 所有游戏
	allGsItem={};
	typeGsItem={};
  allGs = [];
	typeGs = [];
	spinning=false;
	// 所有游戏类型
  async getAllGs() {
    let res = await this.$service.fetch( "/config-admin-api/thirdGameType/queryAllThirdGameType",{});
		this.allGs = res.data;
		this.$emit('getAllGs');
	}
	// 当前游戏类型下的所有游戏
  async getTypeGs(id) {
		this.spinning=true;
		let res = await this.$service.fetch( "/config-admin-api/thirdGame/queryThirdGameByGameTypeId", { pageNo: 1, pageSize: 1000, thirdGameTypeId:id});
		this.spinning=false;
		this.typeGs = res.data||[];
		if(!this.typeGs.length){
			this.$emit('tabClick',{tab:{thirdGameTypeName:this.allGs[0].thirdGameTypeName,id:this.allGs[0].id},subTab:{}});
		}else{
			this.allGsItem=this.allGs.filter(item=>item.id==id);
			this.$emit('tabClick',{tab:this.allGsItem[0]||{name:"全部",id:""},subTab:this.typeGs[0]||{}});
		}
  }
  async changeTab(id) {
		this.typeGs=[];
		if(!id){
			this.$emit('tabClick',{tab:{thirdGameTypeName:"全部",id:""},subTab:{}});
			this.typeGs=[];
			this.spinning=false;
			return;
		};
		await this.getTypeGs(id);
	}
	/** 子tab方法  */
  async changeSubTab(id) {
		this.typeGsItem=this.typeGs.filter(item=>item.id==id);
		this.$emit('tabClick',{tab:this.allGsItem[0]||{name:"全部",id:""},subTab:this.typeGsItem[0]||{}});
  }
  @Lifecycle() async created() {
		await this.getAllGs();
	}
}
</script>