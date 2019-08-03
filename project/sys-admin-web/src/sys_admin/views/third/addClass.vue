<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加分类</span>
        <span class="close-tag" @click="close">X</span>
      </div>
      <div class="body">
        <a-form layout="inline" :form="form">
          <a-form-item label="分类名称">
            <a-input v-decorator="['thirdGameTypeName', {rules: [{required:true, message: '请输入分类名称中英文1-20字符', pattern:/^[\u4e00-\u9fa5a-zA-Z]{1,20}$/g}]}]"></a-input>
          </a-form-item>
          <br>
          <br>
          <a-form-item>
            <a-button type="primary" @click="submit">保存</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";
@Component
export default class addClass extends Vue {
  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }
  close() {
    this.$emit("close");
  }
  async submit() {
    await this.form.validateFields(async (err, values) => {
      if (err) return;
      // let res = await Api.addthirdGameType(values);
      // if (1 !== res.data?.body?.code) return;
			// this.$message.success(res?.data?.body?.message);
				const res = await this.$service.fetch( "/config-admin-api/thirdGameType/addThirdGameType",values);
				if (!res.code) return res.message && this.$message.error(res.message);
				this.$message.success(res.message);
      	this.$emit("getClass");
      	this.$emit("close");
      	this.$emit("ok");
    });
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.body {
  padding: 22px;
}
</style>