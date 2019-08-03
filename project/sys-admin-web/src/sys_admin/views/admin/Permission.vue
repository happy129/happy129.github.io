<template>
  <div class="permission-list">
    <el-tree :default-expanded-keys="defaultExpandedKeysArr" :default-checked-keys="defaultCheckedKeysArr" node-key="id" ref="tree" :data="treeData" show-checkbox></el-tree>
    <div class="permission-buttons">
      <a-button @click="$refs.tree.setCheckedKeys([])">重置</a-button>
      <a-button type="primary" @click="submit" :loading="loading">提交</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import {
  Component,
  Lifecycle,
  InjectComponents,
  Prop,
  State,
  Watch
} from "vue-decorators";
import * as Api from "@api/admin";
import { Tree } from "element-ui";
import _ from "lodash";

Vue.use(Tree);

@Component
export default class Permission extends Vue {
  treeKey = 1;
  loading = false;
  @Prop() detail;

  // 默认选中
  checkedKeys = [];
  //需要展开的id
  defaultExpandedKeysArr = [];
  //默认选中
  defaultCheckedKeysArr = [];
	//存储所有选中数据 
	allUserPermissions=[];
  // 树形接口所需要的数据
  treeData = [];

  // 标签列表
  menuList = [];

  newarr = [];

  @Lifecycle created() {
    this.getPermissionList();
  }

  // 获取所有权限列表
  async getPermissionList() {

    const res = await this.$service.fetch(
      "/config-admin-api/config/permission/queryAllAvailablePermission",
      { systemType: 0 }
    );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    // 获取标签页列表, 过滤掉按钮以及空数据
    this.menuList = res.data.filter(d => d.permissionType !== 2).filter(v => v);
    this.allUserPermissions = (await this.getPermissionListById()) || [];
    // 设置是否选中
    this.menuList.forEach(item => {
      item.label = item.permissionName;
      item.id = item.id;
      item.children = [];
			item.level = '';

			item.parentId == 0?
			item.level = 1:
			item.parentId!==0 && item.permissionType==0?
			item.level = 2:
			item.permissionType == 1?
			item.level = 3:
			item.level = 4;

      for (var i = 0; i < this.allUserPermissions.length; i++) {
        if (this.allUserPermissions[i]?.id === item.id && item.level == 3) {
          this.defaultCheckedKeysArr.push(this.allUserPermissions[i].id);
          break;
        }
      }
    });
    this.defaultExpandedKeysArr = this.menuList.map((item, i) => {
      return item.id;
    });
    this.combindedTreeData();
  }

  // 获取用户的权限列表
  async getPermissionListById() {
    const id = this.detail?.id;
		//  permissionType: "" 
    const res = await this.$service.fetch( "/config-admin-api/adminPermission/queryAllPermission", {id} );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    const data = res.data.filter(d => d.permissionType !== 2).filter(v => v);
    return data;
  }

  combindedTreeData() {
    // 一级菜单
    const firstLevel = _.cloneDeep(this.menuList)
      .filter(item => item.parentId == 0)
      .map(item => ({ ...item, children: [] }));
    // 二级菜单
    let secondLevel = _.cloneDeep(this.menuList)
      .filter(item => item.permissionType == 0)
      .map(item => ({ ...item, children: [] }));
    // 三级菜单
    let thirdLevel = _.cloneDeep(this.menuList).filter(
      item => item.permissionType == 1
    );
    // 把三级菜单的子项进行一次汇总
    thirdLevel = thirdLevel.reduce((prev, next) => {
      if (!prev[next.parentId]) prev[next.parentId] = [];
      prev[next.parentId].push(next);
      return prev;
    }, {});
    // 把三级菜单加入二级菜单中
    secondLevel.forEach(item => {
      item.children = thirdLevel[item.id];
			for(let i=0;i<this.allUserPermissions.length;i++){
				if(item.level==2&&!item.children?.length&&item.id==this.allUserPermissions[i]?.id){
					this.defaultCheckedKeysArr.push(item.id);
					break;
				}
			}
    });

    // 把二级菜单进行汇总
    secondLevel = secondLevel.reduce((prev, next) => {
      if (!prev[next.parentId]) prev[next.parentId] = [];
      prev[next.parentId].push(next);
      return prev;
    }, {});
    // 把二级菜单加入一级菜单中
    firstLevel.forEach(item => {
      item.children = secondLevel[item.id];
    });

    this.treeData = firstLevel;
  }

  // 提交权限
  async submit() {
    let getCheckedNodes = this.$refs.tree.getCheckedNodes();
    let getHalfCheckedNodes = this.$refs.tree.getHalfCheckedNodes();

    let allNodes = [...getHalfCheckedNodes, ...getCheckedNodes].map(
      (item, i) => {
        return { permissionId: item.id, permissionType: item.permissionType };
      }
    );
    this.loading = true;
    const { data: res } = await Api.editMenuAndTagPermission({
      adminId: this.detail?.id,
      permissionList: allNodes
    });
    this.loading = false;
    if (res.body.code !== 1)
      return res.body.message && this.$message.error(res.body.message);
    this.$message.success(res.body.message);
  }
}
</script>

<style lang="scss" scoped>
.el-tree /deep/{
  display: flex;
  flex-wrap: wrap;

  .el-tree-node {
    flex: 0 0 20%;
  }
  >.el-tree-node {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 20px;
    >.el-tree-node__content {
      .el-tree-node__label {
        background: #ff9900;
        color: #fff;
      }
    }
  }
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #009688;
    border-color: #009688;
  }
  .el-checkbox__input.is-checked .el-checkbox__inner,
  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #009688;
    border-color: #009688;
  }
  .el-checkbox__inner:hover {
    border-color: #009688;
  }
}
.tree-list {
  display: flex;
  flex-wrap: wrap;
  > li {
    flex: 0 0 20%;
    height: 300px;
    overflow-y: scroll;
    margin-bottom: 20px;
    text-align: left;

    .ant-tree-child-tree {
      li {
        text-align: left;
      }
    }
  }
}
.permission-buttons {
  text-align: right;
}
</style>