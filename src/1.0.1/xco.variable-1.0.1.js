/** XCO变量 */
/**
 * XCO变量<br />
 * {name|xxxx}<br />
 * {name@xxxx}<br />
 * {name+xxxx*123}<br />
 */
var XCOVariable = {
	// 普通变量
	NORMAL : 1,
	// 默认值 {name|xxxx}
	DEFAULT_VALUE : 2,
	// 函数 {name@xxxx}
	FUNCTION : 3,
	// 表达式 {name+xxxx*123}
	EXPR : 4,

	// 变量
	VAR : 1,
	// 常量
	CONST : 2,
	// 操作符
	OP : 3,

	getDefaultValue : function(ns, content, type) {
		var _pos = content.indexOf('|');
		if (_pos > -1) {
			var defaultVal = content.substring(_pos + 1);
			var _startChar = defaultVal.charAt(0);
			var _endChar = defaultVal.charAt(defaultVal.length - 1);
			if ((("'" == _startChar) && ("'" == _endChar)) || (('"' == _startChar) && ('"' == _endChar))) {
				defaultVal = defaultVal.slice(1, -1);
			}
			return {
				ns : ns,
				type : type,
				mode : XCOVariable.DEFAULT_VALUE,
				key : content.substring(0, _pos),
				defaultVal : defaultVal
			};

		}
		return null;
	},

	getFunction : function(ns, content, type) {
		var _pos = content.indexOf('@');
		if (_pos > -1) {
			return {
				ns : ns,
				type : type,
				mode : XCOVariable.FUNCTION,
				key : content.substring(0, _pos),
				functionVal : content.substring(_pos + 1)
			};
		}
		return null;
	},

	getExpr : function(ns, content, type) {
		content = content.trim();
		var expr = false;
		var len = content.length;
		var sb = [];
		var itemList = [];
		var isString = '';
		for ( var i = 0; i < len; i++) {
			var key = content.charAt(i);
			switch (key) {
			case '\'':
				if ('\'' == isString) {
					isString = '';
					sb.push(key);
					var val = sb.join("").trim();
					itemList.push(this.getVal(val));
					sb = [];
				} else if ('' != isString) {// ==["]
					sb.push(key);
				} else {
					// 处理之前的
					var val = sb.join("").trim();
					if (val.length > 0) {
						itemList.push(this.getVal(val));
					}
					sb = [];
					isString = '\'';
					sb.push(key);
				}
				break;
			case '"':
				if ('"' == isString) {
					isString = '';
					sb.push(key);
					var val = sb.join("").trim();
					itemList.push(this.getVal(val));
					sb = [];
				} else if ('' != isString) {// ==[']
					sb.push(key);
				} else {
					// 处理之前的
					var val = sb.join("").trim();
					if (val.length > 0) {
						itemList.push(this.getVal(val));
					}
					sb = [];
					isString = '"';
					sb.push(key);
				}
				break;
			case '+':
			case '-':
			case '*':
			case '/':
			case '%':
			case '(':
			case ')':
				if ('' != isString) {
					sb.push(key);
				} else {
					if (sb.length > 0) {
						var val = sb.join("").trim();
						if (val.length > 0) {
							itemList.push(this.getVal(val));
						}
						sb = [];
					}
					// 操作符
					itemList.push({
						val : key,
						type : XCOVariable.OP
					});
					expr = true;
				}
				break;
			default:
				sb.push(key);
			}
		}
		if (!expr) {
			return null;
		}
		if (sb.length > 0) {
			var val = sb.join("").trim();
			if (val.length > 0) {
				itemList.push(this.getVal(val));
			}
		}
		return {
			ns : ns,
			type : type,
			mode : XCOVariable.EXPR,
			itemList : itemList
		};
	},

	getVal : function(val) {
		// 是否是数字常量
		if (/^[-+]?(([0-9]+)([.]([0-9]+))?|([.]([0-9]+))?)$/.test(val)) {
			return {
				val : val,
				type : XCOVariable.CONST
			};
		}
		// 是否是字符串常量
		if (val.length > 2) {
			var _startChar = val.charAt(0);
			var _endChar = val.charAt(val.length - 1);
			if ((("'" == _startChar) && ("'" == _endChar)) || (('"' == _startChar) && ('"' == _endChar))) {
				return {
					val : val,
					type : XCOVariable.CONST
				};
			}
		}
		// 剩下的是变量
		return {
			val : val,
			type : XCOVariable.VAR
		};
	},

	calcExpr : function(xco, itemList) {
		var sb = [];
		var len = itemList.length;
		for ( var i = 0; i < len; i++) {
			var item = itemList[i];
			if (XCOVariable.VAR == item.type) {
				var val = xco.get(item.val);
				// TODO check
				if (typeof val != "number") {
					val = "'" + val + "'";
				}
				sb.push(val);
			} else {
				sb.push(item.val);
			}
		}
		var expr = sb.join("");
		return new Function("return (" + expr + ")")();
	},

	parse : function(ns, content, type) {
		var variable = null;
		variable = this.getDefaultValue(ns, content, type);
		if (null != variable) {
			return variable;
		}
		variable = this.getFunction(ns, content, type);
		if (null != variable) {
			return variable;
		}
		variable = this.getExpr(ns, content, type);
		if (null != variable) {
			return variable;
		}
		variable = {
			ns : ns,
			type : type,
			mode : XCOVariable.NORMAL,
			key : content
		}
		return variable;
	}
}
