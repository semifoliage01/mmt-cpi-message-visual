sap.ui.define(
    ["./BaseController", "sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Sorter, FilterOperator, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("sap.maco.apps.groovylist01.controller.MainView", {
            onInit: function () {
                this.setModel(
                    new JSONModel({
                        count: 0,
                        total: 0,
                    }),
                    "ui",
                );
            },
            onAfterRendering: function () {
                this.getOwnerComponent()
                    .getModel()
                    .dataLoaded()
                    .then(() => {
                        let identifier = this.getOwnerComponent().getModel().getProperty("/identifier");
                        document.title = `${document.title} ${identifier}`;
                    });
            },
            onUpdateFinished: function (oEvent) {
                this.getModel("ui").setProperty("/count", oEvent.getParameter("total"));
                this.getModel("ui").setProperty("/total", this.getModel().getProperty("/MessageProcessLogs").length);
            },
            onSearch: function (oEvent) {
                let aFilters = [];
                let sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    let filter = new Filter({
                        filters: [
                            new Filter("_paddingStartIndex", FilterOperator.Contains, sQuery),
                            new Filter("_paddingIndex", FilterOperator.Contains, sQuery),
                            new Filter("IntegrationFlowName", FilterOperator.Contains, sQuery),
                            new Filter("MessageGuid", FilterOperator.Contains, sQuery),
                        ],
                        and: false,
                    });
                    aFilters.push(filter);
                }

                // update list binding
                let oList = this.byId("idMessageProcessLogsTable");
                let oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },
            onSortStartPress: function (oEvent) {
                let oList = this.byId("idMessageProcessLogsTable");
                let oBinding = oList.getBinding("items");
                oBinding.sort(new Sorter("_paddingStartIndex", true));
            },
            _lastTime: 0,
            onTitlePress: function (oEvent) {
                let controller = this;
                let time = new Date().getTime();
                setTimeout(() => {
                    controller._lastTime = 0;
                }, 1000);
                if (this._lastTime === 0) {
                    this._lastTime = time;
                } else {
                    let delta = time - this._lastTime;
                    let data = oEvent.getSource().getBindingContext().getObject();
                    window.open(data._cpiRunLogLink, "_blank");
                    sap.m.MessageToast.show(`double clicked in ${delta}ms`);
                }
            },
            onDetail: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let messageLog = oContext.getObject();
                let display = {};
                let trace;
                let skip = ["MessageStoreEntries", "ErrorInformation", "AdapterAttributes", "Attachments", "Runs"];
                for (const key in messageLog)
                    if (key === "IntegrationArtifact" || key === "CustomHeaderProperties" || key === "detail" || skip.indexOf(key) > -1) {
                        for (const sub in messageLog[key]) {
                            if (sub === "Trace") trace = messageLog[key][sub];
                            else if (!sub.startsWith("_")) display[`${key}.${sub}`] = messageLog[key][sub];
                        }
                    } else if (!key.startsWith("_")) display[key] = messageLog[key];
                let detail = JSON.stringify(display, null, "\t");
                MessageBox.information(`Detail:\n${detail}\n\n\nTrace:\n\n${trace}`);
            },
        });
    },
);
