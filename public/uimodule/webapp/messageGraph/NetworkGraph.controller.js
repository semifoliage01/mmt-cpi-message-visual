sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/base/i18n/ResourceBundle",
        "sap/base/strings/formatMessage",
        "sap/ui/model/json/JSONModel",
        "sap/suite/ui/microchart/ComparisonMicroChart",
        "sap/suite/ui/microchart/ComparisonMicroChartData",
    ],
    function (Controller, ResourceBundle, formatMessage, JSONModel, ComparisonMicroChart, ComparisonMicroChartData) {
        var oPageController = Controller.extend("sap.suite.ui.commons.sample.NetworkGraph.NetworkGraph", {
            _type: "",
            onInit: function () {
                this._type = "instance";
                var oModel = new JSONModel(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph.json"));
                this.getView().setModel(oModel);
                this._oModelSettings = new JSONModel({
                    source: "atomicCircle",
                    orientation: "LeftRight",
                    arrowPosition: "End",
                    arrowOrientation: "ParentOf",
                    nodeSpacing: 55,
                    mergeEdges: false,
                    showGraphMap: true,
                });
                oModel.setSizeLimit(1000);
                oModel.dataLoaded().then(() => {
                    // get corr
                    let CorrelationId = this.getView().getModel().getProperty("/CorrelationId");
                    if (CorrelationId) {
                        document.title = `${document.title} ${CorrelationId}`;
                    }
                });
                this.getView().setModel(this._oModelSettings, "settings");
                this.patch();
            },
            onAfterRendering: function () {
                let controller = this;
                this.byId("graphWrapper").$().css("overflow-y", "auto");
                console.log("onAfterRendering");


                let ctrl = new sap.m.CheckBox({ text: "Show Graph", selected: "{settings>/showGraphMap}" });
                ctrl.setModel(this._oModelSettings, "settings");
                this.byId("graph")._toolbar.insertContent(ctrl, 0);
                this.byId("graph")._toolbar.addContent(
                    new sap.m.Button({
                        text: "instance",
                        press: () => {
                            controller._type = "instance";
                            this.getView().getModel().loadData(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph.json"));
                        },
                    }),
                );
                this.byId("graph")._toolbar.addContent(
                    new sap.m.Button({
                        text: "class",
                        press: () => {
                            this._type = "class";
                            this.getView().getModel().loadData(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph_cls.json"));
                        },
                    }),
                );
                this.byId("graph")._toolbar.addContent(
                    new sap.m.Button({
                        text: "pakage",
                        press: () => {
                            this._type = "package";
                            this.getView().getModel().loadData(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph_pkg.json"));
                        },
                    }),
                );
                this.byId("graph")._toolbar.addContent(new sap.m.Link({ text: "#gantt", href: "/messageGantt/index.html", target: "_blank" }));
                this.byId("graph")._toolbar.addContent(new sap.m.Link({ text: "#list", href: "/messageList/index.html", target: "_blank" }));
            },
            mergeChanged: function (oEvent) {
                this._oModelSettings.setProperty("/mergeEdges", !!Number(oEvent.getSource().getProperty("selectedKey")));
            },
            spacingChanged: function (oEvent) {
                this._oModelSettings.setProperty("/nodeSpacing", Number(oEvent.getSource().getProperty("selectedKey")));
            },
            onGraphReady: function (oEvent) {
                console.log("onGraphReady");
            },
            onAfterLayouting: function (oEvent) {
                console.log("onAfterLayouting");
            },
            _lastTime: 0,
            onNodePress: function (oEvent) {
                let controller = this;
                let time = new Date().getTime();
                setTimeout(() => {
                    controller._lastTime = 0;
                }, 1000);
                if (this._lastTime == 0) {
                    this._lastTime = time;
                } else {
                    let delta = time - this._lastTime;
                    let data = oEvent.getSource().getBindingContext().getObject();
                    if (controller._type === "instance") {
                        window.open(data.cpiRunLogLink, "_blank");
                    } else {
                        window.open(data.cpiDesignContentPackageLink, "_blank");
                    }
                    sap.m.MessageToast.show(`double clicked in ${delta}ms`);
                }
            },
            patch: function () {
                ResourceBundle.prototype._formatValue = function (sValue, sKey, aArgs) {
                    if (typeof sValue === "string") {
                        if (aArgs !== undefined && !Array.isArray(aArgs)) {
                            aArgs = [aArgs];
                        }

                        if (aArgs) {
                            sValue = formatMessage(sValue, aArgs);
                        }

                        if (this.bIncludeInfo) {
                            // String object is created on purpose and must not be a string literal
                            // eslint-disable-next-line no-new-wrappers
                            sValue = new String(sValue);
                            sValue.originInfo = {
                                source: "Resource Bundle",
                                url: this.oUrlInfo.url,
                                locale: this.sLocale,
                                key: sKey,
                            };
                        }
                    }
                    return sValue;
                };
            },
        });
        return oPageController;
    },
);
