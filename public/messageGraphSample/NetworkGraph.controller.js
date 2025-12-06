sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/base/i18n/ResourceBundle",
        "sap/base/strings/formatMessage",
        "sap/ui/model/json/JSONModel",
        "sap/suite/ui/microchart/ComparisonMicroChart",
        "sap/suite/ui/microchart/ComparisonMicroChartData",
        "sap/ui/model/odata/v4/ODataModel"
    ],
    function (Controller, ResourceBundle, formatMessage, JSONModel, ComparisonMicroChart, ComparisonMicroChartData,ODataModel) {
        var oPageController = Controller.extend("sap.suite.ui.commons.sample.NetworkGraph.NetworkGraph", {
            _type: "",
            onInit: function () {
                this._type = "instance";
                var oModel = new JSONModel(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph2.json"));
                this.getView().setModel(oModel);
                this._oModelSettings = new JSONModel({
                    source: "atomicCircle",
                    orientation: "LeftRight",
                    arrowPosition: "End",
                    arrowOrientation: "ParentOf",
                    nodeSpacing: 25,
                    mergeEdges: false,
                    showGraphMap: false,
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


                let oData = {
                  items: [
                  { key: "APERAK_312_1tr_NoSplitter", text: "APERAK 312 1 transaction with Not Splitter" },
                  { key: "APERAK_312_Aggerated_2tr_NoSplitter", text: "APERAK 312 Aggerated 2 transaction with Not Splitter" },
                  { key: "APERAK_312_GAS_1tr_NoSplitter", text: "Gas APERAK 312 1tr with Not Splitter"},
                  { key: "APERAK_312_AS4_1tr_NoSplitter", text: "AS4 APERAK 312 1tr with Not Splitter"},
                  { key: "APERAK_312_AS4_5tr_NoSplitter", text: "AS4 APERAK 312 5tr with Not Splitter"},
                  { key: "APERAK_312_outboundAPE_4tr_Pos_Splitter", text: "APERAK 312 Outbound from APE and Splitter" },
                  { key: "APERAK_312_outbound3RD_4tr_negativeCONtRL", text: "APERAK 312 Outbound from 3RD 4tr and Neg CONTRL" },
                  { key: "MSCONS_outbound_APE_4tr_Splitter", text: "MSCONS outbound from APE with 4tr and Splitter" },
                  { key: "MSCONS_outbound_APE_4tr_Splitter_3rd", text: "MSCONS outbound from APE with 4tr and Splitter 3RD" },
                  { key: "MSCONS_outbound_APE_4tr_Splitter_NegContrl", text: "MSCONS outbound from APE with 4tr and Splitter 3RD Negative CONTRL" },
                  { key: "APERAK_312_4_tr_Neg_CONTRL", text: "APERAK 312 4 transaction with Negative CONtRL " },
                  { key: "2504-EXT-GAS-APERAK-312-1UNH-RT-to-MP4G", text: "2504-EXT-GAS-APERAK-312-1UNH-RT-to-MP4G" },
                  { key: "2504-EXT-GAS-APERAK-313-4ERCs-RT-to-MP4G", text: "2504-EXT-GAS-APERAK-313-4ERCs-RT-to-MP4G" },
                  { key: "2504-WebAPI-Request-ext-to-3rd", text: "2504 WebAPI Request ext to 3rd" },
                  { key: "MSCONS_Outbound_3RD_4tr_Splitter", text: "MSCONS outbound from 3RD with 4tr and Splitter" },
                  { key: "C", text: "Option C iflow case 1 and 3" }
                  ]
                  };
                
                let serviceUrl = "http://localhost:4004/odata/v4/catalog/IflowLogsTracks?$select=ID,scenarioName,logTrackData";
                let serviceEnvUrl = "http://localhost:4004/odata/v4/catalog/targetSysConfig?select=ID,configName";
                // let oModel = new JSONModel(oData);
                var oModelOData = new ODataModel({
                    serviceUrl : "http://localhost:4004/odata/v4/catalog/IflowLogsTracks/"
                });
                let oModel = new JSONModel();
                let oModelEnv = new JSONModel();
                // oModel.loadData("data.json")
                // this.byId("graph")._toolbar.setModel(oModelOData);
                this.byId("graph")._toolbar.setModel(oModel);
                this.byId("secondToolbar").setModel(oModel);
                let selectCase = new sap.m.Select({
                    visible :false,
                  items: {
                    path: "/value",
                    template: new sap.ui.core.Item({ key: "{ID}", text: "{scenarioName}" })
                //   path: "/value",
                //   template: new sap.ui.core.Item({ key: "{ID}", text: "{scenarioName}" })
                  }
                  });

                let selectCase1 = new sap.m.Select({
                  items: {
                    path: "/value",
                    template: new sap.ui.core.Item({ key: "{ID}", text: "{scenarioName}" })
                //   path: "/value",
                //   template: new sap.ui.core.Item({ key: "{ID}", text: "{scenarioName}" })
                  }
                  });
                
                let selectEnv = new sap.m.Select({
                  items: {
                    path: "/value",
                    template: new sap.ui.core.Item({ key: "{configName}", text: "{configName}" })
                //   path: "/value",
                //   template: new sap.ui.core.Item({ key: "{ID}", text: "{scenarioName}" })
                  }
                  });
                
                selectEnv.setModel(oModelEnv);
                selectCase.attachChange(this.onSelectiflowChage);
                selectCase1.attachChange(this.onSelectiflowChage);

                (async () => {
                    try {
                        const response = await fetch(serviceUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const data = await response.json(); // Wait for the JSON to be parsed
                        console.log('Form submission successful:', data);
                        oModel.setData(data); // Set the data to the model
                    } catch (error) {
                        console.error('Form submission failed:', error);
                    }
                })();

                (async () => {
                    try {
                        const response = await fetch(serviceEnvUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const data = await response.json(); // Wait for the JSON to be parsed
                        console.log('Form submission successful:', data);
                        oModelEnv.setData(data); // Set the data to the model
                    } catch (error) {
                        console.error('Form submission failed:', error);
                    }
                })();

                //add content to sencondToolbar
                this.byId("secondToolbar").addContent(selectCase1);

                this.byId("secondToolbar").addContent(
                    new sap.m.Button({
                        id : "EditSampleButton",
                        text: "Edit",
                        press: () => {
                            controller._type = "instance";
                            this.getView().getModel().loadData(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph.json"));
                        },
                    }),
                );
                this.byId("secondToolbar").addContent(selectEnv);

                this.byId("secondToolbar").addContent(
                    new sap.m.Input({
                        text :"",
                        width: "20%",
                        showClearIcon: true,
                        placeholder: "CorrelationId",
                    })
                );

                this.byId("secondToolbar").addContent(
                    new sap.m.Button({
                        id : "FetchLogButton",
                        text: "Fetch logs",
                        press: () => {
                            controller._type = "instance";
                            this.getView().getModel().loadData(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/graph.json"));
                        },
                    }),
                );

                // add content to graph toolbar
                this.byId("graph")._toolbar.addContent(selectCase);
                //not use contrl
                // let ctrl = new sap.m.CheckBox({ text: "Show Graph", selected: "{settings>/showGraphMap}" });
                // ctrl.setModel(this._oModelSettings, "settings");
                // this.byId("graph")._toolbar.insertContent(ctrl, 0);
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
             onSelectiflowChage: function(oEvent){
              let key = oEvent.getParameters().selectedItem.getKey();
              let textValue = oEvent.getParameters().selectedItem.getText();
              let logTrackData = oEvent.getParameters().selectedItem.getBindingContext().getObject().logTrackData;

              /**
               * same as 
               * // Get the selected item
                let selectedItem = oEvent.getSource().getSelectedItem();

                // Get the data bound to the selected item
                let selectedData = selectedItem.getBindingContext().getObject();
               */


            //   const existData = await dataOperation.queryIflowLogByScenarioName(tableName,sampleId,res )
            //   console.log("key and text: ", key + textValue)

            //   let path = "sap/suite/ui/commons/sample/NetworkGraph/iflows/" + key + ".json";
            //   console.log("Graph name and key :  ", textValue + "-----" + path);

            //   let oModel = new JSONModel(sap.ui.require.toUrl(path));
              let oModel = new JSONModel(JSON.parse(logTrackData));
              // let oModel = new JSONModel(sap.ui.require.toUrl("sap/suite/ui/commons/sample/NetworkGraph/iflows/graph2.json"));
              let that = this.getParent().getParent().getParent().getController();
              that.getView().setModel(oModel);
              that.byId("TitleText").setText("Scenario Name : "+ textValue)
              that._oModelSettings = new JSONModel({
                    source: "atomicCircle",
                    orientation: "LeftRight",
                    arrowPosition: "End",
                    arrowOrientation: "ParentOf",
                    nodeSpacing: 25,
                    mergeEdges: false,
                    showGraphMap: false,
                });
                oModel.setSizeLimit(1000);
                oModel.dataLoaded().then(() => {
                    // get corr
                    let CorrelationId = this.getSelectedItem().getBindingContext().getObject().correlationId
                    if (CorrelationId) {
                        document.title = `${document.title} ${CorrelationId}`;
                    }
                });
                that.getView().setModel(that._oModelSettings, "settings");
                that.patch();
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
