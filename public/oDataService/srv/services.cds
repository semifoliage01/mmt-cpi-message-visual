using mmtdata.iflow as iflow from '../db/schema';
using mmtdata.iflow as comm from '../db/common';

service CatalogService {
    
    entity caseExecution as projection on iflow.caseExecution{
        *
    }
    actions {
        @cds.odata.bindingparameter.name: '_it'
        action fetchMsgResult() returns caseExecution;
        @cds.odata.bindingparameter.name: 'caseExecution'
        @Core.OperationAvailable : _it.IsActiveEntity
        action deleteExecutions() returns caseExecution;
        @cds.odata.bindingparameter.name: '_it'
        action openCPILogPage() returns caseExecution;
        @cds.odata.bindingparameter.name: '_it'
        action showIflowLogs() returns caseExecution;
    };
    
    entity targetSysConfig as projection on iflow.targetSysConfig;
    entity IflowLogsTracks as projection on iflow.IflowLogsTracks;
    entity autoTestCases as projection on iflow.autoTestCases{
        *,
        testenv,
        toExecution: Association to many caseExecution on toExecution.autoTestcaseId=$self.ID,
        // toDirection: Association to one VHDirection on toDirection.code = $self.direction,
        // toSynchAutoStatus : Association to one VHSynchAutoCaseStatus on toSynchAutoStatus.code = $self.synchedToAutoTest,
        case when synchedToAutoTest = 'toBeSynchToAutoTestCase' then 2 
             when synchedToAutoTest = 'synchedFromAutoTestCase' then 3
             else 1 end as synchStatus : String,

    }
    actions {
        @cds.odata.bindingparameter.name: 'autoTestCases'
        action createAutoTestcase(
            @UI.MultiLineText: true  @Common.Label : '{i18n>Comment}'
            comment : String(5000)) returns autoTestCases;
        @cds.odata.bindingparameter.name: 'autoTestCases'
        action postTestcase(testenv: autoTestCases:testenv not null)
            returns autoTestCases;
        action copyAutoTestcase(
            @UI.MultiLineText: true  @Common.Label : '{i18n>newcasename}'
            newcasename : String(5000) not null @mandatory) returns autoTestCases;
        @cds.odata.bindingparameter.name: 'autoTestCases'
        action runSelectedTestCases(testenv: autoTestCases:testenv not null)
            returns autoTestCases;
            
    };

    entity VHCommunicationMethods as projection on comm.common.CommunicationMethods;
    entity VHtargetSysConfig as select from iflow.targetSysConfig{
        key configName
    };
    entity VHProcesssequence  as projection on comm.common.Processsequence;
    entity VHDirection as projection on comm.common.MsgDirection;
    entity VHSynchAutoCaseStatus as projection on comm.common.SynchAutoCaseStatus;


    action synchTestcaseFromAutoSplitter();
    action synchSysConfigFromAutoSplitter();
}