sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'iflowlogtrackes/test/integration/FirstJourney',
		'iflowlogtrackes/test/integration/pages/IflowLogsTracksList',
		'iflowlogtrackes/test/integration/pages/IflowLogsTracksObjectPage'
    ],
    function(JourneyRunner, opaJourney, IflowLogsTracksList, IflowLogsTracksObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('iflowlogtrackes') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheIflowLogsTracksList: IflowLogsTracksList,
					onTheIflowLogsTracksObjectPage: IflowLogsTracksObjectPage
                }
            },
            opaJourney.run
        );
    }
);