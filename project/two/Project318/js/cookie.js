// 封装一个函数查询cookie中存储的用户名:
function getCookie(key) {
    var cookieStr = document.cookie;
    if (cookieStr) {
        var cookieList = cookieStr.split("; ");
        for (var i in cookieList) {
            var itemStr = cookieList[i];
            var itemList = itemStr.split("=");
            var itemKey = itemList[0];
            var itemValue = itemList[1];

            //判断itemKey与key的值是否相等
            if (itemKey == key) {
                return itemValue;
            }
        }
        return "";
    } else {
        return "";
    }
}


// 封装一个函数新增/删除/修改用户信息:
function setCookie(key, value, days) {
    var date = new Date();
    //设置过期时间:
    date.setDate(date.getDate() + days);
    document.cookie = key + "=" + value + ";expires=" + date;
}