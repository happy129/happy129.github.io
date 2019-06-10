let $ = {
    ajax: function(json) {
        //"php/list.php?key=&order=id&paixu=asc&skipnum=0&shownum=3&",自动拼接
        var url = json.url; //php/list.php
        if (json.data) { //有参数就拼接  没有就不管
            url += "?"; //php/list.php?
            for (var i in json.data) { //循环该对象
                url += i + "=" + json.data[i] + "&"; //php/list.php?key=""&order=id&
            }
            url = url.substring(0, url.length - 1);
        }
        var xhr = new XMLHttpRequest();
        xhr.open(json.type, url, true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                try {
                    var result = xhr.responseText;
                    if (json.dataType == "json") {
                        result = JSON.parse(result);
                    }
                    json["success"](result);

                } catch (e) {
                    json["error"](e);
                }
            }
        }
    },
    url: "http://localhost/",

};
// 导出ajax;
export {
    $
}