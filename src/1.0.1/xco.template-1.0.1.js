/**
 * JS模板引擎
 * 
 * #{xxx} 数值替换 <br />
 * #{xxx.xxx} 数值替换 <br />
 * 
 * @{abc} 函数调用 <br />
 */
var XCOTemplate = {

	_templateCache : new Array(),

	_parseConfig : [ {
		openToken : '#{',
		closeToken : '}',
		warper : {
			parse : function(content) {
				return XCOVariable.parse('', content, '#');
			}
		}
	}, {
		openToken : '@{',
		closeToken : '}',
		warper : {
			parse : function(content) {
				return {
					type : '@',
					key : content
				};
			}
		}
	} ],

	stringAppend : function(str, start, length) {
		return str.substr(start, length);
	},

	fillTemplate : function(_tempList, _xco, _extendedFunction) {
		var builder = new XCOStringBuilder();
		for ( var i = 0; i < _tempList.length; i++) {
			if (typeof (_tempList[i]) == 'string') {
				builder.append(_tempList[i]);
			} else {
				if ('#' == _tempList[i].type) {
					if (XCOVariable.NORMAL == _tempList[i].mode) {
						builder.append(_xco.get(_tempList[i].key));
					} else if (XCOVariable.DEFAULT_VALUE == _tempList[i].mode) {
						var _tempVal = _xco.get(_tempList[i].key);
						if (null == _tempVal) {
							_tempVal = _tempList[i].defaultVal;
						}
						builder.append(_tempVal);
					} else if (XCOVariable.FUNCTION == _tempList[i].mode) {
						var _fn = window[_tempList[i].functionVal];
						if (undefined == _fn || null == _fn) {
							throw 'Non-existent function: ' + _tempList[i].functionVal;
						}
						var _param = _xco.get(_tempList[i].key);
						var _tempVal = _fn(_param);
						builder.append(_tempVal);
						// new Function("console.log('xxx')");
					} else if (XCOVariable.EXPR == _tempList[i].mode) {
						var _tempVal = XCOVariable.calcExpr(_xco, _tempList[i].itemList);
						builder.append(_tempVal);
					}
				} else {
					if (!_extendedFunction[_tempList[i].key]) {
						throw 'The function [' + _tempList[i].key + '] is missing in the extendedFunction.';
					}
					builder.append(_extendedFunction[_tempList[i].key](_xco));
				}
			}
		}
		return builder.toString();
	},

	parseComment : function(_comment) {
		var allList = [];
		allList.push(_comment);
		var eachList = [];
		for ( var i = 0; i < this._parseConfig.length; i++) {
			for ( var j = 0; j < allList.length; j++) {
				if (typeof (allList[j]) == 'string') {
					var tempList = this.parseComment0(allList[j], this._parseConfig[i]);
					if (tempList.length > 0) {
						eachList = eachList.concat(tempList);
					}
				} else {
					eachList.push(allList[j]);
				}
			}
			allList = eachList;
			eachList = [];
		}
		return allList;
	},

	parseComment0 : function(_comment, _config) {
		var openToken = _config.openToken;
		var closeToken = _config.closeToken;
		var warper = _config.warper;
		var list = [];
		var builder = new XCOStringBuilder();
		if (_comment != null && _comment.length > 0) {
			var offset = 0;
			var start = _comment.indexOf(openToken, offset);
			while (start > -1) {
				if (start > 0 && _comment.charAt(start - 1) == '\\') {
					builder.append(this.stringAppend(_comment, offset, start - 1)).append(openToken);
					offset = start + openToken.length;
				} else {
					var end = _comment.indexOf(closeToken, start);
					if (end == -1) {
						builder.append(this.stringAppend(_comment, offset, _comment.length - offset));
						offset = _comment.length;
					} else {
						builder.append(this.stringAppend(_comment, offset, start - offset));
						// 记录之前的字符串
						list.push(builder.toString());
						builder = new XCOStringBuilder();
						offset = start + openToken.length;

						var content = this.stringAppend(_comment, offset, end - offset);
						list.push(warper.parse(content));
						offset = end + closeToken.length;
					}
				}
				start = _comment.indexOf(openToken, offset);
			}
			if (offset < _comment.length) {
				builder.append(this.stringAppend(_comment, offset, _comment.length - offset));
				list.push(builder.toString());// 记录
			}
		}
		return list;
	},

	/** 渲染模板 */
	execute : function(_container, _xco, _extendedFunction) {
		var __parsedList = this.pretreatment(_container);
		var __html = this.fillTemplate(__parsedList, _xco, _extendedFunction);
		return __html;
	},

	/** 模板预处理，新增支持数组 */
	pretreatment : function(_container) {
		if (typeof (_container) == 'string') {
			return this.pretreatment0(_container);
		} else {
			for ( var i = 0; i < _container.length; i++) {
				this.pretreatment0(_container[i]);
			}
		}
	},

	pretreatment0 : function(_container) {
		var __templateContainer = document.getElementById(_container);
		if (undefined == __templateContainer || null == __templateContainer) {
			throw 'Template container does not exist: ' + _container;
		}
		var __parsedList = this._templateCache[_container];
		if (undefined == __parsedList || null == __parsedList) {// fix bug
			var __childNodes = __templateContainer.childNodes;
			var __commentCount = 0;
			var __commentNode = null;
			for ( var i = 0; i < __childNodes.length; i++) {
				if (__childNodes[i].nodeName == "#comment" || __childNodes[i].nodeType == 8) {
					__commentCount++;
					__commentNode = __childNodes[i];
				}
			}
			if (__commentCount != 1) {
				throw 'The number of comment nodes in a container[' + _container + '] can only be one, and the number of comment nodes is '
						+ __commentCount;
			}
			__parsedList = this.parseComment(__commentNode.nodeValue);
			this._templateCache[_container] = __parsedList;
		}
		return __parsedList;
	}
};
