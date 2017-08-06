# XCO-JS

------

XCO-JS是一款以XCO数据对象为基础，集数据封装、数据请求、模板渲染、数据绑定和数据验证为一体的综合性JS框架。

![XCO-JS组件](http://www.xson.org/project/xco-js/images/01.png)

## 2. 当前版本

当前最新版本：1.0.1

## 3. 代码片段

> 模板渲染

	<div id="container"><!-- 
 		<p>#{x|123}</p>
		<p>#{y|'中国'}</p>
	 --></div>

	<div id="container"><!-- 
 		<p>#{x+y}</p>
		<p>#{x*y}</p>
		<p>#{x+y*z}</p>
		<p>#{money + '$'}</p>
	 --></div>

	<div id="container"><!-- 
 		<p>#{create_time@formatDateTime}</p>
	 --></div>

> 数据绑定

	<div>
		<p id="p1">用户ID:#{id}</p>
		<p id="p2">用户昵称:#{name|'无名'}</p>
		<p id="p3">年龄层次:#{age@getAgeLevel}</p>
		<p id="p4">注册时间:#{create_time@formatDateTime}</p>
		<p class="c2">@{getState}</p>
		<a id="p5" href="toCertify.jsp?id=#{id}">#{name}</a>
	</div>

	<div>
		<p id="p6">用户积分:#{xx:score}</p>
		<p id="p7">用户资金:#{xx:(money/100)+'$'}</p>
	</div>

## 4. 技术文档

<http://www.xson.org/project/xco-js/index.html>

## 5. 沟通交流

QQ群：518522232**（请备注关注的项目）**

邮箱：xson_org@126.com