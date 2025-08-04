sap.ui.define(
    ["./BaseController", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("sap.maco.apps.groovylist01.controller.MainView", {
            onInit: function () {
                let controller = this;
                this.setModel(
                    new JSONModel({
                        count: 0,
                        total: 0,
                        system: null,
                    }),
                    "ui",
                );
                const systmesModel = new JSONModel("model/data/systems.json");
                systmesModel.dataLoaded().then(() => {
                    controller.getModel("ui").setProperty("/system", systmesModel.getProperty("/CpiSystems/0"));
                });
                this.setModel(systmesModel, "systems");
            },
            onUpdateFinished: function (oEvent) {
                this.getModel("ui").setProperty("/count", oEvent.getParameter("total"));
                this.getModel("ui").setProperty("/total", this.getModel().getProperty("/Groovies").length);
            },
            onSearch: function (oEvent) {
                let aFilters = [];
                let sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    let filter = new Filter({
                        filters: [
                            new Filter("iflowPackage", FilterOperator.Contains, sQuery),
                            new Filter("iflow", FilterOperator.Contains, sQuery),
                            new Filter("groovy", FilterOperator.Contains, sQuery),
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
            onDetail: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();
                let messageLog = oContext.getObject();
                let display = {};
                let trace;
                let skip = [];
                for (const key in messageLog)
                    if (skip.indexOf(key) > -1) {
                        for (const sub in messageLog[key]) {
                            if (sub === "Trace") trace = messageLog[key][sub];
                            else if (!sub.startsWith("_")) display[`${key}.${sub}`] = messageLog[key][sub];
                        }
                    } else if (!key.startsWith("_")) display[key] = messageLog[key];
                let detail = JSON.stringify(display, null, "\t");
                MessageBox.information(detail);
            },
            onCopyFilePath: function (oEvent) {
                let button = oEvent.getSource();
                button.setBusy(true);
                let text = oEvent.getSource().getBindingContext().getObject().filePath;
                navigator.clipboard.writeText(text).then(
                    function () {
                        sap.m.MessageToast.show("copied");
                        button.setBusy(false);
                    },
                    function () {
                        sap.m.MessageToast.show("copy failed");
                        button.setBusy(false);
                    },
                );
            },
            onChangeSystem: function (oEvent) {
                let system = oEvent.getParameter("selectedItem").getBindingContext("systems").getObject();
                this.getModel("ui").setProperty("/system", system);
                sap.m.MessageToast.show(`set to ${system.Name}`);
            },
        });
    },
);
