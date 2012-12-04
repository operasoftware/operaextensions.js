//opera.isReady(function() {
  
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

var document = window.document,
	opera = window.opera,
	extension = window.opera.extension,
	pref = window.widget.preferences,
	widget = window.widget;
	
  // TEMPORARY DEBUG LINE
  pref.clear();

var bgProcess = window.opera.extension.bgProcess,
	extensionAddress = window.location.protocol + "//" + window.location.hostname,
	operaVersion = window.parseFloat(window.opera.version()),
	extVersion = window.widget.version.replace(/\-.+/, ''),
	availableUpdate = '';

if (bgProcess)
	var log = bgProcess.log;
else {
	// Log messages and print them to error console.
	var log = {
			counter: 1,
			buffer: [{
				msgc: 1,
				time: Date.now(),
				mesg: "boot: Message log started.",
				type: " i "
			}],
			clearbuffer: function clearMessageLogBuffer() {
				this.buffer = [this.buffer.shift()];
				this.info("Message buffer cleared.");
			},
			pushmesg: function (mesg, type) {
				this.buffer.push({
					msgc: ++this.counter,
					time: Date.now(),
					mesg: mesg,
					type: type
				});
			},
			lsmesg: function (atime, buffer) {
				if (!buffer)
					buffer = this.buffer;

				return buffer.map(function (message) {
						return '[' + formatTime(buffer[0].time, message.time, atime) + "] " + message.type + ' ' + message.mesg;
					}, this).join("\n");
			},
			src: "ExtendTube\n‾‾‾‾‾‾‾‾‾‾",
			info: function () {
				var mesg = reduce.apply(this, arguments).trim("\n");
				mesg = getCallerName() + ": " + mesg;
				this.pushmesg(mesg, " i ");

				if (pref.getPref("loglevel") > 2)
					window.console.info(this.src + "\n" + '[' + formatTime(this.buffer[0].time, this.buffer[this.buffer.length - 1].time) + "] " + mesg + "\n");
			},
			Info: function () {
				var loglevel = pref.getPref("loglevel");
				pref.setPref("loglevel", 3);
				this.info.apply(this, arguments);
				pref.setPref("loglevel", loglevel);
			},
			warn: function () {
				var mesg = reduce.apply(this, arguments).trim("\n");
				mesg = getCallerName() + ": " + mesg;
				this.pushmesg(mesg, "'w'");

				if (pref.getPref("loglevel") > 1)
					window.console.warn(this.src + "\n" + '[' + formatTime(this.buffer[0].time, this.buffer[this.buffer.length - 1].time) + "] " + mesg + "\n");
			},
			Warn: function () {
				var loglevel = pref.getPref("loglevel");
				pref.setPref("loglevel", 3);
				this.warn.apply(this, arguments);
				pref.setPref("loglevel", loglevel);
			},
			error: function () {
				var mesg = reduce.apply(this, arguments).trim("\n");
				mesg = getCallerName() + ": " + mesg;
				this.pushmesg(mesg, "{E}");

				if (pref.getPref("loglevel") > 0 || pref.getPref("loglevel") === null)
					window.console.error(this.src + "\n" + '[' + formatTime(this.buffer[0].time, this.buffer[this.buffer.length - 1].time) + "] " + mesg + "\n");
			},
			Error: function () {
				var loglevel = pref.getPref("loglevel");
				pref.setPref("loglevel", 3);
				this.error.apply(this, arguments);
				pref.setPref("loglevel", loglevel);
			}
		};

	// Prevent log buffer overgrowth.
	window.setInterval(function () {
		var targetLength = 1e3;

		if (targetLength < log.buffer.length - 1) {
			log.info("Performing log buffer maintenance. Log buffer have", log.buffer.length, "messages");
			targetLength = log.buffer.length - targetLength;
			log.buffer.splice(0, targetLength, log.buffer[0]);
			log.info("First " + targetLength + " messages removed from log buffer.");
		}
	}, 3e5);

}

function reduce() {
	return Array.prototype.reduce.call(arguments, function (previous, argument) {
		if (Object.isObject(argument))
			return previous + Object.ls(argument) + ' ';
		else
			return previous + argument + ' ';
		}, '');
}

function formatTime(start, current, atime) {
	if (atime) {
		if (typeof atime != "string")
			atime = "%v";

		var time = (new Date(current)).format(atime);
	}
	else {
		var time = current - start;

		var second = Math.floor(time / 1000).toPaddedString(5, ' '),
			milli = (time - Math.floor(time / 1000) * 1000).toPaddedString(3);

		time = second + '.' + milli;
	}

	return time;
}

function getCallerName() {
	var caller = arguments.callee.caller;
	while (caller && !caller.name)
		caller = caller.caller;

	if (caller)
		return caller.name;
	return "global";
}

