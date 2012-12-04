/*
 * Copyright 2011-2012 Darko Pantić (pdarko@myopera.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (window, document) {
	if (!Storage.prototype.getPref) {
		/**
		 * Get an item from storage and convert it to its original type.
		 *
		 * @param {String} key
		 * Key for accessing data.
		 *
		 * @returns {Any}
		 * Any type of data on success; <cite>null</cite> on failure.
		 */
		Storage.prototype.getPref = function (key) {
			var value = this.getItem(key);

			if (value == "true")
				return true;
			else if (value == "false")
				return false;
			else if (value == "undefined")
				return undefined;
			// Search for integer.
			else if (/^[+\-]?\d+$/.test(value))
				return window.parseInt(value, 10);
			// Search for hexadecimal number.
			else if (/^(0x)[\da-f]+$/i.test(value))
				return window.parseInt(value, 16);
			// Search for real number.
			else if (/^[+\-]?\d*\.\d+(e[+\-]\d+)?$/i.test(value))
				return window.parseFloat(value);
			// Search for object/array.
			else if (/^\{.*\}$|^\[.*\]$/.test(value))
				return JSON.parse(value);

			return value;
		};
	}

	if (!Storage.prototype.setPref) {
		/**
		 * Store an item in storage.
		 *
		 * @param {String} key
		 * String to be used as key for data.
		 *
		 * @param {Any} value
		 * Any type of data.
		 */
		Storage.prototype.setPref = function (key, value) {
			if (typeof value == "object")
				value = JSON.stringify(value);
				
			this.setItem(key, value);
		};
	}
})(window, window.document);
