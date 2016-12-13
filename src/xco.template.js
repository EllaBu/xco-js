/** JS模板引擎 */
/**
 * <a>#{xxx}</a> 数值替换 <a>#{xxx.xxx}</a> 数值替换 <a>${abc}</a> 函数调用
 */
var XCOTemplate = {

	_templateCache : new Array(),

	_parseConfig : [ {
		openToken : '#{',
		closeToken : '}',
		warper : {
			parse : function(content) {
				return {
					type : '#',
					key : content
				};
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
		for (var i = 0; i < _tempList.length; i++) {
			if (typeof (_tempList[i]) == 'string') {
				builder.append(_tempList[i]);
			} else {
				if ('#' == _tempList[i].type) {
					builder.append(_xco.get(_tempList[i].key));
				} else {
					builder.append(_extendedFunction[_tempList[i].key]());
				}
			}
		}
		return builder.toString();
	},

	parseComment : function(_comment) {
		var allList = [];
		allList.push(_comment);
		var eachList = [];
		for (var i = 0; i < this._parseConfig.length; i++) {
			for (var j = 0; j < allList.length; j++) {
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

	execute : function(_container, _xco, _extendedFunction) {
		var __templateContainer = document.getElementById(_container);
		if (undefined == __templateContainer || null == __templateContainer) {
			throw 'Template container does not exist: ' + _container;
		}
		var __parsedList = this._templateCache[_container];
		if (undefined == __templateContainer || null == __parsedList) {
			// alert('新的解析');
			var __childNodes = __templateContainer.childNodes;
			var __commentCount = 0;
			var __commentNode = null;
			for (var i = 0; i < __childNodes.length; i++) {
				if (__childNodes[i].nodeName == "#comment" || __childNodes[i].nodeType == 8) {
					__commentCount++;
					__commentNode = __childNodes[i];
				}
			}
			if (__commentCount != 1) {
				throw 'The comment nodes in the container are not unique: ' + _container;
			}
			__parsedList = this.parseComment(__commentNode.nodeValue);
			this._templateCache[_container] = __parsedList;
		}
		var __html = this.fillTemplate(__parsedList, _xco, _extendedFunction);
		return __html;
	}
};
