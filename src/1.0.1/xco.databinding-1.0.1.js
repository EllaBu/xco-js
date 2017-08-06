/**
 * JS数据绑定引擎<br />
 * 参数: [ {el:'xxx', attr:'xxx'},{el:'xxx', attr:'xxx'} ]<br />
 * attr: 属性, 默认为html
 */
var XCODataBind = {

	_nsMap : new Array(),

	_parseConfig : [ {
		openToken : '#{',
		closeToken : '}',
		warper : {
			parse : function(content) {
				return XCOVariable.parse(content[0], content[1], '#');
			}
		}
	}, {
		openToken : '@{',
		closeToken : '}',
		warper : {
			parse : function(content) {
				return {
					ns : content[0],
					type : '@',
					key : content[1]
				};
			}
		}
	} ],

	stringAppend : function(str, start, length) {
		return str.substr(start, length);
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
						// list.push(warper.parse(content));
						list.push(warper.parse(this.parseNs(content)));
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

	parseNs : function(content) {
		var i = content.indexOf(':');
		if (i > -1) {
			return [ content.substring(0, i), content.substr(i + 1) ];
		}
		return [ '', content ];
	},

	findNs : function(list) {
		for ( var i = 0; i < list.length; i++) {
			if (typeof (list[i]) == 'object') {
				return list[i].ns;
			}
		}
		return '';
	},

	bind : function(options) {
		if (undefined == options.data) {
			options.data = new XCO();
		}
		if (undefined == options.success) {
			options.success = this.callback;
		} else if (typeof options.success === 'function') {
			options.success = [ this.callback, options.success ];
		} else if (Object.prototype.toString.call(options.success) === '[object Array]') {
			var success = [];
			success.push(this.callback);
			options.success = success.concat(options.success);
		}
		jQuery.doXcoRequest(options);
	},

	// [ ns1:[], ns2:[] ]
	callback : function(xco, options) {
		var ns = '';
		if (undefined != options.ns) {
			ns = options.ns;
		}
		var list = XCODataBind._nsMap[ns];

		if (undefined == list) {
			return true;
		}

		for ( var i = 0; i < list.length; i++) {
			var item = list[i];
			var htmlObj = jQuery(item.el);
			var html = XCODataBind.fillTemplate(item.val, xco, options.extendedFunction);
			if ('html' == item.attr) {
				htmlObj.html(html);
			} else {
				htmlObj.attr(item.attr, html);
			}
		}
		return true;
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

	pretreatment : function(config) {
		for ( var i = 0; i < config.length; i++) {
			var item = config[i];
			if (typeof item === "string") {
				item = {
					el : item,
					attr : [ 'html' ],
				};
			}
			// 获取HTML元素
			var htmlObj = jQuery(item.el);

			if (0 == htmlObj.length) {
				throw 'Can not find DOM element: ' + item.el;
			}
			if (htmlObj.length > 1) {
				throw 'Currently matching multiple DOM elements: ' + item.el;
			}

			// 处理HTML属性
			if (undefined == item.attr) {
				item.attr = [ 'html' ];
			} else if (typeof (item.attr) == 'string') {
				item.attr = [ item.attr ];
			}

			for ( var j = 0; j < item.attr.length; j++) {
				var attr = item.attr[j];
				var attrVal = '';
				if ('html' == attr) {
					attrVal = htmlObj.html();
				} else {
					attrVal = htmlObj.attr(attr);
				}
				if (undefined == attrVal) {
					throw 'A non-existent attribute [' + attr + '], located in container [' + item.el + ']';
				}
				if (null == attrVal || '' == attrVal) {
					throw 'The bound property[' + attr + '] is empty, located in container [' + item.el + ']';
				}

				var list = this.parseComment(attrVal);
				var ns = this.findNs(list);
				if (undefined == this._nsMap[ns]) {
					this._nsMap[ns] = [];
				}
				this._nsMap[ns].push({
					el : item.el,
					attr : attr,
					val : list
				});
			}
		}
	}
};
