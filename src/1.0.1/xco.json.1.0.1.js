var XCOJsonUtil = {

	/**
	 * JSON对象转XCO对象 
	 * json: JSON对象<br />
	 * xco: XCO对象,可选<br />
	 */
	convert : function(json, xco) {
		if (undefined == xco || null == xco) {
			xco = new XCO();
		}
		for ( var key in json) {
			if (typeof json[key] === "string") {
				xco.setStringValue(key, json[key]);
			} else if (typeof json[key] === "number") {
				if (this.isFloat(json[key])) {
					xco.setFloatValue(key, json[key]);
				} else {
					xco.setIntegerValue(key, json[key]);
				}
			} else if (typeof json[key] === "boolean") {
				xco.setStringValue(key, json[key]);
			} else if (Object.prototype.toString.call(json[key]) === '[object Array]') {
				this.convertArray(xco, key, json[key]);
			} else if (typeof json[key] === "object") {
				if (json[key] instanceof Date) {
					xco.setDateTimeValue(key, json[key])
				} else {
					xco.setXCOValue(key, this.convert(json[key]));
				}
			} else {
				throw 'Unsupported conversion type:' + (typeof json[key]);
			}
		}
		return xco;
	},
	isFloat : function(num) {
		return (num + "").indexOf(".") > -1;
	},
	convertArray : function(xco, key, array) {

		if (0 == array.length) {
			xco.setStringArrayValue(key, []);
			return;
		}

		var firstItem = array[0];
		if (typeof firstItem === "string" || typeof firstItem === "number" || typeof firstItem === "boolean") {
			xco.setStringArrayValue(key, array);
			return;
		} else if (typeof firstItem === "object") {
			var list = [];
			for ( var i = 0; i < array.length; i++) {
				list.push(this.convert(array[i]));
			}
			xco.setXCOArrayValue(key, list);
		} else {
			throw 'Unsupported conversion array type:' + (typeof array[i]);
		}
	}
}