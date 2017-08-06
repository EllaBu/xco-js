var IGNORE_FOLLOW_UP = 'Ignore follow-up';
(function($) {
	$.extend({
		/** XCO请求 */
		doXcoRequest : function(options) {
			options = options || {};
			try {
				var _strServletURL = options.url || '';
				var _xcoRequestXml = options.data.toXML();
				var _url = encodeURI(_strServletURL);
				jQuery.ajax({
					url : _url,
					async : options.async == undefined ? true : options.async,
					contentType : options.contentType || 'application/xco;charset=utf-8',
					type : 'POST',
					ifModified : options.ifModified || false,
					cache : options.cache == undefined ? true : options.cache,
					dataType : options.dataType || 'xml',
					data : encodeURIComponent(_xcoRequestXml),
					error : function(jqXHR, statusText, error) {
						if (options.error) {
							options.error(jqXHR, statusText, error);
						}
						// else {
						// throw event;
						// }
					},
					success : function(response) {
						var _xcoResponse = new XCO();
						try {
							_xcoResponse.fromXML0(response);
							// 结果验证
							if (options.detector) {
								if (typeof options.detector == 'function') {
									if (!options.detector(_xcoResponse, options)) {
										return;
									}
								} else {// Object.prototype.toString.call(obj)
									// === '[object Array]';
									var detectorResult = null;
									for ( var i = 0; i < options.detector.length; i++) {
										detectorResult = options.detector[i](_xcoResponse, options);
										if (!detectorResult) {
											return;
										}
										// 增加后续忽略
										if (IGNORE_FOLLOW_UP == detectorResult) {
											break;
										}
									}
								}
							}
							// 回调
							if (options.success) {
								if (typeof options.success === 'function') {
									options.success(_xcoResponse, options);
								} else {
									for ( var i = 0; i < options.success.length; i++) {
										options.success[i](_xcoResponse, options);
									}
								}
							}
						} catch (e) {
							throw e;
						}
					}
				});
			} catch (e) {
				throw e;
			}
		},

		/** XCO同步请求，并且相应结果通过函数返回 */
		doXcoSyncReturnRequest : function(options) {
			var result = null;
			options = options || {};
			try {
				var _strServletURL = options.url || '';
				var _xcoRequestXml = options.data.toXML();
				var _url = encodeURI(_strServletURL);
				jQuery.ajax({
					// TODO: timeout
					url : _url,
					async : false,
					contentType : options.contentType || 'application/xco;charset=utf-8',
					type : 'POST',
					ifModified : options.ifModified || false,
					cache : options.cache == undefined ? true : options.cache,
					dataType : options.dataType || 'xml',
					data : encodeURIComponent(_xcoRequestXml),
					success : function(response) {
						var _xcoResponse = new XCO();
						try {
							_xcoResponse.fromXML0(response);
							result = _xcoResponse;
						} catch (e) {
							throw e;
						}
					}
				});
				return result;
			} catch (e) {
				throw e;
			}
		}
	});
})(jQuery);
