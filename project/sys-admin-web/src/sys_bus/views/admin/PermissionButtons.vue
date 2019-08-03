<template>
  <div>
    <div class="permission-buttons-list">
      <a-collapse style="position:relative;">
        <template v-for="(item, i) in tree">
          <a-checkbox style="float:left;border:none;margin-left:3px;margin-top:7px;position:absolute;z-index:999;" :key="i + `a`" :checked="item.topChecked" @change="checkedMeunAllMethod(item, $event)" ></a-checkbox>
          <a-collapse-panel :key="i" class="permission-l1" :header="item && item.permissionName" >
            <ul class="permission-l1-1" v-if="item && item.childrenList && item.childrenList.length" >
              <li @click="switchTags($event, item, i)" :class="{ active: item.current == i }" v-for="(item1, i) in item.childrenList" :key="i + `b`" >
                <a-checkbox :key="keys" :checked="item1.topChecked" @change="checkedTabAllMethod(item1, $event)" ></a-checkbox>&nbsp;{{ item1.permissionName }}
              </li>
            </ul>
            <div class="tags-btns">
              <ul class="permission-with-tag" v-if="item && item.childrenList && item.childrenList.length">
                <template v-for="(item1, i) in item.childrenList">
                  <li :key="item1.id" v-show="item.current == i" v-if=" item1 && item1.childrenList && item1.childrenList.length">
                    <template v-for="item2 in item1.childrenList">
                      <div v-if="item2.permissionType === 1" :key="item2.keys">
                        <div class="permission-tag-title" v-if="item2.childrenList.length" >
                          {{ item2.permissionName }}
                        </div>
                        <div class="permission-btns-1" v-if="item2.childrenList.length">
                          <a-checkbox :defaultChecked="item3.checked" @change="onCheckAllChange( { permissionId: item3.id, permissionType: item3.permissionType }, $event) " v-for="item3 in item2.childrenList" 
                          :key="item3.keys" >{{ item3.permissionName }}</a-checkbox>
                        </div>
                      </div>
                      <div v-else-if="item2.permissionType === 2" :key="item2.keys">
                        <div class="permission-btns-1">
                          <a-checkbox :defaultChecked="item2.checked" @change="onCheckAllChange( { permissionId: item2.id, permissionType: item2.permissionType }, $event ) " >{{ item2.permissionName }}</a-checkbox >
                        </div>
                      </div>
                    </template>
                  </li>
                </template>
              </ul>
            </div>
          </a-collapse-panel>
        </template>
      </a-collapse>
    </div>
    <div class="permission-buttons" style="margin-top:20px;text-align:right;">
      <a-button type="primary" @click="save" :loading="loading">保存</a-button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Computed, Prop, Watch, State } from "vue-decorators";

@Component
export default class PermissionButtons extends Vue {
  @Prop() detail;
  activeKey = '1';
  loading=false;
  checkedArr=[];
  currentArr=[];
  permissionList=[];
  treeCopy = [];
  tree = [{}];
  keys=Date.now();

  /** 获取用户的所有按钮权限 */
  async _getAllPermissionList(){
		let res = await this.$service.fetch("/config-admin-api/config/permission/queryAllStructuredAvailablePermission",{ systemType: 1 });
    if (1!==res.code) return this.$message.error(res.message);
    if(!(res.data instanceof  Array)&&!res.data.length)return this.$message.error(`没有标签页及按钮权限数据!`);
    this.treeCopy=res.data.map(item=>{
      item.current=0;
      item.topChecked=false;
      item.childrenList.map(item1=>{
        item1.permissionType=1;
      });
    return item;});
  }
  /* 勾选二级菜单全选 */
  async checkedMeunAllMethod(item,e){
     this.tree.map(item1=>{
     if(item1.id===item.id){
      if(item1.childrenList.length){
          item1.childrenList.map(item2=>{
              item2.topChecked=e.target.checked;
              this.keys=Math.random().toString();
              item2.childrenList.map(async item3=>{
                if(item3.permissionType===2){
                  item3.checked=e.target.checked;
                  item3.keys=Math.random().toString().slice(2);
                  await this._formatTabAndMeunData(item3,e.target.checked)
                }
                item3.childrenList.map(async item4=>{
                  if(item4.permissionType===2){
                    item4.checked=e.target.checked;
                    item4.keys=Math.random().toString().slice(2);
                    await this._formatTabAndMeunData(item4,e.target.checked)
                  }
                })
              })
          })
        }
       }
    })
  }

