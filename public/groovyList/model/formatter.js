sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
    "use strict";
    return {
        formatDateDisplay: function (dateStr) {
            if (dateStr) {
                let timestamp = dateStr.match(/\d+/)[0]; // Extract digits
                let date = new Date(parseInt(timestamp));
                let dateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy HH:mm:ss" });
                return dateFormat.format(date);
            } else {
                return "";
            }
        },
    };
});
