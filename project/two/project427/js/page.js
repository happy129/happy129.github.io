    //首先获取数据的总数        100
    // 设置每页显示的数据条数     5     20页
    // 连续出现的页码数         5
    function Page(ele, json) {
        this.target = document.querySelector(ele);
        // 默认显示的页码数
        this.pageIndex = 1;
        this.option = {
            // count: 100, //总数据条数
            // shownum: 5, //每页显示数据条数
            // showpage: 7, //连续出现页码数
            // prevHtml: "上一页",
            // nextHtml: "下一页",
            callback: function(pageIndex) {
                // alert(pageIndex);
            }
        }
        Object.assign(this.option, json); //更新数据
        this.create(); //构建分页的主体结构
        this.bindData(); //绑定数据
    }

    Page.prototype.bindData = function() {
        // this.target.innerHTML = "";
        var that = this;
        // 通过计算获取页面的总页数
        var allPage = Math.ceil(this.option["count"] / this.option["shownum"]);
        var start = 1; //设置起始页码
        // 判总页码    总页码大于连续出现的页码数--页码数    总页码小于连续出现的页码数--总页码
        var end = allPage > this.option["showpage"] ? this.option["showpage"] : allPage;

        var middleNum = Math.floor(this.option["showpage"] / 2);
        // 判断高亮页码与居中页码
        if (this.pageIndex > middleNum) {
            start = this.pageIndex - middleNum;
            end = this.pageIndex + middleNum;
        }
        if (this.pageIndex > allPage - middleNum) {
            start = allPage - this.option["showpage"] + 1;
            end = allPage;
        }
        start = start <= 1 ? 1 : start;

        //总页码大于7 就是显示7  小于等于7 就是总页码数
        this.content.innerHTML = "";
        for (var i = start; i <= end; i++) {
            var li = document.createElement("li");
            li.innerHTML = i;
            if (i == this.pageIndex) {
                li.className = "selected";
            }
            li.index = i;
            li.onclick = function() {
                that.pageIndex = this.index;
                that.bindData();
            }
            this.content.appendChild(li);
        }

        // 绑定上下翻页的点击事件
        this.prevBtn.className = "default";
        this.prevBtn.onclick = function() {
            that.pageIndex--;
            that.bindData();
        }

        this.nextBtn.className = "default";
        this.nextBtn.onclick = function() {
            that.pageIndex++;
            that.bindData();
        }

        // 销毁   
        // 当高亮页码为1时  除去上一页按钮的点击事件
        if (this.pageIndex == 1) {
            this.prevBtn.onclick = null;
            this.prevBtn.className = "disabled";
        }
        // 当高亮页码为总页码时  除去下一页按钮的点击事件
        if (this.pageIndex == allPage) {
            this.nextBtn.onclick = null;
            this.nextBtn.className = "disabled";
        }
        this.option["callback"](this.pageIndex);
    }


    Page.prototype.create = function() {
        this.target.className = "page";
        // 上一页
        this.prevBtn = document.createElement("span");
        this.prevBtn.className = "page-prev";
        this.prevBtn.innerHTML = "下一页"
        this.target.appendChild(this.prevBtn);

        // 页码内容
        this.content = document.createElement("ul");
        this.content.className = "page-content";
        this.target.appendChild(this.content);

        // 下一页
        this.nextBtn = document.createElement("span");
        this.nextBtn.className = "page-next";
        this.nextBtn.innerHTML = "下一页";
        this.target.appendChild(this.nextBtn);

    };
    // new Page("#page", {
    //     count: 100,
    //     shownum: 5,
    //     showpage: 5,
    //     prevHtml: "&laquo;",
    //     nextHtml: "&raquo;",

    // });