  async checkedTabAllMethod(item,e){
    this.tree.map(item1=>{
      if(item1.childrenList.length){
        item1.childrenList.map(item2=>{
          if(item2.id===item.id){
            item2.topChecked=!item2.topChecked;
            this.keys=Date.now();
            item2.childrenList.map(async item3=>{
              if(item3.permissionType===2){
                item3.checked=e.target.checked;
                item3.keys=Math.random().toString().slice(2);
                await this._formatTabAndMeunData(item3,e.target.checked)
              }
              item3.childrenList.map(async item4=>{
                if(item4.permissionType===2){
                  item4.checked=e.target.checked;
                  item4.keys=Math.random().toString().slice(2);
                  await this._formatTabAndMeunData(item4,e.target.checked)
                }
              })
            })
          }
        })
      }
    })
  }
  /** 处理数据 */
  _formatTabAndMeunData(obj,flag){
    if(flag){
      if(!this.permissionList.length){
        this.permissionList.push({permissionId: obj.id,permissionType: obj.permissionType});
      }else{
        let flag=this.permissionList.some(item=>item.permissionId===obj.id);
        if(!flag){this.permissionList.push({permissionId: obj.id,permissionType: obj.permissionType});}
      }
    }else{
      if(!this.permissionList.length)return;
      for(let i=0;i<this.permissionList.length;i++){
        if(this.permissionList[i].permissionId===obj.id){
            this.permissionList.splice(i,1)
            break;
        }
      }
    }
  }

  /** 回显组合数据 */
  _checkedSelect(arr){
    if(arr instanceof Array){
      arr.map(item=>{
        /* 如果是按钮层级 */
        if(item.permissionType===2){
          this.checkedArr.map(item1=>{
            if(item1.id===item.id){
              item.checked=true;
              item.keys=Math.random().toString().slice(2);
              this.permissionList.push({permissionId: item.id,permissionType: item.permissionType});
             };
          })
        }
        if(item.childrenList.length)this._checkedSelect(item.childrenList);
        if(item.permissionType===1){
          item.keys=Math.random().toString().slice(2);
          item.topChecked=item.childrenList.length?item.childrenList.every(item1=>item1.checked):false;
          item.childrenList.length&&item.childrenList.map(item1=>{
            item1.childrenList.length&&item1.childrenList.map(item2=>{
              item.keys=Math.random().toString().slice(2);
              item.topChecked=item1.childrenList.every(item2=>item2.checked);
            })
          })
        }
      })
    }
  }
  // 切换标签
  switchTags(e,item,i) {
    this.tree.forEach(item1=>{
      if(item1.id===item.id){
        item1.current=i;
      }
    })
  }
  // 保存按钮权限
  async save() {
    if(!this.permissionList.length)return this.$message.error(`没有勾选任何按钮权限,请检查`);
    this.loading=true;
    let res = await this.$service.fetch("/config-admin-api/adminPermission/batchEditButtonPermission",{ 
      adminId: this.detail.id,
		  permissionList: this.permissionList
    });
    if (1!==res.code) return this.$message.error(res.message);
    this.$message.success(res.message);
    this.permissionList=[];
    this.formatPermissionAndInit();
  }
  /** 勾选或不勾选按钮权限处理方法 */
  onCheckAllChange(obj,e){
    if(e.target.checked){
        let flag=false;
      /* 是否有数据 */
      if(this.permissionList.length){
        for(let i=0;i<this.permissionList.length;i++){
          if(this.permissionList[i].permissionId===obj.permissionId){ flag=true; break; }
        }
        if(flag)return;
        this.permissionList.push(obj);
        return;
      }
      this.permissionList.push(obj);
      return;
    }
    /* 是否有数据 */
    if(this.permissionList.length){
      for(let i=0;i<this.permissionList.length;i++){
        if(this.permissionList[i].permissionId===obj.permissionId){
            this.permissionList.splice(i,1)
            break;
        }
      }
    }
  }
  
  /* 获取已经选中的按钮 */
  async _queryAllCheckedPermission() {
    const id = this.detail.id;
    const res = await this.$service.fetch( "/config-admin-api/adminPermission/queryAllPermission",{id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.checkedArr = res.data.filter(d => d.permissionType === 2);
  }

  /* 聚合内容并初始化 */
  async formatPermissionAndInit(){
    await this._queryAllCheckedPermission();
    await this._getAllPermissionList();
    await this._checkedSelect(this.treeCopy);
    this.tree=this.treeCopy;
    this.loading=false;
  }

  @Lifecycle() created(){
    this.formatPermissionAndInit();
  }
}

</script>

<style lang="scss" scoped>
.permission-buttons-list /deep/ {
  text-align: left!important;
  height: 635px;
  overflow-y: scroll;
  .ant-collapse {
    background-color: #009688;
    border: none;
  }
  .permission-l1 {
    .ant-collapse-header {
      padding: 6px 0 6px 40px;
      color: #fff;
    }
  }

  .ant-collapse-content-box {
    padding: 0;
  }

  .permission-l1-1 {
    display: flex;
    border-bottom: 1px solid #ccc;
    li {
      padding: 8px 20px;
      cursor: pointer;
      position: relative;

      &.active {
        &::after {
          content: "";
          position: absolute;
          bottom: -1px;
          border-bottom: 2px solid #009688;
          height: 2px;
          width: 100%;
          left: 0;
        }
      }
    }
  }

  .tags-btns {
    min-height: 80px;
  }

  .permission-with-tag {
    padding: 15px;

    li {
      margin-bottom: 20px;

      .permission-tag-title {
        margin-bottom: 10px;
      }

      .ant-checkbox-wrapper {
        margin-bottom: 5px;
      }
    }
  }
}
</style>