var localisedStrings = {
// Afrikaans (Afrikaans)
"af": {
PREFERENCES:				"Voorkeure...",
DOWNLOAD_VIDEO:				"Aflaai video",
DOWNLOAD_EMPTY:				"(leeg)",
DOWNLOAD_EMPTY_TIP:			"Data vir aflaai nie gevind",
DOWNLOAD_UNKNOWN_TIP:		"onbekend video-formaat",
STEP_FRAME_FORWARD:			"Stap een raam vorentoe",
SEEK_FORWARD:				"Soek vorentoe",
SEEK_BACK:					"Soek terug",
POPOUT_PLAYER:				"Pop uit video-speler",
LOOP_DISABLE:				"Disable lus",
LOOP_ENABLE:				"Aktiveer lus",
LOOP_SECTION_DISABLE:		"Artikel lus afskakel",
LOOP_SECTION_ENABLE:		"Skakel die artikel lus",
LOOP_MARK_START:			"Mark artikel begin",
LOOP_MARK_END:				"Mark afdeling einde",
PREVIEW_START:				"Klik op video voorskou om te begin.",
PREVIEW_END:				"Klik op video voorskou aan die einde.",
LYRICS_BUTTON_HIDE:			"Steek lyrics",
LYRICS_BUTTON_SHOW:			"Wys lyrics",
LYRICS_BUTTON_LOAD:			"Load",
LYRICS_BUTTON_TRY:			"Probeer handmatig...",
LYRICS_LYRICS:				"Lyrics",
LYRICS_LYRICS_FOR:			"Lyrics vir: %song",
LYRICS_TITLE_INFO:			"Voeg kunstenaar en titel van die liedjie om te soek na.",
LYRICS_TITLE_INFO_EX:		"Skei deur koppelteken (soos so: Kunstenaar - Titel).",
LYRICS_SEARCH_START:		"Op soek na “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Geen resultate vir “%song”.",
LYRICS_SEARCH_FOUND:		"Lyrics gevind. Loading...",
LYRICS_SEARCH_NOT_FOUND:	"Lyrics is nie gevind nie en nie meer kombinasies te probeer.",
LYRICS_PARSE_SEARCH:		"Parsing soek...",
LYRICS_PARSE_LYRICS:		"Parsing lyrics data...",
LYRICS_PARSE_SUCCESS:		"Lyrics suksesvol geparseerd.",
LYRICS_PARSE_ERROR:			"Lyrics is gevind, maar kan nie verwerk word nie. Jammer.",
LYRICS_TITLE_INVALID:		"Video titel nie ooreenstem met “kunstenaar - titel” patroon!",
RATING_LIKE:				"%pcent% laaiks",
RATING_NO_DATA:				"Video gradering nie beskikbaar nie."
},
// አማርኛ (Amharic)
// "am": {
// },
// العربية (Arabic)
"ar": {
PREFERENCES:				"تفضيلات...",
DOWNLOAD_VIDEO:				"تحميل الفيديو",
DOWNLOAD_EMPTY:				"(فارغ)",
DOWNLOAD_EMPTY_TIP:			"بيانات للتحميل لم يتم العثور على",
DOWNLOAD_UNKNOWN_TIP:		"غير معروف شكل فيديو",
STEP_FRAME_FORWARD:			"خطوة إلى الأمام في إطار واحد",
SEEK_FORWARD:				"تسعى إلى الأمام",
SEEK_BACK:					"تسعى مرة أخرى",
POPOUT_PLAYER:				"جحظ مشغل فيديو",
LOOP_DISABLE:				"تعطيل حلقة",
LOOP_ENABLE:				"تمكين حلقة",
LOOP_SECTION_DISABLE:		"تعطيل قسم حلقة",
LOOP_SECTION_ENABLE:		"تمكين حلقة القسم",
LOOP_MARK_START:			"مارك قسم بدء",
LOOP_MARK_END:				"علامة نهاية المقطع",
PREVIEW_START:				"انقر لبدء تشغيل معاينة الفيديو.",
PREVIEW_END:				"انقر لنهاية المعاينة الفيديو.",
LYRICS_BUTTON_HIDE:			"إخفاء كلمات",
LYRICS_BUTTON_SHOW:			"تظهر كلمات",
LYRICS_BUTTON_LOAD:			"تحميل",
LYRICS_BUTTON_TRY:			"محاولة يدويا...",
LYRICS_LYRICS:				"كلمات",
LYRICS_LYRICS_FOR:			"كلمات ل: %song",
LYRICS_TITLE_INFO:			"إدراج الفنان وعنوان الأغنية للبحث عن.",
LYRICS_TITLE_INFO_EX:		"منفصلة اصلة (مثل ذلك : الفنان - العنوان).",
LYRICS_SEARCH_START:		"البحث عن “%song”...",
LYRICS_SEARCH_NO_RESULT:	"لا نتائج ل “%song”.",
LYRICS_SEARCH_FOUND:		"العثور على كلمات. تحميل...",
LYRICS_SEARCH_NOT_FOUND:	"لم يتم العثور على كلمات وليس أكثر من محاولة لتركيبات.",
LYRICS_PARSE_SEARCH:		"توزيع نتائج البحث...",
LYRICS_PARSE_LYRICS:		"تحليل البيانات كلمات...",
LYRICS_PARSE_SUCCESS:		"كلمات تحليل بنجاح.",
LYRICS_PARSE_ERROR:			"تم العثور على كلمات ولكن لا يمكن أن يكون تحليل. عذرا.",
LYRICS_TITLE_INVALID:		"عنوان المقطع لا يطابق “الفنان -- العنوان” نمط!",
RATING_LIKE:				"أثار الفيديو إعجاب %pcent% من الأشخاص",
RATING_NO_DATA:				"غير متوفر التصنيف."
},
// Български (Bulgarian)
//	Thanks to:
//		Любомир <extrawordinary@hotmai.com>
"bg": {
PREFERENCES:				"Предпочитания...",
DOWNLOAD_VIDEO:				"Сваляне на видео",
DOWNLOAD_EMPTY:				"(Няма възможност да се свали)",
DOWNLOAD_EMPTY_TIP:			"Данни за изтегляне не са намерени",
DOWNLOAD_UNKNOWN_TIP:		"Непознат видео формат",
STEP_FRAME_FORWARD:			"Премини един кадър напред",
SEEK_FORWARD:				"Превърти напред",
SEEK_BACK:					"Върни назад",
POPOUT_PLAYER:				"Покажи само видео", // new
LOOP_DISABLE:				"Изключи автоматичното повторение",
LOOP_ENABLE:				"Включи автоматичното повторение",
LOOP_SECTION_DISABLE:		"Изключи повторението на зададената част",
LOOP_SECTION_ENABLE:		"Включи повторението на зададената част",
LOOP_MARK_START:			"Маркирай начална точка на повторение",
LOOP_MARK_END:				"Маркирай крайна точка на повторение",
PREVIEW_START:				"Кликнете да започне предварителен преглед на видео.", // new
PREVIEW_END:				"Натиснете до края на предварителен преглед на видео.", // new
LYRICS_BUTTON_HIDE:			"Скрий текста",
LYRICS_BUTTON_SHOW:			"Покажи текста",
LYRICS_BUTTON_LOAD:			"Зареди",
LYRICS_BUTTON_TRY:			"Ръчно въвеждане на текст...",
LYRICS_LYRICS:				"Текст",
LYRICS_LYRICS_FOR:			"Текст за: %song",
LYRICS_TITLE_INFO:			"Въведи изпълнител и заглавие на търсената песен.",
LYRICS_TITLE_INFO_EX:		"Разделяне с тире (пример: Изпълнител – Заглавие).",
LYRICS_SEARCH_START:		"Търсене на „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Не е намерен резултат за „%song“.",
LYRICS_SEARCH_FOUND:		"Намерен текст. Зареждане... ",
LYRICS_SEARCH_NOT_FOUND:	"Не е намерен текст и няма повече приложими комбинации.",
LYRICS_PARSE_SEARCH:		"Анализира се резултата от търсенето...",
LYRICS_PARSE_LYRICS:		"Анализиране на текста...",
LYRICS_PARSE_SUCCESS:		"Текстът е успешно анализиран.",
LYRICS_PARSE_ERROR:			"Намерен е текст, но за съжаление не може да бъде анализиран.",
LYRICS_TITLE_INVALID:		"Заглавието на видеото не отговаря на указаните „Изпълнител – Заглавие“!",
RATING_LIKE:				"%pcent% харесвания", // new
RATING_NO_DATA:				"Рейтинг не е налична." // new
},
// Беларуская (Belarusian)
//	Thanks to:
//		Jahor Sivahryvaŭ <Jahor@mail.by>
"be": {
PREFERENCES:				"Налады...",
DOWNLOAD_VIDEO:				"Запампаваць відэа",
DOWNLOAD_EMPTY:				"(пуста)",
DOWNLOAD_EMPTY_TIP:			"Няма чаго запампоўваць",
DOWNLOAD_UNKNOWN_TIP:		"невядомы фармат відэа", // new
STEP_FRAME_FORWARD:			"Перасунуцца на кадр наперад",
SEEK_FORWARD:				"Шукаць наперад",
SEEK_BACK:					"Шукаць назад",
POPOUT_PLAYER:				"Паказаць толькі відэа", // new
LOOP_DISABLE:				"Адключыць паўтор",
LOOP_ENABLE:				"Уключыць паўтор",
LOOP_SECTION_DISABLE:		"Адключыць частковы паўтор",
LOOP_SECTION_ENABLE:		"Уключыць частковы паўтор",
LOOP_MARK_START:			"Пазначыць пачатак часткі",
LOOP_MARK_END:				"Пазначыць канец часткі",
PREVIEW_START:				"Націсніце, каб пачаць прагляд відэа.", // new
PREVIEW_END:				"Націсніце да канца папярэдняга прагляду відэа.", // new
LYRICS_BUTTON_HIDE:			"Схаваць тэкст песьні",
LYRICS_BUTTON_SHOW:			"Адлюстраваць тэкст песьні",
LYRICS_BUTTON_LOAD:			"Загрузка",
LYRICS_BUTTON_TRY:			"Спрабаваць самастойна...",
LYRICS_LYRICS:				"Тэкст песьні",
LYRICS_LYRICS_FOR:			"Тэкст для песьні: %song",
LYRICS_TITLE_INFO:			"Пазначце артыста ды назву песьні для пошуку.",
LYRICS_TITLE_INFO_EX:		"Падзяляць злучком (напрыклад: Артыст - Назва).",
LYRICS_SEARCH_START:		"Пошук «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Нічога падобнага да «%song» ня знойдзена.",
LYRICS_SEARCH_FOUND:		"Знойдзены тэкст песьні. Загрузка...",
LYRICS_SEARCH_NOT_FOUND:	"Тэкст песьні ня знойдзены й ніякіх варыянтаў пошуку больш няма.",
LYRICS_PARSE_SEARCH:		"Аналіз вынікаў пошуку...",
LYRICS_PARSE_LYRICS:		"Аналіз тэкста песьні...",
LYRICS_PARSE_SUCCESS:		"Тэкст песьні пасьпяхова прааналізаваны.",
LYRICS_PARSE_ERROR:			"Тэкст песьні знойдзены але яго не атрымалася прааналізаваць. Выбачайце.",
LYRICS_TITLE_INVALID:		"Назва відэафайлу не адпавядае шаблёну «Артыст - Назва»!",
RATING_LIKE:				"%pcent% як", // new
RATING_NO_DATA:				"Рэйтынг не даступныя." // new
},
// বাংলা (Bengali)
"bn": {
PREFERENCES:				"পছন্দ...",
DOWNLOAD_VIDEO:				"ভিডিও ডাউনলোড করুন",
DOWNLOAD_EMPTY:				"(ফাঁকা)",
DOWNLOAD_EMPTY_TIP:			"পাওয়া ডাউনলোডের জন্য ডেটা না",
DOWNLOAD_UNKNOWN_TIP:		"অজানা ভিডিও বিন্যাস",
STEP_FRAME_FORWARD:			"এক ফ্রেম আগ বাড়া",
SEEK_FORWARD:				"সামনের দিকে খোঁজ",
SEEK_BACK:					"ফিরে খোঁজ",
POPOUT_PLAYER:				"ভিডিও প্লেয়ার পপ আউট",
LOOP_DISABLE:				"পরিহারের উপায় নিষ্ক্রিয় করুন",
LOOP_ENABLE:				"লুপ সক্রিয় করুন",
LOOP_SECTION_DISABLE:		"অধ্যায় লুপ নিষ্ক্রিয় করুন",
LOOP_SECTION_ENABLE:		"অধ্যায় লুপ সক্রিয় করুন",
LOOP_MARK_START:			"মার্ক অধ্যায় শুরু",
LOOP_MARK_END:				"মার্ক অধ্যায় শেষ",
PREVIEW_START:				"ভিডিও প্রাকদর্শন করুন.",
PREVIEW_END:				"থেকে ভিডিওর পূর্বদৃশ্য শেষ ক্লিক করুন.",
LYRICS_BUTTON_HIDE:			"গানের লুকান",
LYRICS_BUTTON_SHOW:			"গানের দেখাও",
LYRICS_BUTTON_LOAD:			"লোড",
LYRICS_BUTTON_TRY:			"নিজে চেষ্টা করুন...",
LYRICS_LYRICS:				"গান",
LYRICS_LYRICS_FOR:			"জন্য গান: %song",
LYRICS_TITLE_INFO:			"শিল্পী এবং সঙ্গীত এর শিরোনামটি অনুসন্ধান ঢোকান.",
LYRICS_TITLE_INFO_EX:		"হাইফেন (মত তাই: শিরোনাম - শিল্পী) দ্বারা পৃথক.",
LYRICS_SEARCH_START:		"\"%song\" জন্য অনুসন্ধান করছি...",
LYRICS_SEARCH_NO_RESULT:	"\"%song\" জন্য কোন ফলাফল.",
LYRICS_SEARCH_FOUND:		"গান পাওয়া যায়. লোড হচ্ছে...",
LYRICS_SEARCH_NOT_FOUND:	"গান এবং কোনো আরো সমন্বয় করার চেষ্টা পাওয়া যায় না.",
LYRICS_PARSE_SEARCH:		"অনুসন্ধান ফলাফল পার্স...",
LYRICS_PARSE_LYRICS:		"গানের তথ্য পার্স...",
LYRICS_PARSE_SUCCESS:		"গান সাফল্যের বিশ্লেষণ.",
LYRICS_PARSE_ERROR:			"লিরিক কিন্তু পাওয়া বিশ্লেষণ করা যাবে না হয়. দুঃখিত.",
LYRICS_TITLE_INVALID:		"ভিডিও শিরোনাম \"শিল্পী - শিরোনাম\" না মেলে প্যাটার্ন!",
RATING_LIKE:				"%pcent% মত",
RATING_NO_DATA:				"উপলব্ধ নির্ধারণ না."
},
// Català (Catalan; Valencian)
"ca": {
PREFERENCES:				"Preferències...",
DOWNLOAD_VIDEO:				"Descarregar el vídeo",
DOWNLOAD_EMPTY:				"(buit)",
DOWNLOAD_EMPTY_TIP:			"Dades per a la descàrrega no es troba",
DOWNLOAD_UNKNOWN_TIP:		"format de vídeo desconegut",
STEP_FRAME_FORWARD:			"Pas de la imatge següent",
SEEK_FORWARD:				"Cercar cap endavant",
SEEK_BACK:					"Cercar cap enrere",
POPOUT_PLAYER:				"Mostra només vídeo",
LOOP_DISABLE:				"Llaç de desactivar",
LOOP_ENABLE:				"Permeten bucle",
LOOP_SECTION_DISABLE:		"Bucle secció desactivar",
LOOP_SECTION_ENABLE:		"Permetre que la secció del llaç",
LOOP_MARK_START:			"Marca d’inici de la secció",
LOOP_MARK_END:				"Marca de cap secció",
PREVIEW_START:				"Feu clic per començar a vista prèvia de vídeo.",
PREVIEW_END:				"Feu clic per finalitzar vista prèvia de vídeo.",
LYRICS_BUTTON_HIDE:			"Amaga lletres de cançons",
LYRICS_BUTTON_SHOW:			"Lletres de cançons mostren",
LYRICS_BUTTON_LOAD:			"De càrrega",
LYRICS_BUTTON_TRY:			"Tractar de forma manual...",
LYRICS_LYRICS:				"Lletres de cançons",
LYRICS_LYRICS_FOR:			"Lletres de cançons de: %song",
LYRICS_TITLE_INFO:			"Inseriu artista i el títol de la cançó que voleu cercar.",
LYRICS_TITLE_INFO_EX:		"Separats per un guió (d’aquesta manera: Artista - Títol).",
LYRICS_SEARCH_START:		"A la recerca de «%song»...",
LYRICS_SEARCH_NO_RESULT:	"No hi ha resultats per a «%song».",
LYRICS_SEARCH_FOUND:		"Lletres que es troben. Carregant...",
LYRICS_SEARCH_NOT_FOUND:	"Lletres no es troben ni més combinacions intentar.",
LYRICS_PARSE_SEARCH:		"Analitzar els resultats de cerca...",
LYRICS_PARSE_LYRICS:		"Lletres d’anàlisi de dades...",
LYRICS_PARSE_SUCCESS:		"Lletres d’analitzar correctament.",
LYRICS_PARSE_ERROR:			"Lletres es troben, però no es pot analitzar. Ho sentim.",
LYRICS_TITLE_INVALID:		"Títol del vídeo no coincideix amb «Artista - Títol» patró!",
RATING_LIKE:				"%pcent% «M’agrada»",
RATING_NO_DATA:				"Categoria no disponible."
},
// Čeština (Czech)
//	Thanks to:
//		watrill,
//		RomanK47
"cs": {
PREFERENCES:				"Nastavení...",
DOWNLOAD_VIDEO:				"Stáhnout",
DOWNLOAD_EMPTY:				"(prázdné)",
DOWNLOAD_EMPTY_TIP:			"Požadovaná data nebyla nalezena",
DOWNLOAD_UNKNOWN_TIP:		"neznámý formát videa", // new
STEP_FRAME_FORWARD:			"Krok o jeden snímek vpřed",
SEEK_FORWARD:				"Skok vpřed",
SEEK_BACK:					"Skok zpět",
POPOUT_PLAYER:				"Zobrazit pouze video", // new
LOOP_DISABLE:				"Zakázat smyčku",
LOOP_ENABLE:				"Povolit smyčku",
LOOP_SECTION_DISABLE:		"Zakázat smyčku výběru",
LOOP_SECTION_ENABLE:		"Povolit smyčku výběru",
LOOP_MARK_START:			"Začátek výběru",
LOOP_MARK_END:				"Konec výběru",
PREVIEW_START:				"Klepněte na tlačítko pro spuštění videa náhledu.", // new
PREVIEW_END:				"Klikněte do konce náhled videa.", // new
LYRICS_BUTTON_HIDE:			"Skrýt text písně",
LYRICS_BUTTON_SHOW:			"Zobrazit text písně",
LYRICS_BUTTON_LOAD:			"Načíst",
LYRICS_BUTTON_TRY:			"Zkusit najít ručně...",
LYRICS_LYRICS:				"Text písně",
LYRICS_LYRICS_FOR:			"Text písně: %song",
LYRICS_TITLE_INFO:			"Vložte jméno interpreta a písně, kterou chcete hledat.",
LYRICS_TITLE_INFO_EX:		"Oddělte pomlčkou (například: Interpret - Název písně).",
LYRICS_SEARCH_START:		"Vyhledávání „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Žádné výsledky pro „%song“.",
LYRICS_SEARCH_FOUND:		"Text písně nalezen. Načítání...",
LYRICS_SEARCH_NOT_FOUND:	"Byly vyzkoušeny všechny možné kombinace, ale text písně nebyl nalezen.",
LYRICS_PARSE_SEARCH:		"Zpracovávání výsledků hledání...",
LYRICS_PARSE_LYRICS:		"Zpracování textů...",
LYRICS_PARSE_SUCCESS:		"Text písně úspěšně zpracován.",
LYRICS_PARSE_ERROR:			"Text byl nalezen, ale není možné jej zpracovat. Omlouvám se.",
LYRICS_TITLE_INVALID:		"Název videa neodpovídá vzoru „Interpret - Název písně“!",
RATING_LIKE:				"Líbí se: %pcent%", // new
RATING_NO_DATA:				"Hodnocení není k dispozici." // new
},
// Dansk (Danish)
//	Thanks to:
//		Frederik Riboe Olsen
"da": {
PREFERENCES:				"Præferencer...",
DOWNLOAD_VIDEO:				"Hent video",
DOWNLOAD_EMPTY:				"(Tom)",
DOWNLOAD_EMPTY_TIP:			"Data til nedhentning ikke fundet",
DOWNLOAD_UNKNOWN_TIP:		"ukendt videoformat", // new
STEP_FRAME_FORWARD:			"Gå et billede frem",
SEEK_FORWARD:				"Spol frem",
SEEK_BACK:					"Spol tilbage",
POPOUT_PLAYER:				"Pop ud videoafspiller", // new
LOOP_DISABLE:				"Deaktiver gentagelse",
LOOP_ENABLE:				"Aktiver gentagelse",
LOOP_SECTION_DISABLE:		"Deaktiver sektionsgentagelse",
LOOP_SECTION_ENABLE:		"Aktiver sektionsgentagelse",
LOOP_MARK_START:			"Marker sektionens start",
LOOP_MARK_END:				"Marker sektionens slutning",
PREVIEW_START:				"Klik for at starte video preview.", // new
PREVIEW_END:				"Klik for at afslutte video preview.", // new
LYRICS_BUTTON_HIDE:			"Skjul tekster",
LYRICS_BUTTON_SHOW:			"Vis tekster",
LYRICS_BUTTON_LOAD:			"Indlæs",
LYRICS_BUTTON_TRY:			"Prøv manuelt...",
LYRICS_LYRICS:				"Tekster",
LYRICS_LYRICS_FOR:			"Tekster for: %song",
LYRICS_TITLE_INFO:			"Indsæt kunstner og titlen på sangen du vil søge efter.",
LYRICS_TITLE_INFO_EX:		"Adskilt med bindestreg (Sådan: Kunstner - Titel).",
LYRICS_SEARCH_START:		"Søger efter »%song«...",
LYRICS_SEARCH_NO_RESULT:	"Ingen resultater for »%song«.",
LYRICS_SEARCH_FOUND:		"Tekster fundet. Henter...",
LYRICS_SEARCH_NOT_FOUND:	"Teksterne blev ikke fundet og der er ikke flere kombinationer at prøve.",
LYRICS_PARSE_SEARCH:		"Tolker søgeresultater...",
LYRICS_PARSE_LYRICS:		"Tolker tekst data...",
LYRICS_PARSE_SUCCESS:		"Tekster successfuldt tolket.",
LYRICS_PARSE_ERROR:			"Teksterne er fundet, men kan ikke tolkes. Beklager.",
LYRICS_TITLE_INVALID:		"Videotitlen passer ikke til »Kunstner - Titel« formatet!",
RATING_LIKE:				"%pcent% synes godt om", // new
RATING_NO_DATA:				"Video bedømmelse ikke tilgængelig." // new
},
// Deutsch (German)
//	Thanks to:
//		Ralf Beckebans
//		Steve K. <velocity@bossmail.de>
//		Gedeon
//		Andreas Böhm
//		Carl Aron Carls <carlaron@carls.de>
//		Nicola Markus Pfister <nicola@besonet.ch>
"de": {
PREFERENCES:				"Einstellungen...",
DOWNLOAD_VIDEO:				"Video herunterladen",
DOWNLOAD_EMPTY:				"(leer)",
DOWNLOAD_EMPTY_TIP:			"Herunterzuladende Daten wurden nicht gefunden",
DOWNLOAD_UNKNOWN_TIP:		"unbekannten Video-Format", // new
STEP_FRAME_FORWARD:			"Einen Frame vorwärts",
SEEK_FORWARD:				"Vorspulen",
SEEK_BACK:					"Zurückspulen",
POPOUT_PLAYER:				"Video zeigen nur", // new
LOOP_DISABLE:				"Wiederholung ausschalten",
LOOP_ENABLE:				"Wiederholung einschalten",
LOOP_SECTION_DISABLE:		"Wiederholung eines Abschnitts ausschalten",
LOOP_SECTION_ENABLE:		"Wiederholung eines Abschnitts einschalten",
LOOP_MARK_START:			"Start eines Abschnitts markieren",
LOOP_MARK_END:				"Ende eines Abschnitts markieren",
PREVIEW_START:				"Hier klicken, um Video-Vorschau zu starten.", // new
PREVIEW_END:				"Hier klicken, um Video-Vorschau zu beenden.", // new
LYRICS_BUTTON_HIDE:			"Verstecke den Liedtext",
LYRICS_BUTTON_SHOW:			"Zeige den Liedtext an",
LYRICS_BUTTON_LOAD:			"Laden",
LYRICS_BUTTON_TRY:			"Manuell suchen...",
LYRICS_LYRICS:				"Liedtext",
LYRICS_LYRICS_FOR:			"Liedtext für: %song",
LYRICS_TITLE_INFO:			"Bitte Interpret und Titel im Suchfeld eingeben.",
LYRICS_TITLE_INFO_EX:		"Eingabe getrennt durch Bindestrich (Format: Interpret - Titel)",
LYRICS_SEARCH_START:		"Suche nach „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Keine Ergebnisse für „%song“.",
LYRICS_SEARCH_FOUND:		"Liedtext gefunden. Wird geladen...",
LYRICS_SEARCH_NOT_FOUND:	"Liedtext wurde auch in verschiedenen Kombinationen  nicht gefunden.",
LYRICS_PARSE_SEARCH:		"Analysiere Resultate...",
LYRICS_PARSE_LYRICS:		"Analysiere die Liedtext Daten...",
LYRICS_PARSE_SUCCESS:		"Liedtext wurde erfolgreich analysiert.",
LYRICS_PARSE_ERROR:			"Leider konnte der Liedtext nicht gefunden und analysiert werden.",
LYRICS_TITLE_INVALID:		"Der Suchtext wurde nicht im Format „Interpret - Titel“ eingegeben!",
RATING_LIKE:				"Gefällt %pcent%", // new
RATING_NO_DATA:				"Bewertung nicht verfügbar." // new
},
// Ελληνικά (Greek)
//	Thanks to:
//		Murat SO <so.murat@hotmail.com>
"el": {
PREFERENCES:				"Ρυθμίσεις...",
DOWNLOAD_VIDEO:				"Κατεβάστε το βίντεο",
DOWNLOAD_EMPTY:				"(κενό)",
DOWNLOAD_EMPTY_TIP:			"Δεν βρέθηκαν δεδομένα για κατέβασμα",
DOWNLOAD_UNKNOWN_TIP:		"άγνωστη μορφή βίντεο", // new
STEP_FRAME_FORWARD:			"Ένα πλαίσιο μπροστά",
SEEK_FORWARD:				"Μπροστά",
SEEK_BACK:					"Πίσω",
POPOUT_PLAYER:				"Προβολή βίντεο μόνο", // new
LOOP_DISABLE:				"Απενεργοποίηση επανάληψης",
LOOP_ENABLE:				"Ενεργοποίηση επανάληψης",
LOOP_SECTION_DISABLE:		"Απενεργοποίηση επανάληψης τμήματος",
LOOP_SECTION_ENABLE:		"Ενεργοποίηση επανάληψης τμήματος",
LOOP_MARK_START:			"Σήμανση αρχής τμήματος",
LOOP_MARK_END:				"Σήμανση τέλους τμήματος",
PREVIEW_START:				"Κάντε κλικ στο κουμπί για να ξεκινήσει προεπισκόπηση βίντεο.", // new
PREVIEW_END:				"Κάντε κλικ στο τέλος προεπισκόπηση βίντεο.", // new
LYRICS_BUTTON_HIDE:			"Κρύψε τους στίχους",
LYRICS_BUTTON_SHOW:			"Εμφάνισε τους στίχους",
LYRICS_BUTTON_LOAD:			"Αναζήτηση",
LYRICS_BUTTON_TRY:			"Δοκιμάστε χειροκίνητα...",
LYRICS_LYRICS:				"Στίχοι",
LYRICS_LYRICS_FOR:			"Στίχοι για: %song",
LYRICS_TITLE_INFO:			"Εισαγωγή καλλιτέχνη και τίτλου τραγουδιού για αναζήτηση.",
LYRICS_TITLE_INFO_EX:		"Διαχωρίστε με παύλα (π.χ. Καλλιτέχνης - Τίτλος).",
LYRICS_SEARCH_START:		"Αναζήτηση για «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Δεν βρέθηκαν αποτελέσματα για «%song».",
LYRICS_SEARCH_FOUND:		"Οι στίχοι βρέθηκαν. Φορτώνονται...",
LYRICS_SEARCH_NOT_FOUND:	"Δεν βρέθηκαν στίχοι και δεν υπάρχουν άλλοι συνδυασμοί για αναζήτηση.",
LYRICS_PARSE_SEARCH:		"Ανάλυση αποτελεσμάτων αναζήτησης...",
LYRICS_PARSE_LYRICS:		"Ανάλυση δεδομένων στίχων...",
LYRICS_PARSE_SUCCESS:		"Ανάλυση των στίχων ολοκληρώθηκε επιτυχώς.",
LYRICS_PARSE_ERROR:			"Οι στίχοι βρέθηκαν αλλά δεν μπορούν να αναλυθούν. Συγγνώμη.",
LYRICS_TITLE_INVALID:		"Ο τίτλος του βίντεο δεν αντιστοιχεί στο σχήμα «Καλλιτέχνης - Τίτλος»!",
RATING_LIKE:				"%pcent% θετικές", // new
RATING_NO_DATA:				"Αξιολόγηση δεν είναι διαθέσιμη." // new
},
// English (English)
//	Thanks to: me :), Darko Pantić
"en": {
PREFERENCES:				"Preferences...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(empty)",
DOWNLOAD_EMPTY_TIP:			"Data for download not found",
DOWNLOAD_UNKNOWN_TIP:		"unknown video format",
STEP_FRAME_FORWARD:			"Step one frame forward",
SEEK_FORWARD:				"Seek forward",
SEEK_BACK:					"Seek back",
POPOUT_PLAYER:				"Pop out video player",
LOOP_DISABLE:				"Disable loop",
LOOP_ENABLE:				"Enable loop",
LOOP_SECTION_DISABLE:		"Disable section loop",
LOOP_SECTION_ENABLE:		"Enable section loop",
LOOP_MARK_START:			"Mark section start",
LOOP_MARK_END:				"Mark section end",
PREVIEW_START:				"Click to start video preview.",
PREVIEW_END:				"Click to end video preview.",
LYRICS_BUTTON_HIDE:			"Hide lyrics",
LYRICS_BUTTON_SHOW:			"Show lyrics",
LYRICS_BUTTON_LOAD:			"Load",
LYRICS_BUTTON_TRY:			"Try manually...",
LYRICS_LYRICS:				"Lyrics",
LYRICS_LYRICS_FOR:			"Lyrics for: %song",
LYRICS_TITLE_INFO:			"Insert artist and title of song to search for.",
LYRICS_TITLE_INFO_EX:		"Separate with hyphen (like so: Artist - Title).",
LYRICS_SEARCH_START:		"Searching for “%song”...",
LYRICS_SEARCH_NO_RESULT:	"No results for “%song”.",
LYRICS_SEARCH_FOUND:		"Lyrics found. Loading...",
LYRICS_SEARCH_NOT_FOUND:	"Lyrics are not found and no more combinations to try.",
LYRICS_PARSE_SEARCH:		"Parsing search results...",
LYRICS_PARSE_LYRICS:		"Parsing lyrics data...",
LYRICS_PARSE_SUCCESS:		"Lyrics successfully parsed.",
LYRICS_PARSE_ERROR:			"Lyrics are found but cannot be parsed. Sorry.",
LYRICS_TITLE_INVALID:		"Video title doesn’t match “Artist - Title” pattern!",
RATING_LIKE:				"%pcent% like",
RATING_NO_DATA:				"Rating not available."
},
// Español (Spanish)
//	Thanks to:
//		Santiago Puerto <santiago.puerto@gmail.com>
//		LuKaZ PaiN <lukaznet@gmail.com>
//		José Manuel Navarro Vargas <elkotox3@live.cl>
"es": {
PREFERENCES:				"Opciones...",
DOWNLOAD_VIDEO:				"Descargar vídeo",
DOWNLOAD_EMPTY:				"(Descargar vacía)",
DOWNLOAD_EMPTY_TIP:			"No se encuentran datos para la descarga",
DOWNLOAD_UNKNOWN_TIP:		"formato de vídeo desconocido", // new
STEP_FRAME_FORWARD:			"Saltar un frame adelante",
SEEK_FORWARD:				"Buscar adelante",
SEEK_BACK:					"Buscar atras",
POPOUT_PLAYER:				"Videos mostrando sólo", // new
LOOP_DISABLE:				"Desactivar bucle",
LOOP_ENABLE:				"Activar bucle",
LOOP_SECTION_DISABLE:		"Desactivar sección de bucle",
LOOP_SECTION_ENABLE:		"Activar sección de bucle",
LOOP_MARK_START:			"Marcar inicio de sección",
LOOP_MARK_END:				"Marcar fin de sección",
PREVIEW_START:				"Haga clic para empezar a vista previa de vídeo.", // new
PREVIEW_END:				"Haga clic para finalizar vista previa de vídeo.", // new
LYRICS_BUTTON_HIDE:			"Ocultar letras de canciones",
LYRICS_BUTTON_SHOW:			"Mostrar letras de canciones",
LYRICS_BUTTON_LOAD:			"Cargar",
LYRICS_BUTTON_TRY:			"Intentar manualmente...",
LYRICS_LYRICS:				"Letras de canciones",
LYRICS_LYRICS_FOR:			"Letras para: %song",
LYRICS_TITLE_INFO:			"Inserte artista y título de la cancion a buscar.",
LYRICS_TITLE_INFO_EX:		"Separado por un guión (por ejempli: Artista - Título).",
LYRICS_SEARCH_START:		"Búscando «%song»...",
LYRICS_SEARCH_NO_RESULT:	"No hay resultados para «%song».",
LYRICS_SEARCH_FOUND:		"Letras encontradas. Cargando...",
LYRICS_SEARCH_NOT_FOUND:	"Letras no encontradas y no hay mas combinaciones para probar.",
LYRICS_PARSE_SEARCH:		"Procesando los resultados de la búsqueda...",
LYRICS_PARSE_LYRICS:		"Procesando datos de lyrics...",
LYRICS_PARSE_SUCCESS:		"Letras analizadas correctamente.",
LYRICS_PARSE_ERROR:			"Las letras se encuentran, pero no se pueden analizar. Lo siento.",
LYRICS_TITLE_INVALID:		"El título del vídeo no coincide «Artista - Título» patron!",
RATING_LIKE:				"Me gusta: %pcent%", // new
RATING_NO_DATA:				"Categoría no disponible." // new
},
// Eesti keel (Estonian)
//	Thanks to:
//		Alexander Assmann
"et": {
PREFERENCES:				"Eelistused...",
DOWNLOAD_VIDEO:				"Laadi video alla",
DOWNLOAD_EMPTY:				"(tühi)",
DOWNLOAD_EMPTY_TIP:			"Andmeid allalaadimiseks ei leitud",
DOWNLOAD_UNKNOWN_TIP:		"tundmatu videoformaadis", // new
STEP_FRAME_FORWARD:			"Üks kaader edasi",
SEEK_FORWARD:				"Keri edasi",
SEEK_BACK:					"Keri tagasi",
POPOUT_PLAYER:				"Tupsahtaa videopleier", // new
LOOP_DISABLE:				"Kordus välja",
LOOP_ENABLE:				"Kordus sisse",
LOOP_SECTION_DISABLE:		"Lõigu kordus välja",
LOOP_SECTION_ENABLE:		"Lõigu kordus sisse",
LOOP_MARK_START:			"Märgi lõigu algus",
LOOP_MARK_END:				"Märgi lõigu lõpp",
PREVIEW_START:				"Klõpsake alustamiseks video eelvaade.", // new
PREVIEW_END:				"Klikka end video eelvaade.", // new
LYRICS_BUTTON_HIDE:			"Peida laulusõnad",
LYRICS_BUTTON_SHOW:			"Näita laulusõnu",
LYRICS_BUTTON_LOAD:			"Lae",
LYRICS_BUTTON_TRY:			"Proovi käsitsi...",
LYRICS_LYRICS:				"Laulusõnad",
LYRICS_LYRICS_FOR:			"Laulusõnad: %song",
LYRICS_TITLE_INFO:			"Sisesta otsitava laulu esitaja ja pealkiri.",
LYRICS_TITLE_INFO_EX:		"Eralda sidekriipsuga (näiteks: Esitaja - Pealkiri).",
LYRICS_SEARCH_START:		"Otsimine „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Tulemused „%song“.",
LYRICS_SEARCH_FOUND:		"Laulusõnad leitud. Laadimine...",
LYRICS_SEARCH_NOT_FOUND:	"Laulusõnu ei leitud. Rohkem kombinatsioone proovida ei ole.",
LYRICS_PARSE_SEARCH:		"Otsingutulemuste sõelumine...",
LYRICS_PARSE_LYRICS:		"Laulusõnade andmete sõelumine...",
LYRICS_PARSE_SUCCESS:		"Laulusõnad edukalt sõelutud.",
LYRICS_PARSE_ERROR:			"Laulusõnad on leitud, aga neid ei ole võimalik sõeluda. Vabandust.",
LYRICS_TITLE_INVALID:		"Video pealkiri ei klapi „Esitaja - Pealkiri“ mustriga!",
RATING_LIKE:				"%pcent% kasutajale meeldis", // new
RATING_NO_DATA:				"Hinnang ei ole saadaval." // new
},
// Euskara (Basque)
"eu": {
PREFERENCES:				"Aukerak...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(hutsik)",
DOWNLOAD_EMPTY_TIP:			"Deskargatu datuak ez dira aurkitu",
DOWNLOAD_UNKNOWN_TIP:		"Bideoaren formatua ezezaguna",
STEP_FRAME_FORWARD:			"Step bat frame aurrera",
SEEK_FORWARD:				"Jo aurrera",
SEEK_BACK:					"Jo atzera",
POPOUT_PLAYER:				"Pop izarrekin video player",
LOOP_DISABLE:				"Desgaitu begizta",
LOOP_ENABLE:				"Gaitu begizta",
LOOP_SECTION_DISABLE:		"Desgaitu Atal begizta",
LOOP_SECTION_ENABLE:		"Gaitu Atal begizta",
LOOP_MARK_START:			"Mark Atal Irteeran",
LOOP_MARK_END:				"Mark Atal bukaera",
PREVIEW_START:				"Egin klik bideoa preview hasteko.",
PREVIEW_END:				"Egin klik bideoa preview amaiera emateko.",
LYRICS_BUTTON_HIDE:			"Ezkutatu lyrics",
LYRICS_BUTTON_SHOW:			"Erakutsi lyrics",
LYRICS_BUTTON_LOAD:			"Kargatu",
LYRICS_BUTTON_TRY:			"Saiatu eskuz...",
LYRICS_LYRICS:				"Lyrics",
LYRICS_LYRICS_FOR:			"Lyrics for %song",
LYRICS_TITLE_INFO:			"Txertatu artista eta abestiaren izenburua bilatzeko.",
LYRICS_TITLE_INFO_EX:		"Marratxo by bereizia (beraz: Artist - Izenburua).",
LYRICS_SEARCH_START:		"Bilatzea «%song»...",
LYRICS_SEARCH_NO_RESULT:	"No results for «%song».",
LYRICS_SEARCH_FOUND:		"Lyrics aurkitu. Kargatzen...",
LYRICS_SEARCH_NOT_FOUND:	"Lyrics ez da aurkitu dira eta gehiago konbinazioak ez saiatzeko.",
LYRICS_PARSE_SEARCH:		"Bilaketaren emaitzak Parsing...",
LYRICS_PARSE_LYRICS:		"Lyrics datuak Parsing...",
LYRICS_PARSE_SUCCESS:		"Lyrics arrakastaz analizatu.",
LYRICS_PARSE_ERROR:			"Lyrics dira, baina ezin da analizatu. Barkatu.",
LYRICS_TITLE_INVALID:		"Video title «Artist - Izenburua» ereduarekin ez dator bat!",
RATING_LIKE:				"%pcent% erabiltzaileri gustatu zaie",
RATING_NO_DATA:				"Puntuatu gabe dago."
},
// فارسی (Persian)
//	Thanks to:
//		Hessam Sameri
"fa": {
PREFERENCES:				"تنظيمات",
DOWNLOAD_VIDEO:				"دانلود ويدئو",
DOWNLOAD_EMPTY:				"(خالي)",
DOWNLOAD_EMPTY_TIP:			"اطلاعاتي براي دانلود پيدا نشد",
DOWNLOAD_UNKNOWN_TIP:		"فرمت های تصویری ناشناخته", // new
STEP_FRAME_FORWARD:			"يک فريم به جلو",
SEEK_FORWARD:				"جلو بردن",
SEEK_BACK:					"عقب بردن",
POPOUT_PLAYER:				"پاپ از پخش ویدئو", // new
LOOP_DISABLE:				"غيرفعال کردن حلقه",
LOOP_ENABLE:				"فعال کردن حلقه",
LOOP_SECTION_DISABLE:		"غيرفعال کردن حلقه براي قطعه",
LOOP_SECTION_ENABLE:		"غيرفعال کردن حلقه براي قطعه",
LOOP_MARK_START:			"شروع قطعه",
LOOP_MARK_END:				"پايان قطعه",
PREVIEW_START:				"بر روی پیش نمایش فیلم برای شروع کلیک کنید.", // new
PREVIEW_END:				"بر روی پیش نمایش فیلم برای پایان دادن به کلیک کنید.", // new
LYRICS_BUTTON_HIDE:			"مخفي کردن شعر",
LYRICS_BUTTON_SHOW:			"نمايش شعر",
LYRICS_BUTTON_LOAD:			"بارگذاري",
LYRICS_BUTTON_TRY:			"به صورت دستي امتحان کنيد",
LYRICS_LYRICS:				"شعر",
LYRICS_LYRICS_FOR:			"شعر براي: %song",
LYRICS_TITLE_INFO:			"نام خواننده و عنوان ترانه را براي جستجو وارد نماييد.",
LYRICS_TITLE_INFO_EX:		"با خط تيره جدا کنيد (مثل: خواننده - عنوان).",
LYRICS_SEARCH_START:		"جستجو براي “%song”...",
LYRICS_SEARCH_NO_RESULT:	"نتيجه اي يافت نشد براي “%song”.",
LYRICS_SEARCH_FOUND:		"شعر پيدا شد.درحال بارگذاري...",
LYRICS_SEARCH_NOT_FOUND:	"شعر يافت نشد و ترکيب ديگري براي جستجو کردن وجود ندارد",
LYRICS_PARSE_SEARCH:		"تجزيه نتايج جستجو...",
LYRICS_PARSE_LYRICS:		"تجزيه اطلاعات شعر...",
LYRICS_PARSE_SUCCESS:		"شعر به خوبي تجزيه شد.",
LYRICS_PARSE_ERROR:			"شعر پيدا شد اما قابل تجزيه شدن نيست،ببخشيد!",
LYRICS_TITLE_INVALID:		"عنوان ويدئو با الگوي “خواننده - عنوان” سازگاري ندارد!",
RATING_LIKE:				"%pcent% دوست داشتن", // new
RATING_NO_DATA:				"رتبه بندی در دسترس نیست." // new
},
// Suomi (Finnish)
"fi": {
PREFERENCES:				"Asetukset...",
DOWNLOAD_VIDEO:				"Lataa video",
DOWNLOAD_EMPTY:				"(tyhjä)",
DOWNLOAD_EMPTY_TIP:			"Tiedot voi ladata ei löytynyt",
DOWNLOAD_UNKNOWN_TIP:		"tuntematon videoformaatti",
STEP_FRAME_FORWARD:			"Askel yhden ruudun eteenpäin",
SEEK_FORWARD:				"Siirtyä eteenpäin",
SEEK_BACK:					"Hakea takaisin",
POPOUT_PLAYER:				"Näytä vain video",
LOOP_DISABLE:				"Poistaa silmukka",
LOOP_ENABLE:				"Jotta silmukka",
LOOP_SECTION_DISABLE:		"Poistaa osa silmukka",
LOOP_SECTION_ENABLE:		"Mahdollistavat osa silmukka",
LOOP_MARK_START:			"Merkki jakso alkaa",
LOOP_MARK_END:				"Merkki osa lopussa",
PREVIEW_START:				"Napsauta Käynnistä videon esikatselun.",
PREVIEW_END:				"Klikkaa loppuun videon esikatselun.",
LYRICS_BUTTON_HIDE:			"Piilota lyriikat",
LYRICS_BUTTON_SHOW:			"Selviää lyriikat",
LYRICS_BUTTON_LOAD:			"Kuormitus",
LYRICS_BUTTON_TRY:			"Kokeile itse...",
LYRICS_LYRICS:				"Lyriikat",
LYRICS_LYRICS_FOR:			"Lyriikat for: %song",
LYRICS_TITLE_INFO:			"Lisää taiteilijan nimi ja laulun etsiä.",
LYRICS_TITLE_INFO_EX:		"Erillinen on yhdysmerkki (esimerkiksi näin: Artist - osasto).",
LYRICS_SEARCH_START:		"Haetaan ”%song”...",
LYRICS_SEARCH_NO_RESULT:	"Ei tuloksia ”%song”.",
LYRICS_SEARCH_FOUND:		"Lyriikat löytynyt. Lastaus...",
LYRICS_SEARCH_NOT_FOUND:	"Lyriikat eivät löytynyt ja enää yhdistelmiä kokeilla.",
LYRICS_PARSE_SEARCH:		"Jäsentäminen hakutulosta...",
LYRICS_PARSE_LYRICS:		"Jäsentäminen lyrics tietoja...",
LYRICS_PARSE_SUCCESS:		"Lyriikat onnistuneesti käsitellä.",
LYRICS_PARSE_ERROR:			"Lyriikat are found mutta ei voi jäsentää. Anteeksi.",
LYRICS_TITLE_INVALID:		"Videon otsikko ei vastaa ”Artist - osasto” malli!",
RATING_LIKE:				"%pcent% pitää",
RATING_NO_DATA:				"Arvostelu ei ole saatavilla."
},
// Français (French)
//	Thanks to:
//		Alban Lemaitre <alban.roger.lemaitre@gmail.com>
//		Valentin Chemiere <vchemiere@gmail.com>
//		Guillaume Navet <guinavet@gmail.com>
"fr": {
PREFERENCES:				"Préférences...",
DOWNLOAD_VIDEO:				"Télécharger la vidéo",
DOWNLOAD_EMPTY:				"(vide)",
DOWNLOAD_EMPTY_TIP:			"Données de téléchargement non trouvées",
DOWNLOAD_UNKNOWN_TIP:		"format vidéo inconnue", // new
STEP_FRAME_FORWARD:			"Etape suivante",
SEEK_FORWARD:				"Suivant",
SEEK_BACK:					"Retour",
POPOUT_PLAYER:				"Accent vidéo", // new
LOOP_DISABLE:				"Désactiver la boucle",
LOOP_ENABLE:				"Activer la boucle",
LOOP_SECTION_DISABLE:		"Désactiver la lecture en boucle d’une sélection",
LOOP_SECTION_ENABLE:		"Activer la lecture en boucle d’une sélection",
LOOP_MARK_START:			"La boucle a debutee",
LOOP_MARK_END:				"La boucle s’est arretee",
PREVIEW_START:				"Cliquez ici pour démarrer prévisualisation vidéo.", // new
PREVIEW_END:				"Cliquez pour mettre fin à de prévisualisation vidéo.", // new
LYRICS_BUTTON_HIDE:			"Cacher les paroles",
LYRICS_BUTTON_SHOW:			"Afficher les paroles",
LYRICS_BUTTON_LOAD:			"Charger",
LYRICS_BUTTON_TRY:			"Veuillez essayer manuellement",
LYRICS_LYRICS:				"Paroles",
LYRICS_LYRICS_FOR:			"Paroles pour: %song",
LYRICS_TITLE_INFO:			"Insérer un artiste ou un titre de chanson pour le chercher.",
LYRICS_TITLE_INFO_EX:		"Séparé par un trait d’union (tel que: Artiste - Titre).",
LYRICS_SEARCH_START:		"Recherche pour « %song »...",
LYRICS_SEARCH_NO_RESULT:	"Pas de résultats pour « %song ».",
LYRICS_SEARCH_FOUND:		"Paroles trouvees. Veuillez patienter...",
LYRICS_SEARCH_NOT_FOUND:	"Paroles non trouvees. Toutes les combinaisons possibles ont etes essayees.",
LYRICS_PARSE_SEARCH:		"Analyse des résultats en cours...",
LYRICS_PARSE_LYRICS:		"Analyse des donnees des paroles en cours...",
LYRICS_PARSE_SUCCESS:		"Paroles analysées avec succès.",
LYRICS_PARSE_ERROR:			"Paroles trouvees mais ne peuvent etre analysees. Desole et merci de votre compréhension.",
LYRICS_TITLE_INVALID:		"Le titre de la video ne correspond pas au modèle « Artiste - Titre ».",
RATING_LIKE:				"%pcent% aiment", // new
RATING_NO_DATA:				"Note pas disponibles." // new
},
// Galego (Galician)
"gl": {
PREFERENCES:				"Preferencias...",
DOWNLOAD_VIDEO:				"Video descarga",
DOWNLOAD_EMPTY:				"(baleiro)",
DOWNLOAD_EMPTY_TIP:			"Datos para descargar Non se atopou",
DOWNLOAD_UNKNOWN_TIP:		"formato de vídeo descoñecida",
STEP_FRAME_FORWARD:			"Paso un cadro para adiante",
SEEK_FORWARD:				"Buscar cara adiante",
SEEK_BACK:					"Buscar de novo",
POPOUT_PLAYER:				"Pop out reprodutor de vídeo",
LOOP_DISABLE:				"Desactivar circuíto",
LOOP_ENABLE:				"Activar lazo",
LOOP_SECTION_DISABLE:		"Desactivar circuíto sección",
LOOP_SECTION_ENABLE:		"Activar circuíto sección",
LOOP_MARK_START:			"Mark comezar a sección",
LOOP_MARK_END:				"Mark sección final",
PREVIEW_START:				"Preme aquí para comezar a vista previa de vídeo.",
PREVIEW_END:				"Preme aquí para finais de visualización de vídeo.",
LYRICS_BUTTON_HIDE:			"Ocultar letras",
LYRICS_BUTTON_SHOW:			"Letras mostran",
LYRICS_BUTTON_LOAD:			"Carga",
LYRICS_BUTTON_TRY:			"Probe a man...",
LYRICS_LYRICS:				"Letra",
LYRICS_LYRICS_FOR:			"Letra da música: %song",
LYRICS_TITLE_INFO:			"Inserir artista eo título da canción para investigar.",
LYRICS_TITLE_INFO_EX:		"Separadas por guión (como así: Artista - Título).",
LYRICS_SEARCH_START:		"Buscando por «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Non hai resultados para «%song».",
LYRICS_SEARCH_FOUND:		"Letra atopado. Carga...",
LYRICS_SEARCH_NOT_FOUND:	"Letras non se atopan e non máis combinacións para probar.",
LYRICS_PARSE_SEARCH:		"Analizar os resultados da procura...",
LYRICS_PARSE_LYRICS:		"Análise de datos letras...",
LYRICS_PARSE_SUCCESS:		"Letras analizado correctamente.",
LYRICS_PARSE_ERROR:			"Letras se atopan, pero non pode ser analizado. Sentímolo.",
LYRICS_TITLE_INVALID:		"Título do vídeo non corresponde «Artista - Título» por defecto!",
RATING_LIKE:				"%pcent% «Gústame»",
RATING_NO_DATA:				"Avaliación de vídeo non está dispoñible."
},
// ગુજરાતી (Gujarati)
"gu": {
PREFERENCES:				"પસંદગીઓ...",
DOWNLOAD_VIDEO:				"વિડીયો ડાઉનલોડ કરો",
DOWNLOAD_EMPTY:				"(ખાલી)",
DOWNLOAD_EMPTY_TIP:			"મળ્યું નથી ડાઉનલોડ માટે માહિતી",
DOWNLOAD_UNKNOWN_TIP:		"અજ્ઞાત વિડિયો રચના",
STEP_FRAME_FORWARD:			"એક ફ્રેમ આગળ વધે",
SEEK_FORWARD:				"આગળ શોધો",
SEEK_BACK:					"પાછા શોધો",
POPOUT_PLAYER:				"બહાર વિડિયો પ્લેયર પૉપ",
LOOP_DISABLE:				"લૂપ નિષ્ક્રિય કરો",
LOOP_ENABLE:				"લૂપ સક્રિય કરો",
LOOP_SECTION_DISABLE:		"વિભાગ લૂપ નિષ્ક્રિય કરો",
LOOP_SECTION_ENABLE:		"વિભાગ લૂપ સક્રિય કરો",
LOOP_MARK_START:			"માર્ક વિભાગ શરૂ",
LOOP_MARK_END:				"માર્ક વિભાગમાં અંત",
PREVIEW_START:				"વીડિયો પૂર્વદર્શન શરૂ કરો ક્લિક કરો.",
PREVIEW_END:				"વીડિયો પૂર્વદર્શન અંત કરો ક્લિક કરો.",
LYRICS_BUTTON_HIDE:			"ગીતો છુપાવો",
LYRICS_BUTTON_SHOW:			"ગીતો બતાવો",
LYRICS_BUTTON_LOAD:			"લોડ કરો",
LYRICS_BUTTON_TRY:			"જાતે જ કરવાનો પ્રયાસ કરો...",
LYRICS_LYRICS:				"ગીતો",
LYRICS_LYRICS_FOR:			"માટે ગીતો: %song",
LYRICS_TITLE_INFO:			"કલાકાર અને શીર્ષક ગીત માટે શોધવા માટે દાખલ કરો.",
LYRICS_TITLE_INFO_EX:		"આડંબર (શીર્ષક - કલાકાર) સાથે અલગ પાડો.",
LYRICS_SEARCH_START:		"\"%song\" માટે શોધી રહ્યું છે...",
LYRICS_SEARCH_NO_RESULT:	"\"%song\" માટે કોઈ પરિણામ છે.",
LYRICS_SEARCH_FOUND:		"ગીતો જોવા મળે છે. લોડ...",
LYRICS_SEARCH_NOT_FOUND:	"ગીતકારઃ મળી નથી અને કોઈ વધુ સંયોજનો પ્રયાસ કરવામાં આવે છે.",
LYRICS_PARSE_SEARCH:		"શોધ પરિણામો પદચ્છેદન કરી રહ્યા છીએ...",
LYRICS_PARSE_LYRICS:		"ગીતો માહિતી પદચ્છેદન કરી રહ્યા છીએ...",
LYRICS_PARSE_SUCCESS:		"ગીતકારઃ સફળતાપૂર્વક પદચ્છેદન.",
LYRICS_PARSE_ERROR:			"ગીતકારઃ મળી પરંતુ આવે પાર્સ કરી શકો છો. માફ કરશો.",
LYRICS_TITLE_INVALID:		"વિડિઓ શીર્ષક \"આર્ટિસ્ટ - શીર્ષક\" બંધબેસે નહિં પેટર્ન!",
RATING_LIKE:				"%pcent% જેમ",
RATING_NO_DATA:				"ઉપલબ્ધ નથી પ્રતિસાદ."
},
// עברית (Hebrew)
"he": {
PREFERENCES:				"העדפות...",
DOWNLOAD_VIDEO:				"וידאו להורדה",
DOWNLOAD_EMPTY:				"(ריק)",
DOWNLOAD_EMPTY_TIP:			"נתונים להורדה לא נמצאו",
DOWNLOAD_UNKNOWN_TIP:		"וידאו בפורמט לא ידוע",
STEP_FRAME_FORWARD:			"צעד אחד קדימה מסגרת",
SEEK_FORWARD:				"מחפשים קדימה",
SEEK_BACK:					"לחפש לאחור",
POPOUT_PLAYER:				"פופ החוצה נגן וידאו",
LOOP_DISABLE:				"להשבית את הלולאה",
LOOP_ENABLE:				"להפעיל לולאה",
LOOP_SECTION_DISABLE:		"בסעיף להשבית לולאה",
LOOP_SECTION_ENABLE:		"להפעיל לולאה בסעיף",
LOOP_MARK_START:			"בסעיף סימן להתחיל",
LOOP_MARK_END:				"בסעיף סימן לסוף",
PREVIEW_START:				"לחץ כדי להפעיל את התצוגה המקדימה וידאו.",
PREVIEW_END:				"לחץ לסיים את התצוגה המקדימה וידאו.",
LYRICS_BUTTON_HIDE:			"להסתיר מילים",
LYRICS_BUTTON_SHOW:			"הצג מילים",
LYRICS_BUTTON_LOAD:			"עומס",
LYRICS_BUTTON_TRY:			"נסה באופן ידני...",
LYRICS_LYRICS:				"מילים",
LYRICS_LYRICS_FOR:			"מילים: %song",
LYRICS_TITLE_INFO:			"האמן הוספה הכותרת של השיר כדי לחפש.",
LYRICS_TITLE_INFO_EX:		"להפריד על ידי מקף (כמו כל כך: אמן - כותרת).",
LYRICS_SEARCH_START:		"מחפש “%song”...",
LYRICS_SEARCH_NO_RESULT:	"אין תוצאות עבור “%song”.",
LYRICS_SEARCH_FOUND:		"מילים נמצאו. טוען...",
LYRICS_SEARCH_NOT_FOUND:	"מילים לא נמצאים ואין שילובים יותר לנסות.",
LYRICS_PARSE_SEARCH:		"תוצאות החיפוש של ניתוח...",
LYRICS_PARSE_LYRICS:		"ניתוח הנתונים מילים...",
LYRICS_PARSE_SUCCESS:		"מילים מנותח בהצלחה.",
LYRICS_PARSE_ERROR:			"מילים הם מצאו, אבל לא יכול להיות מנותח. סליחה.",
LYRICS_TITLE_INVALID:		"שם הקליפ אינו תואם “אמן - כותרת” דפוס!",
RATING_LIKE:				"%pcent% אהבתי",
RATING_NO_DATA:				"לא זמין דירוג."
},
// हिन्दी (Hindi)
"hi": {
PREFERENCES:				"वरीयता...",
DOWNLOAD_VIDEO:				"डाउनलोड वीडियो",
DOWNLOAD_EMPTY:				"(खाली)",
DOWNLOAD_EMPTY_TIP:			"नहीं मिला डाउनलोड के लिए डेटा",
DOWNLOAD_UNKNOWN_TIP:		"अज्ञात वीडियो प्रारूप",
STEP_FRAME_FORWARD:			"एक कदम आगे फ्रेम",
SEEK_FORWARD:				"आगे की तलाश",
SEEK_BACK:					"पीठ की तलाश",
POPOUT_PLAYER:				"बाहर वीडियो प्लेयर पॉप",
LOOP_DISABLE:				"निष्क्रिय पाश",
LOOP_ENABLE:				"पाश सक्षम",
LOOP_SECTION_DISABLE:		"निष्क्रिय अनुभाग पाश",
LOOP_SECTION_ENABLE:		"अनुभाग पाश सक्षम",
LOOP_MARK_START:			"निशान खंड शुरू",
LOOP_MARK_END:				"चिह्न अनुभाग अंत",
PREVIEW_START:				"वीडियो पूर्वावलोकन शुरू करने के लिए क्लिक करें.",
PREVIEW_END:				"वीडियो पूर्वावलोकन को समाप्त करने के लिए क्लिक करें.",
LYRICS_BUTTON_HIDE:			"गीत छिपाना",
LYRICS_BUTTON_SHOW:			"दिखाने के गीत",
LYRICS_BUTTON_LOAD:			"भार",
LYRICS_BUTTON_TRY:			"मैन्युअल रूप से प्रयास करें...",
LYRICS_LYRICS:				"गीत",
LYRICS_LYRICS_FOR:			"के लिए गीत: %song",
LYRICS_TITLE_INFO:			"सम्मिलित कलाकार और गीत के शीर्षक के लिए खोज करने के लिए.",
LYRICS_TITLE_INFO_EX:		"हायफ़न द्वारा अलग तरह (इतने: कलाकार - शीर्षक).",
LYRICS_SEARCH_START:		"खोज के लिए “%song”...",
LYRICS_SEARCH_NO_RESULT:	"के लिए कोई परिणाम नहीं “%song”.",
LYRICS_SEARCH_FOUND:		"बोल पाया. लोड हो रहा है...",
LYRICS_SEARCH_NOT_FOUND:	"बोल पाया और न कोई और अधिक संयोजनों की कोशिश कर रहे हैं.",
LYRICS_PARSE_SEARCH:		"पार्सिंग खोज परिणाम...",
LYRICS_PARSE_LYRICS:		"पार्सिंग गीत डेटा...",
LYRICS_PARSE_SUCCESS:		"गीत को सफलतापूर्वक विश्लेषित.",
LYRICS_PARSE_ERROR:			"गीत मिल रहे हैं, लेकिन विश्लेषित नहीं कर सकते हैं. माफ़ कीजिए.",
LYRICS_TITLE_INVALID:		"पैटर्न - वीडियो शीर्षक “शीर्षक कलाकार ” से मेल नहीं खाता!",
RATING_LIKE:				"%pcent% पसंद",
RATING_NO_DATA:				"रेटिंग नहीं उपलब्ध है."
},
// Hrvatski (Croatian)
//	Thanks to: me :), Darko Pantić
"hr": {
PREFERENCES:				"Postavke...",
DOWNLOAD_VIDEO:				"Preuzimanje video datotekе",
DOWNLOAD_EMPTY:				"(prazno)",
DOWNLOAD_EMPTY_TIP:			"Podaci za preuzimanje nisu pronađeni",
DOWNLOAD_UNKNOWN_TIP:		"nepoznat video format",
STEP_FRAME_FORWARD:			"Korak naprijed jedan okvir",
SEEK_FORWARD:				"Skoči naprijed",
SEEK_BACK:					"Skoči nazad",
POPOUT_PLAYER:				"Prikaži samo video",
LOOP_DISABLE:				"Onemogućit petlju",
LOOP_ENABLE:				"Omogućit petlju",
LOOP_SECTION_DISABLE:		"Onemogućit dio petlje",
LOOP_SECTION_ENABLE:		"Omogućit dio petlje",
LOOP_MARK_START:			"Obilježi početak odjeljaka",
LOOP_MARK_END:				"Obilježi kraj odjeljaka",
PREVIEW_START:				"Kliknite da počnete pregled videa.",
PREVIEW_END:				"Kliknite da završite pregled videa.",
LYRICS_BUTTON_HIDE:			"Sakrij tekst pjesme",
LYRICS_BUTTON_SHOW:			"Prikaži tekst pjesme",
LYRICS_BUTTON_LOAD:			"Učitaj",
LYRICS_BUTTON_TRY:			"Pokušajte ručno...",
LYRICS_LYRICS:				"Tekst pjesme",
LYRICS_LYRICS_FOR:			"Tekst za pjesmu: %song",
LYRICS_TITLE_INFO:			"Umetnite izvođaču i naslov pjesme za pretraživanje.",
LYRICS_TITLE_INFO_EX:		"Odvojeni po crticu (kao što su to: Artist - Title).",
LYRICS_SEARCH_START:		"U potrazi za „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Nema rezultata za „%song“.",
LYRICS_SEARCH_FOUND:		"Tekst pjesme pronađen. Učitavanje...",
LYRICS_SEARCH_NOT_FOUND:	"Tekst pjesme nije pronađen i nema više kombinacija probati.",
LYRICS_PARSE_SEARCH:		"Raščlanjivanje rezultata pretraživanja...",
LYRICS_PARSE_LYRICS:		"Raščlanjivanje podataka teksta pjesme...",
LYRICS_PARSE_SUCCESS:		"Tekst pjesme uspješno analiziran.",
LYRICS_PARSE_ERROR:			"Tekst pjesme je nađen, ali ne mogu se raščlaniti. Oprostite.",
LYRICS_TITLE_INVALID:		"Video naslov ne odgovara „Artist - Title“ uzorku!",
RATING_LIKE:				"Sviđa se: %pcent%",
RATING_NO_DATA:				"Ocjena nije dostupna."
},
// Magyar (Hungarian)
//	Thanks to:
//		Molnár Tibor <mtibee@gmail.com>
"hu": {
PREFERENCES:				"Beállítások...",
DOWNLOAD_VIDEO:				"Videó letöltése",
DOWNLOAD_EMPTY:				"(üres)",
DOWNLOAD_EMPTY_TIP:			"Nincs letölthető adat",
DOWNLOAD_UNKNOWN_TIP:		"ismeretlen videó formátum", // new
STEP_FRAME_FORWARD:			"Léptetés egy képkockával elõre",
SEEK_FORWARD:				"Elõre tekerés",
SEEK_BACK:					"Hátra tekerés",
POPOUT_PLAYER:				"Mutasd csak videó", // new
LOOP_DISABLE:				"Ismétlés kikapcsolása",
LOOP_ENABLE:				"Ismétlés bekapcsolása",
LOOP_SECTION_DISABLE:		"Szakasz ismétlésének kikapcsolása",
LOOP_SECTION_ENABLE:		"Szakasz ismétlésének bekapcsolása",
LOOP_MARK_START:			"Szakasz kezdõpontjának kijelölése",
LOOP_MARK_END:				"Szakasz végpontjának kijelölése",
PREVIEW_START:				"Klikkelj hogy video preview.", // new
PREVIEW_END:				"Kattints ide a végére video preview.", // new
LYRICS_BUTTON_HIDE:			"Dalszöveg elrejtése",
LYRICS_BUTTON_SHOW:			"Dalszöveg megjelenítése",
LYRICS_BUTTON_LOAD:			"Betöltés",
LYRICS_BUTTON_TRY:			"Próbáld manuálisan...",
LYRICS_LYRICS:				"Dalszöveg",
LYRICS_LYRICS_FOR:			"Dalszöveg ehhez: %song",
LYRICS_TITLE_INFO:			"Gépeld be az elõadót és a szám címét, amire keresel!",
LYRICS_TITLE_INFO_EX:		"Válaszd el kötõjellel (Így: Elõadó - Cím)!",
LYRICS_SEARCH_START:		"Keresés: „%song”...",
LYRICS_SEARCH_NO_RESULT:	"Nincs eredmény erre: „%song”.",
LYRICS_SEARCH_FOUND:		"Dalszöveget találtam. Betöltés...",
LYRICS_SEARCH_NOT_FOUND:	"Nem találtam dalszöveget. Nincs több lehetõséged próbálkozni.",
LYRICS_PARSE_SEARCH:		"A keresés eredményeinek nyelvtani elemzése...",
LYRICS_PARSE_LYRICS:		"Dalszövegek nyelvtani elemzése...",
LYRICS_PARSE_SUCCESS:		"A dalszövegek nyelvtani elemzése sikeres.",
LYRICS_PARSE_ERROR:			"Találtam dalszöveget, de a nyelvi elemzése nem végezhetõ el. Sajnálom.",
LYRICS_TITLE_INVALID:		"A videó címe nem egyezik az „Elõadó - Cím” mintával!",
RATING_LIKE:				"%pcent% embernek tetszik", // new
RATING_NO_DATA:				"Értékelés nem elérhető." // new
},
// Bahasa Indonesia (Indonesian)
"id": {
PREFERENCES:				"Preferensi...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(kosong)",
DOWNLOAD_EMPTY_TIP:			"Data untuk download tidak ditemukan",
DOWNLOAD_UNKNOWN_TIP:		"diketahui format video",
STEP_FRAME_FORWARD:			"Langkah maju satu frame",
SEEK_FORWARD:				"Mencari maju",
SEEK_BACK:					"Mencari kembali",
POPOUT_PLAYER:				"Tampilkan video saja",
LOOP_DISABLE:				"Menonaktifkan loop",
LOOP_ENABLE:				"Memungkinkan loop",
LOOP_SECTION_DISABLE:		"Menonaktifkan bagian loop",
LOOP_SECTION_ENABLE:		"Memungkinkan loop bagian",
LOOP_MARK_START:			"Menandai bagian awal",
LOOP_MARK_END:				"Menandai bagian akhir",
PREVIEW_START:				"Klik untuk memulai video preview.",
PREVIEW_END:				"Klik untuk mengakhiri preview video.",
LYRICS_BUTTON_HIDE:			"Menyembunyikan lirik",
LYRICS_BUTTON_SHOW:			"Menunjukkan lirik",
LYRICS_BUTTON_LOAD:			"Beban",
LYRICS_BUTTON_TRY:			"Coba secara manual...",
LYRICS_LYRICS:				"Lirik",
LYRICS_LYRICS_FOR:			"Lirik untuk: %song",
LYRICS_TITLE_INFO:			"Masukkan artis dan judul lagu untuk mencari.",
LYRICS_TITLE_INFO_EX:		"Pisahkan dengan tanda hubung (seperti: Artis - Judul).",
LYRICS_SEARCH_START:		"Mencari “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Tidak ada hasil untuk “%song”.",
LYRICS_SEARCH_FOUND:		"Lirik ditemukan. Pembebanan...",
LYRICS_SEARCH_NOT_FOUND:	"Lirik yang tidak ditemukan dan tidak ada kombinasi yang lebih banyak untuk mencoba.",
LYRICS_PARSE_SEARCH:		"Parsing hasil penelusuran...",
LYRICS_PARSE_LYRICS:		"Parsing lyrics data...",
LYRICS_PARSE_SUCCESS:		"Lirik berhasil dipecah.",
LYRICS_PARSE_ERROR:			"Lirik yang ditemukan tetapi tidak bisa diurai. Maaf.",
LYRICS_TITLE_INVALID:		"Video judul tidak cocok “Artis - Judul” Pola!",
RATING_LIKE:				"%pcent% suka",
RATING_NO_DATA:				"Penilaian tidak tersedia."
},
// Íslenska (Icelandic)
"is": {
PREFERENCES:				"Preferences...",
DOWNLOAD_VIDEO:				"Sækja vídeó",
DOWNLOAD_EMPTY:				"(tóm)",
DOWNLOAD_EMPTY_TIP:			"Gögn fyrir download fannst ekki",
DOWNLOAD_UNKNOWN_TIP:		"óþekkt vídeó snið",
STEP_FRAME_FORWARD:			"Skref einn ramma áfram",
SEEK_FORWARD:				"Leitið áfram",
SEEK_BACK:					"Leitið til baka",
POPOUT_PLAYER:				"Pop út vídeó leikmaður",
LOOP_DISABLE:				"Gera óvinnufæran lykkja",
LOOP_ENABLE:				"Virkja lykkja",
LOOP_SECTION_DISABLE:		"Gera óvinnufæran hluta lykkja",
LOOP_SECTION_ENABLE:		"Virkja hluta lykkja",
LOOP_MARK_START:			"Mark lið byrja",
LOOP_MARK_END:				"Mark kafla enda",
PREVIEW_START:				"Smelltu til að byrja vídeó forsýning.",
PREVIEW_END:				"Smelltu til endir vídeó forsýning.",
LYRICS_BUTTON_HIDE:			"Fela lyrics",
LYRICS_BUTTON_SHOW:			"Show lyrics",
LYRICS_BUTTON_LOAD:			"Hlaða",
LYRICS_BUTTON_TRY:			"Prófaðu handvirkt...",
LYRICS_LYRICS:				"Lyrics",
LYRICS_LYRICS_FOR:			"Lyrics for: %song",
LYRICS_TITLE_INFO:			"Setja listamaður og titill lag til að leita að.",
LYRICS_TITLE_INFO_EX:		"Aðskilja með bandstrik (eins og svo: Artist - Title).",
LYRICS_SEARCH_START:		"Leitað að „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Engar niðurstöður fyrir „%song“.",
LYRICS_SEARCH_FOUND:		"Lyrics fundust. Loading...",
LYRICS_SEARCH_NOT_FOUND:	"Lyrics er ekki að finna og ekki fleiri samsetningar til að reyna.",
LYRICS_PARSE_SEARCH:		"Þátta leitarniðurstöður...",
LYRICS_PARSE_LYRICS:		"Þátta Lyrics gögn...",
LYRICS_PARSE_SUCCESS:		"Lyrics flokka með góðum árangri.",
LYRICS_PARSE_ERROR:			"Lyrics finnast en ekki er hægt að flokka. Því miður.",
LYRICS_TITLE_INVALID:		"Video titill passar ekki „Artist - Titill“ mynstur!",
RATING_LIKE:				"%pcent% líkar þetta",
RATING_NO_DATA:				"Stjörnugjöf ekki í boði."
},
// Italiano (Italian)
//	Thanks to:
//		Francesco Parente <frenk_91@hotmail.it>
//		Emanuele Buda
"it": {
PREFERENCES:				"Preferenze...",
DOWNLOAD_VIDEO:				"Scarica video",
DOWNLOAD_EMPTY:				"(vuoto)",
DOWNLOAD_EMPTY_TIP:			"Non è stato trovato niente da scaricare",
DOWNLOAD_UNKNOWN_TIP:		"video formato sconosciuto", // new
STEP_FRAME_FORWARD:			"Avanti di un frame",
SEEK_FORWARD:				"Avanti velose",
SEEK_BACK:					"Indietro veloce",
POPOUT_PLAYER:				"Mostra solo video", // new
LOOP_DISABLE:				"Disattiva ripetizione",
LOOP_ENABLE:				"Attiva ripetizione",
LOOP_SECTION_DISABLE:		"Disattiva ripetizione della selezione",
LOOP_SECTION_ENABLE:		"Attiva ripetizione della selezione",
LOOP_MARK_START:			"Imposta inizio selezione",
LOOP_MARK_END:				"Imposta fine selezione",
PREVIEW_START:				"Fare clic per avviare anteprima video.", // new
PREVIEW_END:				"Clicca per fine di anteprima video.", // new
LYRICS_BUTTON_HIDE:			"Nascondi il testo della canzone",
LYRICS_BUTTON_SHOW:			"Visualizza il testo della canzone",
LYRICS_BUTTON_LOAD:			"Carica",
LYRICS_BUTTON_TRY:			"Prova manualmente...",
LYRICS_LYRICS:				"Testo della canzone",
LYRICS_LYRICS_FOR:			"Testo della canzone per: %song",
LYRICS_TITLE_INFO:			"Inserisci artista e titolo della canzone che stai cercando.",
LYRICS_TITLE_INFO_EX:		"Separati da un trattino (ad esempio: Artista - Titolo).",
LYRICS_SEARCH_START:		"Ricerca per «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Nessun risultato per «%song».",
LYRICS_SEARCH_FOUND:		"Testo trovato. In caricamento...",
LYRICS_SEARCH_NOT_FOUND:	"Testo non trovato, non ci sono più combinazioni possibili.",
LYRICS_PARSE_SEARCH:		"Analisi del risultato...",
LYRICS_PARSE_LYRICS:		"Analisi del testo in corso...",
LYRICS_PARSE_SUCCESS:		"Testo correttamente analizzato.",
LYRICS_PARSE_ERROR:			"Il testo è stato trovato ma non è stato possibile analizzarlo. Spiacenti.",
LYRICS_TITLE_INVALID:		"Il titolo del video non corrisponde «Artista - Titolo» percorso!",
RATING_LIKE:				"%pcent% Mi piace", // new
RATING_NO_DATA:				"Categoria non disponibile." // new
},
// 日本語 (Japanese)
//	Thanks to:
//		ka106_56 <kat465a@live.jp>
"ja": {
PREFERENCES:				"設定...",
DOWNLOAD_VIDEO:				"ビデオをダウンロード",
DOWNLOAD_EMPTY:				"（空）",
DOWNLOAD_EMPTY_TIP:			"ダウンロード用のデータが見つかりませんでした",
DOWNLOAD_UNKNOWN_TIP:		"不明なビデオフォーマット",
STEP_FRAME_FORWARD:			"一歩前進つのフレーム",
SEEK_FORWARD:				"前方にシーク",
SEEK_BACK:					"後方にシーク",
POPOUT_PLAYER:				"ビデオのみを表示する", // new
LOOP_DISABLE:				"ループを無効にする",
LOOP_ENABLE:				"ループを有効にする",
LOOP_SECTION_DISABLE:		"ループを無効にする",
LOOP_SECTION_ENABLE:		"ループを有効にする",
LOOP_MARK_START:			"ループ開始点を設定",
LOOP_MARK_END:				"ループ終了点を設定",
PREVIEW_START:				"ビデオのプレビューを開始するときにクリックします。", // new
PREVIEW_END:				"ビデオのプレビューを終了する]をクリックします。", // new
LYRICS_BUTTON_HIDE:			"歌詞を非表示にする",
LYRICS_BUTTON_SHOW:			"歌詞を表示する",
LYRICS_BUTTON_LOAD:			"読み込む",
LYRICS_BUTTON_TRY:			"手動で読み込みを試みる...",
LYRICS_LYRICS:				"歌詞",
LYRICS_LYRICS_FOR:			"表示中の歌詞： %song",
LYRICS_TITLE_INFO:			"[挿入]アーティストや曲のタイトルが検索できます。",
LYRICS_TITLE_INFO_EX:		"ハイフンで区切ってください（例：アーティスト-タイトル）。",
LYRICS_SEARCH_START:		"次を検索 「%song」...",
LYRICS_SEARCH_NO_RESULT:	"次の曲に対する検索結果は見つかりませんでした 「%song」.",
LYRICS_SEARCH_FOUND:		"歌詞が見つかりました。読み込んでいます...",
LYRICS_SEARCH_NOT_FOUND:	"歌詞が見つかりませんでした。その他の組み合わせを試しています。",
LYRICS_PARSE_SEARCH:		"歌詞の解析による検索結果...",
LYRICS_PARSE_LYRICS:		"解析済み歌詞データ...",
LYRICS_PARSE_SUCCESS:		"歌詞は正常に解析されました。",
LYRICS_PARSE_ERROR:			"歌詞は見つかりましたが、解析できません。申し訳ありません。",
LYRICS_TITLE_INVALID:		"ビデオタイトルが次の組み合わせで一致しませんでした。 「Artist - Title」",
RATING_LIKE:				"高評価 %pcent%", // new
RATING_NO_DATA:				"利用できない評価。" // new
},
// ಕನ್ನಡ (Kannada)
"kn": {
PREFERENCES:				"ಆಯ್ಕೆಗಳು...",
DOWNLOAD_VIDEO:				"ವಿಡಿಯೋ ಡೌನ್ಲೋಡ್",
DOWNLOAD_EMPTY:				"(ಖಾಲಿ)",
DOWNLOAD_EMPTY_TIP:			"ಡೌನ್ಲೋಡ್ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ",
DOWNLOAD_UNKNOWN_TIP:		"ಅಜ್ಞಾತ ವಿಡಿಯೋ ಸ್ವರೂಪದ",
STEP_FRAME_FORWARD:			"ಮುಂದೆ ಒಂದು ಫ್ರೇಮ್ ಸ್ಟೆಪ್",
SEEK_FORWARD:				"ಮುಂದೆ ಅನ್ವೇಷಿಸು",
SEEK_BACK:					"ಮತ್ತೆ ಅನ್ವೇಷಿಸು",
POPOUT_PLAYER:				"ವಿಡಿಯೋ ಪ್ಲೇಯರ್ ಪಾಪ್ ಔಟ್",
LOOP_DISABLE:				"ಲೂಪ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",
LOOP_ENABLE:				"ಲೂಪ್ ಸಕ್ರಿಯಗೊಳಿಸಿ",
LOOP_SECTION_DISABLE:		"ಭಾಗವನ್ನುತೆರೆದು ಲೂಪ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ",
LOOP_SECTION_ENABLE:		"ಭಾಗವನ್ನುತೆರೆದು ಲೂಪ್ ಸಕ್ರಿಯಗೊಳಿಸಿ",
LOOP_MARK_START:			"ಮಾರ್ಕ್ ಭಾಗವನ್ನುತೆರೆದು ಆರಂಭ",
LOOP_MARK_END:				"ಮಾರ್ಕ್ ಭಾಗವನ್ನುತೆರೆದು ಕೊನೆಯಲ್ಲಿ",
PREVIEW_START:				"ವೀಡಿಯೊ ಪೂರ್ವವೀಕ್ಷಣೆ ಆರಂಭಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ.",
PREVIEW_END:				"ವೀಡಿಯೊ ಪೂರ್ವವೀಕ್ಷಣೆ ಕೊನೆಗೊಂಡಿಲ್ಲ ಕ್ಲಿಕ್ ಮಾಡಿ.",
LYRICS_BUTTON_HIDE:			"ಸಾಹಿತ್ಯ ಮರೆಮಾಡಿ",
LYRICS_BUTTON_SHOW:			"ಸಾಹಿತ್ಯ ತೋರಿಸಿ",
LYRICS_BUTTON_LOAD:			"ಲೋಡ್",
LYRICS_BUTTON_TRY:			"ಕೈಯಾರೆ ಪ್ರಯತ್ನಿಸಿ...",
LYRICS_LYRICS:				"ಸಾಹಿತ್ಯ",
LYRICS_LYRICS_FOR:			"ಗೀತ: %song",
LYRICS_TITLE_INFO:			"ಕಲಾವಿದ ಮತ್ತು ಹುಡುಕಲು ಹಾಡಿನ ಶೀರ್ಷಿಕೆ ಸೇರಿಸಿ.",
LYRICS_TITLE_INFO_EX:		"ಕೂಡುಗೆರೆ (ಟೈಟಲ್ ತರಹ: ಕಲಾವಿದ - ಆದ್ದರಿಂದ) ಪ್ರತ್ಯೇಕ.",
LYRICS_SEARCH_START:		"\"%song\" ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
LYRICS_SEARCH_NO_RESULT:	"\"%song\" ಫಲಿತಾಂಶವನ್ನು ಇಲ್ಲ.",
LYRICS_SEARCH_FOUND:		"ಸಾಹಿತ್ಯ ಕಂಡುಬಂದಿಲ್ಲ. ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
LYRICS_SEARCH_NOT_FOUND:	"ಸಾಹಿತ್ಯ ಕಂಡುಬರುವುದಿಲ್ಲ ಮತ್ತು ಯಾವುದೇ ಸಂಯೋಜನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
LYRICS_PARSE_SEARCH:		"ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳನ್ನು ಪಾರ್ಸಿಂಗ್...",
LYRICS_PARSE_LYRICS:		"ಸಾಹಿತ್ಯ ದತ್ತಾಂಶ ಪಾರ್ಸಿಂಗ್...",
LYRICS_PARSE_SUCCESS:		"ಸಾಹಿತ್ಯ ಯಶಸ್ವಿಯಾಗಿ ಪಾರ್ಸ್.",
LYRICS_PARSE_ERROR:			"ಸಾಹಿತ್ಯ ಕಂಡುಬರುತ್ತವೆ ಆದರೆ ಪಾರ್ಸ್ ಸಾಧ್ಯವಿಲ್ಲ. ಕ್ಷಮಿಸಿ.",
LYRICS_TITLE_INVALID:		"ವೀಡಿಯೊ ಶೀರ್ಷಿಕೆ \"ಕಲಾವಿದ - ಶೀರ್ಷಿಕೆ\" ಹೊಂದುತ್ತಿಲ್ಲ ಮಾದರಿ!",
RATING_LIKE:				"%pcent% ನಂತಹ",
RATING_NO_DATA:				"ರೇಟಿಂಗ್ ಲಭ್ಯವಿಲ್ಲ."
},
// 한국어 (Korean)
"ko": {
PREFERENCES:				"환경 설정...",
DOWNLOAD_VIDEO:				"다운로드 동영상",
DOWNLOAD_EMPTY:				"(빈)",
DOWNLOAD_EMPTY_TIP:			"다운로드를위한 데이터를 찾을 수 없습니다",
DOWNLOAD_UNKNOWN_TIP:		"알려지지 않은 비디오 포맷",
STEP_FRAME_FORWARD:			"앞으로 단계 한 프레임",
SEEK_FORWARD:				"앞으로 탐색",
SEEK_BACK:					"뒤로 탐색",
POPOUT_PLAYER:				"비디오 플레이어를 팝",
LOOP_DISABLE:				"해제 루프",
LOOP_ENABLE:				"루프를 사용",
LOOP_SECTION_DISABLE:		"해제 섹션 루프",
LOOP_SECTION_ENABLE:		"섹션 루프를 사용",
LOOP_MARK_START:			"마크 섹션 시작",
LOOP_MARK_END:				"마크 섹션 끝",
PREVIEW_START:				"동영상 미리보기를 시작합니다.",
PREVIEW_END:				"비디오 미리보기를 종료합니다.",
LYRICS_BUTTON_HIDE:			"가사 숨기기",
LYRICS_BUTTON_SHOW:			"가사보기",
LYRICS_BUTTON_LOAD:			"하중",
LYRICS_BUTTON_TRY:			"수동으로 시도...",
LYRICS_LYRICS:				"가사",
LYRICS_LYRICS_FOR:			"가사 용: %song",
LYRICS_TITLE_INFO:			"삽입 아티스트와 노래 제목을 검색합니다.",
LYRICS_TITLE_INFO_EX:		"하이픈으로 구분 (가 마음 : 아티스트 - 타이틀).",
LYRICS_SEARCH_START:		"검색 중 “%song”...",
LYRICS_SEARCH_NO_RESULT:	"에 대한 검색 결과가 없습니다 “%song”.",
LYRICS_SEARCH_FOUND:		"가사가 없습니다. 로드 중입니다...",
LYRICS_SEARCH_NOT_FOUND:	"가사는 발견되지 더 이상의 조합을 시도합니다.",
LYRICS_PARSE_SEARCH:		"구문 분석 검색 결과...",
LYRICS_PARSE_LYRICS:		"파싱 ​​가사 데이터...",
LYRICS_PARSE_SUCCESS:		"가사가 성공적으로 구문 분석.",
LYRICS_PARSE_ERROR:			"가사하지만 발견되는 파싱할 수 없습니다. 미안 해요.",
LYRICS_TITLE_INVALID:		"패턴 - 비디오 제목은 “제목 아티스트”과 일치하지 않습니다!",
RATING_LIKE:				"좋아요 %pcent%개",
RATING_NO_DATA:				"등급을 사용할 수 없습니다."
},
// Lietuvių (Lithuanian)
//	Thanks to:
//		Aleksandras T. <aleksandrr@gmail.com>
"lt": {
PREFERENCES:				"Nustatymai...",
DOWNLOAD_VIDEO:				"Parsisiųsti",
DOWNLOAD_EMPTY:				"(tusčia)",
DOWNLOAD_EMPTY_TIP:			"Informacijos nerasta",
DOWNLOAD_UNKNOWN_TIP:		"nežinomas vaizdo formatas", // new
STEP_FRAME_FORWARD:			"Vienas kadras į priekį",
SEEK_FORWARD:				"Prasukti į priekį",
SEEK_BACK:					"Atsukti atgal",
POPOUT_PLAYER:				"Iššokti vaizdo grotuvas", // new
LOOP_DISABLE:				"Išjungti nepertraukiamą grojimą",
LOOP_ENABLE:				"Įjungti nepertraukiamą grojimą",
LOOP_SECTION_DISABLE:		"Išjungti atkarpos nepertraukiamą grojimą",
LOOP_SECTION_ENABLE:		"Įjungti atkarpos nepertraukiamą grojimą",
LOOP_MARK_START:			"Pažymėti atkarpos pradžią",
LOOP_MARK_END:				"Pažymėti atkarpos pabaigą",
PREVIEW_START:				"Spustelėkite, jei norite paleisti vaizdo peržiūros.", // new
PREVIEW_END:				"Spustelėkite, jei norite baigti vaizdo peržiūros.", // new
LYRICS_BUTTON_HIDE:			"Paslėpti tekstą",
LYRICS_BUTTON_SHOW:			"Rodyti tekstą",
LYRICS_BUTTON_LOAD:			"Užkrauti",
LYRICS_BUTTON_TRY:			"Pabandyti pačiam...",
LYRICS_LYRICS:				"Tekstas",
LYRICS_LYRICS_FOR:			"Tekstas: %song",
LYRICS_TITLE_INFO:			"Įveskite atlikėjo ir dainos pavadinimą paieškai.",
LYRICS_TITLE_INFO_EX:		"Atskirti brukšneliu (pvz.: Artist - Title).",
LYRICS_SEARCH_START:		"Ieškoma „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Rezultatų nerasta: „%song“.",
LYRICS_SEARCH_FOUND:		"Tekstas surastas. Kraunasi...",
LYRICS_SEARCH_NOT_FOUND:	"Tekstas nesurastas ir galimų kombinacijų nebeliko.",
LYRICS_PARSE_SEARCH:		"Analizuojami paieškos rezultatai...",
LYRICS_PARSE_LYRICS:		"Analizuojamas tekstas...",
LYRICS_PARSE_SUCCESS:		"Tekstas sėkmingai atpažintas.",
LYRICS_PARSE_ERROR:			"Tekstas rastas, bet negali būtų atpažintas. Atsiprašome.",
LYRICS_TITLE_INVALID:		"Pavadinimas neatitinka reikiamo formato „Artist - Title“!",
RATING_LIKE:				"%pcent% teig. įvertinim.", // new
RATING_NO_DATA:				"Vaizdo įvertinimas nėra." // new
},
// Latviešu valoda (Latvian)
"lv": {
PREFERENCES:				"Preferences...",
DOWNLOAD_VIDEO:				"Lejuplādēt video",
DOWNLOAD_EMPTY:				"(tukši)",
DOWNLOAD_EMPTY_TIP:			"Dati lejupielādei nav atrasts",
DOWNLOAD_UNKNOWN_TIP:		"nezināms video formātā",
STEP_FRAME_FORWARD:			"Solis uz viena rāmja priekšu",
SEEK_FORWARD:				"Meklētu uz priekšu",
SEEK_BACK:					"Meklētu atpakaļ",
POPOUT_PLAYER:				"Rādīt video tikai",
LOOP_DISABLE:				"Atslēgt cilpa",
LOOP_ENABLE:				"Lai cilpa",
LOOP_SECTION_DISABLE:		"Atslēgt sadaļā cilpa",
LOOP_SECTION_ENABLE:		"Lai sadaļa cilpa",
LOOP_MARK_START:			"Zīmi sadaļā sākums",
LOOP_MARK_END:				"Zīmi sadaļā beigām",
PREVIEW_START:				"Noklikšķiniet, lai sāktu video preview.",
PREVIEW_END:				"Noklikšķiniet, lai pārtrauktu video preview.",
LYRICS_BUTTON_HIDE:			"Paslēpt tekst",
LYRICS_BUTTON_SHOW:			"Rādīt tekst",
LYRICS_BUTTON_LOAD:			"Slodzes",
LYRICS_BUTTON_TRY:			"Mēģiniet manuāli...",
LYRICS_LYRICS:				"Tekst",
LYRICS_LYRICS_FOR:			"Teksta dziesmu: %song",
LYRICS_TITLE_INFO:			"Ievietojiet mākslinieks un dziesmu nosaukumu meklēt.",
LYRICS_TITLE_INFO_EX:		"Nošķirti defisi (piemēram, tā: Mākslinieks - sadaļa).",
LYRICS_SEARCH_START:		"Meklējot «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Nav rezultātu «%song».",
LYRICS_SEARCH_FOUND:		"Tekst atrasts. Iekraušanas...",
LYRICS_SEARCH_NOT_FOUND:	"Tekst nav atrasts, un ne vairāk kombinācijas izmēģināt.",
LYRICS_PARSE_SEARCH:		"Analizējot meklēšanas rezultāti...",
LYRICS_PARSE_LYRICS:		"Analizējot tekst datus...",
LYRICS_PARSE_SUCCESS:		"Tekst veiksmīgi parsēt.",
LYRICS_PARSE_ERROR:			"Tekst tiek konstatēts, bet to nevar parsēt. Piedodiet.",
LYRICS_TITLE_INVALID:		"Video nosaukums neatbilst «Mākslinieks - Sadaļa» modelis!",
RATING_LIKE:				"%pcent% — patīk",
RATING_NO_DATA:				"Vērtējums nav pieejams."
},
// മലയാളം (Malayalam)
// "ml": {
// },
// मराठी (Marathi (Marāṭhī))
// "mr": {
// },
// Bahasa Melayu (Malay)
"ms": {
PREFERENCES:				"Pilihan...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(Kosong)",
DOWNLOAD_EMPTY_TIP:			"Data untuk download tidak dijumpai",
DOWNLOAD_UNKNOWN_TIP:		"diketahui format video",
STEP_FRAME_FORWARD:			"Langkah satu frame ke depan",
SEEK_FORWARD:				"Cari maju",
SEEK_BACK:					"Cari kembali",
POPOUT_PLAYER:				"Pop keluar pemain video",
LOOP_DISABLE:				"Matikan pengulangan",
LOOP_ENABLE:				"Aktifkan pengulangan",
LOOP_SECTION_DISABLE:		"Matikan bahagian pengulangan",
LOOP_SECTION_ENABLE:		"Aktifkan bahagian pengulangan",
LOOP_MARK_START:			"Menandakan bahagian awal",
LOOP_MARK_END:				"Tanda bahagian akhir",
PREVIEW_START:				"Klik untuk memulakan preview video.",
PREVIEW_END:				"Klik untuk akhir preview video.",
LYRICS_BUTTON_HIDE:			"Maklum lirik",
LYRICS_BUTTON_SHOW:			"Papar lirik",
LYRICS_BUTTON_LOAD:			"Beban",
LYRICS_BUTTON_TRY:			"Cuba secara manual...",
LYRICS_LYRICS:				"Lirik",
LYRICS_LYRICS_FOR:			"Lirik untuk: %song",
LYRICS_TITLE_INFO:			"Masukkan artis dan tajuk lagu untuk mencari.",
LYRICS_TITLE_INFO_EX:		"Pisahkan dengan tanda hubung (seperti: Artis - Tajuk).",
LYRICS_SEARCH_START:		"Cari “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Tidak ada hasil untuk “%song”.",
LYRICS_SEARCH_FOUND:		"Lirik dijumpai. Pembebanan...",
LYRICS_SEARCH_NOT_FOUND:	"Lirik yang tidak dijumpai dan tidak ada kombinasi yang lebih banyak untuk mencuba.",
LYRICS_PARSE_SEARCH:		"Parsing hasil carian...",
LYRICS_PARSE_LYRICS:		"Parsing lirik maklumat...",
LYRICS_PARSE_SUCCESS:		"Lirik berjaya dipecah.",
LYRICS_PARSE_ERROR:			"Lirik yang ditemui tetapi tidak dapat diurai. Maaf.",
LYRICS_TITLE_INVALID:		"Video judul tidak sesuai “Artis - Tajuk” pola!",
RATING_LIKE:				"%pcent% suka",
RATING_NO_DATA:				"Kedudukan tidak terdapat."
},
// Nederlands (Dutch)
//	Thanks to:
//		Robin ten Berge <robin_tenberge@hotmail.com>
//		Don van Weverwijk <Creadskel@gmail.com>
//		Alwyn Kik <alwyn_kik@hotmail.com>
//		J. Puik
"nl": {
PREFERENCES:				"Instellingen...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(leeg)",
DOWNLOAD_EMPTY_TIP:			"Data voor download niet gevonden",
DOWNLOAD_UNKNOWN_TIP:		"onbekende video-formaat", // new
STEP_FRAME_FORWARD:			"Stap een frame naar voren",
SEEK_FORWARD:				"Zoek verder",
SEEK_BACK:					"Zoek terug",
POPOUT_PLAYER:				"Pop out video-speler", // new
LOOP_DISABLE:				"Automatisch afspelen uitzetten",
LOOP_ENABLE:				"Automatisch afspelen aanzetten",
LOOP_SECTION_DISABLE:		"Geselecteerde lus uitzetten",
LOOP_SECTION_ENABLE:		"Geselecteerde lus aanzetten",
LOOP_MARK_START:			"Markeer als start sectie",
LOOP_MARK_END:				"Markeer als einde sectie",
PREVIEW_START:				"Klik om video preview te starten.", // new
PREVIEW_END:				"Klik om video preview te beëindigen.", // new
LYRICS_BUTTON_HIDE:			"Liedteksten verbergen",
LYRICS_BUTTON_SHOW:			"Liedteksten tonen",
LYRICS_BUTTON_LOAD:			"Laad",
LYRICS_BUTTON_TRY:			"Zelf invullen...",
LYRICS_LYRICS:				"Liedteksten",
LYRICS_LYRICS_FOR:			"Liedteksten voor: %song",
LYRICS_TITLE_INFO:			"Voer artiest en titelnaam van het nummer in om deze te zoeken.",
LYRICS_TITLE_INFO_EX:		"Gebruik streepje om artiest en titel te scheiden (bijv: Artiest - Titel).",
LYRICS_SEARCH_START:		"Zoekt naar “%song”...",
LYRICS_SEARCH_NO_RESULT:	"“%song” is niet gevonden.",
LYRICS_SEARCH_FOUND:		"Liedteksten gevonden. Een moment...",
LYRICS_SEARCH_NOT_FOUND:	"Liedteksten niet gevonden en geen combinaties meer om te proberen.",
LYRICS_PARSE_SEARCH:		"Zoekresultaten worden verwerkt...",
LYRICS_PARSE_LYRICS:		"Liedtekst data word verwerkt...",
LYRICS_PARSE_SUCCESS:		"Liedtekst succesvol verwerkt.",
LYRICS_PARSE_ERROR:			"Liedtekst zijn gevonden, maar kunnen niet verwerkt worden.",
LYRICS_TITLE_INVALID:		"Video titel komt niet overeen met “Artiest - Titel”.",
RATING_LIKE:				"%pcent% stemmen voor leuk", // new
RATING_NO_DATA:				"Cijfer niet beschikbaar." // new
},
// Norsk (Norwegian)
//	Thanks to:
//		Dennis Moe
//		Are Kristoffer Lamo <arelamo@studioare.net>
"no": {
PREFERENCES:				"Innstillinger...",
DOWNLOAD_VIDEO:				"Last ned video",
DOWNLOAD_EMPTY:				"(tomt)",
DOWNLOAD_EMPTY_TIP:			"Data for nedlasting eksisterer ikke",
DOWNLOAD_UNKNOWN_TIP:		"Ukjent videoformat",
STEP_FRAME_FORWARD:			"Gå en bilderute frem",
SEEK_FORWARD:				"Spol frem",
SEEK_BACK:					"Spol tilbake",
POPOUT_PLAYER:				"Vis bare video", // new
LOOP_DISABLE:				"Deaktiver repetering",
LOOP_ENABLE:				"Aktiver repetering",
LOOP_SECTION_DISABLE:		"Deaktiver seksjonsrepetering",
LOOP_SECTION_ENABLE:		"Aktiver seksjonsrepetering",
LOOP_MARK_START:			"Marker seksjonens start",
LOOP_MARK_END:				"Marker seksjonens slutt",
PREVIEW_START:				"Klikk for å starte video forhåndsvisning.", // new
PREVIEW_END:				"Klikk for å avslutte forhåndsvisning av video.", // new
LYRICS_BUTTON_HIDE:			"Gjem sangtekst",
LYRICS_BUTTON_SHOW:			"Vis sangtekst",
LYRICS_BUTTON_LOAD:			"Last sangtekst",
LYRICS_BUTTON_TRY:			"Velg sangtekst selv...",
LYRICS_LYRICS:				"Sangtekst",
LYRICS_LYRICS_FOR:			"Sangtekst til: %song",
LYRICS_TITLE_INFO:			"Skriv inn artist og tittel på sangen for å søke etter den.",
LYRICS_TITLE_INFO_EX:		"Separer med bindestrek (Som: Artist - Tittel).",
LYRICS_SEARCH_START:		"Søker etter «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Ingen resultater for «%song».",
LYRICS_SEARCH_FOUND:		"Sangtekst funnet. Laster...",
LYRICS_SEARCH_NOT_FOUND:	"Fant ikke sangtekst og ingen flere kombinasjoner å prøve",
LYRICS_PARSE_SEARCH:		"Analyserer søkeresultater...",
LYRICS_PARSE_LYRICS:		"Analyserer sangtekstinformasjon...",
LYRICS_PARSE_SUCCESS:		"Sangtekst fullstendig analysert.",
LYRICS_PARSE_ERROR:			"Sangtekst er funnet, men kan ikke bli analysert. Beklager.",
LYRICS_TITLE_INVALID:		"Videotittel stemmer ikke overens med «Artist - Tittel» mønsteret!",
RATING_LIKE:				"%pcent% liker", // new
RATING_NO_DATA:				"Video karakter ikke tilgjengelig." // new
},
// Polski (Polish)
//	Thanks to:
//		Kamil Wyrzykowski <k.wyrzykowski@gmail.com>
//		Maksymilian Lutek <maximusadw@gmail.com>
//		Galhali <galhali@o2.pl>
//		Daniel M <danielm86@wp.pl>
"pl": {
PREFERENCES:				"Ustawienia...",
DOWNLOAD_VIDEO:				"Pobierz plik wideo",
DOWNLOAD_EMPTY:				"(puste)",
DOWNLOAD_EMPTY_TIP:			"Nie odnaleziono danych do pobrania",
DOWNLOAD_UNKNOWN_TIP:		"nieznany format wideo", // new
STEP_FRAME_FORWARD:			"Przejdź o jedną klatkę do przodu",
SEEK_FORWARD:				"Przewiń do przodu",
SEEK_BACK:					"Przewiń do tyłu",
POPOUT_PLAYER:				"Pokaż tylko wideo", // new
LOOP_DISABLE:				"Wyłacz zapętlanie",
LOOP_ENABLE:				"Włącz zapętlanie",
LOOP_SECTION_DISABLE:		"Wyłącz zapętlanie sekcji",
LOOP_SECTION_ENABLE:		"Włącz zapętlanie sekcji",
LOOP_MARK_START:			"Zaznacz początek sekcji",
LOOP_MARK_END:				"Zaznacz koniec sekcji",
PREVIEW_START:				"Kliknij, aby uruchomić podgląd wideo.", // new
PREVIEW_END:				"Kliknij, aby zakończyć podgląd wideo.", // new
LYRICS_BUTTON_HIDE:			"Ukryj tekst utworu",
LYRICS_BUTTON_SHOW:			"Pokaż tekst utworu",
LYRICS_BUTTON_LOAD:			"Wczytaj",
LYRICS_BUTTON_TRY:			"Spróbuj ręcznie...",
LYRICS_LYRICS:				"Tekst utworu",
LYRICS_LYRICS_FOR:			"Tekst dla utworu: %song",
LYRICS_TITLE_INFO:			"Wpisz wykonawcę i tytuł piosenki w celu wyszukania",
LYRICS_TITLE_INFO_EX:		"Oddzielone myślnikiem (w taki sposób: Wykonawca - Tytuł).",
LYRICS_SEARCH_START:		"Wyszukiwanie „%song”...",
LYRICS_SEARCH_NO_RESULT:	"Brak wyników dla „%song”.",
LYRICS_SEARCH_FOUND:		"Tekst znaleziony. Wczytywanie...",
LYRICS_SEARCH_NOT_FOUND:	"Tekst nie został odnaleziony i nie istnieje więcej kombinacji do sprawdzenia.",
LYRICS_PARSE_SEARCH:		"Przetwarzanie wyników wyszukiwania...",
LYRICS_PARSE_LYRICS:		"Przetwarzanie danych tekstu...",
LYRICS_PARSE_SUCCESS:		"Tekst udało się przetworzyć.",
LYRICS_PARSE_ERROR:			"Tekst znaleziony ale nie może być przetworzony. Przepraszamy.",
LYRICS_TITLE_INVALID:		"Tytuł filmu nie pasuje do wzorca „Wykonawca - Tytuł”!",
RATING_LIKE:				"Głosy na tak: %pcent%", // new
RATING_NO_DATA:				"Ocena nie jest dostępny." // new
},
// Português Brasileiro (Brazilian Portuguese)
//	Thanks to:
//		Jose Renan <joseassis1993@gmail.com>
//		Romário Paiva
//		Lucas Rafael Barboza <webmaster@lucasrafael.com.br>
//		André Zanghelini
"pt_BR": {
PREFERENCES:				"Preferências...",
DOWNLOAD_VIDEO:				"Baixar vídeo",
DOWNLOAD_EMPTY:				"(vazio)",
DOWNLOAD_EMPTY_TIP:			"Não foi possível encontrar o vídeo para baixar",
DOWNLOAD_UNKNOWN_TIP:		"formato de vídeo desconhecido",
STEP_FRAME_FORWARD:			"Avançar um quadro",
SEEK_FORWARD:				"Avançar",
SEEK_BACK:					"Voltar",
POPOUT_PLAYER:				"Mostrar apenas o vídeo",
LOOP_DISABLE:				"Desativar repetição",
LOOP_ENABLE:				"Ativar repetição",
LOOP_SECTION_DISABLE:		"Desativar repetição de seção",
LOOP_SECTION_ENABLE:		"Ativar repetição de seção",
LOOP_MARK_START:			"Marcar início de seção",
LOOP_MARK_END:				"Marcar final de sação",
PREVIEW_START:				"Iniciar visualização do vídeo.",
PREVIEW_END:				"Parar visualização do vídeo.",
LYRICS_BUTTON_HIDE:			"Ocultar letras",
LYRICS_BUTTON_SHOW:			"Exibir letras",
LYRICS_BUTTON_LOAD:			"Pesquisar",
LYRICS_BUTTON_TRY:			"Pesquisar manualmente...",
LYRICS_LYRICS:				"Letra da música",
LYRICS_LYRICS_FOR:			"Letras da música para: %song",
LYRICS_TITLE_INFO:			"Insira o nome do artista e o título da música para procurar:",
LYRICS_TITLE_INFO_EX:		"Separar por hífen (como: Artista - Título).",
LYRICS_SEARCH_START:		"Procurando por “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Nenhum resultado para “%song”.",
LYRICS_SEARCH_FOUND:		"Letra encontrada. Carregando...",
LYRICS_SEARCH_NOT_FOUND:	"Nenhuma letra foi encontrada e não há mais combinações para tentar.",
LYRICS_PARSE_SEARCH:		"Analizando resultados da busca...",
LYRICS_PARSE_LYRICS:		"Analizando dados da letra...",
LYRICS_PARSE_SUCCESS:		"Letra de música carregada com sucesso.",
LYRICS_PARSE_ERROR:			"Letra encontrada, porém não pôde ser analizada. Desculpe.",
LYRICS_TITLE_INVALID:		"Título do vídeo não corresponde “Artista - Título” exemplo!",
RATING_LIKE:				"%pcent% pessoa(s) gosta(m)",
RATING_NO_DATA:				"Avaliação não disponível."
},
// Português (European Portuguese)
//	Thanks to:
//		Miguel Clara <miguelmclara@gmail.com>
//		Pedro Magalhães <pedromagalhaes@gmx.com>
"pt_PT": {
PREFERENCES:				"Preferências...",
DOWNLOAD_VIDEO:				"Descarregar vídeo",
DOWNLOAD_EMPTY:				"(vazio)",
DOWNLOAD_EMPTY_TIP:			"Dados para descarga não encontrados",
DOWNLOAD_UNKNOWN_TIP:		"formato de vídeo desconhecido",
STEP_FRAME_FORWARD:			"Avançar uma frame",
SEEK_FORWARD:				"Pesquisar à frente",
SEEK_BACK:					"Pesquisar para trás",
POPOUT_PLAYER:				"Mostrar apenas o vídeo",
LOOP_DISABLE:				"Desactivar repetição",
LOOP_ENABLE:				"Activar repetição",
LOOP_SECTION_DISABLE:		"Desactivar repetição de selecção",
LOOP_SECTION_ENABLE:		"Desactivar repetição de selecção",
LOOP_MARK_START:			"Marcar início de selecção",
LOOP_MARK_END:				"Marcar fim de selecção",
PREVIEW_START:				"Clique para começar a visualização de vídeo.", // new
PREVIEW_END:				"Clique para final de visualização de vídeo.", // new
LYRICS_BUTTON_HIDE:			"Esconder letras de músicas",
LYRICS_BUTTON_SHOW:			"Mostrar letras de músicas",
LYRICS_BUTTON_LOAD:			"Carregar",
LYRICS_BUTTON_TRY:			"Tentar manualmente...",
LYRICS_LYRICS:				"Letras de músicas",
LYRICS_LYRICS_FOR:			"Letras para: %song",
LYRICS_TITLE_INFO:			"Insira um artista e título da canção para pesquisar.",
LYRICS_TITLE_INFO_EX:		"Separado com hífen (exemplo: Artista - Titulo).",
LYRICS_SEARCH_START:		"A pesquisar por «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Nenhum resultado encontrado «%song».",
LYRICS_SEARCH_FOUND:		"Letra encontrada, a carregar...",
LYRICS_SEARCH_NOT_FOUND:	"Não foram encontradas letras e não há mais combinações para tentar.",
LYRICS_PARSE_SEARCH:		"A analisar os resultados da pesquisa...",
LYRICS_PARSE_LYRICS:		"A analisar os dados da letra...",
LYRICS_PARSE_SUCCESS:		"Letra analisada com sucesso.",
LYRICS_PARSE_ERROR:			"A letra foi encontrada, mas não pode ser analisada. Lamentamos o incómodo.",
LYRICS_TITLE_INVALID:		"O título do vídeo não corresponde ao padrão «Artista - Titulo»!",
RATING_LIKE:				"%pcent% utilizadores que gostaram deste vídeo", // new
RATING_NO_DATA:				"Avaliação não disponível." // new
},
// Română (Romanian)
"ro": {
PREFERENCES:				"Preferinţe...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(gol)",
DOWNLOAD_EMPTY_TIP:			"Datele pentru download nu a fost găsit",
DOWNLOAD_UNKNOWN_TIP:		"necunoscut format video",
STEP_FRAME_FORWARD:			"Un cadru pas înainte",
SEEK_FORWARD:				"Căuta înainte",
SEEK_BACK:					"Căuta înapoi",
POPOUT_PLAYER:				"Afişare video numai",
LOOP_DISABLE:				"Dezactiva buclă",
LOOP_ENABLE:				"Permite buclă",
LOOP_SECTION_DISABLE:		"Dezactiva secţiune buclă",
LOOP_SECTION_ENABLE:		"Permite bucla secţiune",
LOOP_MARK_START:			"Marca secţiune începe",
LOOP_MARK_END:				"Marca sfârşitul secţiune",
PREVIEW_START:				"Click pentru a incepe previzualizare video.",
PREVIEW_END:				"Faceţi clic pentru a termina previzualizare video.",
LYRICS_BUTTON_HIDE:			"Ascunde versuri",
LYRICS_BUTTON_SHOW:			"Arată versuri",
LYRICS_BUTTON_LOAD:			"Sarcină",
LYRICS_BUTTON_TRY:			"Încercaţi manual...",
LYRICS_LYRICS:				"Versuri",
LYRICS_LYRICS_FOR:			"Versuri pentru: %song",
LYRICS_TITLE_INFO:			"Introduceţi artist şi titlul de cântec pentru a căuta.",
LYRICS_TITLE_INFO_EX:		"Separate prin cratimă (cum ar fi aşa: Artist - Titlul).",
LYRICS_SEARCH_START:		"Căutarea pentru „%song”...",
LYRICS_SEARCH_NO_RESULT:	"Nici un rezultat pentru „%song”.",
LYRICS_SEARCH_FOUND:		"Versuri găsit. Se incarca...",
LYRICS_SEARCH_NOT_FOUND:	"Versurile nu sunt găsite şi nu pentru a încerca mai multe combinaţii.",
LYRICS_PARSE_SEARCH:		"Parsarea rezultatele de căutare...",
LYRICS_PARSE_LYRICS:		"Versuri Parsarea de date...",
LYRICS_PARSE_SUCCESS:		"Versuri cu succes analizat.",
LYRICS_PARSE_ERROR:			"Versurile sunt găsite, dar nu pot fi analizate. Ne pare rau.",
LYRICS_TITLE_INVALID:		"Titlul video nu se potriveşte cu „Artist - titlul” model!",
RATING_LIKE:				"%pcent% au apreciat",
RATING_NO_DATA:				"Rating-ul nu este disponibil."
},
// Русский (Russian)
//	Thanks to:
//		Игорь Харитонов <nimrod07@rambler.ru>
//		Антон Шаповалов <333hronos@gmail.com>
//		Кирилл Климанов <lakaicheaker@gmail.com>
//		Тимур Давлетшин <Davletwin@gmail.com>
//		Маргарита Бабовникова <babovnikova@gmail.com>
"ru": {
PREFERENCES:				"Настройки...",
DOWNLOAD_VIDEO:				"Скачать видео",
DOWNLOAD_EMPTY:				"(пусто)",
DOWNLOAD_EMPTY_TIP:			"Файл для загрузки не найден",
DOWNLOAD_UNKNOWN_TIP:		"неизвестный формат видео", // new
STEP_FRAME_FORWARD:			"Вперед на один кадр",
SEEK_FORWARD:				"Искать вперед",
SEEK_BACK:					"Искать назад",
POPOUT_PLAYER:				"Показать только видео", // new
LOOP_DISABLE:				"Отключить повтор",
LOOP_ENABLE:				"Включить повтор",
LOOP_SECTION_DISABLE:		"Отключить повтор раздела",
LOOP_SECTION_ENABLE:		"Включить повтор раздела",
LOOP_MARK_START:			"Назначить начало раздела",
LOOP_MARK_END:				"Назначить конец раздела",
PREVIEW_START:				"Нажмите, чтобы начать просмотр видео.", // new
PREVIEW_END:				"Нажмите до конца предварительного просмотра видео.", // new
LYRICS_BUTTON_HIDE:			"Скрыть текст песен",
LYRICS_BUTTON_SHOW:			"Показать текст песен",
LYRICS_BUTTON_LOAD:			"Загрузить",
LYRICS_BUTTON_TRY:			"Повторить вручную...",
LYRICS_LYRICS:				"Текст песен",
LYRICS_LYRICS_FOR:			"Текст песен для: %song",
LYRICS_TITLE_INFO:			"Вставьте исполнителя и название песни для поиска.",
LYRICS_TITLE_INFO_EX:		"Отделить дефисом (например: Исполнитель - Название).",
LYRICS_SEARCH_START:		"Поиск для «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Нет результатов для «%song».",
LYRICS_SEARCH_FOUND:		"Текст песни найден. Идет загрузка...",
LYRICS_SEARCH_NOT_FOUND:	"Текст песни не найден, варианты для поиска отсутствуют.",
LYRICS_PARSE_SEARCH:		"Анализ результатов поиска...",
LYRICS_PARSE_LYRICS:		"Разбор данных текста...",
LYRICS_PARSE_SUCCESS:		"Текст песен успешно проанализирован.",
LYRICS_PARSE_ERROR:			"Текст песен были найден, но не может быть проанализирован. Извините.",
LYRICS_TITLE_INVALID:		"Название видео не соответствует шаблону «Исполнитель - Название»!",
RATING_LIKE:				"%pcent% понравилось", // new
RATING_NO_DATA:				"Рейтинг не доступны." // new
},
// Slovenský (Slovak)
//	Thanks to:
//		Michal Galan <michal.galan@post.sk>
//		Jaroslav Andrejovský <andrejovsky.jaro@gmail.com>
"sk": {
PREFERENCES:				"Nastavenia...",
DOWNLOAD_VIDEO:				"Stiahnuť video",
DOWNLOAD_EMPTY:				"(nedostupné)",
DOWNLOAD_EMPTY_TIP:			"Dáta na stiahnutie neboli nájdené",
DOWNLOAD_UNKNOWN_TIP:		"neznámy formát videa", // new
STEP_FRAME_FORWARD:			"Krok o jeden snímok vpred",
SEEK_FORWARD:				"Skok vpred",
SEEK_BACK:					"Skok späť",
POPOUT_PLAYER:				"Zobraziť iba video", // new
LOOP_DISABLE:				"Vypnúť opakovanie",
LOOP_ENABLE:				"Zapnúť opakovanie",
LOOP_SECTION_DISABLE:		"Vypnúť opakovanie výberu",
LOOP_SECTION_ENABLE:		"Zapnúť opakovanie výberu",
LOOP_MARK_START:			"Označiť začiatok výberu",
LOOP_MARK_END:				"Označiť koniec výberu",
PREVIEW_START:				"Kliknite na tlačidlo pre spustenie videa náhľadu.", // new
PREVIEW_END:				"Kliknite do konca náhľad videa.", // new
LYRICS_BUTTON_HIDE:			"Skryť text piesne",
LYRICS_BUTTON_SHOW:			"Zobraziť text piesne",
LYRICS_BUTTON_LOAD:			"Načítať text piesne",
LYRICS_BUTTON_TRY:			"Zadať názvy ručne...",
LYRICS_LYRICS:				"Texty piesne",
LYRICS_LYRICS_FOR:			"Text pre: %song",
LYRICS_TITLE_INFO:			"Napíšte meno umelca a názov piesne, ktorú chcete hľadať.",
LYRICS_TITLE_INFO_EX:		"Oddeľte pomlčkou (napríklad: Interpret - Názov piesne).",
LYRICS_SEARCH_START:		"Hľadanie pre „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Žiadne výsledky hľadania pre „%song“.",
LYRICS_SEARCH_FOUND:		"Text piesne nájdený. Načítava sa...",
LYRICS_SEARCH_NOT_FOUND:	"Boli vyskúšané všetky kombinácie, ale text nebol nájdený.",
LYRICS_PARSE_SEARCH:		"Spracovávanie výsledkov hľadania...",
LYRICS_PARSE_LYRICS:		"Spracovávanie textu piesne...",
LYRICS_PARSE_SUCCESS:		"Text piesne úspešne spracovaný.",
LYRICS_PARSE_ERROR:			"Text piesne bol nájdený, ale nie je ho možné spracovať. Ospravedlňujeme sa.",
LYRICS_TITLE_INVALID:		"Názov videa nezodpovedá vzoru „Interpret - Názov piesne“!",
RATING_LIKE:				"%pcent%-krát „Páči sa mi to“", // new
RATING_NO_DATA:				"Hodnotenie nie je k dispozícii." // new
},
// Slovenščina (Slovene)
//	Thanks to:
//		Vito Meznaric
"sl": {
PREFERENCES:				"Nastavitve...",
DOWNLOAD_VIDEO:				"Prenesi video",
DOWNLOAD_EMPTY:				"(prazno)",
DOWNLOAD_EMPTY_TIP:			"Ni podatkov za prenos",
DOWNLOAD_UNKNOWN_TIP:		"neznano video format", // new
STEP_FRAME_FORWARD:			"Ena sličica naprej",
SEEK_FORWARD:				"Prevrti naprej",
SEEK_BACK:					"Prevrti nazaj",
POPOUT_PLAYER:				"Prikaži samo video", // new
LOOP_DISABLE:				"Izklopi ponavljanje",
LOOP_ENABLE:				"Vklopi ponavljanje",
LOOP_SECTION_DISABLE:		"Izklopi ponavljanje predela",
LOOP_SECTION_ENABLE:		"Vklopi ponavljanje predela",
LOOP_MARK_START:			"Označi začetek predela",
LOOP_MARK_END:				"Označi konec predela",
PREVIEW_START:				"Kliknite za začetek predogled video.", // new
PREVIEW_END:				"Kliknite za konec predogled video.", // new
LYRICS_BUTTON_HIDE:			"Skri besedilo",
LYRICS_BUTTON_SHOW:			"Pokaži besedilo",
LYRICS_BUTTON_LOAD:			"Naloži",
LYRICS_BUTTON_TRY:			"Poskusi ročno...",
LYRICS_LYRICS:				"Besedilo",
LYRICS_LYRICS_FOR:			"Besedilo za: %song",
LYRICS_TITLE_INFO:			"Vstavi izvajalca in naslov pesmi za iskanje.",
LYRICS_TITLE_INFO_EX:		"Deli z pomišlajem (Naprimer: Izvajalec - Naslov).",
LYRICS_SEARCH_START:		"Iščem „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Ni rezultatov za „%song“.",
LYRICS_SEARCH_FOUND:		"Besedilo najdeno. Nalagam...",
LYRICS_SEARCH_NOT_FOUND:	"Besedilo ni najdeno in ni več kombinacij za poskusit.",
LYRICS_PARSE_SEARCH:		"Obdelujem rezultate iskanja...",
LYRICS_PARSE_LYRICS:		"Obdelujem rezultate besedila...",
LYRICS_PARSE_SUCCESS:		"Besedilo je bilo uspešno obdelano.",
LYRICS_PARSE_ERROR:			"Besedilo je najdeno vendar ne more biti obdelano. Oprostite.",
LYRICS_TITLE_INVALID:		"Naslov videa se ne ujema z „Izvajalec - Naslov“ vzorcem!",
RATING_LIKE:				"%pcent% glasov „Všeč mi je“", // new
RATING_NO_DATA:				"Ocena ni na voljo." // new
},
// Српски (Serbian)
//	Thanks to: me :), Дарко Пантић
"sr": {
PREFERENCES:				"Подешавања...",
DOWNLOAD_VIDEO:				"Преузмите видео запис",
DOWNLOAD_EMPTY:				"(празно)",
DOWNLOAD_EMPTY_TIP:			"Подаци за преузимање нису пронађени",
DOWNLOAD_UNKNOWN_TIP:		"непознат формат видео записа",
STEP_FRAME_FORWARD:			"Један фрејм напред",
SEEK_FORWARD:				"Скочи напред",
SEEK_BACK:					"Скочи уназад",
POPOUT_PLAYER:				"Прикажи само видео запис",
LOOP_DISABLE:				"Искључи понављање",
LOOP_ENABLE:				"Укључи понављање",
LOOP_SECTION_DISABLE:		"Искључи понављање дела видео записа",
LOOP_SECTION_ENABLE:		"Укључи понављање дела видео записа",
LOOP_MARK_START:			"Обележи почетак понављања",
LOOP_MARK_END:				"Обележи крај понављања",
PREVIEW_START:				"Кликните да бисте започели преглед видео записа",
PREVIEW_END:				"Кликните да бисте окончали преглед видео записа",
LYRICS_BUTTON_HIDE:			"Сакриј текст песме",
LYRICS_BUTTON_SHOW:			"Прикажи текст песме",
LYRICS_BUTTON_LOAD:			"Учитај",
LYRICS_BUTTON_TRY:			"Покушајте ручно...",
LYRICS_LYRICS:				"Текст песме",
LYRICS_LYRICS_FOR:			"Текст за песму: %song",
LYRICS_TITLE_INFO:			"Унесите име извођача и назив песме за претрагу.",
LYRICS_TITLE_INFO_EX:		"Одвојите их цртицом (нпр.: „Извођач - Назив песме“).",
LYRICS_SEARCH_START:		"У потрази за „%song“...",
LYRICS_SEARCH_NO_RESULT:	"Нема резултата за „%song“.",
LYRICS_SEARCH_FOUND:		"Текст песме је пронађен. Учитавање...",
LYRICS_SEARCH_NOT_FOUND:	"Текст песме није пронађен и нема више могућих комбинација.",
LYRICS_PARSE_SEARCH:		"Анализа резултата претраге...",
LYRICS_PARSE_LYRICS:		"Анализа текста...",
LYRICS_PARSE_SUCCESS:		"Текст песме је успешно анализиран.",
LYRICS_PARSE_ERROR:			"Текст песме је пронађен, али га је немогуће изанализирати. Извините због тога.",
LYRICS_TITLE_INVALID:		"Име видео записа не одговара шаблону „Извођач - Назив песме“!",
RATING_LIKE:				"Свиђа ми се: %pcent%",
RATING_NO_DATA:				"Оцена видео записа није доступна."
},
// Svenska (Swedish)
"sv": {
PREFERENCES:				"Inställningar...",
DOWNLOAD_VIDEO:				"Ladda ner video",
DOWNLOAD_EMPTY:				"(tom)",
DOWNLOAD_EMPTY_TIP:			"Data för nedladdning hittades inte",
DOWNLOAD_UNKNOWN_TIP:		"okänd videoformat",
STEP_FRAME_FORWARD:			"Steg en bildruta framåt",
SEEK_FORWARD:				"Söka framåt",
SEEK_BACK:					"Söka bakåt",
POPOUT_PLAYER:				"Visa endast video",
LOOP_DISABLE:				"Inaktivera slinga",
LOOP_ENABLE:				"Möjliggöra slinga",
LOOP_SECTION_DISABLE:		"Inaktivera avsnitt slinga",
LOOP_SECTION_ENABLE:		"Möjliggöra avsnitt slinga",
LOOP_MARK_START:			"Märke avsnitt start",
LOOP_MARK_END:				"Markera avsnittet slut",
PREVIEW_START:				"Klicka för att starta video-förhandsvisning.",
PREVIEW_END:				"Klicka för att avsluta video-förhandsgranskning.",
LYRICS_BUTTON_HIDE:			"Dölja texten",
LYRICS_BUTTON_SHOW:			"Visa texten",
LYRICS_BUTTON_LOAD:			"Belastning",
LYRICS_BUTTON_TRY:			"Försöka att manuellt...",
LYRICS_LYRICS:				"Texten",
LYRICS_LYRICS_FOR:			"Texten till: %song",
LYRICS_TITLE_INFO:			"Sätt artist och titel sång för att söka efter.",
LYRICS_TITLE_INFO_EX:		"Separat av bindestreck (så här: Artist - Titel).",
LYRICS_SEARCH_START:		"Letar efter ”%song”...",
LYRICS_SEARCH_NO_RESULT:	"Inga resultat för ”%song”.",
LYRICS_SEARCH_FOUND:		"Texten found. Laddar...",
LYRICS_SEARCH_NOT_FOUND:	"Texterna är inte hittats och ingen fler kombinationer att prova.",
LYRICS_PARSE_SEARCH:		"Parsning sökresultat...",
LYRICS_PARSE_LYRICS:		"Parsning texten data...",
LYRICS_PARSE_SUCCESS:		"Texten framgångsrikt analyserad.",
LYRICS_PARSE_ERROR:			"Texten finns men kan inte tolkas. Tyvärr.",
LYRICS_TITLE_INVALID:		"Videotitel matchar inte ”Artist - Titel” mönstret!",
RATING_LIKE:				"%pcent% gillar",
RATING_NO_DATA:				"Betyg saknas."
},
// Kiswahili (Swahili)
"sw": {
PREFERENCES:				"Upendeleo...",
DOWNLOAD_VIDEO:				"Shusha video",
DOWNLOAD_EMPTY:				"(tupu)",
DOWNLOAD_EMPTY_TIP:			"Takwimu kwa shusha halikupatikana",
DOWNLOAD_UNKNOWN_TIP:		"haijulikani video format",
STEP_FRAME_FORWARD:			"Hatua moja mbele frame",
SEEK_FORWARD:				"Kutafuta mbele",
SEEK_BACK:					"Kutafuta nyuma",
POPOUT_PLAYER:				"Onyesha video tu",
LOOP_DISABLE:				"Disable kitanzi",
LOOP_ENABLE:				"Kuwawezesha kitanzi",
LOOP_SECTION_DISABLE:		"Disable sehemu ya kitanzi",
LOOP_SECTION_ENABLE:		"Kuwawezesha sehemu ya kitanzi",
LOOP_MARK_START:			"Alama sehemu ya kuanza",
LOOP_MARK_END:				"Alama sehemu ya mwisho",
PREVIEW_START:				"Click kuanza hakikisho video.",
PREVIEW_END:				"Click mwisho hakikisho video.",
LYRICS_BUTTON_HIDE:			"Kujificha nakala ya wimbo",
LYRICS_BUTTON_SHOW:			"Kuonyesha nakala ya wimbo",
LYRICS_BUTTON_LOAD:			"Mzigo",
LYRICS_BUTTON_TRY:			"Kujaribu manually...",
LYRICS_LYRICS:				"Nakala ya wimbo",
LYRICS_LYRICS_FOR:			"Nakala ya wimbo: %song",
LYRICS_TITLE_INFO:			"Insert msanii na jina la wimbo wa kutafuta.",
LYRICS_TITLE_INFO_EX:		"Tofauti na hyphen (kama hivyo: Msanii - Title).",
LYRICS_SEARCH_START:		"Kwa ajili ya kutafuta “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Hakuna matokeo kwa “%song”.",
LYRICS_SEARCH_FOUND:		"Nakala ya wimbo kupatikana. Upakiaji...",
LYRICS_SEARCH_NOT_FOUND:	"Nakala ya wimbo si kupatikana na hakuna michanganyiko zaidi kwa kujaribu.",
LYRICS_PARSE_SEARCH:		"Hazrat matokeo...",
LYRICS_PARSE_LYRICS:		"Hazrat lyrics data...",
LYRICS_PARSE_SUCCESS:		"Nakala ya wimbo mafanikio hazrat.",
LYRICS_PARSE_ERROR:			"Nakala ya wimbo ni kupatikana lakini hawezi kuwa hazrat. Msamaha.",
LYRICS_TITLE_INVALID:		"Video cheo haina mechi “Msanii - Title” mfano!",
RATING_LIKE:				"%pcent% waliipenda",
RATING_NO_DATA:				"Rating hazipatikani."
},
// தமிழ் (Tamil)
"ta": {
PREFERENCES:				"விருப்பங்கள்...",
DOWNLOAD_VIDEO:				"வீடியோ பதிவிறக்க",
DOWNLOAD_EMPTY:				"(வெற்று)",
DOWNLOAD_EMPTY_TIP:			"பதிவிறக்க தரவு இல்லை",
DOWNLOAD_UNKNOWN_TIP:		"தெரியாத வீடியோ வடிவமைப்பு",
STEP_FRAME_FORWARD:			"முன்னோக்கி ஒரு சட்டகம் தள்ளு",
SEEK_FORWARD:				"முன்னோக்கி தேடுங்கள்",
SEEK_BACK:					"திரும்ப பெற",
POPOUT_PLAYER:				"வீடியோ பிளேயர் வெளிவந்துவிடும்",
LOOP_DISABLE:				"கண்ணி முடக்கு",
LOOP_ENABLE:				"கண்ணி செயல்படுத்த",
LOOP_SECTION_DISABLE:		"பகுதியில் கண்ணி முடக்கு",
LOOP_SECTION_ENABLE:		"பகுதியில் கண்ணி செயல்படுத்த",
LOOP_MARK_START:			"மார்க் பிரிவு தொடக்க",
LOOP_MARK_END:				"மார்க் பிரிவில் இறுதி",
PREVIEW_START:				"வீடியோ முன்னோட்ட தொடங்க கிளிக் செய்யவும்.",
PREVIEW_END:				"வீடியோ முன்னோட்ட முடிக்க என்பதை கிளிக் செய்யவும்.",
LYRICS_BUTTON_HIDE:			"பாடல் மறை",
LYRICS_BUTTON_SHOW:			"பாடல் காட்டு",
LYRICS_BUTTON_LOAD:			"சுமை",
LYRICS_BUTTON_TRY:			"கைமுறையாக முயற்சி...",
LYRICS_LYRICS:				"பாடல்",
LYRICS_LYRICS_FOR:			"பாடல்: %song",
LYRICS_TITLE_INFO:			"கலைஞர் மற்றும் தேட பாடல் தலைப்பை சேர்க்க.",
LYRICS_TITLE_INFO_EX:		"ஹைபன் (போல: தலைப்பு - கலைஞர்) தனி.",
LYRICS_SEARCH_START:		"\"%song\" தேடுகிறது...",
LYRICS_SEARCH_NO_RESULT:	"\"%song\" முடிவுகள் இல்லை.",
LYRICS_SEARCH_FOUND:		"பாடல் காணப்படுகிறது. ஏறுகிறது...",
LYRICS_SEARCH_NOT_FOUND:	"பாடல் கிடைக்காத மேலும் சேர்க்கைகள் முயற்சி.",
LYRICS_PARSE_SEARCH:		"தேடல் முடிவுகளை பாகுபடுத்தல்...",
LYRICS_PARSE_LYRICS:		"பாடல் தரவு பாகுபடுத்தல்...",
LYRICS_PARSE_SUCCESS:		"பாடல் வெற்றிகரமாக அலச.",
LYRICS_PARSE_ERROR:			"பாடல் வரிகள் காணப்படுகின்றன ஆனால் அலச முடியாது. மன்னிக்கவும்.",
LYRICS_TITLE_INVALID:		"வீடியோ தலைப்பு \"கலைஞர் - தலைப்பு\" பொருந்தவில்லை பாணி!",
RATING_LIKE:				"%pcent% போன்ற",
RATING_NO_DATA:				"மதிப்பீடு இல்லை."
},
// తెలుగు (Telugu)
// "te": {
// },
// ภาษาไทย (Thai)
"th": {
PREFERENCES:				"...การตั้งค่า",
DOWNLOAD_VIDEO:				"วิดีโอดาวน์โหลด",
DOWNLOAD_EMPTY:				"(ไม่มี)",
DOWNLOAD_EMPTY_TIP:			"ข้อมูลสำหรับการดาวน์โหลดไม่พบ",
DOWNLOAD_UNKNOWN_TIP:		"รูปแบบวิดีโอที่ไม่รู้จัก",
STEP_FRAME_FORWARD:			"ขั้นตอนทีละเฟรมไปข้างหน้า",
SEEK_FORWARD:				"ขอไปข้างหน้า",
SEEK_BACK:					"ขอกลับ",
POPOUT_PLAYER:				"แสดงวิดีโอเท่านั้น",
LOOP_DISABLE:				"ลูปปิดการใช้งาน",
LOOP_ENABLE:				"เปิดใช้งานลูป",
LOOP_SECTION_DISABLE:		"ส่วนลูปปิดการใช้งาน",
LOOP_SECTION_ENABLE:		"เปิดใช้งานส่วนลูป",
LOOP_MARK_START:			"เริ่มต้นส่วนเครื่องหมาย",
LOOP_MARK_END:				"ส่วนท้ายทำเครื่องหมาย",
PREVIEW_START:				"คลิกเพื่อเริ่มการแสดงตัวอย่างวิดีโอ",
PREVIEW_END:				"คลิกเพื่อสิ้นสุดการแสดงตัวอย่างวิดีโอ",
LYRICS_BUTTON_HIDE:			"ซ่อนเนื้อเพลง",
LYRICS_BUTTON_SHOW:			"แสดงเนื้อเพลง",
LYRICS_BUTTON_LOAD:			"ภาระ",
LYRICS_BUTTON_TRY:			"...ลองด้วยตนเอง",
LYRICS_LYRICS:				"เนื้อเพลง",
LYRICS_LYRICS_FOR:			"เนื้อเพลง: %song",
LYRICS_TITLE_INFO:			"แทรกศิลปินและชื่อของเพลงที่จะค้นหา",
LYRICS_TITLE_INFO_EX:		"แยกตามยัติภังค์ (เช่นเพื่อ : ศิลปิน - ชื่อเรื่อง)",
LYRICS_SEARCH_START:		"ค้นหา “%song”...",
LYRICS_SEARCH_NO_RESULT:	"ไม่มีผลลัพธ์สำหรับ “%song”.",
LYRICS_SEARCH_FOUND:		"พบนักร้อง การโหลด...",
LYRICS_SEARCH_NOT_FOUND:	"เนื้อเพลงไม่พบและไม่มีการผสมมากขึ้นในการพยายาม",
LYRICS_PARSE_SEARCH:		"แจงผลการค้นหา...",
LYRICS_PARSE_LYRICS:		"การแยกวิเคราะห์ข้อมูลเนื้อเพลง...",
LYRICS_PARSE_SUCCESS:		"แจงนักร้องได้สำเร็จ",
LYRICS_PARSE_ERROR:			"เนื้อเพลงจะพบ แต่ไม่สามารถแยกวิเคราะห์ ขอโทษ",
LYRICS_TITLE_INVALID:		"ชื่อวิดีโอไม่ตรงกับ“ศิลปิน - ชื่อเพลง”ลาย!",
RATING_LIKE:				"ชอบ %pcent% คน",
RATING_NO_DATA:				"คะแนนไม่สามารถใช้ได้"
},
// Tagalog (Tagalog; Filipino)
"tl": {
PREFERENCES:				"Mga kagustuhan...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(wala)",
DOWNLOAD_EMPTY_TIP:			"Data para sa download hindi natagpuan",
DOWNLOAD_UNKNOWN_TIP:		"hindi kilalang video format",
STEP_FRAME_FORWARD:			"Hakbang isa frame pasulong",
SEEK_FORWARD:				"Humingi ng pasulong",
SEEK_BACK:					"Humingi ng likod",
POPOUT_PLAYER:				"Ipakita ang video lamang",
LOOP_DISABLE:				"Huwag paganahin loop",
LOOP_ENABLE:				"Paganahin loop",
LOOP_SECTION_DISABLE:		"Hindi paganahin ang seksyon loop",
LOOP_SECTION_ENABLE:		"Paganahin ang seksyon loop",
LOOP_MARK_START:			"Markahan seksyon simulan",
LOOP_MARK_END:				"Markahan seksyon katapusan",
PREVIEW_START:				"I-click upang simulan ang video preview.",
PREVIEW_END:				"I-click upang tapusin ang video preview.",
LYRICS_BUTTON_HIDE:			"Itago teksto",
LYRICS_BUTTON_SHOW:			"Ipakita teksto",
LYRICS_BUTTON_LOAD:			"Magkarga",
LYRICS_BUTTON_TRY:			"Subukan manually...",
LYRICS_LYRICS:				"Teksto",
LYRICS_LYRICS_FOR:			"Teksto para sa: %song",
LYRICS_TITLE_INFO:			"Magsingit ng artist at title ng kanta sa paghahanap para sa.",
LYRICS_TITLE_INFO_EX:		"Hiwalay na sa pamamagitan ng gitling (tulad ng sa gayon: Artist - Title).",
LYRICS_SEARCH_START:		"Naghahanap para sa “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Walang mga resulta para sa “%song”.",
LYRICS_SEARCH_FOUND:		"Teksto natagpuan. Pagkarga...",
LYRICS_SEARCH_NOT_FOUND:	"Teksto ay hindi natagpuan at walang higit pang mga kumbinasyon na subukan.",
LYRICS_PARSE_SEARCH:		"Pag-parse ng mga resulta ng paghahanap...",
LYRICS_PARSE_LYRICS:		"Pag-parse ng teksto ng data...",
LYRICS_PARSE_SUCCESS:		"Teksto matagumpay parse.",
LYRICS_PARSE_ERROR:			"Teksto ay natagpuan ngunit hindi maaaring ma-parse. Sorry.",
LYRICS_TITLE_INVALID:		"Video title ay hindi tumutugma sa “Artist - Title” pattern!",
RATING_LIKE:				"%pcent% (na) gusto",
RATING_NO_DATA:				"Rating hindi magagamit."
},
// Türkçe (Turkish)
//	Thanks to:
//		Murat SO <so.murat@hotmail.com>
"tr": {
PREFERENCES:				"Tercihler...",
DOWNLOAD_VIDEO:				"Videoyu indir",
DOWNLOAD_EMPTY:				"(boş)",
DOWNLOAD_EMPTY_TIP:			"İndirmek için bilgi bulunamadı",
DOWNLOAD_UNKNOWN_TIP:		"bilinmeyen video formatı", // new
STEP_FRAME_FORWARD:			"Bir kare ileri git",
SEEK_FORWARD:				"Geriye git",
SEEK_BACK:					"İleri git",
POPOUT_PLAYER:				"Video yalnızca göster", // new
LOOP_DISABLE:				"Videoyu tekrarla",
LOOP_ENABLE:				"Video tekrarlamayı durdur",
LOOP_SECTION_DISABLE:		"Bölümü tekrarlamayı durdur",
LOOP_SECTION_ENABLE:		"Bölümü tekrarla",
LOOP_MARK_START:			"Bölüm başını işaretle",
LOOP_MARK_END:				"Bölüm sonunu işaretle",
PREVIEW_START:				"Video önizleme başlatmak için tıklayın.", // new
PREVIEW_END:				"Video önizleme bitirmek için tıklayın.", // new
LYRICS_BUTTON_HIDE:			"Şarkı sözlerini sakla",
LYRICS_BUTTON_SHOW:			"Şarkı sözlerini göster",
LYRICS_BUTTON_LOAD:			"Yükle",
LYRICS_BUTTON_TRY:			"Kendiniz deneyin...",
LYRICS_LYRICS:				"Şarkı sözleri",
LYRICS_LYRICS_FOR:			"%song için şarkı sözleri.",
LYRICS_TITLE_INFO:			"Aramak için şarkıcı ve şarkı adını giriniz.",
LYRICS_TITLE_INFO_EX:		"Tire ile ayırınız (örneğin: Şarkıcı - Şarkı).",
LYRICS_SEARCH_START:		"«%song» için şarkı sözü aranıyor.",
LYRICS_SEARCH_NO_RESULT:	"«%song» için şarkı sözü bulunamadı.",
LYRICS_SEARCH_FOUND:		"Sözler bulundu. Yükleniyor...",
LYRICS_SEARCH_NOT_FOUND:	"Sözler bulunamadı ve denemek için kombinasyon kalmadı.",
LYRICS_PARSE_SEARCH:		"Arama sonuçları getiriliyor...",
LYRICS_PARSE_LYRICS:		"Söz bilgileri getiriliyor...",
LYRICS_PARSE_SUCCESS:		"Sözler başarıyla getirildi.",
LYRICS_PARSE_ERROR:			"Sözler bulundu ama getirilimiyor. Özür dileriz.",
LYRICS_TITLE_INVALID:		"Videonun adı «Şarkıcı - Şarkı» örneğine uymuyor!",
RATING_LIKE:				"%pcent% gibi", // new
RATING_NO_DATA:				"Değerlendirme kullanılabilir değil." // new
},
// Українська (Ukrainian)
//	Thanks to:
//		Петро Віжевський
//		Evol G.
"uk": {
PREFERENCES:				"Налаштування...",
DOWNLOAD_VIDEO:				"Завантажити відео",
DOWNLOAD_EMPTY:				"(пусто)",
DOWNLOAD_EMPTY_TIP:			"Даних для завантаження не знайдено",
DOWNLOAD_UNKNOWN_TIP:		"невідомий формат відео", // new
STEP_FRAME_FORWARD:			"Один кадр вперед",
SEEK_FORWARD:				"Переміститися вперед",
SEEK_BACK:					"Переміститися назад",
POPOUT_PLAYER:				"Показати тільки відео", // new
LOOP_DISABLE:				"Вимкнути зациклення",
LOOP_ENABLE:				"Увімкнути зациклення",
LOOP_SECTION_DISABLE:		"Вимкнути зациклення уривку",
LOOP_SECTION_ENABLE:		"Увімкнути зациклення уривку",
LOOP_MARK_START:			"Позначити початок уривку",
LOOP_MARK_END:				"Позначити кінець уривку",
PREVIEW_START:				"Натисніть, щоб почати перегляд відео.", // new
PREVIEW_END:				"Натисніть до кінця попереднього перегляду відео.", // new
LYRICS_BUTTON_HIDE:			"Приховати текст",
LYRICS_BUTTON_SHOW:			"Показати текст",
LYRICS_BUTTON_LOAD:			"Завантажити",
LYRICS_BUTTON_TRY:			"Спробувати вручну...",
LYRICS_LYRICS:				"Текст",
LYRICS_LYRICS_FOR:			"Текст для: %song",
LYRICS_TITLE_INFO:			"Введіть виконавця та назву пісні для пошуку.",
LYRICS_TITLE_INFO_EX:		"Розділяти дефісом(наприклад: Виконавець - Назва).",
LYRICS_SEARCH_START:		"Пошук для «%song»...",
LYRICS_SEARCH_NO_RESULT:	"Немає результатів для «%song».",
LYRICS_SEARCH_FOUND:		"Текст знайдено. Завантаження...",
LYRICS_SEARCH_NOT_FOUND:	"Текст не знайдено, варіанти для пошуку відсутні",
LYRICS_PARSE_SEARCH:		"Аналіз результатів пошуку...",
LYRICS_PARSE_LYRICS:		"Аналіз даних тексту...",
LYRICS_PARSE_SUCCESS:		"Текст проаналізовано корректно.",
LYRICS_PARSE_ERROR:			"Текст знайдений, але не може бути проаналізований. Звиняйте.",
LYRICS_TITLE_INVALID:		"Назва відео не	відповідає шаблону «Виконавець - Назва»!",
RATING_LIKE:				"Сподобалося: %pcent%", // new
RATING_NO_DATA:				"Рейтинг не доступні." // new
},
// اردو (Urdu)
"ur": {
PREFERENCES:				"کی ترجیحات...",
DOWNLOAD_VIDEO:				"ڈاؤن لوڈ ، اتارنا ویڈیو",
DOWNLOAD_EMPTY:				"(خالی)",
DOWNLOAD_EMPTY_TIP:			"ڈاؤن لوڈ ، اتارنا لئے دستیاب معلومات نہیں مل سکا",
DOWNLOAD_UNKNOWN_TIP:		"نامعلوم ویڈیو فارمیٹ",
STEP_FRAME_FORWARD:			"ایک فریم آگے مرحلہ",
SEEK_FORWARD:				"آگے طلب کرو",
SEEK_BACK:					"واپس طلب کرو",
POPOUT_PLAYER:				"ویڈیو کھلاڑی پاپ",
LOOP_DISABLE:				"لوپ کو غیر فعال کریں",
LOOP_ENABLE:				"لوپ کو فعال کریں",
LOOP_SECTION_DISABLE:		"سیکشن لوپ کو غیر فعال",
LOOP_SECTION_ENABLE:		"سیکشن لوپ کو چالو کریں",
LOOP_MARK_START:			"کو بطور “خواندہ” نشان زد کریں سیکشن شروع",
LOOP_MARK_END:				"کو بطور “خواندہ” نشان زد کریں سیکشن آخر",
PREVIEW_START:				"ویڈیو پیش نظارہ شروع کرنے کے لئے یہاں دبائیں.",
PREVIEW_END:				"ویڈیو پیش نظارہ کو ختم کرنے کے لئے یہاں دبائیں.",
LYRICS_BUTTON_HIDE:			"دھن چھپائیں",
LYRICS_BUTTON_SHOW:			"دکھائیں کی دھن",
LYRICS_BUTTON_LOAD:			"لوڈ کریں",
LYRICS_BUTTON_TRY:			"دستی طور پر کرنے کی کوشش کریں...",
LYRICS_LYRICS:				"کی دھن",
LYRICS_LYRICS_FOR:			"کے لئے کی دھن: %song",
LYRICS_TITLE_INFO:			"آرٹسٹ اور تلاش کرنے کے لئے گیت کا عنوان ڈالیں.",
LYRICS_TITLE_INFO_EX:		"ہائفن کی طرف سے الگ الگ (تو اس طرح کہ : آرٹسٹ - عنوان).",
LYRICS_SEARCH_START:		"کی تلاش میں “%song”...",
LYRICS_SEARCH_NO_RESULT:	"کے لئے کوئی نتائج نہیں “%song”.",
LYRICS_SEARCH_FOUND:		"دھن مل گیا. لوڈ کیا جا رہا ہے...",
LYRICS_SEARCH_NOT_FOUND:	"کی دھن نہیں مل رہے ہیں اور کوئی زیادہ کے مجموعے کی کوشش کریں.",
LYRICS_PARSE_SEARCH:		"تلاش کے نتائج تصریف میں کیا جا رہا ہے...",
LYRICS_PARSE_LYRICS:		"دھن کے اعداد و شمار کی تصریف میں کیا جا رہا ہے...",
LYRICS_PARSE_SUCCESS:		"دھن کامیابی تجزیہ.",
LYRICS_PARSE_ERROR:			"کی دھن پایا ہے لیکن تجزیہ نہیں کیا جا سکتا ہیں. معاف کیجئے گا.",
LYRICS_TITLE_INVALID:		"“-- عنوان \ کلاکار” کی پیٹرن ویڈیو عنوان \ میل نہیں کھاتا ہے!",
RATING_LIKE:				"%pcent% پسند کرتا ہے",
RATING_NO_DATA:				"دستیاب نہیں کی درجہ بندی."
},
// Tiếng Việt (Vietnamese)
"vi": {
PREFERENCES:				"Ưu đãi...",
DOWNLOAD_VIDEO:				"Download video",
DOWNLOAD_EMPTY:				"(hết)",
DOWNLOAD_EMPTY_TIP:			"Dữ liệu để tải về không được tìm thấy",
DOWNLOAD_UNKNOWN_TIP:		"không rõ định dạng video",
STEP_FRAME_FORWARD:			"Bước một khung phía trước",
SEEK_FORWARD:				"Tìm kiếm sự chuyển tiếp",
SEEK_BACK:					"Tìm kiếm sự trở lại",
POPOUT_PLAYER:				"Hiển thị video chỉ",
LOOP_DISABLE:				"Vô hiệu hóa vòng lặp",
LOOP_ENABLE:				"Cho phép lặp",
LOOP_SECTION_DISABLE:		"Vô hiệu hóa phần vòng lặp",
LOOP_SECTION_ENABLE:		"Phần cho phép vòng lặp",
LOOP_MARK_START:			"Phần đánh dấu bắt đầu",
LOOP_MARK_END:				"Phần đánh dấu kết thúc",
PREVIEW_START:				"Nhấp vào để bắt đầu xem trước video.",
PREVIEW_END:				"Nhấp vào để kết thúc xem trước video.",
LYRICS_BUTTON_HIDE:			"Ẩn lời bài hát",
LYRICS_BUTTON_SHOW:			"Hiển thị lời bài hát",
LYRICS_BUTTON_LOAD:			"Tải",
LYRICS_BUTTON_TRY:			"Thử bằng tay...",
LYRICS_LYRICS:				"Lời bài hát",
LYRICS_LYRICS_FOR:			"Lời cho: %song",
LYRICS_TITLE_INFO:			"Chèn nghệ sĩ và Tiêu đề của bài hát để tìm kiếm.",
LYRICS_TITLE_INFO_EX:		"Riêng biệt bằng dấu gạch nối (như thế này: Nghệ sĩ - Tiêu đề).",
LYRICS_SEARCH_START:		"Tìm kiếm “%song”...",
LYRICS_SEARCH_NO_RESULT:	"Không có kết quả cho “%song”.",
LYRICS_SEARCH_FOUND:		"Lời bài hát được tìm thấy. Tải...",
LYRICS_SEARCH_NOT_FOUND:	"Lời bài hát không được tìm thấy và không có sự kết hợp nhiều hơn để thử.",
LYRICS_PARSE_SEARCH:		"Phân tích kết quả tìm kiếm...",
LYRICS_PARSE_LYRICS:		"Phân tích lời bài hát dữ liệu...",
LYRICS_PARSE_SUCCESS:		"Lời phân tích thành công.",
LYRICS_PARSE_ERROR:			"Lời bài hát được tìm thấy nhưng không thể được phân tích. Xin lôi.",
LYRICS_TITLE_INVALID:		"Video Tiêu đề không phù hợp “Nghệ sĩ - Tiêu đề” mô hình!",
RATING_LIKE:				"%pcent% người thích",
RATING_NO_DATA:				"Đánh giá không có."
},
// 中文 (简体) (Simplified Chinese)
"zh_CN": {
PREFERENCES:				"喜好...",
DOWNLOAD_VIDEO:				"下载视频",
DOWNLOAD_EMPTY:				"（空）",
DOWNLOAD_EMPTY_TIP:			"下载数据未找到",
DOWNLOAD_UNKNOWN_TIP:		"未知的视频格式",
STEP_FRAME_FORWARD:			"一步一帧​​前进",
SEEK_FORWARD:				"快进",
SEEK_BACK:					"寻找回来",
POPOUT_PLAYER:				"只显示视频",
LOOP_DISABLE:				"禁用循环",
LOOP_ENABLE:				"启用循环",
LOOP_SECTION_DISABLE:		"禁用部分循环",
LOOP_SECTION_ENABLE:		"使循环节",
LOOP_MARK_START:			"商标节的开始",
LOOP_MARK_END:				"商标节结束",
PREVIEW_START:				"单击“开始视频预览。",
PREVIEW_END:				"结束视频预览。",
LYRICS_BUTTON_HIDE:			"隐藏歌词",
LYRICS_BUTTON_SHOW:			"显示歌词",
LYRICS_BUTTON_LOAD:			"负载",
LYRICS_BUTTON_TRY:			"尝试手动...",
LYRICS_LYRICS:				"歌词",
LYRICS_LYRICS_FOR:			"歌词为： %song",
LYRICS_TITLE_INFO:			"插入艺术家和歌曲名称来搜索。",
LYRICS_TITLE_INFO_EX:		"连字符分隔（像这样：艺术家 -标题）。",
LYRICS_SEARCH_START:		"搜索 “%song”...",
LYRICS_SEARCH_NO_RESULT:	"没有结果 “%song”.",
LYRICS_SEARCH_FOUND:		"歌词找到。载入中...",
LYRICS_SEARCH_NOT_FOUND:	"歌词都没有发现，没有更多的组合尝试。",
LYRICS_PARSE_SEARCH:		"解析搜索结果...",
LYRICS_PARSE_LYRICS:		"歌词解析数据...",
LYRICS_PARSE_SUCCESS:		"歌词成功解析。",
LYRICS_PARSE_ERROR:			"歌词被发现，但不能被解析。抱歉。",
LYRICS_TITLE_INVALID:		"视频的标题不匹配“艺术家-标题“模式！",
RATING_LIKE:				"%pcent% 人顶了此视频",
RATING_NO_DATA:				"评等资料。"
},
// 广州话 / 廣州話 (Cantonese)
// "zh_HK": {
// },
// 中文 (繁體) (Traditional Chinese)
//	Thanks to:
//		Yang
"zh_TW": {
PREFERENCES:				"偏好設定...",
DOWNLOAD_VIDEO:				"下載影片",
DOWNLOAD_EMPTY:				"(空)",
DOWNLOAD_EMPTY_TIP:			"找不到可下載的資料",
DOWNLOAD_UNKNOWN_TIP:		"未知的影片格式",
STEP_FRAME_FORWARD:			"跳到下一個影格",
SEEK_FORWARD:				"往前跳",
SEEK_BACK:					"往後跳",
POPOUT_PLAYER:				"彈出影片播放器",
LOOP_DISABLE:				"停用重複播放",
LOOP_ENABLE:				"啟用重複播放",
LOOP_SECTION_DISABLE:		"停用選擇範圍重複播放",
LOOP_SECTION_ENABLE:		"啟用選擇範圍重複播放",
LOOP_MARK_START:			"選擇範圍的開始",
LOOP_MARK_END:				"選擇範圍的結束",
PREVIEW_START:				"點選開始影片預覽。",
PREVIEW_END:				"點選結束影片預覽。",
LYRICS_BUTTON_HIDE:			"隱藏歌詞",
LYRICS_BUTTON_SHOW:			"顯示歌詞",
LYRICS_BUTTON_LOAD:			"載入",
LYRICS_BUTTON_TRY:			"手動重試...",
LYRICS_LYRICS:				"歌詞",
LYRICS_LYRICS_FOR:			"歌詞:  %song",
LYRICS_TITLE_INFO:			"輸入歌曲的歌手和標題進行搜尋。",
LYRICS_TITLE_INFO_EX:		"用連字符號分開 (就像:  歌手 - 標題)。",
LYRICS_SEARCH_START:		"搜尋「%song」中...",
LYRICS_SEARCH_NO_RESULT:	"找不到「%song」。",
LYRICS_SEARCH_FOUND:		"已找到歌詞。載入中...",
LYRICS_SEARCH_NOT_FOUND:	"找不到歌詞且已經嘗試過任何可能的選項。",
LYRICS_PARSE_SEARCH:		"分析搜尋結果中...",
LYRICS_PARSE_LYRICS:		"分析歌詞資料中...",
LYRICS_PARSE_SUCCESS:		"已完成歌詞分析。",
LYRICS_PARSE_ERROR:			"已找到歌詞但無法分析。抱歉。",
LYRICS_TITLE_INVALID:		"影片的標題不符合「歌手 - 標題」這樣的格式！",
RATING_LIKE:				"%pcent % 相似",
RATING_NO_DATA:				"無法評價。"
}//,
// isiZulu (Zulu)
// "zu": {
// }
}

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

