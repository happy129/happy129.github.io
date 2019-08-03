var now = new Date(); //当前日期
var nowDayOfWeek = now.getDay() == 0 ? 6 : now.getDay() - 1; //今天本周的第几天
var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getYear(); //当前年
var lastMonthDate = new Date(); //上月日期

nowYear += (nowYear < 2000) ? 1900 : 0;

lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

var lastYear = lastMonthDate.getYear();
var lastMonth = lastMonthDate.getMonth();

//格式化日期：yyyy-MM-dd
export function formatDate(date, type = 1) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    if (mymonth < 10) {
        mymonth = "0" + mymonth;
    }
    if (myweekday < 10) {
        myweekday = "0" + myweekday;
    }

    if (type === 1) {
        hour = hour < 10 ? '0' + hour : hour;
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
    } else if (type === 2) {
        hour = '00'; min = '00'; sec = '00';
    } else if (type === 3) {
        hour = '23'; min = '59'; sec = '59';
    }
    return (myyear + "-" + mymonth + "-" + myweekday + ' ' + hour + ':' + min + ':' + sec);
}

// 获取今天的开始时间
export function getTodayStartDate() {
    return formatDate(new Date(), 2);
}

// 获取今天的结束时间
export function getTodayEndDate() {
    return formatDate(new Date(), 3);
}

// 获取昨天的开始时间
export function getLastDayStartDate() {
    return formatDate(new Date(nowYear, nowMonth, nowDay - 1), 2);
}

// 获取昨天的结束时间
export function getLastDayEndDate() {
    return formatDate(new Date(nowYear, nowMonth, nowDay - 1), 3);
}

//获得某月的天数
export function getMonthDays(myMonth) {
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}

//获得本周的开始日期
export function getWeekStartDate() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
    return formatDate(weekStartDate);
}

//获得本周的结束日期
export function getWeekEndDate() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
    return formatDate(weekEndDate, 3);
}

//获得上周的开始日期
export function getLastWeekStartDate() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7);
    return formatDate(weekStartDate);
}

//获得上周的结束日期
export function getLastWeekEndDate() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1);
    return formatDate(weekEndDate, 3);
}

//获得本月的开始日期
export function getMonthStartDate() {
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    return formatDate(monthStartDate);
}

//获得本月的结束日期
export function getMonthEndDate() {
    var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
    return formatDate(monthEndDate, 3);
}

//获得上月开始时间
export function getLastMonthStartDate() {
	if(lastMonth==11){
		var lastMonthStartDate = new Date(nowYear-1, lastMonth, 1);
	}else{
		var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
	}
    return formatDate(lastMonthStartDate);
}

//获得上月结束时间
export function getLastMonthEndDate() {
	if(lastMonth==11){
		var lastMonthEndDate = new Date(nowYear-1, lastMonth, getMonthDays(lastMonth));
	}else{
		var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth));
	}
    return formatDate(lastMonthEndDate, 3);
}