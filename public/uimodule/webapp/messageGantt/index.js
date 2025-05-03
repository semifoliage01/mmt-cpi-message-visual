sap.ui.require([
	"sap/m/Shell",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core"
], function(
	Shell, App, Page, ComponentContainer, Core) {
	"use strict";

	Core.attachInit(function() {
		new Shell ({
			appWidthLimited: false,
			app : new App ({
				pages : [
					new Page({
						title : "Relationships",
						enableScrolling : false,
						content : [
							new ComponentContainer({
								height : "100%", name : "sap.gantt.sample.GanttChart2Relationship",
								settings : {
									id : "sap.gantt.sample.GanttChart2Relationship"
								}
							})
						]
					})
				]
			})
		}).placeAt("content");
	});
});
