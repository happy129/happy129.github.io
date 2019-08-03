import * as DateUtil from './date';

// 获取开始时间跟结束时间
export function getDateByText(text) {
  let startDate, endDate;

  switch (text) {
    case "今天":
      startDate = DateUtil.getTodayStartDate();
      endDate = DateUtil.getTodayEndDate();
      break;
    case "昨天":
      startDate = DateUtil.getLastDayStartDate();
      endDate = DateUtil.getLastDayEndDate();
      break;
    case "本周":
      startDate = DateUtil.getWeekStartDate();
      endDate =  DateUtil.getWeekEndDate();
      break;
    case "上周":
      startDate = DateUtil.getLastWeekStartDate();
      endDate = DateUtil.getLastWeekEndDate();
      break;
    case "本月":
      startDate =  DateUtil.getMonthStartDate();
      endDate = DateUtil.getMonthEndDate();
      break;
    case "上月":
      startDate = DateUtil.getLastMonthStartDate();
      endDate =  DateUtil.getLastMonthEndDate();
      break;
  }

  return {startDate, endDate}
}


// 把数字转化为中文
export function formatChineseNumeral(value){
	if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value)){
		return ;
	}
	var unit = "仟佰拾亿仟佰拾萬仟佰拾元角分", str = "";
	value += "00";
	var p = value.indexOf('.');
	if (p >= 0){
		value = value.substring(0, p) + value.substr(p+1, 2);
	}
	unit = unit.substr(unit.length - value.length);
	for (var i=0; i < value.length; i++){
		str += '零壹贰叁肆伍陆柒捌玖'.charAt(value.charAt(i)) + unit.charAt(i);
  }
	return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(萬|亿|元)/g, "$1").replace(/(亿)萬|(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
}


export function getUnit(length) {
  switch(length) {
    case 1:  return "个";
    case 2:  return "十";
    case 3:  return "百";
    case 4:  return "千";
    case 5:  return "万";
    case 6:  return "十万";
    case 7:  return "百万";
    case 8:  return "千万";
    case 9:  return "亿";
    case 10: return "十亿";
    case 11: return "百亿";
    case 12: return "千亿";
    default: 
    return "个"
  }
}

export function getColor(length) {
  switch(length) {
    case 1:
    case 2:
    case 3:  
      return 'g-green';
    case 4: 
      return 'g-yellow';
    default:
      return 'g-red';
  }
}