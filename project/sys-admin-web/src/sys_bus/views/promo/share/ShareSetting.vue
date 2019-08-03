<template>
  <section class="share-wrapper share-setting-wrapper">
    <a-form layout="inline" :form="vform">
      <a-form-item>
        <a-form-item label="分享者收益">
          <a-input placeholder="单位: 元" :min="0" type="number" v-decorator="['bonus']" @change="changeInputValue"/>
        </a-form-item>
        <a-form-item label="获取条件：被分享对象有效投注满">
          <a-input placeholder="单位: 元" :min="0" type="number" v-decorator="['validBetAmount']" @change="changeInputValue"/>
        </a-form-item>
      </a-form-item>
      <div class="mt10">
        <a-form-item label="彩票A盘返水比例">
          <a-input placeholder="单位: %" :min="0" type="number"  v-decorator="['arebateRate']" @change="changeInputValue"/>
        </a-form-item>
      </div>
      <div class="mt10">
        <a-form-item label="彩票B盘返水比例">
          <a-input placeholder="单位: %" :min="0" type="number"  v-decorator="['brebateRate']" @change="changeInputValue"/>
        </a-form-item>
      </div>
      <div class="mt10">
        <a-form-item label="体育返水比例" >
          <a-input placeholder="单位: %" :min="0" type="number"  v-decorator="['sportRebateRate']" @change="changeInputValue"/>
        </a-form-item>
      </div>
      <div class="mt10">
        <a-form-item label="真人返水比例">
          <a-input placeholder="单位: %" :min="0" type="number" v-decorator="['realPersonRebateRate']" @change="changeInputValue"/>
        </a-form-item>
      </div>
      <div class="mt10">
        <a-form-item label="棋牌返水比例">
          <a-input placeholder="单位: %" :min="0" type="number"  v-decorator="['chessRebateRate']" @change="changeInputValue"/>
        </a-form-item>
      </div>
      <div class="mt10">
        <a-form-item label="电子返水比例">
          <a-input placeholder="单位: %" :min="0" type="number" v-decorator="['electronRebateRate']" @change="changeInputValue"/>
        </a-form-item>
        <a-form-item style="display:none">
          <a-input placeholder="隐藏id"  type="number" v-decorator="['id']"/>
        </a-form-item>
      </div>
      <div class="page-under-table" v-permission="20196">
        <a-form-item>
          <a-form-item label="谷歌验证码">
            <a-input type="number" @change="changeInputValue" v-decorator="['googleCode', {rules: [{ required: true, message: '请输入谷歌验证码'}]}]" />
          </a-form-item>
          <a-form-item>
            <a-button type='primary' @click="_shareSettingSave">保存</a-button>
          </a-form-item>
        </a-form-item>
      </div>
    </a-form>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle,  InjectComponents} from 'vue-decorators';
import moment from 'moment';
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';

@Component({ formOptions: "id" })
export default class ShareSetting extends Vue {
	form={
		arebateRate: 0,//彩票A盘返水比例
		bonus: 0,//
		brebateRate: 0, //彩票B盘返水比例
		chessRebateRate: 0, //棋牌
		electronRebateRate: 0, //电子
		realPersonRebateRate: 0, //体育返回比例
		sportRebateRate: 0,
		validBetAmount: 0
	}


  changeInputValue(e) {
    const {value} = e.target;
    e.target.value = value.replace(/-/,'');
  }

	/* 保存数据 */
	async _shareSettingSave(){
    const form = await this.vform.validate();
    if (form.errors) return; 
    const params = Object.assign(this.form, form.values);
		let { data: req } =	await Api.shareSettingSave(params);
    if (req?.body?.code === 1) {
      Message.success(req.body.message);
    }
	}


/* 回填数据 */
	async _shareSettingQuery(){
		let { data: req } =	await Api.shareSettingQuery({});
		  if (req?.body?.code === 1 && req.body.data) {
        this.vform.setValues(req.body.data, true);
			  // this.form = {
				// 	arebateRate: req.body.data.arebateRate,//彩票A盘返水比例
				// 	bonus: req.body.data.bonus,//
				// 	brebateRate: req.body.data.brebateRate, //彩票B盘返水比例
				// 	chessRebateRate: req.body.data.chessRebateRate, //棋牌
				// 	electronRebateRate: req.body.data.electronRebateRate, //电子
				// 	realPersonRebateRate: req.body.data.realPersonRebateRate, //体育返回比例
				// 	sportRebateRate: req.body.data.sportRebateRate,
				// 	validBetAmount: req.body.data.validBetAmount
			  // }
		   }
	}

	@Lifecycle() created(){
		this._shareSettingQuery();
	}


}
</script>


<style lang="scss">
.share-setting-wrapper {
  .ant-form-item-label > label {
    min-width: 124px; display: inline-block; text-align: right;
  }
}
</style>