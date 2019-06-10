var username = getCookie("username");
if (username) {
    $(".register").attr("display", "none");
    $(".login").html(username + "已登录");
}

var addList = document.getElementsByClassName("add");
for (var i = 0; i < addList.length; i++) { //4
    let add = addList[i];
    add.onclick = function() {
        // console.log(this);
        var numInp = prev(this);
        var reduceSpan = prev(numInp);
        var price = prev(parent(this)).innerHTML;
        var subTotal = next(parent(this));

        numInp.value++;
        var num = numInp.value * 1;
        // console.log(numInp, reduceSpan, price, num, subTotal);

        if (numInp.value >= 2) {
            reduceSpan.innerHTML = "-";
        }
        subTotal.innerHTML = (num * price).toFixed(2);
        getALLTotal();
    }
}
var reduceList = document.getElementsByClassName("reduce");
for (var j = 0; j < reduceList.length; j++) {
    var reduce = reduceList[j];
    reduce.onclick = function() {
        var numInp = next(this);
        var price = prev(parent(this)).innerHTML;
        var subTotal = next(parent(this));

        console.log(numInp, price, subTotal);
        // numInp.value--;
        if (numInp.value > 1) {
            numInp.value--;
        }
        if (numInp.value == 1) {
            this.innerHTML = "";
            this.onclick = null;
            // this.setAttribute("disabled", "disabled");
            // return false;
        }
        subTotal.innerHTML = (price * numInp.value).toFixed(2);
        getALLTotal();
    }
}

// function reduceFn() {
//     var numInp = next(this);
//     var price = prev(parent(this)).innerHTML;
//     var subTotal = next(parent(this));

//     console.log(numInp, price, subTotal);
//     // numInp.value--;
//     if (numInp.value > 1) {
//         numInp.value--;
//     }
//     if (numInp.value == 1) {
//         this.innerHTML = "";
//         this.onclick = null;
//         // this.setAttribute("disabled", "disabled");
//         // return false;
//     }
//     subTotal.innerHTML = (price * numInp.value).toFixed(2);
//     getALLTotal();
// }

var deleteList = document.getElementsByClassName("delete");
for (var k = 0; k < deleteList.length - 1; k++) {
    var deleteSPan = deleteList[k];
    deleteSPan.onclick = function() {
        parent(parent(this)).remove();
        checkLength();
        getALLTotal();
    }
}
// [1,2,3,4]
//  0 1 2 3
var deleteAll = document.getElementById("deleteAll");
deleteAll.onclick = function() {
    for (var j = 0; j < checkOneList.length; j++) {
        var checkOne = checkOneList[j]
        if (checkOne.checked) {
            parent(parent(checkOne)).remove();
            j--;
        }
    }
    checkLength()
}

var checkAllList = document.getElementsByClassName("check-all");
var checkOneList = document.getElementsByClassName("check-one");
for (var i = 0; i < checkAllList.length; i++) {
    var checkAll = checkAllList[i];
    checkAll.onclick = function() {
        var status = this.checked;
        // console.log(status);
        for (var j = 0; j < checkAllList.length; j++) {
            checkAllList[j].checked = status;
        }
        for (var j = 0; j < checkOneList.length; j++) {
            checkOneList[j].checked = status;
        }
        getALLTotal();
    }
}

for (var i = 0; i < checkOneList.length; i++) {
    var checkOne = checkOneList[i];
    checkOne.onclick = checkLength;
}

function checkLength() {
    var count = 0;
    for (var j = 0; j < checkOneList.length; j++) {
        if (checkOneList[j].checked) {
            count++;
        }
    }
    if (count == checkOneList.length &&
        count != 0) {
        for (var l = 0; l < checkAllList.length; l++) {
            checkAllList[l].checked = true;
        }
    } else {
        for (var l = 0; l < checkAllList.length; l++) {
            checkAllList[l].checked = false;
        }
    }
    getALLTotal()
}

var selectedTotal = document.getElementById("selectedTotal");
var priceTotal = document.getElementById("priceTotal");

function getALLTotal() {
    var allNum = 0;
    var allPrice = 0;
    for (var j = 0; j < checkOneList.length; j++) {
        var checkOne = checkOneList[j]
        if (checkOne.checked) {
            var tr = parent(parent(checkOne));
            var numInp = tr.getElementsByClassName("count-input")[0];
            var subtotal = tr.getElementsByClassName("subtotal")[0];
            var num = numInp.value * 1;
            var total = subtotal.innerHTML * 1;
            allNum += num;
            allPrice += total;
            // console.log(num, subtotal, total);

        }
    }
    // console.log(allNum, allPrice);
    selectedTotal.innerHTML = allNum;
    priceTotal.innerHTML = allPrice.toFixed(2);
}

function prev(ele) {
    if (ele.previousElementSibling) {
        return ele.previousElementSibling
    } else {
        return ele.previousSibling
    }
}

function next(ele) {
    if (ele.nextElementSibling) {
        return ele.nextElementSibling
    } else {
        return ele.nextSibling
    }
}

function parent(ele) {
    if (ele.parentElementSibling) {
        return ele.parentElementSibling
    } else {
        return ele.parentNode;
    }
}