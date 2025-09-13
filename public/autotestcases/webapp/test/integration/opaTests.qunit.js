sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'autotestcases/test/integration/FirstJourney',
		'autotestcases/test/integration/pages/autoTestCasesList',
		'autotestcases/test/integration/pages/autoTestCasesObjectPage'
    ],
    function(JourneyRunner, opaJourney, autoTestCasesList, autoTestCasesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('autotestcases') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheautoTestCasesList: autoTestCasesList,
					onTheautoTestCasesObjectPage: autoTestCasesObjectPage
                }
            },
            opaJourney.run
        );
    }
);