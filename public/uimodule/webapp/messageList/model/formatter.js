sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
    "use strict";
    return {
        formatStartDateDisplay: function (dateStr) {
            if (dateStr) {
                // /Date(1718693908069)/
                let timestamp = dateStr.match(/\/Date\((?<ms>\d{13})\)\//).groups.ms;
                let date = new Date(parseInt(timestamp));
                let dateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy HH:mm:ss.SSS" });
                return dateFormat.format(date);
            } else {
                return "";
            }
        },
        formatDateDisplay: function (dateStr) {
            if (dateStr) {
                // /Date(1718693908069)/
                let timestamp = dateStr.match(/\/Date\((?<ms>\d{13})\)\//).groups.ms;
                let date = new Date(parseInt(timestamp));
                let dateFormat = DateFormat.getDateInstance({ pattern: "HH:mm:ss.SSS" }); // dd/MM/yyyy
                return dateFormat.format(date);
            } else {
                return "";
            }
        },
        formatStatusDisplay: function (status) {
            if (status === "FAILED") {
                return "Error";
            } else if (status === "COMPLETED") {
                return "Success";
            } else if (status === "RETRY") {
                return "Warning";
            }
        },
    };
});
