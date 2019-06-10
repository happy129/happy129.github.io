var $ = {
    ajax: function (json) {
        var url = json.url;
        if (json.data) { //如果没有就不用解析
            url += "?"; //php/myshoppingcar.php?
            for (var i in json.data) {
                url += i + "=" + json.data[i] + "&"
            }
            url = url.substring(0, url.length - 1);
        }
        //将参数拼接到url中
        var xhr = new XMLHttpRequest();
        xhr.open(json.type, url, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let result = xhr.responseText;
                if (json.dataType == "json") {
                    result = JSON.parse(result);
                }
                if (json.success) { //判断其有没有该方法  有就执行
                    json.success(result);
                }
            }
        }
    }
}