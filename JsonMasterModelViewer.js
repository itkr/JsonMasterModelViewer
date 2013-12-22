// library part
(function(global, document) {

	// name space
	var self = {};

	// generic tools
	self.tools = (function() {
		var objects = {
			/**
			 * Json to object
			 * @param {String} json
			 * @return {Object}
			 */
			perthJson : function(json) {
				// （´・ω・｀）
				return eval("(" + json + ")");
			}
		};
		return objects;
	})();

	// jdango model json specialized formats
	// (View objects)
	self.format = (function() {

		// Element id
		self.ID = {
			DATA_TABLE : "dataTable",
			COLUMN_CHECKBOX : "columnCheckbox",
			SORTKEY_SELECT : "sortkeySelect"
		};

		// JVVM.show() keys
		self.FORMAT = {
			DATA_TABLE : "dataTable",
			COLUMN_CHECKBOX : "columnCheckbox",
			SORTKEY_SELECT : "sortkeySelect"
		};

		var objects = {};

		/**
		 * make table element
		 * @param {Array} rawDatas
		 * @param {Array} columns
		 * @return {Element} table
		 */
		objects[self.FORMAT.DATA_TABLE] = function(rawDatas, columns) {
			var table = document.createElement('table');
			var tr = document.createElement('tr');
			var th, td;
			var i, j, k;
			for ( k = 0; k < columns.length; k++) {
				th = document.createElement('th');
				th.innerHTML = columns[k];
				tr.appendChild(th);
			}
			table.appendChild(tr);
			for ( i = 0; i < rawDatas.length; i++) {
				tr = document.createElement('tr');
				for ( j = 0; j < columns.length; j++) {
					td = document.createElement('td');
					if (columns[j] === "id") {
						td.innerHTML = rawDatas[i].pk;
					} else {
						td.innerHTML = rawDatas[i].fields[columns[j]];
					}
					tr.appendChild(td);
				}
				table.appendChild(tr);
			}
			table.setAttribute("id", self.ID.DATA_TABLE);
			return table;
		};

		/**
		 * Create checkboxes on the column selection
		 * @param {Array} columns
		 * @return {Element}
		 */
		objects[self.FORMAT.COLUMN_CHECKBOX] = function(columns) {
			var form = document.createElement('form');
			var checkbox;
			var label;
			var text;
			var br;
			var i;
			form.setAttribute('name', self.ID.COLUMN_CHECKBOX);
			form.setAttribute('id', self.ID.COLUMN_CHECKBOX);
			for ( i = 0; i < columns.length; i++) {
				checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				checkbox.setAttribute('checked', 'checked');
				checkbox.setAttribute('value', columns[i]);
				text = document.createTextNode(columns[i]);
				br = document.createElement('br');
				label = document.createElement('label');
				label.appendChild(checkbox);
				label.appendChild(br);
				label.appendChild(text);
				form.appendChild(label);
			}
			return form;
		};

		/**
		 * Create a pulldown form on the sort key selection
		 * @param {Array} columns
		 * @return {Element}
		 */
		objects[self.FORMAT.SORTKEY_SELECT] = function(columns) {
			var select = document.createElement('select');
			var option;
			var text;
			var i;
			select.setAttribute('name', self.ID.SORTKEY_SELECT);
			select.setAttribute('id', self.ID.SORTKEY_SELECT);
			for ( i = 0; i < columns.length; i++) {
				text = document.createTextNode(columns[i]);
				option = document.createElement('option');
				option.setAttribute('value', columns[i]);
				option.appendChild(text);
				select.appendChild(option);
			}
			return select;
		};

		return objects;
	})();

	// data models
	self.models = (function() {
		var objects = {

			/**
			 * JsonMasterModel Klass
			 * @param {Object} json
			 */
			MasterModel : function(json) {

				var originalDatas = self.tools.perthJson(json);
				var name;
				var columns;

				/**
				 * Sort non-destructively
				 * @param {Object} datas
				 * @param {String} key
				 */
				var sorted = function(datas, key) {
					var datas = datas.slice();
					if (key === "id" || key === "pk") {
						datas.sort(function(a, b) {
							return (a.pk > b.pk ? 1 : -1);
						});
					} else {
						datas.sort(function(a, b) {
							return (a.fields[key] > b.fields[key] ? 1 : -1);
						});
					}
					return datas;
				};

				/**
				 * get model name
				 */
				this.__defineGetter__("name", function() {
					if ( typeof name === "undefined") {
						name = originalDatas[0].model;
					}
					return name;
				});

				/**
				 * get columns
				 */
				this.__defineGetter__("columns", function() {
					if ( typeof columns === "undefined") {
						var data = originalDatas[0];
						var fiels = Object.keys(data.fields);
						fiels.sort();
						columns = ["id"];
						columns = columns.concat(fiels)
					}
					return columns;
				});

				/**
				 * get original data
				 */
				this.__defineGetter__("data", function() {
					return originalDatas.slice();
				});

				/**
				 * Get the filtered data
				 * @param {Object} filter
				 */
				this.getDatas = function(filter) {
					var copyData = originalDatas.slice();
					if ( typeof filter.sortKey !== 'undefined') {
						copyData = sorted(copyData, filter.sortKey);
					}
					if ( typeof filter.range !== 'undefined') {
						copyData = copyData.slice(filter.range[0], filter.range[1]);
					}
					return copyData;
				};

			},

			/**
			 *
			 */
			Pager : function(datas, range) {
				var pages = [];
				var init = function() {
					var i;
					for ( i = 0; i < datas.length / range; i++) {
						pages.push(datas.slice(i * range, i * range + range));
					}
				};

				this.getAll = function() {
					return pages;
				};

				this.get = function(page) {
					return pages[page - 1];
				};

				init();
			}
		};
		return objects;
	})();

	// JsonMasterModelViewer.foo()
	// JMMV.foo()
	self.API = (function() {

		var objects = {

			/**
			 * get model
			 * @param {Object} json
			 */
			create : function(json) {
				return new self.models.MasterModel(json);
			},

			/**
			 * factory function to display
			 * @param {Element} elem
			 * @param {String} formatName
			 * @param {Array} args
			 */
			show : function(elem, formatName, args) {
				// @TODO 引数の数を可変にする方法が思いつかなかった
				// @TODO 呼び出し側がフォーマットの名前と必要な引数を知っている必要がある実装なので変えたい
				var createdDOM;
				if (args.length === 0) {
					createdDOM = self.format[formatName]();
				} else if (args.length === 1) {
					createdDOM = self.format[formatName](args[0]);
				} else if (args.length === 2) {
					createdDOM = self.format[formatName](args[0], args[1]);
				} else if (args.length === 3) {
					createdDOM = self.format[formatName](args[0], args[1], args[2]);
				} else if (args.length === 4) {
					createdDOM = self.format[formatName](args[0], args[1], args[2], args[3]);
				}
				elem.innerHTML = '';
				elem.appendChild(createdDOM);
			},

			/**
			 * event listener
			 * @param {Object} eventTarget
			 * @param {Object} eventType
			 * @param {Object} eventHandler
			 */
			on : function(eventTarget, eventType, eventHandler) {
				if (eventTarget.addEventListener) {
					eventTarget.addEventListener(eventType, eventHandler, false);
				} else {
					if (eventTarget.attachEvent) {
						eventType = "on" + eventType;
						eventTarget.attachEvent(eventType, eventHandler);
					} else {
						eventTarget["on" + eventType] = eventHandler;
					}
				}
			}
		};

		return objects;
	})();

	// Publication of the name space
	(function() {
		if ( typeof (global.JsonMasterModelViewer) === 'undefined') {
			global.JsonMasterModelViewer = self.API;
			global.JsonMasterModelViewer.ID = self.ID;
			global.JsonMasterModelViewer.FORMAT = self.FORMAT;
		}
		if ( typeof (global.JMMV) === 'undefined') {
			global.JMMV = self.API;
			global.JMMV.ID = self.ID;
			global.JMMV.FORMAT = self.FORMAT;
		}
	})();

})(this, this.document);

