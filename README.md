# XCO-JS

------

### 1. 项目简介

此项目为XCO的JavaScript实现版本，并提供基于Jquery的异步请求访问工具。

*  xco.js: 			xco的js版本
*  xco.jquery.js: 	基于Jquery的xco请求扩展
*  xco.template.js: 一个基于xco的的模板工具

### 2. 版本更新说明

*  提供xco的的模板工具
*  xco.js提供ognl的访问方式

### 3. xco异步请求使用说明

> 1. 加入JS引用

	<script type="text/javascript" src="jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="xco.js"></script>
	<script type="text/javascript" src="xco.jquery.js"></script>

> 2. JS代码调用

	function doPostAjax() {
		var xco = new XCO();
		xco.setIntegerValue("id", 10);
		xco.setStringValue("name", "中国");
		var options = {
			url : "http://xxx.yyy.com/x.xco",
			data : xco,
			success : doCallBack
		};
		$.doXcoRequest(options);
	}
	
	function doCallBack(data) {
		alert('doCallBack:\n' + data);
	}

### 4. xco模板使用说明

> 1. HTML中定义模板

	<ul id="container">
		<!--<li>name:#{dataList[i]}, URL:@{op}</li>-->
	</ul>

> 2. JS代码中填充数据

	<SCRIPT src="/js/xco.js" crossorigin="anonymous"></SCRIPT>
	<SCRIPT src="/js/xco.template.js" crossorigin="anonymous"></SCRIPT>
	<SCRIPT type="text/javascript">
		var xco = new XCO();
		var dataList = [ 'a', 'b', 'c' ];
		xco.setStringArrayValue("dataList", dataList);

		var extendedFunction = {
			op : function() {
				return '<a href="/' + xco.get('dataList[i]') + '">查看详情</a>';
			}
		};
		var html = '';
		for (var i = 0; i < dataList.length; i++) {
			xco.setIntegerValue("i", i);
			html += XCOTemplate.execute("container", xco, extendedFunction);
		}
		document.getElementById("container").innerHTML = html;
	</SCRIPT>
	
> 3. 说明

`#{dataList[i]}`表示数据绑定，`@{op}`表示函数调用。

### 5. xco.js之ognl访问

	xco.get('a');
	xco.get('a.b.c');
	xco.get('a[0]');
	xco.get('a[0].b.c');

### 6. 相关资料

XCO资料可参考: <https://github.com/xsonorg/xco>

XCO控制器资料可参考: <https://github.com/xsonorg/web>