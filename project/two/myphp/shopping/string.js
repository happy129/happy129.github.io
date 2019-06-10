    var upperCodeList = [];
    var lowerCodeList = [];
    var numList = [];
    var otherList = ["$", "_"];

    for (var i = 65; i < (65 + 26); i++) { //A的编码为65  Z 65+25
        var upperCode = String.fromCharCode(i); //A  B  C
        var lowerCode = String.fromCharCode(i + 32); //a:97  A:65
        upperCodeList.push(upperCode);
        lowerCodeList.push(lowerCode);
        //大写的集合里面丢大写   小写的集合里面丢小写
    }
    for (var i = 0; i <= 9; i++) {
        numList.push(String(i)); //["0","1","2"]
    }
    var bigList = otherList.concat(numList, upperCodeList, lowerCodeList);

    function toUpperCode(str) {
        var newStr = "";
        for (var i = 0; i < str.length; i++) {
            var code = str.charAt(i); //取出每一个字符
            //判断   判断是否为小写 是小写就转大写
            var index = lowerCodeList.indexOf(code); //查找一个元素在集合中的位置 如果存在就返回下标 不存在就返回-1
            if (index == -1) { //不存在
                newStr = newStr + code;
            } else { //存在就转换
                newStr = newStr + upperCodeList[index];
            }
        }
        return newStr;
    }