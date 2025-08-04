sap.ui.require(["sap/m/Shell", "sap/m/App", "sap/m/Page", "sap/ui/core/ComponentContainer", "sap/ui/core/Core"], function (Shell, App, Page, ComponentContainer, Core) {
    "use strict";
    Core.attachInit(function () {
        new Shell({
            appWidthLimited: false,
            app: new App({
                pages: [
                    new Page({
                        enableScrolling: false,
                        showHeader: false,
                        content: [
                            new ComponentContainer({
                                height: "100%",
                                name: "sap.suite.ui.commons.sample.NetworkGraph",
                                settings: {
                                    id: "sap.suite.ui.commons.sample.NetworkGraph",
                                },
                            }),
                        ],
                    }),
                ],
            }),
        }).placeAt("content");
    });
});
