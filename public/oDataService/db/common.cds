namespace mmtdata.iflow;

using {managed,cuid} from '@sap/cds/common';



context common {
    entity DataElements {
    key domain           : String(30);
    key code             : String(100); // ISO 3166-2 alpha5 codes, e.g. DE-BW
        name             : localized String(255);
        descr            : localized String(1000);
        internalComments : localized String(1000);
    }
    annotate DataElements with {
        domain            @UI.Hidden;
        code              @UI.Hidden;
        name              @UI.Hidden;
        internalComments  @UI.Hidden;
    };

    entity CommunicationMethods                     as projection on DataElements {
        key code,
            name,
            descr
    } where domain = 'CommunicationMethod';

    entity Processsequence                          as projection on DataElements {
        key code,
            name,
            descr
    } where domain = 'Processsequence';

    entity MsgDirection                          as projection on DataElements {
        key code,
            name,
            descr
    } where domain = 'MsgDirection';

    entity SynchAutoCaseStatus                          as projection on DataElements {
        key code,
            name,
            descr
    } where domain = 'SynchAutoCaseStatus';
}
