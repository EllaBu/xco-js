/** XCO 验证组件 */
/** 根据元数据对XCO对象进行赋值 */
function setXCOParameter(xco, metadata, extendedFunction, debug) {

	if (null === xco) {
		xco = new XCO();
	}

	var inputTypes = [ 'text', 'button', 'checkbox', 'hidden', 'image', 'password', 'radio', 'reset', 'submit', // HTML4
	'color', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'range', 'search', 'tel', 'time', 'url', 'week' // HTML5
	];

	var len = metadata.length;
	for (var i = 0; i < len; i++) {
		var item = metadata[i];
		if (undefined == item.s || !item.s) {
			continue;
		}
		if (undefined == item.elem || null == item.elem) {
			item.elem = '#' + item.name;
		}
		var _elem = item.elem;
		var htmlElement = null;
		if ('#' == _elem.charAt(0)) {
			htmlElement = document.getElementById(_elem.substr(1));
		} else {
			htmlElement = jQuery(_elem);
			if (1 == htmlElement.length) {
				htmlElement = htmlElement[0];
			} else if (0 == htmlElement.length) {
				htmlElement = undefined;
			} else {
				throw 'Currently matching multiple DOM elements: ' + _elem;
			}
		}
		if (undefined == htmlElement) {
			throw 'Can not find DOM element: ' + _elem;
		}

		var tempVal = null;
		if ('INPUT' == htmlElement.tagName) {
			if (inArray(htmlElement.type, inputTypes) > -1) {
				// checkbox', 'hidden', 'image', 'password', 'radio'
				if('checkbox' == htmlElement.type || 'radio' == htmlElement.type){
					if(!htmlElement.checked){
						continue;
					}
				}
				tempVal = htmlElement.value;
			}
		} else if ('SELECT' == htmlElement.tagName) {
			tempVal = htmlElement[htmlElement.selectedIndex].value;
		} else if ('TEXTAREA' == htmlElement.tagName) {
			tempVal = htmlElement.value;
		}

		if (undefined == tempVal) {
			continue;
		}

		if (null == tempVal) {
			throw 'Unsupported tags :' + htmlElement.tagName;
		}

		// TODO trim

		setXCOItemValue(xco, item, tempVal);
	}

	if (extendedFunction) {
		extendedFunction(xco, metadata);
	}

	if (debug) {
		console.log('setXCOParameter: ', xco);
	}

	return xco;
}

/** 设置XCO参数某一项的值 */
function setXCOItemValue(xco, item, val) {
	var type = item.type;
	if ('INT' == type.toUpperCase()) {
		var numVal = parseInt(val);
		if (isNaN(numVal)) {
			return;
		}
		xco.setIntegerValue(item.name, numVal);
	} else if ('LONG' == type.toUpperCase()) {
		var numVal = parseInt(val);
		if (isNaN(numVal)) {
			return;
		}
		xco.setLongValue(item.name, numVal);
	} else if ('FLOAT' == type.toUpperCase()) {
		var numVal = parseFloat(val);
		if (isNaN(numVal)) {
			return;
		}
		xco.setFloatValue(item.name, numVal);
	} else if ('DOUBLE' == type.toUpperCase()) {
		var numVal = parseFloat(val);
		if (isNaN(numVal)) {
			return;
		}
		xco.setDoubleValue(item.name, numVal);
	} else if ('STRING' == type.toUpperCase()) {
		xco.setStringValue(item.name, val);
	} else if ('DATE' == type) {
		var dateVal = XCOUtil.parseDate(val);
		if ('Invalid Date' == dateVal.toString()) {
			return;
		}
		xco.setDateValue(item.name, dateVal);
	} else if ('TIME' == type.toUpperCase()) {
		var dateVal = XCOUtil.parseTime(val);
		if ('Invalid Date' == dateVal.toString()) {
			return;
		}
		xco.setTimeValue(item.name, dateVal);
	} else if ('DATETIME' == type.toUpperCase()) {
		var dateVal = XCOUtil.parseDateTime(val);
		if ('Invalid Date' == dateVal.toString()) {
			return;
		}
		xco.setDateTimeValue(item.name, dateVal);
	} else if ('TIMESTAMP' == type.toUpperCase()) {
		var dateVal = XCOUtil.parseDateTime(val);
		if ('Invalid Date' == dateVal.toString()) {
			return;
		}
		xco.setTimestampValue(item.name, dateVal);
	} else if ('BIGINTEGER' == type.toUpperCase()) {
		xco.setBigIntegerValue(item.name, val);// XXX
	} else if ('BIGDECIMAL' == type.toUpperCase()) {
		xco.setBigDecimalValue(item.name, val);// XXX
	}

	else {
		throw 'Unsupported data type :' + type;
	}
}

function inArray(elem, arr) {
	if (arr) {
		len = arr.length;
		for (var i = 0; i < len; i++) {
			if (arr[i] === elem) {
				return i;
			}
		}
	}
	return -1;
}

