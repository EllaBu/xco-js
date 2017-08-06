(function($) {
	$.extend({
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
					success : function(response) {
						var _xcoResponse = new XCO();
						try {
							_xcoResponse.fromXML0(response);
							if (options.success) {
								options.success(_xcoResponse, options);
							}
						} catch (e) {
							throw e;
						}
					}
				});
			} catch (e) {
				throw e;
			}
		}
	});
})(jQuery);
