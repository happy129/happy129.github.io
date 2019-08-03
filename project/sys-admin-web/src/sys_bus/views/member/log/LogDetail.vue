<template>
  <div class="log-detail">
      <a-form :form="vform" @submit.prevent="submitForm">
        <a-form-item label="用户名" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" >
          <a-input v-decorator="['userName', { initialValue: userName }]" disabled/>
        </a-form-item>
        <a-form-item label="问题" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['problemType']" disabled/>
        </a-form-item>
        <a-form-item label="错误页面" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['errorPage']" disabled/>
        </a-form-item>
        <a-form-item label="错误时间" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['errorTime']" disabled/>
        </a-form-item>
        <a-form-item label="联系方式" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['contactNumber']" disabled/>
        </a-form-item>
        <a-form-item label="图片" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <div class="img-wp"><img :src="init.url"/></div>
        </a-form-item>
        <a-form-item label="反馈内容" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-textarea  v-decorator="['feedbackContent']" :rows="3" disabled></a-textarea>
        </a-form-item>
        <a-form-item label="反馈时间" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-input  v-decorator="['createTime']" disabled/>
        </a-form-item>
        <a-form-item label="状态" :label-col="{ span: 4 }" :wrapper-col="{ span: 8 }">
          <a-select v-decorator="['status']" :disabled="status==1">
            <a-select-option value="0">等待回复</a-select-option>
            <a-select-option value="1">已回复</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="回复内容" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-textarea  v-decorator="['replyContent', {rules: [{max: 200, message: '回复内容在200个字符以内'}]} ]" :disabled="status==1" :rows="3"></a-textarea>
        </a-form-item>
        <a-form-item :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
          <a-button class="feedback-btn" type="primary" html-type="submit">确定</a-button>
        </a-form-item>
      </a-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle, Prop } from 'vue-decorators'
import { setTimeout } from 'timers';

@Component({ dictionary: "clientType", formOptions: "id"})
export default class LogDetail extends Vue {
  @Prop({type: String}) type;
  @Prop({type: [String, Number]}) userId;
  @Prop({type: [String, Number] }) userName;
  @Prop({type: [String, Number] }) status;

  init = {
    url: ""
  }

  @Lifecycle mounted() {
    // 意见反馈
    if (this.type === "feedback") {
      this.getFeedbackDetail()
    }
  }

  async delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async getFeedbackDetail() {
    const res = await this.$service.fetch('/lottery-admin-api/userFeedback/getUserFeedbackDetail', { id: this.userId });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res?.data && res?.data?.problemType !== "") {
      await this.delay(50);
      res.data.problemType = this.dictionary?.clientType?.find(item => item)?.name;
      this.init.url = res.data?.pictureUrls;
    }
    this.vform.setValues(res.data, true);
  }

  getTextByDictionary(id, array) {
    return array.find(item => item.value == id)?.name;
  }

  async submitForm() {
    // 如果是查看详情，不做修改动作
    if (this.status != 1) {
      const form = await this.vform.validate();
      if (form.errors) return;
      const res = await this.$service.fetch('/lottery-admin-api/userFeedback/replyUserFeedback', 
        Object.assign({feedbackId: this.userId}, {replyStatus: form.values.status,  replyContent: form.values.replyContent})
      );
      if (res.code !== 1) return res.message && this.$message.error(res.message);
    }
    this.$emit("close")
  }
}
</script>

<style lang="scss" scoped>
.log-detail /deep/{
  .ant-form {
    .ant-form-item {
      margin-bottom: 8px;
    }
  }
  .img-wp {
    width: 100px;
    img {
      max-width: 100%;
    }
  }
}
.feedback-btn {
  margin-left: 80px;
}
</style>