/** XCO验证器 */
var XCOValidator = {

	// 枚举值
	enumChecker : function(val, arr) {
		var len = arr.length;
		for (var i = 0; i < len; i++) {
			if (arr[i] === val) {
				return true;
			}
		}
		return false;
	},

	// 区间值
	intervalChecker : function(val, arr) {
		return val >= arr[0] && val <= arr[1];
	},

	// 最大值
	maxChecker : function(val, max) {
		return max >= val;
	},

	// 最小值
	minChecker : function(val, min) {
		return min <= val;
	},

	// 最大长度
	maxLengthChecker : function(val, maxLength) {
		return maxLength >= val.length;
	},

	// 最小长度
	minLengthChecker : function(val, minLength) {
		return minLength <= val.length;
	},

	// 区间长度
	intervalLengthChecker : function(val, arr) {
		return val.length >= arr[0] && val.length <= arr[1];
	},

	// 匹配
	matchChecker : function(val, pattern) {
		var reg = new RegExp(pattern);
		return reg.test(val);
	},

	// 不匹配
	noMatchChecker : function(val, pattern) {
		var reg = new RegExp(pattern);
		return !reg.test(val);
	},

	// 验证XCO对象 options{ xco: 被验证的对象 metadata: 验证元数据 errorHandler: 错误提示函数 accu: 错误信息是否追加 }
	verify : function(options) {
		var _xco = options.xco;
		var _metadata = options.metadata;
		var _accu = (undefined == options.accu) ? false : options.accu;// 错误信息是否累计
		// var _errorHandler = options.errorHandler;
		// var _extendedFunction = options.extendedFunction;
		if (undefined == options.errorList) {
			options.errorList = [];
		}
		var _errorList = options.errorList;
		var result = true;
		var _break = false;
		var len = _metadata.length;
		for (var i = 0; i < len; i++) {
			var item = _metadata[i];
			// if (undefined == item.v || !item.v || undefined == item.vm || 0 == item.vm.length) {
			if (undefined == item.v || !item.v) {
				continue;
			}
			var valIsNull = false;
			var _val = _xco.get(item.name);
			if (null == _val) {
				valIsNull = true;
				if (item.require) {
					var _message = item.desc;
					if (undefined == _message || null == _message) {
						_message = item.message;
						if (undefined == _message || null == _message) {
							_message = item.name + ' is not legal';
						}
					} else {
						_message = _message + '不能为空';
					}
					_errorList.push({
						elem : item.elem,
						name : item.name,
						message : _message
					});
					if (!_accu) {
						break;
					} else {
						continue;
					}
				}
			}

			// 如果没有验证规则, 则不需要验证
			if (undefined == item.vm || 0 == item.vm.length) {
				continue;
			}

			if (valIsNull) {
				var _message = item.desc;
				if (undefined == _message || null == _message) {
					_message = item.message;
					if (undefined == _message || null == _message) {
						_message = item.name + ' is not legal';
					}
				} else {
					_message = _message + '不能为空';
				}
				_errorList.push({
					elem : item.elem,
					name : item.name,
					message : _message
				});
				if (!_accu) {
					break;
				} else {
					continue;
				}
			}

			var _vm = item.vm;
			for (var j = 0; j < _vm.length; j++) {
				var _rule = _vm[j];
				if ('枚举值' == _rule.name) {
					// result = XCOValidator.enumChecker(_val, _rule.value);
					result = this.enumChecker(_val, _rule.value);
				} else if ('区间值' == _rule.name) {
					result = this.intervalChecker(_val, _rule.value);
				} else if ('最大值' == _rule.name) {
					result = this.maxChecker(_val, _rule.value);
				} else if ('最小值' == _rule.name) {
					result = this.minChecker(_val, _rule.value);
				} else if ('最大长度' == _rule.name) {
					result = this.maxLengthChecker(_val, _rule.value);
				} else if ('最小长度' == _rule.name) {
					result = this.minLengthChecker(_val, _rule.value);
				} else if ('区间长度' == _rule.name) {
					result = this.intervalLengthChecker(_val, _rule.value);
				} else if ('匹配' == _rule.name) {
					result = this.matchChecker(_val, _rule.value);
				} else if ('不匹配' == _rule.name) {
					result = this.noMatchChecker(_val, _rule.value);
				} else {
					throw 'Unsupported validation rules: ' + _rule.name;
				}
				if (!result) {
					// desc: 'user name', message: 'user name invalid',
					var _message = item.message;
					if (undefined == _message || null == _message) {
						_message = item.desc;
						if (undefined == _message || null == _message) {
							_message = item.name + ' is not legal';
						} else {
							_message = _message + '不合法';
						}
					}
					_errorList.push({
						elem : item.elem,
						name : item.name,
						message : _message
					});
					if (!_accu) {
						_break = true;
						break;
					}
				}
			}

			if (_break) {
				break;
			}
		}

		if (options.extendedFunction) {
			options.extendedFunction(options);
		}

		// 使用错误提示函数
		if (options.errorHandler) {
			options.errorHandler(options);
		}
		return 0 == _errorList.length;
	}
};
