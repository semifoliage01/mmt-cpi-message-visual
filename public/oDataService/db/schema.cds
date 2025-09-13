namespace mmtdata.iflow;

using {
    cuid,
    managed
} from '@sap/cds/common';

@odata.draft.enabled
entity IflowLogsTracks : managed, cuid {
        ID                  : String;
        correlationId       : String;
        interchangeId       : String;
        targetsys           : String;
    key scenarioId          : String;
        scenarioName        : String;
        senderId            : String;
        receiverId          : String;
        iflowlogNum         : String;
        techMessageId       : String;
        testFixData         : String;
        legalversion        : String;
        messageFormat       : String;
        businessStatus      : String;
        processStatus       : String;
        transferdatTime     : String;
        ahbversion          : String;
        spitterCaseScenario : String;
        autoTestcaseName    : String;
        direction           : String;
        commDirection       : String;
        commMethod          : String;
        comment             : String;
        logTrackData        : LargeString;
        // caseExecuting       : Association to many caseExecution on caseExecuting.autoTestcaseId = ID;
}

@odata.draft.enabled
entity autoTestCases : cuid, managed {
    key casename             : String;
        sender               : String;
        receiver             : String;
        exchgmethod          : String;
        privatekey           : String;
        publickey            : String;
        payload              : LargeString;
        senderaddress        : String;
        receiveraddress      : String;
        fileid               : String;
        testenv              : String;
        as2_url              : String;
        http_url             : String;
        targetdata           : String;
        comparestatus        : String;
        sourceinterchangeid  : String;
        targetinterchangeid  : String;
        encryptandsign       : Boolean;
        processsequence      : String default 1;
        messagecategory      : String;
        businessstatus       : String;
        processingstatus     : String;
        technicalmessageid   : String;
        direction            : String;
        splitdirection       : String;
        techmsgversion       : String;
        numberoftransactions : String;
        sourcesys            : String;
        oldinterchangeid     : String;
        newinterchangeid     : String;
        differences          : String;
        comments             : String;
        commentsat           : String;
        webapireferenceId    : String;
        same                 : Boolean;
        predecessorTestcase  : String;
        successorTestcase    : String;
        splitScenarioName    : String;
        synchedToAutoTest    : String default 'toBeSynchToAutoTestCase';
}

entity targetSysConfig : cuid, managed {
    key configName   : String;
        authType     : String;
        tokenUrl     : String;
        url          : String;
        user         : String;
        password     : String;
        dbUser       : String;
        dbPassword   : String;
        dbUrl        : String;
        dbschemaName : String;
        testenv      : String;
        httpurl      : String;
        as2url       : String;
        as2user      : String;
        as2password  : String;
        subdomain    : String;
}

entity caseExecution : cuid, managed {
    key ID               : UUID;
        autoTestcaseId   : String;
        sentStatus       : String;
        interchangeid    : String;
        correlationId    : String;
        businessStatus   : String;
        processingstatus : String;
        sender           : String;
        receiver         : String;
        testenv          : String;
        comment          : String;
        sourceType       : String;
        payload          : LargeString;
}