var style = {
		/**
		 * Style used to hide various parts of page (on <cite>watch pages</cite>).
		 */
		cleanwatch: {
			addtobutton: "\
#watch-actions button[data-button-action*=\"addto\"] {\n\
	display: none !important;\n\
}\n",
			allbuttons: "\
#watch-actions .yt-uix-button-group,\n\
#watch-actions > button[id^=\"watch\"],\n\
#watch-actions > span[id^=\"watch\"] {\n\
	display: none !important;\n\
}\n",
			allcomments: "\
#watch-discussion,\n\
#watch-comments {\n\
	display: none !important;\n\
}\n",
			allsidebar: "\
#watch-sidebar {\n\
	display: none !important;\n\
}\n\
#watch-headline,\n\
#baseDiv,\n\
#page:not(.watch6) #watch-video,\n\
#watch-main,\n\
#watch-main #watch-panel,\n\
#watch-main #watch-actions,\n\
.watch-maincol.watch-2col {\n\
	width: @width@px !important;\n\
}\n\
#page:not(.watch6) #watch-video #watch-player {\n\
	width: @width@px !important;\n\
	height: @height@px !important;\n\
}\n",
			brand: "\
#watch-branded-actions {\n\
	display: none !important;\n\
}\n\
#watch-headline-title a,\n\
#watch-username {\n\
	color: #0033cc !important;\n\
}\n\
#watch-headline-title {\n\
	color: inherit !important;\n\
}\n\
#content {\n\
	background-image: none !important;\n\
	background-color: transparent !important;\n\
}\n\
#page.watch-branded #watch-sidebar {\n\
	margin-top: -363px !important;\n\
}\n\
#page.watch-branded.watch-wide #watch-sidebar {\n\
	margin-top: 0px !important;\n\
}\n\
#page.watch-branded .watch-wide #watch-sidebar {\n\
	margin-top: 0 !important;\n\
}\n",
			comments: "\
.comments-section.ext-all-comments {\n\
	display: none !important;\n\
}\n",
			description: "\
#watch-description,\n\
#watch-rating {\n\
	display: none !important;\n\
}\n",
			embedbutton: "\
#watch-embed {\n\
	display: none !important;\n\
}\n",
			featured: "\
#watch-sidebar > #branded-playlist-module {\n\
	display: none !important;\n\
}\n",
			flagbutton: "\
#watch-flag {\n\
	display: none !important;\n\
}\n",
			flashpromo: "\
#flash10-promo-div {\n\
	display: none !important;\n\
}\n",
			footer: "\
#footer-container {\n\
	display: none !important;\n\
}\n",
			header: "\
#masthead-container {\n\
	display: none !important;\n\
}\n",
			headuser: "\
#watch-headline-user-info,\n\
#watch-bar-channel {\n\
	display: none !important;\n\
}\n",
			likebutton: "\
#watch-like-unlike {\n\
	display: none !important;\n\
}\n",
			responses: "\
.comments-section.ext-video-responses {\n\
	display: none !important;\n\
}\n",
			sharebutton: "\
#watch-share {\n\
	display: none !important;\n\
}\n",
			statsbutton: "\
#watch-insight-button {\n\
	display: none !important;\n\
}\n",
			subscribe: "\
#watch-headline-user-info .yt-subscription-button-hovercard,\n\
#watch-bar-channel button.end {\n\
	display: none !important;\n\
}\n\
#watch-headline-user-info .yt-uix-button.start {\n\
	border-radius: 3px !important;\n\
	border-style: solid !important;\n\
}\n",
			suggestions: "\
#watch-sidebar > div:not(#branded-playlist-module) {\n\
	display: none !important;\n\
}\n",
			ticker: "\
#ticker {\n\
	display: none !important;\n\
}\n",
			toprated: "\
.comments-section.ext-top-comments {\n\
	display: none !important;\n\
}\n",
			transcript: "\
#watch-transcript {\n\
	display: none !important;\n\
}\n",
			uploader: "\
.comments-section.ext-uploader-comments {\n\
	display: none !important;\n\
}\n",
			videotitle: "\
#watch-headline-title,\n\
#watch-title,\n\
.watch-panel-section.watch-panel-divided-bottom h2 {\n\
	display: none !important;\n\
}\n",
			viewcount: "\
#watch-actions .watch-view-count,\n\
#watch-viewcount {\n\
	display: none !important;\n\
}\n"
		},
		/**
		 * Style that will redefine colours on page.
		 */
		customcolor: {
			buttonbackground: "\
#activity-filter-menu .filter-option,\n\
#activity-filter-menu .filter-option.selected-filter,\n\
#browse-filter-menu,\n\
#user-navbar-sections li a,\n\
.browse-categories-side,\n\
.browse-tab-modifiers .subcategory,\n\
.browse-tab-modifiers,\n\
.main-tabs-spotlight-inner,\n\
.watch-expander-head,\n\
.yt-uix-button:not(.yt-uix-button-player),\n\
.yt-uix-button-menu:not(.yt-uix-button-menu-player) .yt-uix-button-menu-item,\n\
.yt-uix-expander-head,\n\
.yt-uix-hovercard-card .yt-badge-rating {\n\
	background-color: @color@ !important;\n\
	background-image: -o-linear-gradient(top, hsla(0 , 0%, 100%, .1), transparent 50%, hsla(0 , 0%, 0%, .1)) !important;\n\
	background-image: linear-gradient(to bottom, hsla(0 , 0%, 100%, .1), transparent 50%, hsla(0 , 0%, 0%, .1)) !important;\n\
}\n\
#masthead-subnav {\n\
	background-image: -o-linear-gradient(bottom, transparent, @color@) !important;\n\
	background-image: linear-gradient(to top, transparent, @color@) !important;\n\
}\n",
			buttonbackgroundhover: "\
#activity-filter-menu .filter-option:hover,\n\
#browse-filter-menu span,\n\
#playlist-bar-bar-container,\n\
#user-navbar-sections .current a,\n\
#user-navbar-sections .current a:hover,\n\
#watch-description .collapse .yt-uix-button:not(.yt-uix-button-player):hover,\n\
#watch-description .expand .yt-uix-button:not(.yt-uix-button-player):hover,\n\
.browse-categories-side .category-selected,\n\
.browse-filter-menu .selected,\n\
.browse-tab-modifiers .selected,\n\
.yt-uix-button-menu:not(.yt-uix-button-menu-player),\n\
.yt-uix-button:not(.yt-uix-button-player):hover,\n\
.yt-uix-expander-head:hover {\n\
	background-color: @color@ !important;\n\
	background-image: -o-linear-gradient(top, hsla(0 , 0%, 0%, .1), transparent 50%, hsla(0 , 0%, 100%, .1)) !important;\n\
	background-image: linear-gradient(to bottom, hsla(0 , 0%, 0%, .1), transparent 50%, hsla(0 , 0%, 100%, .1)) !important;\n\
}\n\
#watch-description .collapse .yt-uix-button:not(.yt-uix-button-player):focus,\n\
#watch-description .expand .yt-uix-button:not(.yt-uix-button-player):focus,\n\
.yt-uix-button-active:not(.yt-uix-button-player),\n\
.yt-uix-button:not(.yt-uix-button-player):active,\n\
.yt-uix-button:not(.yt-uix-button-player):focus {\n\
	background-image: -o-linear-gradient(top, hsla(0 , 0%, 0%, .2), transparent 25%, hsla(0 , 0%, 100%, .2) 50%, transparent 75%, hsla(0 , 0%, 0%, .2)) !important;\n\
	background-image: linear-gradient(to bottom, hsla(0 , 0%, 0%, .2), transparent 25%, hsla(0 , 0%, 100%, .2) 50%, transparent 75%, hsla(0 , 0%, 0%, .2)) !important;\n\
}\n\
.item-highlight,\n\
.yt-uix-button-menu:not(.yt-uix-button-menu-player) .yt-uix-button-menu-item:hover,\n\
.yt-uix-button-toggled,\n\
.yt-uix-button-toggled:focus,\n\
.yt-uix-button-toggled:hover,\n\
.yt-uix-pager .yt-uix-pager-selected {\n\
	background-image: none !important;\n\
	background-color: @color@ !important;\n\
}\n",
			buttonborder: "\
#alerts [style*=\"border\"],\n\
#browse-filter-menu,\n\
#comment-search-input,\n\
#disco-search-term-splash,\n\
#masthead-search #search-input-container,\n\
#masthead-search-terms,\n\
#playlist-bar-bar-container,\n\
#topic-search label,\n\
.ext-lyrics form input,\n\
.watch-expander-head,\n\
.yt-suggest-table,\n\
.yt-suggest-table-horizontal,\n\
.yt-uix-button-menu:not(.yt-uix-button-menu-player),\n\
.yt-uix-button:not(.yt-uix-button-player),\n\
.yt-uix-expander-head,\n\
.yt-uix-slider.browse-collection .yt-uix-pager,\n\
input.text,\n\
textarea {\n\
	border-color: @color@ !important;\n\
	box-shadow: 0px 1px 2px @color@ !important;\n\
}\n\
#playlist-bar-info .playlist-bar-group,\n\
.yt-uix-slider.browse-collection .pager-info {\n\
	border-right-color: @color@ !important;\n\
}\n\
.yt-uix-slider.browse-collection .pager-info {\n\
	border-left-color: @color@ !important;\n\
}\n\
#masthead-search input {\n\
	border-color: transparent !important;\n\
}\n\
#user-navbar-sections .current a,\n\
#user-navbar-sections .current a:hover,\n\
#user-navbar-sections li a {\n\
	box-shadow: inset 0px 1px @color@, 0px 1px @color@;\n\
}\n\
#user-navbar-sections a:hover {\n\
	box-shadow: 0px 1px @color@ inset, 0px -1px @color@ inset, 0px 0px 1px 1px @color@;\n\
}\n\
#comment-search-input {\n\
	border-style: solid !important;\n\
	border-width: 1px !important;\n\
	height: 18px !important;\n\
}\n\
#masthead-search-bar-container #masthead-search input {\n\
	box-shadow: none !important;\n\
}\n\
#masthead-search-terms {\n\
	box-shadow: 0 1px 2px @color@ inset, 0px 1px 2px @color@ !important;\n\
}\n\
.playlist-bar-count {\n\
	color: @color@ !important;\n\
}\n",
			buttoncolor: "\
a.yt-uix-button-default .yt-uix-button-content,\n\
#live button .localized-date,\n\
#live button:focus .localized-date,\n\
#live button:hover .localized-date,\n\
.yt-uix-button-default,\n\
.cpline-highlight,\n\
.yt-uix-button-menu:not(.yt-uix-button-menu-player) .yt-uix-button-menu-item,\n\
.yt-uix-button:not(.yt-uix-button-player),\n\
.yt-uix-expander-head {\n\
	color: @color@ !important;\n\
	text-shadow: 0 0 1px @color@ !important;\n\
}\n\
#watch-description .collapse,\n\
#watch-description .expand {\n\
	text-shadow: none;\n\
}\n",
			commenthover: "\
#branded-page-body-container,\n\
#comments-post-form-alert,\n\
#concerts-container .concert-item.even,\n\
#feed-background,\n\
#lego-refine-block .lego:hover .lego-action,\n\
#lego-refine-block .lego:hover .lego-content,\n\
#masthead-expanded .playlist-data-section,\n\
#masthead-expanded .playlist-thumb-section,\n\
#masthead-expanded,\n\
#masthead-search-term,\n\
#masthead-search-terms,\n\
#page.search-movies-browse #content-container,\n\
#toolbelt-top .search-option a:hover,\n\
#yts-article .box-gray,\n\
#yts-article .grey-rounded-box,\n\
#yts-article table.targeting tr.stripe,\n\
.about-pages,\n\
.blue-box,\n\
.browse-bg-gradient,\n\
.channel-filtered-page .primary-filter-menu .selected-filter.filter-option,\n\
.comment-list .comment.highlighted,\n\
.comment-list .comment:hover,\n\
.cpline-highlight,\n\
.disco-video-list .album-row-odd,\n\
.ext-lyrics form input,\n\
.feed-item-visual,\n\
.inactive textarea,\n\
.nav-box-gray,\n\
.navigation-menu .menu-item a,\n\
.playlist-landing .video-tile.odd,\n\
.playlist-video-item.even,\n\
.tile,\n\
.user-feed-filter.selected,\n\
.watch-stats-title-cell,\n\
.yt-tile-default:hover,\n\
.yt-tile-default:hover,\n\
.yt-tile-static,\n\
.yt-tile-visible,\n\
.yt-uix-hovercard-card .details,\n\
.yt-uix-hovercard-card-content div[style*=\"background-color\"],\n\
.yt-uix-slider.browse-collection .pager-info {\n\
	background-color: @color@ !important;\n\
}\n",
			infocolor: "\
#show-menu .video-group-separator,\n\
#watch-description-extra-info .watch-likes-dislikes .dislikes,\n\
#watch-description-extra-info .watch-likes-dislikes,\n\
#watch-description-extra-info li,\n\
#watch-description-extras h4,\n\
#watch-sidebar h4,\n\
#watch-uploader-info,\n\
.comment .metadata,\n\
.comments-section h4,\n\
.disco-video-list .album-row,\n\
.fm-title-underlined h2,\n\
.masthead-link-separator,\n\
.module-title,\n\
.new-snippets .metadata-separator,\n\
.primary-pane h2,\n\
.secondary-pane h2,\n\
.shmoovies-list-container h3,\n\
.shmoovies-list-container h4,\n\
.user-profile.channel-module .user-profile-item h5,\n\
.user-profile.channel-module h4,\n\
.video-list-item .stat,\n\
.watch-module-body h4,\n\
.watch-related-video-item .stat,\n\
ul.pickers {\n\
	color: @color@ !important;\n\
}\n\
#comments-post-form textarea,\n\
#comments-post-form textarea,\n\
#comments-post-form-alert,\n\
#language-picker,\n\
#masthead-expanded,\n\
#masthead-subnav,\n\
#region-picker,\n\
#safetymode-picker,\n\
#shmoovies-category-menu-container,\n\
#watch-actions-area,\n\
#watch-channel-discoverbox,\n\
#yts-article #article-container,\n\
#yts-article #partners-showcase li,\n\
#yts-article .border-images,\n\
#yts-article .box,\n\
#yts-article .box-gray,\n\
#yts-article .with-separator,\n\
.blue-box,\n\
.channel-recent-activity .feed-item,\n\
.comment-list .comment,\n\
.comments-post-alert,\n\
.comments-reply-form textarea,\n\
.comments-textarea-container textarea,\n\
.horizontal-rule,\n\
.live-comments-setting,\n\
.music-onebox,\n\
.nav-box-gray,\n\
.navigation-menu .menu-item,\n\
.subscription-menu-expandable,\n\
.user-profile.channel-module .section,\n\
.watch-comment-share-area,\n\
.with-border,\n\
.yt-horizontal-rule,\n\
hr,\n\
textarea.comments-textarea {\n\
	border-color: @color@ !important;\n\
}\n\
#artist-recs-container .browse-music-collection .collection-item,\n\
#autoshare-widget-F-wizard,\n\
#browseMain .searchFooterBox div.yt-uix-pager,\n\
#feed-view-loading-msg,\n\
#footer-container,\n\
#page.search-movies-browse #content-container,\n\
#watch-actions-area .divider,\n\
#watch-audio-stats,\n\
#watch-description-expand,\n\
#watch-description-collapse,\n\
#watch-honors-content,\n\
.browse-bg-gradient,\n\
.browseAdditional .searchFooterBox div.yt-uix-pager,\n\
.channel-alt-query,\n\
.feed-item .feed-item-description,\n\
.flag-list,\n\
.playlist-alt-query,\n\
.results-pager,\n\
.ruv-alt-query,\n\
.separator,\n\
.video-alt-query,\n\
.watch-panel-divided-bottom,\n\
.watch-ratings-stats-divider,\n\
hr {\n\
	border-top-color: @color@ !important;\n\
}\n\
#browse-filter-menu hr,\n\
#charts-main .facets li,\n\
#charts-selector,\n\
#masthead-expanded .playlist-bar-item.system.last,\n\
#masthead-expanded-lists-container,\n\
#masthead-sections a,\n\
#masthead-sections a.end,\n\
#masthead-subnav a,\n\
#search-pva,\n\
#video-sidebar a.video-list-item-link:hover,\n\
.all-playlists .choose-playlist-view a.left,\n\
.autoshare-wizard-opt-in-link,\n\
.playlist-bar-playlist-item.system.last,\n\
.with-divider {\n\
	border-right-color: @color@ !important;\n\
}\n\
#artist-recs-container,\n\
#categories-container #aso-slider,\n\
#categories-container .browse-spotlight,\n\
#categories-container .paginated,\n\
#lego-refine-block,\n\
#live-events,\n\
#masthead-container,\n\
#music-guide-container,\n\
#music-main h3,\n\
#music-main h4,\n\
#picker-container .picker-top p,\n\
#search-header,\n\
#search-section-header,\n\
#trailers-main h3,\n\
#trailers-main h4,\n\
#video-sidebar a.video-list-item-link:hover,\n\
#videos-main h3,\n\
#videos-main h4,\n\
#yts-article .summary,\n\
#yts-article .with-bottom-separator,\n\
#watch-sidebar h4,\n\
#watch-sidebar .video-list-item a:hover,\n\
.comments-section h4,\n\
.events-list-container .events-list,\n\
.feed-item-container,\n\
.fm-title-underlined,\n\
.header,\n\
.module-title,\n\
.music-onebox-channel,\n\
.opt-in-experiment-feedmodule-body .feedmodule-bulletin,\n\
.opt-in-experiment-feedmodule-body .feedmodule-single-form-item,\n\
.playlist-landing .video-tile,\n\
.playlist-landing .playlist-description,\n\
.playlist-video-item,\n\
.share-panel-url-container,\n\
.show-onebox .left-pane,\n\
.user-profile.channel-module .section.last,\n\
.yt-uix-hovercard-card .details,\n\
.yt-uix-hovercard-card .info,\n\
.watch-module-body h4,\n\
.watch-panel-divided-top {\n\
	border-bottom-color: @color@ !important;\n\
}\n\
#masthead-utility a,\n\
#search-pva,\n\
#videos-main #recent-column .playlist-video-count,\n\
.browse-modifiers-extended div.subcategory,\n\
.channel-recent-activity .feed-item .feed-item-actions a,\n\
.search-option-box + .search-option-box,\n\
.search-option-box + .search-option-box::before,\n\
.search-refinements-block + .search-refinements-block,\n\
.search-refinements-block + .search-refinements-block::before,\n\
.share-panel-services {\n\
	border-left-color: @color@ !important;\n\
}\n\
.yt-alert-promo {\n\
	box-shadow: 0 0 5px @color@;\n\
}\n\
.tile,\n\
.tile:hover,\n\
.yt-tile-default:hover,\n\
.yt-tile-static,\n\
.yt-tile-visible,\n\
.yt-uix-hovercard-card .details,\n\
.yt-uix-hovercard-card .info {\n\
	box-shadow: 0 1px 1px @color@;\n\
}\n\
.yt-tile-visible:hover {\n\
	box-shadow: 0 1px 3px @color@, inset 0 -1px 0 @color@ !important;\n\
}\n\
#watch-channel-discoverbox {\n\
	box-shadow: 0 1px 0 @color@ !important;\n\
}\n\
#search-lego-refinements,\n\
#toolbelt-container {\n\
	box-shadow: 0 5px 5px @color@ inset !important;\n\
}\n\
.artist-module hr,\n\
.artist-module-header hr,\n\
.browse-filter-menu hr {\n\
	background-color: @color@ !important;\n\
}\n\
	textarea.comments-textarea {\n\
border-style: solid !important;\n\
}\n\
.browse-videos .browse-content,\n\
.disco-video-list .album-row {\n\
	border-color: transparent !important;\n\
}\n\
#reactions-input-items-menu li,\n\
.comment-list .comment,\n\
.watch-panel-section.watch-panel-divided-top {\n\
	border-bottom-style: none !important;\n\
}\n",
			linkcolor: "\
#show-menu .video-group,\n\
#watch-headline #watch-headline-title a,\n\
#watch-headline #watch-username,\n\
.channel-filtered-page .channel-videos-list .video-title,\n\
.disco-video-list a,\n\
.link-like,\n\
.playlist-landing .video-tile:hover .video-title,\n\
.video-list-item-link .title,\n\
.watch-related-video-item .title,\n\
.yt-suggest-close span,\n\
a {\n\
	color: @color@ !important;\n\
}\n\
a:focus {\n\
	background-color: transparent !important;\n\
	outline: none !important;\n\
}\n",
			pagebackground: "\
#channel-body .channel-tab-content .tab-content-body,\n\
#comment-search-input,\n\
#comments-post-form textarea,\n\
#disco-search-term-splash,\n\
#feed-view-loading-msg,\n\
#picker-container,\n\
#playlist-pane-container,\n\
#shmoovies-category-menu-container,\n\
#topic-search-term,\n\
#user-navbar,\n\
#watch-channel-discoverbox,\n\
#watch-content,\n\
#watch-description .collapse,\n\
#watch-description .expand,\n\
#watch-frame-bottom,\n\
#watch-main-container,\n\
#yts-article #article-container,\n\
.comment-list .comment.child .comment-body,\n\
.comment-list .comment.child:hover .comment-bod,\n\
.comments-post-alert,\n\
.comments-post-count input,\n\
.feed-item .feed-item-description,\n\
.feed-item-title,\n\
.feedmodule-anchor,\n\
.main-tabs-spotlight .video-entry,\n\
.navigation-menu .menu-item a.selected,\n\
.navigation-menu .menu-item .selected a,\n\
.playlist-landing .video-tile.even,\n\
.playlist-video-item,\n\
.snippet-metadata li.views,\n\
.tile:hover,\n\
.topic-card,\n\
.watch-comment-share-area,\n\
.yt-suggest-table,\n\
.yt-suggest-table-horizontal,\n\
.yt-suggest-unselected,\n\
.yt-uix-clickcard-card-border,\n\
.yt-uix-hovercard-card-border,\n\
.yt-uix-slider.browse-collection .yt-uix-pager,\n\
.yva-expandable,\n\
[class*=\"channel-layout\"] .tab-content-body,\n\
body #page.cosmicpanda #content-container,\n\
body #page.search-movies-browse #content-container,\n\
body .browse-bg-gradient,\n\
body,\n\
textarea.comments-textarea {\n\
	background-color: @color@ !important;\n\
}\n\
#masthead-expanded .playlist-data-section,\n\
#topic-search-term,\n\
.cpline {\n\
	border-color: @color@ !important;\n\
}\n\
.yt-uix-card-body-arrow-horizontal {\n\
	border-left-color: @color@ !important;\n\
}\n\
.yt-uix-clickcard-card-flip .yt-uix-card-body-arrow-horizontal,\n\
.yt-uix-hovercard-card-flip .yt-uix-card-body-arrow-horizontal {\n\
	border-right-color: @color@ !important;\n\
}\n\
#artist-recs-container .browse-music-collection .collection-item,\n\
body .browse-bg-gradient,\n\
body {\n\
	background-image: -o-linear-gradient(top, hsla(0, 0%, 0%, .2), transparent) !important;\n\
	background-image: linear-gradient(to bottom, hsla(0, 0%, 0%, .2), transparent) !important;\n\
	background-repeat: no-repeat !important;\n\
}\n\
.masthead-bar {\n\
	background-image: -o-linear-gradient(bottom, hsla(0, 0%, 0%, .2), hsla(0, 0%, 50%, .2)) !important;\n\
	background-image: linear-gradient(to top, hsla(0, 0%, 0%, .2), hsla(0, 0%, 50%, .2)) !important;\n\
}\n\
#page.search-movies-browse #content-container,\n\
.browse-bg-gradient {\n\
	background-image: -o-linear-gradient(top, @color@, transparent 120px) !important;\n\
	background-image: linear-gradient(to bottom, @color@, transparent 120px) !important;\n\
}\n\
#watch-description-fadeout {\n\
	background-image: -o-linear-gradient(top, transparent, @color@) !important;\n\
	background-image: linear-gradient(to bottom, transparent, @color@) !important;\n\
}\n\
#masthead-expanded-menu-shade,\n\
.yt-uix-slider-shade-left,\n\
body.rtl .yt-uix-slider-shade-right {\n\
	background-image: -o-linear-gradient(left, @color@, transparent) !important;\n\
	background-image: linear-gradient(to right, @color@, transparent) !important;\n\
}\n\
#masthead-expanded-menu-shade {\n\
	border: none !important;\n\
}\n\
#page.watch-branded #watch-sidebar,\n\
#page.watch-branded #watch-main-container,\n\
#yt-admin #vm-pageheader-container h1,\n\
#vm-video-actions-inner,\n\
.channel-tab-content .tab-content-body .secondary-pane,\n\
#playlist-body .secondary-pane {\n\
	background-image: -o-linear-gradient(left, hsla(0, 0%, 0%, .08), transparent 30%) !important;\n\
	background-image: linear-gradient(to right, hsla(0, 0%, 0%, .08), transparent 30%) !important;\n\
}\n\
.yt-uix-slider-shade-right,\n\
body.rtl .yt-uix-slider-shade-left {\n\
	background-image: -o-linear-gradient(right, @color@, transparent) !important;\n\
	background-image: linear-gradient(to left, @color@, transparent) !important;\n\
}\n\
#watch-content {\n\
	background-image: -o-linear-gradient(top, hsla(0, 0%, 100%, .08) 50%, transparent) !important;\n\
	background-image: linear-gradient(to bottom, hsla(0, 0%, 100%, .08) 50%, transparent) !important;\n\
}\n\
#playlist-pane-container,\n\
.watch-sidecol-container,\n\
[class*=\"channel-layout\"]:not(.channel-layout-full-width) .tab-content-body {\n\
	background-image: -o-linear-gradient(left, transparent 660px, hsla(0, 0%, 100%, .1) 660px, hsla(0, 0%, 80%, .07) 950px) !important;\n\
	background-image: linear-gradient(to right, transparent 660px, hsla(0, 0%, 100%, .1) 660px, hsla(0, 0%, 80%, .07) 950px) !important;\n\
}\n\
#branded-page-body-container,\n\
#channel-body .channel-tab-content .tab-content-body,\n\
#channel-default-bg,\n\
#content.watch-wide #watch-video-container,\n\
#masthead-container,\n\
#playlist-body #playlist-pane-container,\n\
#playlist-default-bg,\n\
#watch-frame-bottom,\n\
.tile:hover,\n\
.yt-uix-clickcard-card-border,\n\
.yt-uix-hovercard-card-border,\n\
.yt-tile-visible:hover,\n\
.watch-sidebar-body .horizontal-rule hr.second,\n\
body #page #content-container {\n\
	background-image: none !important;\n\
}\n\
#masthead-container,\n\
#masthead-subnav,\n\
#watch-headline-container,\n\
#watch-main-container #watch-main #watch-sidebar,\n\
#watch-sidebar .watch-module-body,\n\
#watch-video-container,\n\
.masthead-bar,\n\
.viewcount {\n\
	background-color: transparent !important;\n\
}\n",
			pagecolor: "\
#artist-bio .info,\n\
#artist-bio h1,\n\
#artist-bio-attribution,\n\
#artist-bio-small .info,\n\
#artist-videos-header.artist-module-header h1,\n\
#artist-videos-small .info,\n\
#artist-videos.artist-module h1,\n\
#browse-show .episode-air-date,\n\
#browse-show .show-counts,\n\
#browse-sports .sports-upload-date,\n\
#categories-container h2,\n\
#charts-main .chart-rank-title .rank,\n\
#charts-main .description,\n\
#charts-main .facets li,\n\
#comment-search-input,\n\
#comments-loading,\n\
#comments-post-form textarea,\n\
#comments-post-form-alert,\n\
#cosmicpanda.disabled,\n\
#disco-search-term-splash,\n\
#events .event-address,\n\
#events .event-calendar-date,\n\
#feed-view-loading-msg,\n\
#footer .footer-info,\n\
#homepage-whats-new .entry,\n\
#insight-ratings td,\n\
#instant-results-frame strong,\n\
#instant-results-frame,\n\
#lego-refine-block .search-refinements-block-title,\n\
#lego-refine-block,\n\
#masthead-expanded #masthead-expanded-menu-label,\n\
#masthead-expanded .list-title,\n\
#masthead-expanded .list-video-count,\n\
#masthead-expanded .masthead-expanded-menu-label,\n\
#masthead-expanded-lists-container h3,\n\
#masthead-expanded-lists-container h3,\n\
#masthead-search-term,\n\
#new-releases-header.artist-module-header h1,\n\
#personalized-sub-recs .hp-sub-short-username,\n\
#picker-container .selected,\n\
#results-main-content .description b,\n\
#search-base-div .result-item a ,\n\
#search-base-div .result-item-main-content p,\n\
#search-base-div .result-item-main-content,\n\
#search-base-div strong,\n\
#search-base-div,\n\
#search-header .num-results,\n\
#search-header,\n\
#search-refinements .num-results,\n\
#search-refinements .single-line-lego-list,\n\
#search-refinements,\n\
#show-container .episode-air-date,\n\
#show-container .show-counts,\n\
#show-menu .video-group-selected,\n\
#show-menu .video-group-selected:hover,\n\
#toolbelt-top .search-option-label,\n\
#topic-search-term,\n\
#video-sidebar h2,\n\
#video-sidebar h3,\n\
#video-sidebar p,\n\
#videos-main .movie-username-genre,\n\
#videos-main .playlist-video-count,\n\
#videos-main .show-extrainfo,\n\
#videos-main .video-username,\n\
#watch-description,\n\
#watch-headline-container,\n\
#watch-main-container,\n\
#watch-playlist-creator-info,\n\
#watch-sidebar .video-list-item .title,\n\
#watch-sidebar,\n\
#watch-video-container,\n\
#yts-article a.anchor,\n\
#yts-article,\n\
.add-comment-form label,\n\
.addto-item.addto-loading,\n\
.artist-album-module h1,\n\
.artist-module h1,\n\
.artist-module-header h1,\n\
.branded-page #content-container,\n\
.branded-page,\n\
.browse-container .browse-item-content .stat,\n\
.browse-container .browse-item-info,\n\
.browse-container .browse-item-price.free,\n\
.browse-container .browse-item-price.purchased,\n\
.browse-container .trending-rank,\n\
.browse-container h1,\n\
.browse-container,\n\
.browse-item .movie-extra-info,\n\
.browse-modifiers-extended .selected,\n\
.browse-modifiers-extended-category-lbl,\n\
.browse-tab-modifiers .selected a,\n\
.browse-tab-modifiers .selected,\n\
.browse-videos .browse-collection .browse-item .browse-item-info .video-date-added,\n\
.browse-videos .browse-collection .browse-item .browse-item-info .viewcount,\n\
.browse-videos .browse-collection .collection-header .subtitle,\n\
.channel-description,\n\
.channel-facets,\n\
.channel-filtered-page .channel-filtered-page-head .item-count,\n\
.channel-filtered-page .channel-videos-list .video-time-created,\n\
.channel-filtered-page .channel-videos-list .video-view-count,\n\
.channel-module .collapse-button,\n\
.channel-module .expand-button,\n\
.channel-page,\n\
.channel-recent-activity .feed-item .feed-item-info a,\n\
.channel-recent-activity .feed-item-info,\n\
.channel-summary-info .subscriber-count,\n\
.channel-tile .subscriber-count,\n\
.channels-featured-video-metadata,\n\
.cluster-footer,\n\
.comment-footer,\n\
.comment-result-comment,\n\
.comments-post-count input,\n\
.comments-post-count,\n\
.comments-remaining,\n\
.comments-reply-form textarea,\n\
.comments-textarea-container label,\n\
.cptime,\n\
.episode-description,\n\
.expander-head-stat,\n\
.ext-lyrics form input,\n\
.feed-item .feed-item-content .more-videos,\n\
.feed-item .feed-item-visual .description,\n\
.feed-item .metadata,\n\
.feed-item .time-created,\n\
.feed-item-main .description,\n\
.feed-item-main .feed-item-time,\n\
.feed-item-main .metadata,\n\
.feed-item-title,\n\
.feed-message,\n\
.feedmodule-smtitle-wrapper,\n\
.feedmodule-subnull div,\n\
.feedmodule-ts,\n\
.grayText,\n\
.lego-content-selected,\n\
.live-comments-setting,\n\
.mini-list-view .rental-price,\n\
.mini-list-view .video-username,\n\
.mini-list-view .video-view-count,\n\
.module-view .video .video-view-count,\n\
.movie-description,\n\
.movie-facets,\n\
.music-chart-item .icon-text,\n\
.music-chart-item .rank,\n\
.music-onebox-playall,\n\
.music-onebox-videos,\n\
.new-snippets .channel-video-count,\n\
.new-snippets .playlist-video-count,\n\
.new-snippets .video-view-count,\n\
.playlist .description,\n\
.playlist-creator-info,\n\
.playlist-facets,\n\
.playlist-landing .video-tile .video-title,\n\
.playlist-landing .video-tile:hover .video-details,\n\
.playlist-landing .video-tile:hover .video-view-count,\n\
.playlist-main-stats,\n\
.playlist-page,\n\
.playlists-narrow span.playlist-author-attribution,\n\
.post-item .bulletin-text,\n\
.post-item .comment-text,\n\
.post-item .post-item-heading,\n\
.post-item .post-item-timestamp,\n\
.post-item .video .video-details .video-view-count,\n\
.post-item .video .video-details,\n\
.profile-view-module .user-profile-item .value,\n\
.profile-view-module,\n\
.runtime,\n\
.secondary-pane .playlist-description,\n\
.search-refinements-block-title,\n\
.share-panel-services .secondary button span,\n\
.share-panel-url-label span,\n\
.shmoovies-list-container h2,\n\
.show-description,\n\
.show-facets,\n\
.show-long-description,\n\
.show-mini-description,\n\
.show-onebox .right-pane,\n\
.show-short-description,\n\
.single-playlist .blogger-video-count,\n\
.single-playlist .playlist-description,\n\
.single-playlist .video .video-details,\n\
.snippet-metadata li.views,\n\
.topic-description,\n\
.trailer-facets,\n\
.user-profile.channel-module .user-profile-item p,\n\
.user-profile.channel-module,\n\
.video-count,\n\
.video-description,\n\
.video-facets,\n\
.video-list-item .stat strong,\n\
.video-referring-label,\n\
.viewcount,\n\
.vruntime,\n\
.watch-likes-dislikes,\n\
.watch-panel-section h1,\n\
.watch-panel-section h2,\n\
.watch-panel-section h3,\n\
.watch-panel-section h4,\n\
.watch-ratings-stats-parenthesis,\n\
.watch-ratings-stats-table td,\n\
.watch-view-count,\n\
.yt-badge-live,\n\
.yt-badge-live-thumb,\n\
.yt-badge-new,\n\
.yt-badge-playlist,\n\
.yt-badge-rating,\n\
.yt-badge-rating-signal,\n\
.yt-badge-std,\n\
.yt-badge-ypc,\n\
.yt-badge-ypc-purchased,\n\
.yt-lockup-content p,\n\
.yt-tile-default a,\n\
.yt-tile-default h3 a,\n\
.yt-tile-default h3,\n\
.yt-tile-default,\n\
.yt-tile-default.video-list-item a .title,\n\
.yt-tile-visible a,\n\
.yt-tile-visible h3 a,\n\
.yt-tile-visible h3,\n\
.yt-tile-visible,\n\
.yt-uix-clickcard-card-body,\n\
.yt-uix-hovercard-card .browse-item-price.free,\n\
.yt-uix-hovercard-card .browse-item-price.purchased,\n\
.yt-uix-hovercard-card .description,\n\
.yt-uix-hovercard-card .footer,\n\
.yt-uix-hovercard-card .info,\n\
.yt-uix-hovercard-card .yt-badge-rating,\n\
.yt-uix-hovercard-card h3,\n\
.yt-uix-hovercard-card-body,\n\
.yt-uix-slider.browse-collection .pager-info,\n\
.yt-uix-slider.browse-collection .yt-uix-pager,\n\
a.yt-badge-std,\n\
body,\n\
input.text,\n\
textarea,\n\
textarea.comments-textarea {\n\
	color: @color@ !important;\n\
}\n\
#events .event-calendar-date,\n\
#events .event-calendar-date-inner,\n\
.browse-container .browse-item-price.free,\n\
.browse-container .browse-item-price.purchased,\n\
.yt-uix-hovercard-card .browse-item-price.free,\n\
.yt-uix-hovercard-card .browse-item-price.purchased {\n\
	border-color:  @color@ !important;\n\
}\n\
.yt-uix-slider.browse-collection .pager-info {\n\
	background-image: -o-linear-gradient(top, hsla(0, 0%, 0%, .2), transparent) !important;\n\
	background-image: linear-gradient(to bottom, hsla(0, 0%, 0%, .2), transparent) !important;\n\
}\n",
			titlecolor: "\
#eow-title-input,\n\
#watch-channel-discoverbox .video-list-item.yt-tile-visible .title,\n\
#watch-headline h1,\n\
#watch-title,\n\
.watch-panel-section.watch-panel-divided-bottom h2 {\n\
	color: @color@ !important;\n\
}\n",
			videolinkhover: "\
#default-language-box,\n\
#personalized-sub-recs .channel-cell:hover,\n\
#related-slam .slam,\n\
#watch-description-extra-info .full-link:hover a,\n\
#watch-description-extra-info .link-list a:hover,\n\
#watch-sidebar .video-list-item a:hover,\n\
#yts-article table.targeting th,\n\
.cpline:hover,\n\
.disco-video-list .album-row:hover,\n\
.hover a.video-list-item-link,\n\
.watch-expander-head:hover,\n\
[class*=\"yt-alert\"],\n\
[class*=\"yt-badge\"],\n\
a.video-list-item-link.selected,\n\
a.video-list-item-link:hover {\n\
	background-color: @color@ !important;\n\
}\n\
#masthead-expanded .playlist-data-section,\n\
.cpline,\n\
.disco-video-list .album-row,\n\
.music-onebox-channel-thumbnail,\n\
.playlist-extra-thumb-inner,\n\
.playlist-extra-thumb-outer,\n\
[class*=\"ux-thumb\"] {\n\
	border-color: @color@ !important;\n\
}\n",
			videothumbbackground: "\
.playlist-extra-thumb-inner,\n\
.playlist-extra-thumb-outer,\n\
.video-thumb,\n\
.watch-related-video-item a,\n\
[class*=\"ux-thumb\"] {\n\
	background-color: @color@ !important;\n\
}\n\
.playlist-bar-drag-source:hover .dragger {\n\
	display: none !important;\n\
}\n"
		},
		/**
		 * Logo replacement.
		 */
		customlogo: "\
#logo {\n\
	background-position: 0 0 !important;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAF8AAAAoCAYAAACYayaMAAAAAXNSR0IArs4c6QAAAAZiS0dEAAAA\
AAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHGRY6LCTG7xEAAA0nSURBVGje\
7VprjBzVlf5uPbqrumd63rbH4we24zEKxuZhCAkhojbkIUwU5QdEIbussAiKImURG1BAUQQimyck\
gZBod0MC/EBRIA9WZDHGEDoPHGKWhbWxPYMdG9uYmcEee3oePf2qe87+qFs1t2u62z0OOB6FO7qa\
6nPOvXXru+d+59xbBbxb3i1/j0XMtwFvS6INQB+ADgC9mqpXycJyFoBUnW4WAOiuoxsDMFxDPgiA\
YrKjAEZjMlK2ADB4aWlWm/kH/rZMcgWYbwXR5cK2LQghhG3bEIYwbNuGEEKYphk8lQiei5khhGAi\
EqZpgohgGAZLKYVhGAAgLNOCMIx4m5P+b2hLxMTExULOcNw/i2Ty2xt279sxL8H/Q8r8lBDiTrOl\
td1wXddw3dR8GDdLKcFEfm78mGmat18ycuJX8wr8P6StSwD82My0dVptbe3zkdtZSunnckfNVGrT\
+w8N/3FegL8tCcM3ra1GS3q13dnVNZ+DKxUK034uN2AWC14YB4wzecBl4DwS6BNuyiUVyeZrheum\
4CRXUE/PFeHzWQCQzWbXA7hbi+YPeZ73qA5ENpt9EMAS9XO353k3v+PeAqwVhmkKx0kxMxZ95rPD\
3Rs/MdZM2xPZ59qGfvrjvrncr/+e+/YlFi2sAMDr3/jasvye3S1va2qZTDpMfC6ArRH4AHYpYNMA\
TAAbATyqAd8O4AqNqp44HZ4vgcVmwrZDjyguWFjJbLg430zbkYFBh+Z4P+uccwqZFStLAFBwXUlv\
8/Ow47qm667BkaOIaMfzPAng1wB8AEUAF2WzWUdr9wEAFaWvAHj2tAQqy+4TbipFDBADFeam2/qC\
Rdiu2ap3X5lj26b6hxCyXFlZRTuq/AbANeraBLAewHb1+xIFPAEY8Txv8HSAby/oOcewE2lGgMrB\
zU92HXh1ZzrUX377V450LDurDABHB/c42+77/uKo8dBQshN86hOv/t6Bbe2SWuC/BOCwtmv8oAb+\
hVo8+P1pyxBmYkwAyGsDLaWBPa3h78LnPj8Sgp8fHrZLW5/uCXVJIZhMg08dfIDeiWfK56PxR9mO\
op6nNQ+/VPH9QgArlLwM4LnTAfwvEkgQURcBIqythoEey+SwVjtUtS5jGtDbNlO5Gn0x1/ZNVabk\
fyfQGvd8ANgC4B8V0Cuz2WwbgA0KdJX9RasBKi7cBOBqAAuV/rcA7vE8b28sW/q1CugM4Eue5+1W\
8sfVGYwA8FXP87YHnoseqYyb9VQZk53/nz8ZsFItBACvffOuZRN7glWz7rv37U0uCLIaXR4L9mhZ\
t35ize1fPdx+wYXTU3tfc3bddutZE7tfzeh2hmlS7yc/Nbz8+huOt/SvKQLAyOYn2w499EDv+M4d\
mRqrGSTQDWCyCnzP817NZrNHAXSp57kUwEXqmgH8yfO8kgLNBvAIgIu1YGwA+CiAS7PZ7DUhwKqs\
UQdfvpoEXd6qwG/RBtlKvpRGYo5coZXWdedPO52dEgBKyZQM9cn3ri10rAyyGl2ul6VXfWJ01aev\
PWFYFgNAS/+a4rn3//v+Fz72D+upXA4YQxi89p779i26cuO43nbRlRvHF3z0YxOv3Lhp1fHn/9gZ\
W1CCguetucnKKrkEcIHi+4oC5xnN7p+UvgigBGBcXZcBOAC+Hk9AlM6P0WlFtS9XeR6jTZIkCUa9\
Wv1QNEtfdRPBIpTrgVSX67O3+rPXHSdZvZbSfX0Vp78/H9p3XHbZmA58OZ+P8DQsi8/5zvcOcjIh\
q8bFxKScrxb4WxTQDMAD0KOyHx/A85rdRg24n3medx6ATRrA52az2ZWxFeeryrFJ8fXNoHLiVulL\
2Th1iy3pmD42mXOSP3fP3b1fe8/y9333ogvPI9+fOYZZsrQY2i+85jNHo2zlZ490fX31ivfdveG8\
88NJcLq7/cyGi8f1MUlJRFwf/P8DcCKcbGVDAHZ6nqcvr/eo1cEA/kvR1gsA3lATUgGwSrMPvZti\
4EttVegzJXzflwRGvTqbT5vTNyPPbf9T5gInSUvHjiUP/c+LEU1yOh2NqXPdukIo3/fLx3o2pF25\
PHciMbh1S1uUTq5aVagaF0kidaY2C3zP8wjANs37Q099XgueKRWsQ2/WXyhMavGvrYbnyxp0RPFJ\
kYAjiVly4J21ajyQNdRrcmpC7hommIEEBE+/9ZYd0UkqLUP7VHePH9nnxm2p7OXEpBl1lGmX+pgq\
Fd8nEXi+VSd0vQjg47FTT51yTA1EI2YX/iZlFz/Cjnt+zWsGElzHUyMbJhBR+F5DxG2ZWYR63bv1\
ds3IgRk5LIsjuWFwKBcsozjE4JlxCcH6uIgZzAEu9cB/WYEkVB31PG9f/ChEeW29nINqZFnQ+kSd\
36FxUZimSQ1yTSlZEJEAAJI8m8+JEOk1XpeST11OJEJ5KAOAjc/8blfV+KN+WOjjkr6UKjGpDb7n\
eUey2WwFQLjcdjYAOd6HqYCOU5pRJx0P04yqSSAB3zBNs9Eu0ycJXwVDIinittL3RaRnimaf5ion\
iuQ+z2RRvh6I646RYjRHDBE4rdX4UBF2Deo42YsY1uIF1wAZdahIxDi6YtiJJDV44UMkhVTpoJQS\
cVspJUI9UbDDDDIcEnORE5HWD83Ya6noy4892jmdy83CM/fyS62s7JmIKr4vLTV/jcA3FfjcAGSj\
jt5oALSoM1nxMgnLshp5PlPwDrveWQwzixn9jMcyM+YiJ6Ka92HtGHTHA//RN3X4kBsfY6tlosMM\
NmocUCGZwMTJwG/Gy2vpRB0sRJ0J4TozOy6FMATXh594hoslM2TMllnn8Bn9XOUEiJpyjfO7LIvb\
EjYDgLuwt2ilUxIAKuMTdvH4sYSiNSkD2po8Gfi694oalFTPa4XG+X6NlSLrTJ4Ru8EkOH7aNcuz\
Z7wvFtjiHlsVQHlucsaMXJbK0X38SkWY6vhBt+//l5vfWK52voMPPtAz+IN7lwfjYSYGSGD8ZO9w\
w1RxFlV4njetNk1S2en5fEoDdbLBxIbnQ1Garq+CG8oYhmlwo01WSCvMHKyC2fqoylBmGDCtBMfl\
8f50udPW4YfycrFohPKp0VErlFttGT+UlxMz/Y/l82Yol0xMAiIFHGvmBTo1oJyDmpd/RIF5NoKv\
wUJPPxDz/HAldCvg7wLgapRUdS8rncqzFqln1yCfDj08rq+USkaoT7a3+8Kyee0tt73eumhRJWqn\
tyFE/XWsOXuaASTa2iuL1q+fDuXliQkrtB/Zs8sN5Ys/fMUJBmClW/xF62bsC8dGba7ONsavLQe7\
eeuv4PtnAaxUfX4um81eBmCZBvRBz/P2a/ZF7TTzdgC3AWjXdrezzi+FaR+TzJm66VjgXSLcIMnY\
a8bixISZ7gl2oe+/467DXCm/kezskmEbFVhF2I61/i669ctDk1dfPWqnW8lyXA7lU8NDydB+8Kmn\
Old96PJJAHjvddeP9l3ygan00mUlyw3syfdxZPsL7U5IWQHfj6MWz9aihgaZy8Mq/w+9f7WWHbHy\
ar0c0vYAaXWMfK9GTfFYgOL42CBzwLY1q+JoVrl3XP/m7l1uqLdbWijR0SmfuPOOJaMHDyZ0Sgrt\
SZO99OjPO9NLllaS3d0R5eRPnDAn/7I3HdoPbX2qe9dTm9tCfWZ1f9F0nIhynrjzjmU8/KYT9R9s\
e4eaAd9S3mjUOQOaBnCjOlQbUf0XAPwvgBs9z3sp1uRuAMfV9V4At3ie97B2HDFrFcrp6QNSMtU7\
1YwTZFz/wg9/sHT00KEEABzZscN95AufX/XG47/onfVyo0Z/f9n8ZNdP//m6/jd373IB4Nj+/cnH\
br5ppVksmqF9hhmbb/nX/i3f+WbfyMBA9MHBge1/Tj98w/Wrh37z+MIEBEdjImYwRppJIedUstls\
i+d5U03YpdTEnbTc7xg3yJbWb9npVLqWfm+xbBTVGUraMLDKSVTlmiUiHChVDDhJMktlo8cyqcMy\
MVAoGeGXEGclbcqo72vjcgFguCwN6SRIFEvGYtuijDV7z/lW2Rc5SYKcBPnFsnAExELLnGVbyuVy\
ZqHwbzeV8aO3Ffx3otyfwNpSIvm0097eDvVV8Sm9tGaGIU79UZtt39COmYtjY2PJcunKL5axo5ls\
529avljGLq5UtpcKxcJf9ameEDgd7RvZlQrFgmC8EgJ/xoMPADbRTX4h/1Z5amqKMT//SPoSLHML\
+vu/FD+/OaPLFsLEVaCdZelfRr5MgMHCsizMh8LMLImoVBpqSbpf2LTv9RfnFfhqAg5fJfjnMMTi\
YqnY4Vd8U0qSMA2TmJmFENEmRrv+W1ViZgqOQseTjvO7xWvOvva6VwdemcuB2Rlb7rVxLgMuCfQy\
o1cYhhCGIdi2+g07kbGSSdty3VR+YmKJaSdsMLPlOg6EEJbjOuT7Ip/Ldap5E6GTCiFE+N+27elk\
a2u+Mp2fZgrOgpkkMRGB+LhlGEfJr0hhmkYinT7itrVH76DdTGb79OixwqbB/duUL7xbzrTy//8l\
z3bF/OsmAAAAAElFTkSuQmCC\") !important;\n\
}\n",
		/**
		 * General style. It will be applied on every page.
		 */
		general: "\
.yt-uix-button-menu {\n\
	z-index: 1001 !important;\n\
}\n\
body > div[id*=\"yt-uix-tooltip\"] {\n\
	z-index: 10000 !important;\n\
}\n\
body > iframe.yt-uix-button-menu-mask {\n\
	z-index: 100 !important;\n\
}\n\
div.video-container div.video-content {\n\
	height: 100% !important;\n\
	width: 100% !important;\n\
	top: auto !important;\n\
	left: auto !important;\n\
}\n\
#watch-actions > :not(.watch-view-count) {\n\
	vertical-align: top !important;\n\
}\n\
#watch7-content .ext-actions-right {\n\
	float: right !important;\n\
	margin-top: .6em !important;\n\
}\n\
#watch7-content .ext-actions-right + * {\n\
	clear: right !important;\n\
}\n\
.yt-uix-button-menu.yt-uix-button-menu-player {\n\
	box-shadow: none !important;\n\
}\n\
.yt-uix-button-player,\n\
.yt-uix-button-player:hover,\n\
.yt-uix-button-player:focus,\n\
.html5-volume-control,\n\
.html5-volume-control:focus,\n\
.html5-volume-control:hover {\n\
	box-shadow: 1px 0 1px rgba(73, 71, 71, 0.3) inset, -1px 0 1px rgba(5, 4, 4, 0.3) inset;\n\
}\n\
.html5-video-player:focus .html5-progress-item,\n\
.html5-video-player:hover .html5-progress-item {\n\
	-o-transition-timing-function: ease !important;\n\
	transition-timing-function: ease !important;\n\
}\n\
.yt-uix-button-player:focus {\n\
	outline: none !important;\n\
}\n\
#watch-longform-ad,\n\
.ad-div,\n\
.ext-hidden,\n\
.ext-preview .html5-info-bar,\n\
.html5-player-chrome button img.yt-uix-button-arrow {\n\
	display: none !important;\n\
}\n\
.ext-progress-white .html5-play-progress {\n\
	background-image: -o-linear-gradient(top, rgb(204, 204, 204), rgb(102, 102, 102));\n\
	background-image: linear-gradient(to bottom, rgb(204, 204, 204), rgb(102, 102, 102));\n\
}\n\
.ext-button {\n\
	margin: 0 0 0 8px !important;\n\
}\n\
.ext-button img {\n\
	background-repeat: no-repeat;\n\
}\n\
.ext-button img {\n\
	opacity: .75;\n\
}\n\
.ext-button:hover img {\n\
	opacity: 1;\n\
}\n\
.ext-button-start {\n\
	border-radius: 3px 0 0 3px !important;\n\
}\n\
.ext-collapsed .ext-button-start {\n\
	display: none;\n\
}\n\
.ext-button-end {\n\
	border-radius: 0 3px 3px 0 !important;\n\
	margin-left: 0 !important;\n\
}\n\
.ext-collapsed .ext-button-end {\n\
	display: none;\n\
}\n\
.ext-button-middle {\n\
	border-radius: 0 !important;\n\
	margin-left: 0 !important;\n\
}\n\
.ext-collapsed .ext-button-middle {\n\
	border-radius: 3px !important;\n\
	margin-left: 8px !important;\n\
}\n\
#ext-download-button img {\n\
	width: 12px;\n\
	height: 15px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAAwAAAAeCAYAAAAYa/93AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8CJ+oTgGoAAADISURBVDjL\
7ZKxDQIxEATnENGREoNogogeEBJV8DlFkENMAYSUQAtQyoUsyT/4zcs8GQErObC9a2l9YxFBI3df\
AivaOkfEqdkMs8sZMM/ObulmwJf6B/po6O5jYFHPZNrhmbj7GrgDF4sI3L0CNoAVHj9GxG4AEBF7\
4ACoZG51KISe5rfSHaGWGcBSWhNqK2CUm8lLSurE28z+eP8a3pI+4i3phXc94V54m9nOEixKoaOZ\
vXGFpErSVdItWdtiqSy07fUTdajT/AC7nnqGCZAxfAAAAABJRU5ErkJggg==\");\n\
}\n\
.ext-light-icon #ext-download-button img {\n\
	background-position: 0 -15px;\n\
}\n\
#ext-framestep-button img {\n\
	width: 12px;\n\
	height: 12px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8CH8IROPQAAADLSURBVDjL\
3dIxSgNRGMTx37cJhICVeCM7W9Fr2NonpXgA7yBiZad2trY5gmIvCGFsNhLJ7mZtHXgwPGYe8+Bf\
eMETrvGhW6uNaTDHKR6xxKEBNVt+hjM8Y9FXbDruZjhvZ+4UC6/trD594qD166n9mmM9NGlIk32F\
L9xhspnUDATvcYzL7UnTjuADrvDe9dJ0bHC7cIsbvI35dZPkJMlFkqO+UJKf84ulJMskf2cpyaKv\
OMhSV7GS/HuWqmocS1U1jqW+4A5LVTWKpW8LdFrFtZny9QAAAABJRU5ErkJggg==\");\n\
}\n\
.ext-light-icon #ext-framestep-button img {\n\
	background-position: 0 -12px;\n\
}\n\
#ext-seekforward-button img {\n\
	width: 18px;\n\
	height: 12px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8CGFx1rVcAAADhSURBVDjL\
3ZM9bsJAGETfAE36SByAo1DnPjS0VFE4CjJNjkCbXMPFluGnGYrYyML2tya4yrRv9mm12pkCB2AB\
fAM/tJPjAAj4Al6AM7AHPoDU6OR4S1TnDBTAtjqQ472iOqfqBm8ZvgVSJKpzHMCLMUQATBgnl5zo\
MoDvgOUkKBTAcgBfAeWso/AJvANlj6CTz54VNLMG5sE75PhvbB9sb2y//oXffrbt1pYkpYYo5F2i\
1pYkpRyPRA9vTVKKRI9tbQTRf92apJWk/q1JKqt/FPLerd0XBnKwvbY9DyYU8jpX9ByiscJU+QUA\
AAAASUVORK5CYII=\");\n\
}\n\
.ext-light-icon #ext-seekforward-button img {\n\
	background-position: 0 -12px;\n\
}\n\
#ext-seekback-button img {\n\
	width: 18px;\n\
	height: 12px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8CEFKuJWUAAAEBSURBVDjL\
zdM9SoNBFIXhZ5LgT6mGpNcNZA9iYRPXoljYpLBJ4V5ExNY+rWDlFuwlIJFr8wkhzjcTYgpPN7zn\
noE7cyirjylmNd5rMRziCmPsYl7jvYzhEheNwbo8rRjG2MsEzPFU4gm3zQ37hV3NazzhTV3VoA4+\
bUFd3OMAJ805pwWixLv4wHMTeITjzMACZyWeMukDXOMcO0s7GlV4qwa4wyteNuC/NMTkD5yI6EfE\
NCJmNd5rMRS7luO9jKG1ayWeVgybdy0ittO1iPhfXevgFA9rBBZ5J6X0nlK6aQIfCwNFnjJPnO1S\
SmlU5IVfvTzw9RPUxqtLjIhhRExq/BvN0IdEQnXndgAAAABJRU5ErkJggg==\");\n\
}\n\
.ext-light-icon #ext-seekback-button img {\n\
	background-position: 0 -12px;\n\
}\n\
#ext-preferences-button img {\n\
	width: 12px;\n\
	height: 11px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAAwAAAAWCAYAAAD0OH0aAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ45A+tg4bQAAAEkSURBVDjL\
tZKtTgNREIW/2ay6b1DRVKwAX9PnQPEaKJJSEkgQkFQhCEHUIEhtBQkCg6qhjgaBJSBqMKOAg7lt\
brrb3RomGXHPfHN/5h5zd5oihLAH7AKfeQPYBi6BnSiN8xq4AK6AdpSm7n6ab4A7wA3QitIbcASQ\
bTjgLIEXwIG7fyyLXWAI9OMABsA85gzouTvLzIEToAB+QwjvwH7cSMCFu0/To3NgOdcMOExqd+4+\
Xr9rBjxXvOEFuK56XAZMgO9Ec+DY3ReVDe7+CtwDP8AXcB61yjC2CEkra1gDWLJGHVxIepA0jzmq\
gzuSHhN4IqlV13CbwE+SirTYlTSU1I/rQQLPJPXWf3plDUkla5jZ9tYws3+0hplVW8PMStaIWmX8\
AZ49uaA13J77AAAAAElFTkSuQmCC\");\n\
}\n\
.ext-light-icon #ext-preferences-button img {\n\
	background-position: 0 -11px;\n\
}\n\
#ext-loop-button img {\n\
	width: 14px;\n\
	height: 9px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8CB9F9oKIAAADSSURBVDjL\
vdIhToNBEIbhd0mRY3ANogmOA9QgcNyhGi7ABRoECBQXAAUJDotDFkOwdU0qSBoMiBHIF7MkzS/K\
/gg+NdnsI+bLlMxkUyJiF5gA95m5+nnf4vdcAifAeUQM+8Bb4As4WMcFOGvAe8C4zs/AtABz+ud4\
ALw3fNwGdur8CXyUhlZHwBWwX9FpZr60lHPRRa2tXgPLdQQwiIiNSl0AT8BbKaW9PvVOnas36rAP\
PFJfu7iofzsA9X8PoGXHkfpQd5yp476ttqMKD9XHLvoGgESCD+iPSSAAAAAASUVORK5CYII=\");\
}\n\
.ext-light-icon #ext-loop-button img {\n\
	background-position: 0 -9px;\n\
}\n\
#ext-loop-button.ext-loop-on img {\n\
	width: 14px;\n\
	height: 13px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAA4AAAAaCAYAAACHD21cAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ44MTqsgXUAAAF1SURBVDjL\
xdI9a1RREIDhZ8KKckBBCAGtAlEsDIII/gULS61EixRauCD+BKuAVVJbithYyJZ2VlZiobJusNQq\
FgrqAaux8FzZXfaukkIHDnOHue/5fAO3sWk2vmC31rqvJwa42MZ8fMN2H7iCp3iAZ3O9Y/M/l1KG\
pZRVWKm1jvAIZyyJUsoOhrjerQjXsI7Eyx72aMtbpZQTHXiu5bdtLIr7LR/CZgeut/wOe3iO19NU\
rfV9uzA4PWgfn3ESa+3MowVnXMORVu53K05avlBK2ejZ6tX2fDDuwCf40S5gex4upVzGzVa+qrWO\
o9baNe/iVmt+xRt8wgbOIvAdN2qtk99gg+9gC4cXbPUj7tVaX8AM2ODzuIJTOI4P7YkeT7sbmdkr\
eUT8Z8kzc5iZqzCIiFErHi6TPDN3cKkpt3sgyTPzH0geEcslj4iFkmfmcskz8+CSz8OZOSN5RIxj\
qvnXkkfEJOZm/qPkEfFL8gWX0Cv5tLs/AYhjoUAiI8hnAAAAAElFTkSuQmCC\");\n\
}\n\
.ext-light-icon #ext-loop-button.ext-loop-on img {\n\
	background-position: 0 -13px;\n\
}\n\
#ext-loop-button.ext-loop-force img {\n\
	width: 14px;\n\
	height: 9px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHBxIlCRVXvbgAAADHSURBVDjL\
1dIhTgNRFIXhb8jw3DM4UtEExwIw3Qi4TlJbwQYIAgQKhcN0EN1FLYY1kCBIGgyIJ0iewswkDSTt\
mzqOOrm5vzn5q5SSbWljHOECy2lK6/5+YHfuMMNNG+PxEPAJ35hswtUD1wXwCc66/oyrGueGZYJx\
jY+C50Mcdf0Ln1XBqmPc47SDLqcpvZSMc/sbKl31EW+bENQxxq1Uk/MrVnifh2AvAZqc9xegh6sm\
5/8iwC6iyfmPAIsQhguwCGG4AD0EPxAiSYdkfWQgAAAAAElFTkSuQmCC\");\n\
}\n\
#ext-loop-button.ext-loop-on.ext-loop-force img {\n\
	width: 14px;\n\
	height: 13px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAA4AAAAaCAYAAACHD21cAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8BH+k8azcAAAFlSURBVDjL\
vdI/SJVhFMfxz2tXuA56cXFoEsxJcxGC2gQhyLFFEIQGRRSEVieHuNiUOEZLi4uDOFTYdMFJEQfL\
P9F0qSmH25CDfzCX88r15b5XcfDAw+/59zvneQ7fZKFUmka/6/EXc5pEAU9iZOMfynnGFqziPdYz\
Zx0N7s/UV1yL+WfN4x2eoxWLLbE5hG78x3aOsT30FZLUOBb6PUajeBvaiuHU2B16gB+oYDdj/BkN\
g95CTGp4iK7481pO1WLon7TiYeggehoYEkxHM2E/Na7gJBpQzpgTvMBErHewn2bYxUdM4jGW8Q1H\
kaQvEhzjjbrSsIiLaHc7nmWe+xvz6bceDBeL9Yeb2IrsZzjFHr4ENb+uyKlVq3mQj9475Ns5kCc3\
Qf4UX2+CfLYB5G23gXzgFpBP3RXy83uFXB7kHzKQt2UgH8mDvJqBvNIE8td3gXw8kl0zwhI28BKP\
0Blgr+JT/cVLhSFiWF9F0CkAAAAASUVORK5CYII=\");\n\
}\n\
#ext-popout-button img {\n\
	width: 18px;\n\
	height: 15px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAABIAAAAeCAYAAAAhDE4sAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9sGHAQGM88hNYcAAALvSURBVEjH\
jVXNbttGGJzZXVaABbRQSMqnoDXgHHzqIzjtqee+SB4qT5BTT/ET5JSLLy7cooBVkJQjJfoBYfKb\
HsJlaFlW9QECpd3l7OzsfCMCQJZlvqqqNs/zK0m/AJAkkMQRRQB1SNPUAwgA2qZpfjw7O/swHo8L\
SY9XPwNqZu7m5uZ1mM/nLYC2G38g+SWE8EnSkzf3sSTpALQhy7I/APwsqZH0EsBHSQsAHLLax0gS\
JHlJFgD8BuB3kv9KemdmtaRlZBQBOlB1zyGqB2ABgEhelWW5TNN0Y2ZrAAtJJBl3RbeOu8c0sxCB\
QDJ0k87MPgO4787+3LHUjQlA0gOZWS+cmS0BzCVFIB26e0lJ1AjO9Zu7pmkWkqoB0MEys+8AtE8Y\
tW1bjUajWdM0h4B6lm3bjvYx8qvV6tX19XUNwEVBBzbQ4Hvb3VgC4CREht3zbdM0bx4eHurnhO7A\
A4BTAH91YNdM09QATJxzy7Isj5EFk8nkxHu/rqqq3yWQlHPu+7qucXl5mUwmE2dmvX9IRr/AOQcz\
w2w2e3F3dwcAKIoiAQBmWbYA8AMAbLfbXo9n+gpmFnX7e7vd/jSMgL42m837pml+PSY+vPdarVb9\
QhZF4QGE6XRaz+fzP29vb+/X63WxT+R95Zxz5+fnr8N0On0UI5K+tG376etJiP8LuM64bSjLso8R\
AC8BfASwiA067P4dT8WL8CQtSOpjBMA751xNchmB4ovxZ8R/EiMkBeAqz/NlVVUb7/2a5BNGXVtw\
96jOua8x0vklOtyR/CzpHoA7oIsG4Mkwj/oNvPdLAPNBHh2MEZIJSQu7N+C9X5CshsF2qJxz32Jk\
OB5CqOq6noUQjooR7/2IpIUdj/jxePzq4uKijhoN57uLiexbkt9ipBPbusm3IYQ3SZLUh/7LAARJ\
j2OkLEsDMDGz5enp6VExUhTFCcl1nuccIlNSRnIU82jIInb7jsNf7PZeAHBH8mZo/2GPxc+OwwHg\
nyHQf8Jv1PMW0aO5AAAAAElFTkSuQmCC\");\n\
}\n\
.ext-light-icon #ext-popout-button img {\n\
	background-position: 0 -15px;\n\
}\n\
.ext-lyrics {\n\
	margin-bottom: 5px;\n\
}\n\
.ext-lyrics .yt-uix-expander-head button {\n\
	width: 100%;\n\
	border-radius: 0 0 5px 5px;\n\
	border-width: 0 0 1px;\n\
	height: 18px;\n\
}\n\
.ext-lyrics .ext-lyrics-body {\n\
	padding: 5px;\n\
}\n\
.ext-lyrics .yt-uix-expander-head button:hover,\n\
.ext-lyrics .yt-uix-expander-head button:focus {\n\
	color: #669acc;\n\
	box-shadow: none;\n\
}\n\
.ext-lyrics-body-info {\n\
	padding: .25em;\n\
	background-color: #e6efff;\n\
	border: 1px solid #aeaed5;\n\
	color: #4d4d4d;\n\
}\n\
.ext-try-manual {\n\
	margin-bottom: 5px;\n\
}\n\
.ext-lyrics form button {\n\
	border-radius: 0 3px 3px 0;\n\
}\n\
.ext-lyrics form {\n\
	padding: 5px;\n\
}\n\
.ext-lyrics form input {\n\
	min-width: 70%;\n\
	box-sizing: border-box;\n\
	height: 35px;\n\
	padding: 2px 4px 3px;\n\
	border-radius: 3px 0 0 3px;\n\
	border: 1px solid;\n\
}\n\
.ext-lyrics form input:focus {\n\
	border-color: #6d9df7;\n\
}\n\
.ext-lyrics .comments-section {\n\
	margin: 0;\n\
}\n\
.ext-lyrics .comments-section h4 {\n\
	margin: 0;\n\
	padding: 0 0 0 35px !important;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAABUAAAAwCAYAAAD+djETAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sEBQ8BL8/lW5sAAAL2SURBVEjH\
7ZZPa5RXFMZ/dxpi2ooWCbRCQSgIkkUQ0oWIfwrtwo3kE3RT3JTiStClSiBbP0GkRTeJ4iIaUESx\
LsR2FkHQqWOsloILwUVCgzS25ufmvNOb8Z3JvGPc9cBlzrnc89zz773zQHU5DDwA5tggGQF+B5rA\
fWBzPyAHgLvAz8BwRNgEfgu7VAa6AF4DfgW+AT4HfgH+DZ/vgRdVohsG6sChsAeBOxHhY+AKMFQ1\
5TqwI7PnArAJTACjwD1gLDtTy9Zbch3Yl9mzwKMAnG0DmQRuAaejaQ3gYZZhS6YzfQpYiFUHjnSY\
hr3ATLY3kzfqB+B86OPAfmAVeA7cAC6WgDbid3dc0AA25TX4Fvgs9KOAwAfA8bjkQ2BPhz4sAF+H\
/rQA3Qy8BA4C24EvsqKfiwtORM3KZAX4KPSXRfqfAjcj0kvASeA18HfY68m2+NKKEYQYjycxh/PZ\
4VM9juHZTP+xiPRYpD8I/AVczb6g76IRXwJbgWXgj2jgdmBX+BTySYrNKeAZsCmasi10YgJWohSv\
4jMdit9VYDGmYylqv5SAM8AW4Cfgdp+v107g49D/TFW91ZaeUrl76hewG3CqCrIeYFfQfgEpe6rU\
FmA3x25S6yeS9kyKQFrBlB0sANtL0Gl/3Uh7cUwpvZVJvlfrlE4vkgPlPrV3ndOO6fcTZTcZ6CXF\
DRmpskZkmRxWH6hznS5PFVMeAS7HO/tP/Gctt09NrdMsduBSFwJwFfgKWM7BCqyBMsCUEmpXLpVS\
elFlbIbVunoo7EH1jtpUH6tX1KGqj3Bd3ZHZcwHYVCfUUfWeOpadqRWrDPC6ui+zZ9VHATjbBjKp\
3lJPq/fVhvqwyDAHnc70KXUhVl09UhLEiLpXncn2/uNSaotLqT1xqZRSI87vVkfCrsal1N65lNri\
Uur751Ippf64lDqmPok5nM/qfKrHMTyb6eVcSm1xKbU6l1LXcKmU0rjaM5dKKS2qa7mU2uJSKaW+\
uJS6hkvxv2y4vAFd/NTG0SsY2wAAAABJRU5ErkJggg==\");\n\
	background-position: left 5px top 3px;\n\
	background-repeat: no-repeat;\n\
}\n\
.ext-lyrics .comments-section h4.ext-light-icon {\n\
	background-position: left 5px top -25px;\n\
}\n\
[dir=\"rtl\"] .ext-lyrics .comments-section h4 {\n\
	padding: 0 35px 0 0 !important;\n\
	background-position: right 5px top 3px;\n\
}\n\
[dir=\"rtl\"] .ext-lyrics .comments-section h4.ext-light-icon {\n\
	background-position: right 5px top -25px;\n\
}\n\
#ext-extra-button-container,\n\
#ext-loop-button-container {\n\
	display: inline-block;\n\
}\n\
#ext-extra-button-container > button,\n\
#ext-loop-button-container > button {\n\
	direction: ltr;\n\
	unicode-bidi: bidi-override;\n\
}\n\
.ext-preview-enabled .ext-preview-container {\n\
	position: relative !important;\n\
	display: inline-block !important;\n\
}\n\
.ext-preview-enabled .ext-preview-container > iframe {\n\
	position: absolute;\n\
	top: 0;\n\
	bottom: 0;\n\
	left: 0;\n\
	right: 0;\n\
	width: 100%;\n\
	height: 100%;\n\
}\n\
.ext-preview-enabled .addto-button,\n\
.ext-preview-enabled .addto-container,\n\
.ext-preview-enabled .ext-thumb-preview {\n\
	display: none !important;\n\
}\n\
.ext-preview-enabled:hover .addto-button,\n\
.ext-preview-enabled:hover .addto-container,\n\
.ext-preview-enabled:hover .ext-thumb-preview,\n\
.ext-preview-enabled:hover .video-time {\n\
	display: block !important;\n\
	z-index: 2;\n\
}\n\
.ext-preview-enabled .video-actions {\n\
	bottom: 0;\n\
	right: 0;\n\
}\n\
.ext-preview-enabled .ext-button {\n\
	margin: 0 !important;\n\
}\n\
.ext-preview-active .video-time {\n\
	bottom: 0 !important;\n\
	left: 0 !important;\n\
	right: auto !important;\n\
}\n\
.ext-addto .ext-thumb-preview {\n\
	width: 25px;\n\
}\n\
.ext-thumb-preview img {\n\
	width: 12px;\n\
	height: 12px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEA04LY7cKc8AAAD1SURBVDjL\
jdMhTgNBGIbhZ2gF9SQVCAS3gHtgOQS6jiAIFBLugEOAqahAVgLXIM0mGEoR/JjdZrPd7eyXjJrv\
nUn+eWeABY7xgW/tGSAhJbxjhDVeMEXRAaoDVdZ4xl0b2AZU+SlvvC0PWeWAKiu84QLFnnxGOMEl\
Dof65QGPKHLAPY4wrwbQBfxihid81jeGHcWbZrEJZIv1TDDWNxGxiIiriDjY0dmsFBFbLqWUiiaw\
UaMGbLlUgTmg6dIUf/iCXWrs4wyvOO9zQ1tO+7o0L11a5oAZluWfWPVx6TqltKxPqdOllFI/l7qK\
9VecRMQ400mVGv8bx3nBeAwDTQAAAABJRU5ErkJggg==\");\n\
}\n\
.ext-thumb-preview.ext-pause img {\n\
	width: 12px;\n\
	height: 12px;\n\
	background-image: url(\"data:image/png;base64,\
iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A\
/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEA06JMU28+kAAABLSURBVDjL\
Y2RAgJtIbHVcYkwMJAL6amCGYgZ8YixI7L9YDPxLjJOY8YkxYRH8i0+MiRpOGuB4gAfr////4YKM\
jIw4xUbT0mhawgEA2gkUQhRmYJIAAAAASUVORK5CYII=\");\n\
}\n\
.ext-thumb-preview.ext-light-icon img {\n\
	background-position: 0 -12px;\n\
}\n\
.ext-video-rating {\n\
	position: absolute;\n\
	top: 0px;\n\
	width: 100%;\n\
	height: 5px;\n\
	display: inline-block;\n\
	background-color: hsla(200, 35%, 80%, .65);\n\
	box-shadow: 0 0 5px 1px #f0f8f0;\n\
}\n",
		/**
		 * Full screen style. It will be applied when Opera is in full screen.
		 */
		fullscreen: "\
body {\n\
	overflow: hidden !important;\n\
}\n\
.html5-expand-button,\n\
.html5-fullscreen-button {\n\
	display:none !important;\n\
}\n\
#playnav-player,\n\
#video-player,\n\
#watch-player,\n\
#watch7-player {\n\
	position: fixed !important;\n\
	top: 0 !important;\n\
	left: 0 !important;\n\
	bottom: 0 !important;\n\
	right: 0 !important;\n\
	z-index: 1234567890 !important;\n\
}\n\
#playnav-player #movie_player {\n\
	width: 100% !important;\n\
	height: 100% !important;\n\
}\n\
#playnav-player,\n\
#watch7-player,\n\
#watch-player {\n\
	padding-top: 1px !important;\n\
	background-color: #345 !important;\n\
	width: 100% !important;\n\
	height: 100% !important;\n\
}\n\
div#channel-body div#user_playlist_navigator,\n\
div#channel-body div#playnav-body,\n\
#watch7-video,\n\
#watch7-main,\n\
#watch7-playlist {\n\
	position: static !important;\n\
}\n",
		/**
		 * Style used to pop out player.
		 */
		popout: "\
body.ext-popout-player {\n\
	overflow: hidden !important;\n\
}\n\
body.ext-popout-player .html5-expand-button,\n\
body.ext-popout-player .html5-fullscreen-button {\n\
	display: none;\n\
}\n\
body.ext-popout-player #branded-page-body-container,\n\
body.ext-popout-player .channel-layout-two-column .primary-pane,\n\
body.ext-popout-player #playlist-pane-container .primary-pane,\n\
body.ext-popout-player #watch7-video,\n\
body.ext-popout-player #watch7-main,\n\
body.ext-popout-player #watch7-playlist {\n\
	position: static;\n\
}\n\
#watch7-player,\n\
#watch-player {\n\
	-o-transition-delay: 0;\n\
	transition-delay: 0;\n\
	-o-transition-duration: 1s;\n\
	transition-duration: 1s;\n\
	-o-transition-property: all;\n\
	transition-property: all;\n\
	-o-transition-timing-function: ease;\n\
	transition-timing-function: ease;\n\
}\n\
body.ext-popout-player div.channels-video-player.player-root div.player-container,\n\
body.ext-popout-player div#watch-player,\n\
body.ext-popout-player div#watch7-player {\n\
	position: fixed !important;\n\
	top: 0 !important;\n\
	left: 0 !important;\n\
	bottom: 0 !important;\n\
	right: 0 !important;\n\
	height: 100% !important;\n\
	width: 100% !important;\n\
	background-color: hsla(0, 0%, 10%, .95) !important;\n\
	z-index: 987654 !important;\n\
}\n\
body.ext-popout-player div.player-container embed,\n\
body.ext-popout-player div#watch-player embed,\n\
body.ext-popout-player div#watch7-player embed,\n\
body.ext-popout-player div#watch-player div#video-player,\n\
body.ext-popout-player div#watch7-player div#video-player {\n\
	width: @width px !important;\n\
	height: @height px !important;\n\
	margin: auto;\n\
	margin-top: @topmargin px;\n\
	z-index: 987655;\n\
	position: relative;\n\
	background-color: transparent;\n\
	display: block;\n\
}\n"
}

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

