opera.isReady(function() {

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
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\
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

});