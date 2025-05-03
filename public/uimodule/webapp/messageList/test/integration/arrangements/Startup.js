sap.ui.define([
    "sap/ui/test/Opa5"
], function (Opa5) {
    "use strict";

    return Opa5.extend("com.sap.coeapps.advprojapp01.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "com.sap.coeapps.advprojapp01",
                    async: true,
                    manifest: true
                }
            });
        }
    });

});