var videoFormat = {
		 '0': ["unknown", "n/a [n/a (n/a px, n/aMbit/s); n/a (n/akHz, n/akbit/s)]"],

		 '5': ["240p", "FLV [Sorenson H.263 (400×240px, 0.25Mbit/s); MP3 (22.05kHz, 64kbit/s)]"],
		 '6': ["270p", "FLV [Sorenson H.263 (400×270px, 0.8Mbit/s); MP3 (22.05kHz, 64kbit/s)]"],
		"34": ["360p", "FLV [MPEG-4 AVC (640×360px, 0.5Mbit/s); AAC (44.1kHz, 128kbit/s)]"],
		"35": ["480p", "FLV [MPEG-4 AVC (854×480px, 0.8-1Mbit/s); AAC (44.1kHz, 128kbit/s)]"],

		"18": ["Medium", "MP4 [MPEG-4 AVC (480×360px, 0.5Mbit/s); AAC (44.1kHz, 96kbit/s)]"],

		"22": ["HD 720p", "MP4 [MPEG-4 AVC (1280×720px, 2-3Mbit/s); AAC (44.1kHz, 152kbit/s)]"],
		"37": ["HD 1080p", "MP4 [MPEG-4 AVC (1920×1080px, 3.5-5Mbit/s); AAC (44.1kHz, 152kbit/s)]"],
		"38": ["Extra HD 4K", "MP4 [MPEG-4 AVC 4096×3072px; AAC (48kHz, 152kbit/s)]"],

		"43": ["WebM 360p", "WebM [VP8 (640×360px, 0.5Mbit/s); Vorbis (44.1kHz, 128kbit/s)]"],
		"44": ["WebM 480p", "WebM [VP8 (854×480px, 1Mbit/s); Vorbis (44.1kHz, 128kbit/s)]"],
		"45": ["WebM 720p", "WebM [VP8 (1280×720px, 2Mbit/s); Vorbis (44.1kHz, 192kbit/s)]"],
		"46": ["WebM 1080p", "WebM [VP8 (1920×1080px, 4Mbit/s); Vorbis (44.1kHz, 256kbit/s)]"],

		"82": ["360p 3D", "MP4 [MPEG-4 AVC (640×360px, 0.5Mbit/s); AAC (44.1kHz, 128kbit/s)]"],
		"83": ["480p 3D", "MP4 [MPEG-4 AVC (854×480px, 0.8-1Mbit/s); AAC (44.1kHz, 128kbit/s)]"],
		"84": ["HD 720p 3D", "MP4 [MPEG-4 AVC (1280×720px, 2-3Mbit/s); AAC (44.1kHz, 152kbit/s)]"],
		"85": ["HD 1080p 3D", "MP4 [MPEG-4 AVC (1920×1080px, 3.5-5Mbit/s); AAC (44.1kHz, 152kbit/s)]"],

		"100": ["WebM 360p 3D", "WebM [VP8 (640×360px, 0.5Mbit/s); Vorbis (44.1kHz, 128kbit/s)]"],
		"101": ["WebM 480p 3D", "WebM [VP8 (854×480px, 1Mbit/s); Vorbis (44.1kHz, 128kbit/s)]"],
		"102": ["WebM 720p 3D", "WebM [VP8 (1280×720px, 2Mbit/s); Vorbis (44.1kHz, 192kbit/s)]"],
		"103": ["WebM 1080p 3D", "WebM [VP8 (1920×1080px, 4Mbit/s); Vorbis (44.1kHz, 256kbit/s)]"],

		"13": ["Mobile (shit)", "3GP [Sorenson H.263 (176×144px, n/aMbit/s); (AMR 8kHz, n/akHz)]"],
		"17": ["Mobile (low)", "3GP [MPEG-4 Visual (176×144px, 0.06Mbit/s); AAC (22.05kHz, 24kbit/s)]"],
		"36": ["Mobile (high)", "3GP [MPEG-4 Visual (320×240 x, 0.25Mbit/s); AAC (22.05kHz, 64kbit/s)]"]
	};
	
  // This are default preferences. They can be changed on preferences page.
  // Default preferences will not change YouTube behaviour.
  var defaultPreferences = {
  		// Hide ads on page.
  		hidepageads: true,
  		// Hide ads in video player.
  		hideplayerads: true,
  		// Hide annotations in flash player.
  		hideannotations: false,
  		// Auto-hide player controls.
  		// 0 = controls and progress bar always visible,
  		// 1 = controls and progress bar will be hidden after few seconds,
  		// 2 = controls will be visible and progress bar will be minimised
  		//     after few seconds,
  		// 3 = controls will be hidden and progress bar will be minimised
  		//     after few seconds.
  		hidecontrols: 3,
  		// What theme to use for video player.
  		// Can be "dark" or "light".
  		playertheme: "dark",
  		// What colour to use for video player’s progress bar.
  		// Can be "red" or "white".
  		progresscolor: "red",
  		// What type of messages should be logged to error console.
  		// 0 = nothing, 1 = errors, 2 = warnings, 3 = informations.
  		loglevel: 1,
  		// Custom actions.
  		actions: {},
  		// Use this language.
  		locale: "en",
  		// If set to “true” language will always be English or whatever
  		// language user chooses.
  		overridelocale: false,
  		// Respect autoplay option on channels.
  		channelautoplay: false,
  		// Make video player expanded.
  		enablewideplayer: false,
  		// Force this video quality. Can be one of: "default", "small",
  		// "medium", "large", "hd720", "hd1080" or "highres".
  		videoquality: "default",
  		// Add download button and menu to page.
  		enabledownload: false,
  		// Use falback servers for video download links.
  		usefallbacklinks: false,
  		// Show preferences button on page.
  		prefbutton: false,
  		// Play video over and over again.
  		loop: false,
  		// Force video loop in playlists.
  		forceloop: false,
  		// Add loop button to page.
  		loopbutton: false,
  		// Add few more buttons.
  		extrabuttons: false,
  		// Add player pop out button.
  		enablepopout: false,
  		// Display real video size on pop out.
  		popoutrealsize: false,
  		// Enable lyrics to be loaded.
  		lyrics: false,
  		// Enable thumbnail video preview.
  		thumbpreview: false,
  		// What will trigger preview.
  		// Can be "hover" or "button".
  		thumbpreviewtrigger: "button",
  		// Whether to show video ratings over thumbnails.
  		ratevideos: false,
  		// While seeking back/forward seek for this number of seconds.
  		seektime: 3,
  		// When saving video replace invalid characters whit this.
  		replace: '',
  		// Enable keyboard shortcuts.
  		enableshortcutkeys: false,
  		// Make player shortcuts work if player is not focused.
  		exposeplayershortcuts: false,
  		// Disable flash player shortcuts when they are exposed to page.
  		disableflashshortcuts: /Linux|BSD|Mac/.test(window.navigator.platform),
  		// Keyboard shortcuts.
  		shortcut: {
  			// Enable/disable section loop.
  			loopsection: '',
  			// Mark section start time.
  			marksectionstart: '',
  			// Mark section end time.
  			marksectionend: '',
  			// Play/pause video.
  			playpause: '',
  			// Play just one frame.
  			framestep: '',
  			// Jump few second back.
  			seekback: '',
  			// Jump few second forward.
  			seekforward: '',
  			// Expand/shrink video player.
  			expandplayer: '',
  			// Pop-out player.
  			popplayer: '',
  			// Show/hide lyrics
  			showlyrics: '',
  			// Enable/disable custom colours.
  			togglecolors: '',
  			// Enable/disable custom CSS.
  			togglecss: '',
  			// Hide/show all elements on page.
  			hideall: '',
  			// Temporary show elements hidden by “page clean-up”.
  			showhidden: ''
  		},
  		// Remove various parts of page on “watch” pages.
  		cleanwatch: {
  			// Hide bar at top of the page that shows news like stuff.
  			ticker: false,
  			// Hide page header (logo, search form, links).
  			header: false,
  			// Hide video title.
  			videotitle: false,
  			// Headline user information.
  			headuser: false,
  			// Subscribe button.
  			subscribe: false,
  			// Hide branding info from page.
  			brand: false,
  			// Whole sidebar.
  			allsidebar: false,
  				// Featured videos in sidebar.
  				featured: false,
  				// Suggested videos in sidebar.
  				suggestions: false,
  			// All buttons beneath the player.
  			allbuttons: false,
  				// Like/dislike this button.
  				likebutton: false,
  				// Add to queue/favourites/playlist button.
  				addtobutton: false,
  				// Share this video button.
  				sharebutton: false,
  				// Get video embed code button.
  				embedbutton: false,
  				// Flag as inappropriate button.
  				flagbutton: false,
  				// Show video statistics button.
  				statsbutton: false,
  				// Interactive Transcript button.
  				transcript: false,
  			// Video view counter.
  			viewcount: false,
  			// Flash promo.
  			flashpromo: false,
  			// Video description.
  			description: false,
  			// All comments.
  			allcomments: false,
  				// Up-loader’s comments.
  				uploader: false,
  				// Top rated comments.
  				toprated: false,
  				// Video responses.
  				responses: false,
  				// Comments (titled as “All comments”).
  				comments: false,
  			// Page footer.
  			footer: false
  		},
  		// Add custom CSS to page.
  		enablecustomstyle: false,
  		// Custom style to add to page.
  		customstyle: '',
  		// Show only videp player when Opera is in full screen mode.
  		fullscreenstyle: false,
  		// Replace YouTube logo.
  		customlogo: false,
  		// Use light icons for buttons added by extension.
  		uselighticons: false,
  		// Redefine colours on page.
  		enablecustomcolors: false,
  		// Redefined colours. Can be any CSS acceptable colour.
  		// See http://www.w3.org/TR/css3-color/#colorunits.
  		customcolor: {
  			pagebackground: "#ffffff",
  			pagecolor: "#000000",
  			linkcolor: "#0033cc",
  			videolinkhover: "#d1e1fa",
  			videothumbbackground: "#ffffff",
  			buttonbackground: "#f6f6f6",
  			buttonbackgroundhover: "#f3f3f3",
  			buttonborder: "#cccccc",
  			buttoncolor: "#000000",
  			titlecolor: "#333333",
  			commenthover: "#eeeeee",
  			infocolor: "#666666"
  		},
  		// Disable autoplay on new videos.
  		disableautoplay: false,
  		// Disable autoplay on every video.
  		disableautoplayalways: false,
  		// Play video when page is focused.
  		playonfocus: false,
  		// Play video only if tab is focused first time.
  		onlyonfirstfocus: false,
  		// Force play on focus.
  		forceplayonfocus: false,
  		// Add button to toolbar.
  		addtoolbarbutton: false,
  		// Add pop-up to toolbar button.
  		addbuttonpopup: true,
  		// Add pop-up to toolbar button even if there’s
  		// one video available to control.
  		buttonpopupalways: true,
  		// Check for update on start-up.
  		updatecheck: true,
  		// Check for unapproved versions.
  		unapprovedcheck: false
  	};

  // This preferences are not shown in preferences page.
  // They can be changed only via Opera Dragonfly.
  var hiddenPreferences = {
  		// Current ExtendTube version.
  		version: extVersion,
  		// When showing/hiding lyrics should page be scrolled for
  		// lyrics or video to be visible.
  		scrollonlyricsdisplay: true,
  		// Show lyrics button always. If set to “true” lyrics button
  		// will be always visible. If not, ExtendTube will search for
  		// artist and title and, only if find any, add a button.
  		lyricsenablealways: false,
  		// Whether lyrics search log should remain visible upon completed search.
  		lyricssearchlog: false,
  		// Should history navigation mode be overridden. If set to “false” can
  		// cause problems while navigating through tab history (like video not
  		// being played on page load and toolbar button showing wrong video count).
  		overridehistory: true,
  		// Mouse hover delay for thumbnail preview.
  		thumbhoverdelay: 3000,
  		// How fast pop-up should be updated (milliseconds).
  		popupupdateinterval: 456,
  		// Interval at which to check for new version (in hours).
  		updateinterval: 5,
  		// Time of last check for update (UNIX time).
  		// This value will schedule update for five minutes after first run.
  		updatechecktime: Date.now() - 36e5 * (5 - 1 / 12),
  		// Style used by injected scripts.
  		style: style,
  		// Localised strings used by injected scripts.
  		localisedStrings: localisedStrings,
  		// Details about available video formats (used by injected scripts).
  		videoFormat: videoFormat
  	};

  // This are recommended preferences. This object contain parts of
  // “defaultPreferences” and “hiddenPreferences” that is recommended and
  // will be set when extension is installed.
  var recommendedPreferences = {
  		hideannotations: true,
  		enabledownload: true,
  		loop: true,
  		loopbutton: true,
  		extrabuttons: true,
  		enablepopout: true,
  		thumbpreview: true,
  		lyrics: true,
  		enableshortcutkeys: true,
  		exposeplayershortcuts: true,
  		shortcut: {
  			loopsection: 'o',
  			marksectionstart: '[',
  			marksectionend: ']',
  			playpause: "Space",
  			framestep: '.',
  			seekback: "Left",
  			seekforward: "Right",
  			expandplayer: 'w',
  			popplayer: 'b',
  			showlyrics: 'l',
  			togglecolors: 'c',
  			togglecss: 's',
  			hideall: 'h',
  			showhidden: 'a'
  		},
  		cleanwatch: {
  			brand: true,
  			sharebutton: true,
  			embedbutton: true,
  			flagbutton: true,
  			statsbutton: true,
  			flashpromo: true,
  			responses: true,
  			footer: true
  		},
  		replace: ' ',
  		disableautoplay: true,
  		onlyonfirstfocus: true,
  		addtoolbarbutton: true,
  		customcolor: {
  			pagebackground: "#2b394a",
  			pagecolor: "#c3c3c3",
  			linkcolor: "#00a2e8",
  			videolinkhover: "hsla(214, 37.5%, 59.216%, 0.38)",
  			videothumbbackground: "#4c7780",
  			buttonbackground: "#2c4552",
  			buttonbackgroundhover: "#2c5152",
  			buttonborder: "hsla(198, 100%, 45.49%, 0.58)",
  			buttoncolor: "#ffc90e",
  			titlecolor: "#f37318",
  			commenthover: "hsla(213, 26.627%, 33.137%, 0.65)",
  			infocolor: "#22b14c"
  		},
  		customstyle: "\
  /* This style is just an example. It may not work at all. */\n\
  #homepage-sidebar-ads,\n\
  #default-language-box {\n\
  	display: none !important;\n\
  }\n\
  .yt-uix-button-player:focus {\n\
  	outline: none !important;\n\
  }",
  		fullscreenstyle: true,
  		actions: {
  			"EXAMPLE-expand-video-description": {
  				enabled: false,
  				exec: "\
  // This action is just an example. It may not work at all.\n\
  var description = document.querySelector(\"#watch-description\");\n\
  if (description)\n\
  	description.classList.remove(\"yt-uix-expander-collapsed\");\n",
  				trigger: "DOMContentLoaded"
  			},
  			"EXAMPLE-prevent-video-autobuffering": {
  				enabled: false,
  				exec: "\
  // This action is just an example. It may not work at all.\n\
  window.setTimeout(function () {\n\
  	xtt.player.control(\"stop\");\n\
  }, 1000);\n",
  				trigger: "player ready"
  			},
  			"I'M-NOT-GUINEA-PIG": {
  				enabled: true,
  				exec: "\
  // This action will be enabled on every strtup.\n\
  // If you want to disable it change its code.\n\
  var expUI = [\"jZNC3DCddAk\", \"vSPn-CmshUU\", \"9UnXBzJIHDc\", \"pfnTZqEKHEE\", \"eKxEWQ3xcc8\", \"wyVhs9Df-0E\"],\n\
  	expCookie = xtt.getCookie(\"VISITOR_INFO1_LIVE\");\n\
  \n\
  if (expCookie && -1 < expUI.indexOf(expCookie)) {\n\
  	document.cookie = \"VISITOR_INFO1_LIVE=; path=/; domain=.youtube.com\";\n\
  	window.location.reload();\n\
  }\n",
  				trigger: "immediately"
  			}
  		}
  	};

  // Check to see if preferences are removed or preferences structure is changed
  // from outside of extension (e.g. via Dragonfly) and fix if necessary.
  function comparePrefs() {
  	var version = pref.getItem("version"),
  		defs = Object.union(defaultPreferences, hiddenPreferences);
  	if (version && String.natcmp(version, extVersion) < 0) {
  		exportPreferences();
  		checkOldStructure();

  		pref.setPref("style", defaultPreferences.style);
  		pref.setPref("localisedStrings", defaultPreferences.localisedStrings);
  		pref.setPref("videoFormat", defaultPreferences.videoFormat);
  	}

  	log.info("prefs:",
  		"Comparing preferences structure."
  	);

  	var changes = compareStructure(defs);
  	var changedItems = changes.wrong.concat(changes.missing.filter(function (item) { return !/^actions\./.test(item); }));

  	// If there are changes restore them from recommended preferences.
  	if (changedItems.length) {
  		defs = Object.union(recommendedPreferences, defs);

  		changedItems.forEach(function (item) {
  		  
  			var key = item.split('.');
  			var newPref = defs[key[0]];

  			if (key[1]) {
  				newPref = pref.getPref(key[0]);
  				newPref[key[1]] = defs[key[0]][key[1]];
  			}

  			pref.setPref(key[0], newPref);
  		});

  		log.warn("prefs:",
  			"Preferences structure is changed outside of the extension. Changes are set to recommended preferences.",
  			"Changed items are:",
  			changedItems.join(", ") + '.'
  		);
  	}
  	else {
  		log.info("prefs:",
  			"Preferences structure is OK."
  		);
  	}

  	checkActions();
  }

  // Compare structure of given object with preferences.
  function compareStructure(object) {
  	var prefs = {},
  		keys = Object.keyUnion(defaultPreferences, hiddenPreferences);

  	// Build preferences structure.
  	keys.forEach(function (key) {
  		if (key != "version" && key != "firstrun")
  			prefs[key] = pref.getPref(key);
  	});

  	var diff = {
  			// Missing from preferences.
  			missing: Object.keyComplement(prefs, object),
  			// Not part of preferences.
  			excess: Object.keyComplement(object, prefs),
  			// Type of properties is different.
  			wrong: []
  		};

  	Object.keyIntersection(object, prefs).forEach(function (key) {
  		// Item deleted by Opera.
  		if (prefs[key] === null)
  			diff.missing.push(key);
  		// Items are not of same type.
  		else if (Object.internalClass(prefs[key]) != Object.internalClass(object[key]))
  			diff.wrong.push(key);
  		else if (Object.isObject(prefs[key])) {
  			var objdiff = {
  					missing: Object.keyComplement(object[key], prefs[key]),
  					excess: Object.keyComplement(prefs[key], object[key]),
  					wrong: []
  				};

  			Object.keyIntersection(object[key], prefs[key]).forEach(function (seckey) {
  				if (typeof prefs[key][seckey] != typeof object[key][seckey])
  					objdiff.wrong.push(seckey);
  			});

  			diff.missing = diff.missing.concat(objdiff.missing.map(function (element) { return key + '.' + element; }));
  			diff.excess = diff.excess.concat(objdiff.excess.map(function (element) { return key + '.' + element; }));
  			diff.wrong = diff.wrong.concat(objdiff.wrong.map(function (element) { return key + '.' + element; }));
  		}
  	});

  	return diff;
  }

  // Reset all preferences to default.
  function loadDefaultPreferences() {
  	for (var key in defaultPreferences) {
  		// Skip this ones.
  		if (/firstrun|version|updatechecktime/.test(key))
  			continue;

  		pref.setPref(key, defaultPreferences[key]);
  	}

  	log.info("prefs:",
  		"Preferences are (re)setted to default values."
  	);
  }

  // This function will change recommended preferences but other will be left unchanged.
  function loadRecommendedPreferences(all) {
  	for (var key in recommendedPreferences) {
  		if (!all && /customstyle|actions/.test(key))
  			continue;

  		/*if (Object.isObject(recommendedPreferences[key]))
  			pref.setPref(key, Object.union(recommendedPreferences[key], pref.getPref(key)));
  		else*/
  			pref.setPref(key, recommendedPreferences[key]);
  	}

  	checkActions(true);

  	log.info("prefs:",
  		"Some preferences are (re)setted to recommended values."
  	);
  }

  // Export preferences for later import.
  function exportPreferences(event) {
  	var exp = {};
  	for (var key in defaultPreferences)
  		exp[key] = pref.getPref(key);
  	for (key in hiddenPreferences)
  		exp[key] = pref.getPref(key);

  	delete exp.localisedStrings;
  	delete exp.style;
  	delete exp.videoFormat;
  	exp = window.JSON.stringify(exp, null, 4);

  	var header ="\
  // ╭───────────────────────────────────────────────────╮\n\
  // │ Please save this file so you can import it later. │\n\
  // ╰───────────────────────────────────────────────────╯\n\
  //\n\
  // ExtendTube: Exported preferences\n\
  // date, time: " + (new Date()).format("%e.%m.%Y, %T").trim() + "\n\
  //    version: " + pref.getItem("version") + "\n\n";

  	var tab = {
  		url: "data:application/javascript," + window.encodeURIComponent(header + exp),
  		focused: true
  	};

  	if (bgProcess)
  		bgProcess.extension.tabs.create(tab);
  	else
  		extension.tabs.create(tab);

  	log.info("prefs:",
  		"Preferences are exported."
  	);
  }

  // Check for old preferences structure and convert them to new one.
  function checkOldStructure() {
  	var actions = pref.getPref("actions");

  	if (Array.isArray(actions)) {
  		var newpref = {}
  		actions.forEach(function (action) {
  			newpref[action.id] = {};
  			newpref[action.id].enabled = action.enabled;
  			newpref[action.id].exec = action.exec;
  			newpref[action.id].trigger = action.when;
  		});

  		pref.setPref("actions", newpref);

  		log.warn("prefs:",
  			"An old structure for actions detected and converted to new one."
  		);
  	}
  	else if (Object.isObject(actions)) {
  		var changed = false;
  		for (var id in actions) {
  			if (actions[id].when) {
  				actions[id].trigger = actions[id].when;
  				delete actions[id].when;
  				changed = true;
  			}
  		}

  		if (changed) {
  			pref.setPref("actions", actions);

  			log.warn("prefs:",
  				"An old structure for actions detected and converted to new one."
  			);
  		}
  	}
  }

  // Check if necessary actions are present.
  function checkActions(restoreCode) {
  	var actions = pref.getPref("actions"),
  		changed = false;

  	if (!Object.isObject(actions)) {
  		log.error("prefs:",
  			"Could not get actions from widget storage."
  		);
  		return;
  	}

  	if (!actions.hasOwnProperty("I'M-NOT-GUINEA-PIG") || restoreCode) {
  		actions["I'M-NOT-GUINEA-PIG"] = recommendedPreferences.actions["I'M-NOT-GUINEA-PIG"];
  		changed = true;
  	}
  	else {
  		if (!actions["I'M-NOT-GUINEA-PIG"].enabled) {
  			actions["I'M-NOT-GUINEA-PIG"].enabled = true;
  			changed = true;
  		}
  		if (actions["I'M-NOT-GUINEA-PIG"].trigger != "immediately") {
  			actions["I'M-NOT-GUINEA-PIG"].trigger = true;
  			changed = true;
  		}
  	}

  	if (changed) {
  		pref.setPref("actions", actions);

  		log.warn("prefs:",
  			"I'M-NOT-GUINEA-PIG action restored."
  		);
  	}
  }
  
  window.addEventListener("load", pageLoaded, false);

  var /**
  	 * This object will hold references to all tabs containing video.
  	 * Every property will be new object whose key is tab (video) ID.
  	 * This new object will have structure as described below:
  	 *
  	 * ID.firstplay (Boolean) - true if video is never played
  	 * ID.focused (Boolean) - true if tab is currently focused
  	 * ID.playing (Boolean) - true if video is playing
  	 * ID.source (WindowProxy) - reference to tab (for sending messages)
  	 * ID.origin (String) - URI of page
  	 * ID.title (String) - title of the video
  	 */
  	video = {},
  	// Number of videos in list.
  	videocount = 0,
  	// Reference to toolbar button and tab associated with it.
  	toolbar = {
  		button: null,
  		videoid: ''
  	},
  	// This object will hold references to intervals which tries to ping
  	// opened tabs to see if they are still alive.
  	ping = {},
  	// Reference to log viewer window.
  	logViewer = null,
  	// Reference to time-out that checks for update.
  	updateTimeout = NaN;

  // Load event listener.
  function pageLoaded(event) {
  	if (!checkPreferences()) {
  		log.error("An error occurred during startup process. Background process cannot be started.");
  		return;
  	}
  	
  	// Check if this is first run.
  	if (pref.getPref("firstrun") === null) {
  		extension.tabs.create({
  			url: extensionAddress + "/share/page/firstrun.html",
  			focused: true
  		});

  		log.info("Extension is run for the first time. Recommended preferences will be loaded.");

  		loadRecommendedPreferences(true);
  		pref.setPref("firstrun", false);
  		pref.setPref("version", extVersion);
  	}
  	// Check if extension is updated.
  	else if (String.natcmp(pref.getItem("version"), extVersion) < 0) {
  		extension.tabs.create({
  			url: extensionAddress + "/share/page/update.html#old=" + pref.getItem("version"),
  			focused: true
  		});

  		log.info("Extension is updated from version", pref.getItem("version"), "to", extVersion, '.');

  		pref.setPref("version", extVersion);
  	}

  	extension.addEventListener("connect", connected, false);
  	extension.addEventListener("disconnect", disconnected, false);
  	extension.addEventListener("message", messageReceived, false);
  	window.addEventListener("storage", storageChanged, false);

  	log.Info("Background process started.");

  	extension.broadcastMessage({ subject: "background process started" });

  	checkForUpdate();
  }

  function checkPreferences() {
  	// Check if widget storage is available.
  	try {
  		pref.setItem("test", "test");
  	}
  	// If an error occurs display error message and abort.
  	catch (error) {
  		var message = "Widget storage area is disabled.\n\
  				Widget storage is needed to store preferences.",
  			url = extensionAddress + "/share/page/error.html#";

  		extension.tabs.create({
  			url: url + window.encodeURIComponent(message),
  			focused: true
  		});

  		log.error("Widget storage area is disabled.",
  			"Error message: " + error.message + '.'
  		);
  		return false;
  	}
  	pref.removeItem("test");

  	// Compare preferences structure.
  	comparePrefs();

  	return true;
  }

  // Run when connection with script(s) is established.
  function connected(event) {
  	if (event.origin == extensionAddress + "/share/page/log.html")
  		logViewer = event.source;
  }

  // Run when connection with script(s) is lost.
  function disconnected(event) {
  	if (event.origin == extensionAddress + "/share/page/popup.html")
  		extension.broadcastMessage({ subject: "popup closed" });
  	else if (event.origin == extensionAddress + "/share/page/log.html")
  		logViewer = null;
  	else if (/^widget.+index\.html$|\.youtube\.com/.test(event.origin))
  		removeTab(event);
  }

  // Storage event does not fire when preferences are changed from
  // background process so we will create one.
  function fireStorageEvent(key, oldValue) {
  	var event = window.document.createEvent("StorageEvent");

  	event.initStorageEvent("storage", true, false, key, oldValue, pref.getItem(key), window.location.href, pref);
  	window.dispatchEvent(event);

  	log.info("Storage event is manually fired.\n",
  		{
  			key: key,
  			oldValue: oldValue,
  			newValue: pref.getItem(key)
  		}
  	);
  }

  // Monitor changes in preferences and send them to all tabs.
  function storageChanged(event) {
  	switch (event.key) {
  		case "addtoolbarbutton":
  			if (event.newValue == "true") {
  				if (pref.getPref("updatecheck"))
  					removeToolbarButton(true);
  				addToolbarButton();
  			}
  			else
  				removeToolbarButton(true);
  			break;
  		case "addbuttonpopup":
  		case "buttonpopupalways":
  			if (toolbar.button) {
  				removeToolbarButton(true);
  				addToolbarButton();
  			}
  			break;
  		case "updatecheck":
  			checkForUpdate(event.newValue == "true");
  	}

  	if (!needed(event.key))
  		return;

  	var message = {
  			subject: "set preferences",
  			key: event.key,
  			data: {}
  		};
  	message.data[event.key] = pref.getPref(event.key);
  	extension.broadcastMessage(message);

  	log.info("Some preferences are changed. Changes are dispatched to injected scripts.");
  }

  // Says if preferences are needed in injected script.
  function needed(key) {
  	switch (key) {
  		case "addbuttonpopup":
  		case "addtoolbarbutton":
  		case "buttonpopupalways":
  		case "disableautoplay":
  		case "disableautoplayalways":
  		case "firstrun":
  		case "forceplayonfocus":
  		case "onlyonfirstfocus":
  		case "playonfocus":
  		case "popupupdateinterval":
  		case "unapprovedcheck":
  		case "updatecheck":
  		case "updatechecktime":
  		case "updateinterval":
  		case "version":
  			return false;
  	}

  	return true;
  }

  // Inbox (with spam filter :)).
  function messageReceived(event) {
  	var data = event.data.data,
  		subject = event.data.subject;

  	// Spam filter.
  	switch (subject) {
  		// New window is ready to receive messages.
  		case "hello":
  			log.info("Got greetings form " + event.origin + '.');

  			var play = true;
  			if (pref.getPref("disableautoplay")) {
  				if (pref.getPref("disableautoplayalways"))
  					play = false;
  				else {
  					for (var id in video) {
  						if (video[id].playing)
  							play = false;
  					}
  				}
  			}

  			sendMessage(event, {
  				subject: "auto play",
  				data: {
  					autoplay: play
  				}
  			});

  			log.info("Autoplay option is sent to injected script on " + event.origin + '.',
  				"Autoplay is “" + play + "“."
  			);
  			break;
  		case "add tab":
  			log.info("Received request to add video to list.",
  				"From " + event.origin + '.'
  			);
  			addTab(event);
  			break;
  		case "remove tab":
  			log.info("Received request to remove video from list.",
  				"From " + event.origin + '.'
  			);
  			removeTab(event);
  			break;
  		case "player ready":
  			sendMessage(event, event.data);

  			if (!data.id || !video[data.id]) {
  				log.warn("Got “player ready” message but video is not in list! Asking for video info.",
  					"From " + event.origin + '.'
  				);
  				sendMessage(event, { subject: "give me info" });
  			}
  			else
  				log.info("Player on page " + data.id + " is ready to play video.");
  			break;
  		case "player state changed":
  			if (!data.id) {
  				log.warn("Player changed state but video ID is missing! Asking for ID.",
  					"New state: " + data.state + '.',
  					"From " + event.origin + '.'
  				);
  				sendMessage(event, { subject: "give me info" });
  				break;
  			}
  			else if (!video[data.id]) {
  				log.warn("Player changed state but video is not in list! Asking for video info.",
  					"New state:" + data.state + '.',
  					"From " + event.origin + '.'
  				);
  				sendMessage(event, { subject: "give me info" });
  				break;
  			}

  			log.info("Player on page " + data.id + " changed state to " + data.state + '.');

  			switch (data.state) {
  				case 0:
  					video[data.id].playing = false;
  					if (pref.getPref("loop")) {
  						sendMessage(event, {
  							subject: "player action",
  							data: {
  								exec: "play"
  							}
  						});
  					}
  					break;
  				case 1:
  					video[data.id].playing = true;
  					video[data.id].firstplay = false;
  					toolbar.videoid = data.id;

  					if (pref.getPref("disableautoplay")) {
  						for (var id in video) {
  							if (id != data.id) {
  								sendMessage(video[id], {
  									subject: "player action",
  									data: {
  										exec: "pause"
  									}
  								});
  							}
  						}
  					}
  					break;
  				case 2:
  				case -1:
  					video[data.id].playing = false;
  			}

  			updateToolbarButton();
  			break;
  		case "toggle loop":
  			var oldValue = pref.getPref("loop");
  			pref.setPref("loop", !oldValue);
  			fireStorageEvent("loop", oldValue);
  			break;
  		case "toggle custom colors":
  			var oldValue = pref.getPref("enablecustomcolors");
  			pref.setPref("enablecustomcolors", !oldValue);
  			fireStorageEvent("enablecustomcolors", oldValue);
  			break;
  		case "toggle custom css":
  			var oldValue = pref.getPref("enablecustomstyle");
  			pref.setPref("enablecustomstyle", !oldValue);
  			fireStorageEvent("enablecustomstyle", oldValue);
  			break;
  		case "load external resource":
  			loadExternalResource(event.data, event.source);
  			break;
  		case "show preferences":
  			extension.tabs.create({
  				url: extensionAddress + "/options.html#preferences",
  				focused: true
  			});
  			break;
  		case "show bug report window":
  			extension.tabs.create({
  				url: extensionAddress + "/share/page/bug-report.html",
  				focused: true
  			});
  			break;
  		case "tab focused":
  			if (!data.id || !video[data.id]) {
  				if (!data.player)
  					break;

  				log.warn("Tab is focussed but video ID is missing or video is not in video list! Asking for video info.");
  				sendMessage(event, { subject: "give me info" });
  				break;
  			}
  			else
  				log.info("Tab with video " + data.id + " is focused.");

  			if (pref.getPref("playonfocus") && !video[data.id].focused) {
  				var play = true;
  				if (!pref.getPref("forceplayonfocus")) {
  					if (pref.getPref("onlyonfirstfocus") && !video[data.id].firstplay)
  						play = false;

  					if (play) {
  						for (var id in video) {
  							if (video[id].playing)
  								play = false;
  						}
  					}
  				}

  				if (play) {
  					sendMessage(event, {
  						subject: "player action",
  						data: {
  							exec: "play"
  						}
  					});
  				}
  			}

  			video[data.id].focused = true;
  			break;
  		case "tab blurred":
  			if (data.id && video[data.id]) {
  				video[data.id].focused = false;
  				log.info("Tab with video " + data.id + " lost focus.");
  			}
  			break;
  		case "echo replay":
  			if (ping[data.id]) {
  				ping[data.id].replay = true;

  				if (ping[data.id].timeout) {
  					window.clearTimeout(ping[data.id].timeout);
  					ping[data.id].timeout = null;
  				}
  			}
  			else {
  				log.warn("Received echo replay from unknown page.",
  					"ID: " + data.id + '.',
  					"Asking for video info."
  				);
  				sendMessage(event, { subject: "give me info" });
  			}
  			break;
  		case "here is message log":
  			if (logViewer)
  				logViewer.postMessage(event.data, [event.source]);
  	}
  }

  // Add tab to the list of tabs.
  function addTab(event) {
  	var data = event.data.data;
  	if (!data.id) {
  		log.warn("Cannot add video to list! Missing video ID.");
  		return;
  	}

  	var playing = false;
  	if (data.state == 1)
  		playing = true;

  	if (video[data.id]) {
  		video[data.id].playing = playing;
  		video[data.id].source = event.source;
  		video[data.id].title = data.title;

  		if (ping[data.id].timeout) {
  			window.clearTimeout(ping[data.id].timeout);
  			ping[data.id].timeout = null;

  			log.info("Page found. It wont be removed from list.");
  		}

  		log.info("Video is already in list. Video data is updated. ID: " + data.id + '.');
  	}
  	else {
  		video[data.id] = {
  			firstplay: true,
  			focused: false,
  			playing: playing,
  			source: event.source,
  			origin: event.origin,
  			title: data.title
  		};
  		videocount++;

  		log.info("New video added to list. Video ID: " + data.id + '.');

  		// Start pinging injected scripts to see if they’re still alive.
  		ping[data.id] = {
  			replay: true,
  			interval: window.setInterval(function () {
  				echo(data.id);
  			}, 1551)
  		};
  	}

  	// Add toolbar button if needed.
  	if (pref.getPref("addtoolbarbutton")) {
  		if (toolbar.button === null) {
  			toolbar.videoid = data.id;
  			addToolbarButton();
  		}
  		else if (toolbar.button.popup === null) {
  			removeToolbarButton(true);
  			addToolbarButton();
  		}
  		else
  			updateToolbarButton();
  	}
  }

  // Remove tab from list and toolbar button if this is only tab.
  function removeTab(event) {
  	var previd = null,
  		removed = false,
  		prevcount = videocount;

  	// Remove tab and find previous/next tab.
  	for (var id in video) {
  		if (video[id].source == event.source) {
  			window.clearInterval(ping[id].interval);
  			delete ping[id];
  			delete video[id];
  			videocount--;

  			log.info("Video is removed from list. Video ID: " + id + '.');

  			if (previd)
  				break;

  			removed = true;
  		}
  		else {
  			previd = id;
  			if (removed)
  				break;
  		}
  	}

  	// If there are more tabs in list update toolbar button.
  	if (previd && video[previd]) {
  		toolbar.videoid = previd;
  		updateToolbarButton();
  	}
  	// Else remove button from toolbar.
  	else {
  		if (toolbar.button && prevcount > videocount)
  			log.info("Video list is empty. Toolbar button may be removed from toolbar.");

  		toolbar.videoid = '';
  		removeToolbarButton(prevcount > videocount);
  	}
  }

  function addToolbarButton() {
  	// Add button only if there is tab to associate it with or
  	// there is no available update.
  	if (toolbar.button || !toolbar.videoid && !availableUpdate)
  		return;

  	var button = {
  			badge: {
  				backgroundColor: "hsla(60, 100%, 50%, .4)",
  				color: "#a52a2a",
  				display: "block",
  				textContent: '0'
  			},
  			disabled: false,
  			icon: "share/image/toolbar-button.png",
  			title: ''
  		};

  	if (pref.getPref("addtoolbarbutton") && pref.getPref("buttonpopupalways") && videocount || pref.getPref("addbuttonpopup") && videocount > 1) {
  		button.popup = {
  			href: "share/page/popup.html",
  			height: 1,
  			width: 350
  		};
  	}

  	toolbar.button = opera.contexts.toolbar.createItem(button);
  	opera.contexts.toolbar.addItem(toolbar.button);

  	if (!button.popup)
  		toolbar.button.addEventListener("click", toolbarButtonListener,false);

  	log.info("Button added to extension’s toolbar.");

  	updateToolbarButton();
  }

  function removeToolbarButton(force) {
  	if (toolbar.button && (force || !availableUpdate)) {
  		opera.contexts.toolbar.removeItem(toolbar.button);
  		toolbar.button = null;

  		log.info("Button is removed from extension’s toolbar.");
  	}

  	if (pref.getPref("updatecheck") && availableUpdate)
  		addToolbarButton();
  }

  // Executed when user click on toolbar button.
  function toolbarButtonListener(event) {
  	if (pref.getPref("addtoolbarbutton") && toolbar.videoid) {
  		if (video[toolbar.videoid].playing) {
  			sendMessage(video[toolbar.videoid], {
  				subject: "player action",
  				data: {
  					exec: "pause"
  				}
  			});
  		}
  		else {
  			sendMessage(video[toolbar.videoid], {
  				subject: "player action",
  				data: {
  					exec: "play"
  				}
  			});
  		}
  	}
  	else if (pref.getPref("updatecheck") && availableUpdate) {
  		extension.tabs.create({
  			url: extensionAddress + "/share/page/update.html#available",
  			focused: true
  		});
  	}
  }

  // Add icon and tool-tip to toolbar button.
  function updateToolbarButton() {
  	if (toolbar.button === null)
  		return;

  	var icon = "share/image/paused.png",
  		title = "No playing videos.";

  	if(toolbar.videoid && pref.getPref("addtoolbarbutton")) {
  		if (video[toolbar.videoid].playing) {
  			icon = "share/image/playing.png";
  			title = video[toolbar.videoid].title + " [Playing]";
  		}
  		else {
  			icon = "share/image/paused.png",
  			title = video[toolbar.videoid].title + " [Paused]";
  		}
  	}
  	else if (availableUpdate && (!videocount || !pref.getPref("addtoolbarbutton"))) {
  		icon = "share/image/toolbar-button-attention.png";
  		title = "An update for ExtendTube is available. Click for more info.";
  	}

  	if (availableUpdate)
  		icon = icon.replace(/(-attention)?\.png$/, "-attention.png");

  	if (toolbar.button.title != title) {
  		toolbar.button.icon = icon;
  		toolbar.button.title = title;
  	}

  	// Update badge text and colours.
  	if (videocount && pref.getPref("addtoolbarbutton")) {
  		toolbar.button.badge.textContent = videocount.toString();
  		toolbar.button.badge.backgroundColor = "hsla(60, 100%, 50%, .4)";
  		toolbar.button.badge.color = "#a52a2a";
  	}
  	else {
  		toolbar.button.badge.textContent = '!';
  		toolbar.button.badge.backgroundColor = "hsla(200, 100%, 50%, .2)";
  		toolbar.button.badge.color = "#010203";
  	}
  }

  // Load resource from web.
  function loadExternalResource(message, target) {
  	log.info("Loading external resource from " + message.data.uri + '.');

  	var xhr = new XMLHttpRequest();

  	xhr.onreadystatechange = function processExternalResource() {
  		if (xhr.readyState != 4)
  			return;

  		var xmlser = new XMLSerializer(),
  			xmlstr = '';

  		if (xhr.responseXML)
  			xmlstr = xmlser.serializeToString(xhr.responseXML);

  		var logdata = {
  			xml: xmlstr.replace(/[\n\r\t]/g, ''),
  			text: xhr.responseText.replace(/[\n\r\t]/g, '')
  		};

  		if (logdata.xml.length > 200)
  			logdata.xml = logdata.xml.substr(0, 197) + "...";
  		if (logdata.text.length > 200)
  			logdata.text = logdata.text.substr(0, 197) + "...";

  		log.info("External resource loaded.\n", logdata);

  		message.subject = "external resource loaded";
  		message.data.text = xhr.responseText;
  		message.data.xml = xmlstr;

  		try {
  			target.postMessage(message);
  		}
  		catch (error) {
  			log.error("An external resource is loaded but cannot be forwarded to injected script.",
  				"\nError: " + error.message + '.',
  				"\nStack:\n" + error.stacktrace
  			);
  		}
  	};

  	xhr.open(message.data.method, message.data.uri, true);

  	if (message.data.header)
  		for (var name in message.data.header)
  			xhr.setRequestHeader(name, message.data.header[name]);

  	xhr.send(message.data.postdata);
  }

  // Load resource from within extension package.
  function loadInternalResource(uri) {
  	log.info("Loading internal resource from " + extensionAddress + '/' + uri + '.');

  	var xhr = new XMLHttpRequest();
  	xhr.open("get", extensionAddress + '/' + uri, false);
  	xhr.send();

  	return xhr.responseText;
  }

  // Check echo replay.
  function echo(id) {
  	if (!ping[id].replay) {
  		// Video page didn’t sent echo replay in more than three seconds.
  		// Try to send message to it.
  		try {
  			video[id].source.postMessage({ subject: "echo request" });
  		}
  		catch (error) {
  			log.warn("Message cannot be sent to page with ID " + id + ". Searching for page.");

  			extension.broadcastMessage({ subject: "give me info" });

  			ping[id].timeout = window.setTimeout(function () {
  				if (!video[id] || !video[id].source)
  					return;

  				log.error("Page with ID " + id + " not found.",
  					"Tab is probably closed and video will be removed from list."
  				);

  				removeTab({ source: video[id].source });
  			}, 987);
  		}
  	}
  	else if (video[id])
  		ping[id].replay = false;
  }

  function checkForUpdate(check) {
  	if (check === undefined)
  		check = pref.getPref("updatecheck");

  	if (!check) {
  		window.clearTimeout(updateTimeout);

  		log.info("Check for updates is disabled.");

  		removeToolbarButton(true);
  		return;
  	}

  	var lastCheck = pref.getPref("updatechecktime"),
  		interval = pref.getPref("updateinterval") * 3600000,
  		time = Date.now();

  	log.info((new Date(lastCheck)).format("Last check for updates was at %T."));

  	var nextCheck = lastCheck + interval;
  	if (time + 30000 > nextCheck) {
  		updateCheck();
  		nextCheck = interval;
  	}
  	else
  		nextCheck -= time;

  	updateTimeout = window.setTimeout(checkForUpdate, nextCheck);
  	log.info((new Date(time + nextCheck)).format("Next check for update scheduled for %T."));
  }

  function updateCheck() {
  	log.info("Checking for approved update.");

  	var xhr = new XMLHttpRequest(),
  		approved = "https://addons.opera.com/en/extensions/details/extendtube/",
  		unapproved = "http://my.opera.com/pdarko/blog/extend-tube";

  	xhr.requestURI = approved;
  	xhr.onreadystatechange = function processServerResponse() {
  		if (xhr.readyState != 4)
  			return;

  		var doc = document.createElement("doc");
  		doc.insertAdjacentHTML("afterbegin", cleanHtml(xhr.responseText));

  		if (xhr.requestURI == approved) {
  			var version = doc.querySelector("section.about dd:nth-of-type(3)");
  			if (version) {
  				version = version.textContent.replace(/\-.+/, '');
  				if (String.natcmp(version, extVersion) > 0) {
  					log.info("A new version of ExtendTube is available.",
  						"Installed: " + extVersion + '.',
  						"Available: " + version + '.'
  					);

  					availableUpdate = "approved=" + version;
  					addToolbarButton();
  				}
  				else
  					log.info("No available update. Latest version is installed (" + extVersion + ").");
  			}
  			else
  				log.warn("Cannot get information about new version.");


  			if (pref.getPref("unapprovedcheck")) {
  				log.info("Checking for unapproved update.");

  				xhr.requestURI = unapproved;
  				xhr.open("get", xhr.requestURI);
  				xhr.send();
  			}
  		}
  		else {
  			var version = doc.querySelector("#excerpt p.note a");
  			if (!version) {
  				log.warn("Cannot get information about new (unapproved) version.");
  				return;
  			}

  			version = version.textContent;
  			if (String.natcmp(version, extVersion) > 0) {
  				log.info("A new (unapproved) version of ExtendTube is available.",
  					"Installed: " + extVersion + '.',
  					"Available: " + version + '.'
  				);

  				availableUpdate += "&unapproved=" + version;
  				addToolbarButton();
  			}
  			else
  				log.info("No available update. Latest version is installed (" + extVersion + ").");
  		}

  		pref.setPref("updatechecktime", Date.now());
  	}

  	xhr.open("get", xhr.requestURI);
  	xhr.send();
  }

  // Return body of given HTML.
  function cleanHtml(html) {
  	var body = html.match(/<body[^>]*>([\S\s]*)<\/body>/i);
  	if (!body || !body[1])
  		return html;

  	return body[1];
  }

  function sendMessage(destination, message) {
  	try {
  		destination.source.postMessage(message);
  	}
  	catch (error) {
  		log.error("An error occurred while trying to send message to injected script.",
  			"Destination: " + destination.origin + '.',
  			"\nError: " + error.message
  		);
  	}
  }
  
//});