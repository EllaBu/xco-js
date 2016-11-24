# XCO-JS

------

## 1. 项目简介

此项目为XCO的JavaScript实现版本，并提供基于Jquery的异步请求访问工具。

*  xco.js: xco的js版本
*  jquery-xco.js: 基于Jquery的xco请求扩展

## 2. 使用说明

> 1. 加入JS引用

	<script type="text/javascript" src="jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="xco.js"></script>
	<script type="text/javascript" src="jquery-xco.js"></script>

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


## 3. 相关资料

参考: <https://github.com/xsonorg/xco>