// call part
(function(global, document) {

	/**
	 * DOM access
	 * @param {String} id
	 * @return {Element}
	 */
	var $ = function(id) {
		return document.getElementById(id);
	};

	/**
	 * get checkbox form values
	 * @param {Element} form
	 * @return {Array}
	 */
	var getCheckboxValues = function(form) {
		var i;
		var values = [];
		for ( i = 0; i < form.length; i++) {
			if (form.elements[i].checked) {
				values.push(form.elements[i].value);
			}
		}
		return values;
	};

	/**
	 *　get pulldown form values
	 * @param {Object} select
	 * @return {String}
	 */
	var getSelectValue = function(select) {
		return select.options[select.selectedIndex].value;
	};

	/**
	 * show datas
	 * @param {Element} element
	 * @param {JsonMasterModelViewer.MasterModel} model
	 * @param {Object} filter
	 * @param {Array} columns
	 */
	var showData = function(element, model, filter, columns) {
		JMMV.show(element, JMMV.FORMAT.DATA_TABLE, [model.getDatas(filter), columns]);
	};

	/**
	 * show model name
	 * @param {JsonMasterModelViewer.MasterModel} model
	 * @param {Element} element
	 */
	var showModelName = function(element, model) {
		element.innerHTML = model.name;
	};

	/**
	 * show model columns
	 * @param {ObJsonMasterModelViewer.MasterModelject} model
	 * @param {Element} element
	 */
	var showColumns = function(element, model) {
		JMMV.show(element, JMMV.FORMAT.COLUMN_CHECKBOX, [model.columns]);
	};

	/**
	 *
	 * @param {Element} element
	 * @param {JsonMasterModelViewer.MasterModel} model
	 */
	var showPulldown = function(element, model) {
		JMMV.show(element, JMMV.FORMAT.SORTKEY_SELECT, [model.columns]);
	};

	/**
	 *
	 */
	var mkFilter = function() {
		var filter = {
			"sortKey" : getSelectValue($(JMMV.ID.SORTKEY_SELECT)),
			//"range": [0, 10]
		}
		return filter;
	}
	/**
	 * initialize
	 */
	var init = function() {

		var jsonField = $('source');
		var model = JMMV.create(jsonField.value);
		var filter;

		jsonField.style.display = "none";

		showModelName($('mn'), model);
		showColumns($('cb'), model);
		showPulldown($('sk'), model);

		filter = mkFilter();
		showData($('container'), model, filter, getCheckboxValues($(JMMV.ID.COLUMN_CHECKBOX)));

		JMMV.on($('show'), 'click', function() {
			filter = mkFilter();
			showData($('container'), model, filter, getCheckboxValues($(JMMV.ID.COLUMN_CHECKBOX)));
		});
	};

	JMMV.on(global, 'load', init);

})(this, this.document);

