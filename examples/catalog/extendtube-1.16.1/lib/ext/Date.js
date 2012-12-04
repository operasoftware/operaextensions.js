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

(function () {
	/**
	 * Will throw an error if some of the arguments is not string.
	 */
	function checkStringType() {
		Array.prototype.forEach.call(arguments, function (argument) {
			if (typeof argument != "string" && !(argument instanceof String))
				throw new TypeError("Wrong argument type.");
		});
	}

	/**
	 * Formats %a, %A, %b and %B are not locale aware.
	 * Formats %E, %O and %+ are not supported.
	 *
	 * Added formats: %f, %i, %L and %v (see below).
	 *
	 * @param {String} pattern
	 * Pattern which will be used to format date and/or time.
	 *
	 * @returns {String}
	 * Formatted date and/or time.
	 */
	function format(pattern) {
		switch (pattern) {
			// The abbreviated weekday name according to the current locale.
			case "%a":
				var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
				return day[this.getDay()];

			// The full weekday name according to the current locale.
			case "%A":
				var day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				return day[this.getDay()];

			// The abbreviated month name according to the current locale.
			case "%b":
				var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
				return month[this.getMonth()];

			// The full month name according to the current locale.
			case "%B":
				var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				return month[this.getMonth()];

			// The preferred date and time representation for the current locale.
			case "%c":
				return this.toLocaleString();

			// The century number as a 2-digit integer.
			// See also %f.
			case "%C":
				return this.getFullYear().toString().substr(0, 2);

			// Equivalent to %m/%d/%y. FOR AMERICANS ONLY.
			// Americans should note that in other countries %d/%m/%y is rather common.
			// In international context this format is ambiguous and should not be used.
			case "%D":
				return this.format("%m/%d/%y");

			// The day of the month as a decimal number (range 01 to 31).
			case "%d":
				var day = this.getDate();
				if (day < 10)
					day = '0' + day.toString();

				return day.toString();

			// Like %d, the day of the month as a decimal number,
			// but a leading zero is replaced by a space.
			case "%e":
				var day = this.getDate();
				if (day < 10)
					day = ' ' + day.toString();

				return day.toString();

			// Modifier: use alternative format.
			case "%E":
				break;

			// Like %C but return real century (21 for 2001, but 20 for 2000).
			case "%f":	// Not available in strftime.
				var year = this.getFullYear();
				var century = Math.floor(year / 100);
				if (year % 100)
					century++;

				return century.toString();

			// Equivalent to %Y-%m-%d (the ISO 8601 date format).
			case "%F":
				return this.format("%Y-%m-%d");

			// The ISO 8601 week-based year with century as a decimal number.
			// The 4-digit year corresponding to the ISO week number (see %V).
			// This has the same format and value as %Y, except that if the ISO week number
			// belongs to the previous or next year, that year is used instead.
			case "%G":
				var week = window.parseInt(this.format("%V"), 10),
					year = this.getFullYear();

				if (week == 53) {
					if (this.getMonth())
						year++;
					else
						year--;
				}

				return year.toString();

			// Like %G, but without century, that is, with a 2-digit year (00-99).
			case "%g":
				return this.format("%G").substr(2);

			// Equivalent to %b.
			case "%h":
				return this.format("%b");

			// The hour as a decimal number using a 24-hour clock (range 00 to 23).
			case "%H":
				var hour = this.getHours();
				if (hour < 10)
					hour = '0' + hour.toString();

				return hour.toString();

			// The number of milliseconds since the Epoch, 1970-01-01 00:00:00 +0000 (UTC).
			case "%i":	// Not available in strftime.
				return this.getTime().toString();

			// The hour as a decimal number using a 12-hour clock (range 01 to 12).
			case "%I":
				var hour = this.getHours();
				if (hour > 12)
					hour -= 12;
				else if (hour < 10)
					hour = '0' + hour.toString();

				return hour.toString();

			// The day of the year as a decimal number (range 001 to 366).
			case "%j":
				var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

				days = days.slice(0, this.getMonth()).reduce(function (a, b) { return a + b; }, 0);
				days += this.getDate();

				if (this.getMonth() > 1 && this.isLeapYear())
					days++;
				if (days < 100) {
					if (days < 10)
						days = '0' + days.toString();
					days = '0' + days.toString();
				}

				return days.toString();

			// The  hour (24-hour clock) as a decimal number (range 0 to 23).
			// Single digits are preceded by a blank.
			// See also %H.
			case "%k":
				var hour = this.getHours();
				if (hour < 10)
					hour = ' ' + hour.toString();

				return hour.toString();

			// The hour (12-hour clock) as a decimal number (range 1 to 12).
			// Single digits are preceded by a blank. See also %I.
			case "%l":
				var hour = this.getHours();

				if (hour > 12)
					hour -= 12;
				if (hour < 10)
					hour = ' ' + hour.toString();

				return hour.toString();

			// The millisecond as a decimal number (range 000 to 999).
			case "%L":	// Not available in strftime.
				var milli = this.getMilliseconds();
				if (milli < 100) {
					if (milli < 10)
						milli = '0' + milli.toString();
					milli = '0' + milli.toString();
				}

				return milli.toString();

			// The month as a decimal number (range 01 to 12).
			case "%m":
				var month = this.getMonth() + 1;
				if (month < 10)
					month = '0' + month.toString();

				return month.toString();

			// The minute as a decimal number (range 00 to 59).
			case "%M":
				var minute = this.getMinutes();
				if (minute < 10)
					minute = '0' + minute.toString();

				return minute.toString();

			// A newline character.
			case "%n":
				return "\n";

			// Modifier: use alternative format.
			case "%O":
				break;

			// Either “AM” or “PM” according to the given time value.
			// Noon is treated as “PM” and midnight as “AM”.
			case "%p":
				if (this.getHours() > 12)
					return "PM";
				else
					return "AM";

			// Like %p but in lower-case: “am” or “pm”.
			case "%P":
				if (this.getHours() > 12)
					return "pm";
				else
					return "am";

			// The time in a.m. or p.m. notation.
			case "%r":
				var time = this.format("%I:%M:%S");
				if (this.getHours() > 12)
					return time += " p.m.";

				return time +=  " a.m.";

			// The time in 24-hour notation (%H:%M).
			// For a version including the seconds, see %T below.
			case "%R":
				return this.format("%H:%M");

			// The number of seconds since the Epoch, 1970-01-01 00:00:00 +0000 (UTC).
			case "%s":
				return this.getTime().toString().slice(0, -3);

			// The second as a decimal number (range 00 to 59).
			case "%S":
				var second = this.getSeconds();
				if (second < 10)
					second = '0' + second.toString();

				return second.toString();

			// A tab character.
			case "%t":
				return "\t";

			// The time in 24-hour notation (%H:%M:%S).
			// For a version including the milliseconds, see %v below.
			case "%T":
				return this.format("%H:%M:%S");

			// The day of the week as a decimal, range 1 to 7, Monday being 1.
			// See also %w.
			case "%u":
				var day = this.getDay();
				if (day == 0)
					day = '7';

				return day.toString();

			// The  week number of the current year as a decimal number, range 00 to 53,
			// starting with the first Sunday as the first day of week 01.
			// See also %V and %W.
			case "%U":
				var yearday = window.parseInt(this.format("%j"), 10);
				var firstday = (new Date(this.getFullYear().toString() + "-01-01")).getDay();

				if (firstday != 0)
					yearday = yearday + firstday - 7;

				var week = Math.ceil(yearday / 7);
				if (week < 10) {
					if (week)
						week = '0' + week.toString();
					else
						week = "53";
				}
				else
					week = week.toString();

				return week;

			// The time in 24-hour notation (%H:%M:%S.%L).
			case "%v":	// Not available in strftime.
				return this.format("%H:%M:%S.%L");

			// The ISO 8601 week number of the current year as a decimal number, range 01 to 53,
			// where week 1 is the first week that has at least 4 days in the new year.
			// See also %U and %W.
			case "%V":
				var yearday = window.parseInt(this.format("%j"), 10);
				var firstday = (new Date(this.getFullYear().toString() + "-01-01")).getDay();

				if (firstday == 0)
					yearday -= 1;
				else if (firstday != 1)
					yearday = yearday + firstday - 8;

				var week = Math.ceil(yearday / 7);
				if (firstday && firstday <= 4)
					week++;
				if (week < 10) {
					if (week)
						week = '0' + week.toString();
					else
						week = "53";
				}
				else
					week = week.toString();

				return week;

			// The day of the week as a decimal, range 0 to 6, Sunday being 0.
			// See also %u.
			case "%w":
				return this.getDay().toString();

			// The week number of the current year as a decimal number, range 00 to 53,
			// starting with the first Monday as the first day of week 01.
			case "%W":
				var yearday = window.parseInt(this.format("%j"), 10);
				var firstday = (new Date(this.getFullYear().toString() + "-01-01")).getDay();

				if (firstday == 0)
					yearday -= 1;
				else if (firstday != 1)
					yearday = yearday + firstday - 8;

				var week = Math.ceil(yearday / 7);
				if (week < 10) {
					if (week)
						week = '0' + week.toString();
					else
						week = "53";
				}
				else
					week = week.toString();

				return week;

			// The preferred date representation for the current locale without the time.
			case "%x":
				return this.toLocaleDateString();

			// The preferred time representation for the current locale without the date.
			case "%X":
				return this.toLocaleTimeString();

			// The year as a decimal number without a century (range 00 to 99).
			case "%y":
				return this.getFullYear().toString().substr(2);

			// The year as a decimal number including the century.
			case "%Y":
				return this.getFullYear().toString();

			// The +hhmm or -hhmm numeric time-zone (that is, the hour and minute offset from UTC).
			case "%z":
				return this.toString().match(/GMT((\+|-)\d{4})/)[1];

			// The numeric time-zone or name or abbreviation.
			case "%Z":
				var timezone = this.toString().match(/\(([A-Z]+)\)/);
				if (timezone === null)
					timezone = this.format("%z");

				return timezone;

			// The date and time in date(1)  format.
			case "%+":
				break;

			// A literal '%' character.
			case "%%":
				return '%';
		}

		// If format string is not found return input.
		return pattern;
	}

	if (!Date.prototype.format) {
		/**
		 * Format date as strftime(3) does (with some exceptions; see above).
		 *
		 * @see http://linux.die.net/man/3/strftime
		 *
		 * @param {String} pattern
		 * Pattern to format date by.
		 *
		 * @returns {String}
		 * Formatted date.
		 */
		Date.prototype.format = function (pattern) {
			checkStringType(pattern);

			return pattern.split(/(%[A-Za-z%+])/).map(format, this).join('');
		};
	}

	if (!Date.prototype.isLeapYear) {
		/**
		 * Test if <code>this</code> year is leap year.
		 *
		 * @returns {Boolean}
		 * <code>true</code> for leap year; <code>false</code> otherwise.
		 */
		Date.prototype.isLeapYear = function () {
			var year = this.getFullYear();

			if (year % 2)
				return false;
			else if ((year % 400) == 0)
				return true;
			else if ((year % 100) == 0)
				return false;
			else if ((year % 4) == 0)
				return true;
			else
				return false;
		};
	}
})();
