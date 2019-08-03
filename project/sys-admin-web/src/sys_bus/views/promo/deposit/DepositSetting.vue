<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
		 <div class="mt10">
      <a-form-item>
        <a-form-item label="周周首充" v-if="form && form[0]">
          <a-input placeholder="赠送比例(%)" type="number" :min="0" v-model.trim="form[0].rechargeGiveRate" @change="(e) => onChange(e, 0, 'rechargeGiveRate')"/>
        </a-form-item>
        <a-form-item>
          <a-input placeholder="礼金上限" type="number" :min="0"  v-model.trim="form[0].rechargeGiveUpperLimit" @change="(e) => onChange(e, 0, 'rechargeGiveUpperLimit')"/>
        </a-form-item>
        <a-form-item label="状态"  v-if="form && form[0]">
          <a-radio-group v-model="form[0].isEnabled">
            <a-radio :value="1">开启</a-radio>
            <a-radio :value="0">关闭</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form-item>
	  </div>
      <div class="mt10">
        <a-form-item>
          <a-form-item label="活动首充" v-if="form && form[1]">
            <a-input placeholder="赠送比例(%)" type="number"  :min="0"  v-model.trim="form[1].rechargeGiveRate" @change="(e) => onChange(e, 1, 'rechargeGiveRate')"/>
          </a-form-item>
          <a-form-item v-if="form && form[1]">
            <a-input placeholder="礼金上限" type="number"  :min="0"  v-model.trim="form[1].rechargeGiveUpperLimit" @change="(e) => onChange(e, 1, 'rechargeGiveUpperLimit')"/>
          </a-form-item>
          <a-form-item label="有效期"  v-if="form && form[1]">
            <!-- <a-range-picker :disabledDate="disabledDate" :value="[moment(form[1].startTime,'YYYY-MM-DD HH:mm:ss'),moment(form[1].endTime, 'YYYY-MM-DD HH:mm:ss')]" @change="changeDate" format="YYYY-MM-DD HH:mm:ss" /> -->
            <a-range-picker
              :disabledDate="disabledDate"
              :value="showTimeFormat"
              @change="changeDate"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
          <a-form-item label="状态"  v-if="form && form[1]">
            <a-radio-group v-model="form[1].isEnabled">
              <a-radio :value="1">开启</a-radio>
              <a-radio :value="0">关闭</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form-item>
      </div>
      <div class="mt10">
        <a-form-item>
          <a-form-item label="返还比例">
            <a-input placeholder="赠送比例(%)" type="number"  :min="0"  v-model="form[0].rebateRate" @change="(e) => onChange(e, 0, 'rebateRate')"/>
          </a-form-item>
        </a-form-item>
      </div>
			<div v-permission="20188" class="mt10" style="text-align:right;border-top:1px solid #CCCCCC;padding-top:10px;">
							<a-form-item label="验证码">
								<a-input type="number" v-model.number="googleCode" :min="0"  placeholder="请输入验证码"/>
							</a-form-item>
							<a-form-item>
								<a-button type='primary' @click="_firstRechargeSettingSave">保存</a-button>
							</a-form-item>
			</div>
    </a-form>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle,  InjectComponents, Computed} from 'vue-decorators';
import moment from 'moment';
import * as Api from '@api/activity';
import {Message} from 'ant-design-vue';


@Component({ methods:{ moment } })
export default class DepositSetting extends Vue {
  googleCode = "";
  form = [{
  id: '',
	firstRechargeType: 1, //1:周周首充
	isEnabled: 0, //状态|0:关闭|1:开启
	rebateRate:0, //公共字段 默认放第一个
	rechargeGiveRate:0,
	rechargeGiveUpperLimit: 0, //首充赠送上限金额
  },
  {
  id: '',
	endTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
	startTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
	firstRechargeType: 0, //0:活动首充
	isEnabled: 0, //状态|0:关闭|1:开启
	rebateRate:0,
	rechargeGiveRate: 0,
	rechargeGiveUpperLimit: 0, //首充赠送上限金额
  }]
  /***修改时间选择器bug */
  @Computed
  showTimeFormat() {
    return [moment(this.form[1].startTime,'YYYY-MM-DD HH:mm:ss'),moment(this.form[1].endTime, 'YYYY-MM-DD HH:mm:ss')];
  }
	/* 保存数据 */
	async _firstRechargeSettingSave(){
		this.form[1].rebateRate=this.form[0].rebateRate;

		let { data: req } =	await Api.firstRechargeSettingSave({ googleCode: this.googleCode ,  list: this.form });
		  if (req?.body?.code === 1) {
			  Message.success(req.body.message);
		   }
	}
	/* 回填数据 */
	async _firstRechargeSettingQuery(){
		let { data: req } =	await Api.firstRechargeSettingQuery({});
		  if (req?.body?.code === 1 && req.body.data.length) {
			  this.form = [{
            id: req.body.data[0].id,
						firstRechargeType: 1, //1:周周首充
						isEnabled: req.body.data[0].isEnabled, //状态|0:关闭|1:开启
						rebateRate:req.body.data[0].rebateRate, //公共字段 默认放第一个
						rechargeGiveRate:req.body.data[0].rechargeGiveRate,
						rechargeGiveUpperLimit: req.body.data[0].rechargeGiveUpperLimit, //首充赠送上限金额
					},
					{
            id: req.body.data[1].id,
						endTime: moment(req.body.data[1].endTime).format('YYYY-MM-DD HH:mm:ss'),
						startTime: moment(req.body.data[1].startTime).format('YYYY-MM-DD HH:mm:ss'),
						firstRechargeType: req.body.data[1].firstRechargeType, //0:活动首充
						isEnabled: req.body.data[1].isEnabled, //状态|0:关闭|1:开启
						rebateRate:req.body.data[1].rebateRate,
						rechargeGiveRate: req.body.data[1].rechargeGiveRate,
						rechargeGiveUpperLimit: req.body.data[1].rechargeGiveUpperLimit, //首充赠送上限金额
					}]
		   }
	}

  onChange(e, index, type) {
    const { value } = e.target;
    this.form[index][type] = value.replace(/-/, '');
  }

  disabledDate(current) {
    return current && current < moment().startOf('day');
  }

  changeDate(arr) {
    if (arr.length === 0) {
      this.form[1].endTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      this.form[1].startTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    } else {
      this.form[1].startTime = arr[0];
      this.form[1].endTime = arr[1];
    }
  }

	@Lifecycle() created(){
		this._firstRechargeSettingQuery();
	}
}
</script>
