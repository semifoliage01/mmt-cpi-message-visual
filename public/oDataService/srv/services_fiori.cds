using CatalogService from './services';

annotate CatalogService.VHCommunicationMethods with {
    code  @(Common: {
        Text           : descr,
        TextArrangement: #TextOnly,
    });
    descr @Common.Label: '{i18n>CommunicationType}';
};

annotate CatalogService.VHProcesssequence with {
    code  @(Common: {
        Text           : descr,
        TextArrangement: #TextLast,
    });
    descr @Common.Label: '{i18n>descr}';
};

annotate CatalogService.VHDirection with {
    code  @Common.Label: '{i18n>code}';
    descr @Common.Label: '{i18n>descr}';
};
annotate CatalogService.VHDirection with @(UI: {
     SelectionFields            : [
        code,
        descr
    ],
     LineItem                  : [
        {
            Value: name,
            Label: '{i18n>code}',
        },
        {
            Value: descr,
            Label: '{i18n>descr}',
        },
     ]
});

annotate CatalogService.VHSynchAutoCaseStatus with {
    code  @(Common: {
        Text           : descr,
        TextArrangement: #TextLast,
    });
    descr @Common.Label: '{i18n>descr}';
};

annotate CatalogService.VHSynchAutoCaseStatus with @(UI: {
     SelectionFields            : [
        code,
        descr
    ],
     LineItem                  : [
        {
            Value: name,
            Label: '{i18n>code}',
        },
        {
            Value: descr,
            Label: '{i18n>descr}',
        },
     ]
});


annotate CatalogService.IflowLogsTracks with {
    ID            @UI.Hidden;
    scenarioId    @Common.Label: '{i18n>scenarioId}';
    senderId      @Common.Label: '{i18n>senderId}';
    receiverId    @Common.Label: '{i18n>receiverId}';
    correlationId @Common.Label: '{i18n>correlationId}';
    legalversion  @Common.Label: '{i18n>legalversion}';

};

annotate CatalogService.IflowLogsTracks with @(UI: {
    SelectionFields           : [
        scenarioName,
        senderId,
        receiverId,
        correlationId,
        commMethod,
        commDirection,
        businessStatus,
        processStatus,
        createdAt
    ],
    LineItem                  : [
        {
            Value: scenarioName,
            Label: '{i18n>scenarioName}',
        },
        {
            Value: legalversion,
            Label: '{i18n>legalversion}'
        },
        {
            Value: senderId,
            Label: '{i18n>senderId}'
        },
        {
            Value: receiverId,
            Label: '{i18n>receiverId}'
        },
        {
            Value: correlationId,
            Label: '{i18n>correlationId}'
        },
        {
            Value: commMethod,
            Label: '{i18n>commMethod}',
        },
        {
            Value: commDirection,
            Label: '{i18n>commDirection}'
        },
        {
            Value: processStatus,
            Label: '{i18n>processStatus}',
        },
        {
            Value: businessStatus,
            Label: '{i18n>businessStatus}'
        },
        {
            Value: ahbversion,
            Label: '{i18n>ahbversion}'

        }
    ],
    FieldGroup #HeaderMessage1: {Data: [
        {
            Value: scenarioName,
            Label: '{i18n>scenarioName}'
        },
        {
            Value: scenarioId,
            Label: '{i18n>scenarioId}'
        }
    ]},

    Facets                    : [
        {
            $Type : 'UI.CollectionFacet',
            Label : '{i18n>HeaderInfo}',
            Facets: [{
                $Type : 'UI.ReferenceFacet',
                Target: '@UI.FieldGroup#HeaderMessage1'
            }]
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: 'transactions/@UI.PresentationVariant',
            Label : '{i18n>Transactions}'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>RelatedMessages}',
            Target: 'relatedMessages/@UI.PresentationVariant'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>ReprocessedHistory}',
            Target: 'marketMessageReprocessHistory/@UI.PresentationVariant'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>RelatedProcesses}',
            Target: 'relatedProcesses/@UI.PresentationVariant'
        }
    ],
});


annotate CatalogService.autoTestCases with {
    ID                  @UI.Hidden;
    casename            @Common.Label: '{i18n>casename}';
    sender              @Common.Label: '{i18n>sender}';
    receiver            @Common.Label: '{i18n>receiver}';
    exchgmethod         @Common.Label: '{i18n>exchgmethod}'
                        @Common.ValueList               : {
                            $Type         : 'Common.ValueListType',
                            Label         : '{i18n>CommunicationType}',
                            CollectionPath: 'VHCommunicationMethods',
                            Parameters    : [
                                {
                                    $Type            : 'Common.ValueListParameterInOut',
                                    LocalDataProperty: exchgmethod,
                                    ValueListProperty: 'code'
                                },
                                {
                                    $Type            : 'Common.ValueListParameterDisplayOnly',
                                    ValueListProperty: 'descr'
                                }
                            ]
                        };
    payload             @Common.Label: '{i18n>payload}'
                        @UI.MultiLineText:true;
    senderaddress       @Common.Label: '{i18n>senderaddress}';
    receiveraddress     @Common.Label: '{i18n>receiveraddress}';
    testenv             @Common.Label: '{i18n>testenv}'
                        @Common.ValueList               : {
                            $Type         : 'Common.ValueListType',
                            Label         : '{i18n>CommunicationType}',
                            CollectionPath: 'VHtargetSysConfig',
                            Parameters    : [
                                {
                                    $Type            : 'Common.ValueListParameterInOut',
                                    LocalDataProperty: testenv,
                                    ValueListProperty: 'configName'
                                }
                            ]
                        };
    as2_url             @Common.Label: '{i18n>as2_url}'
                        @UI.MultiLineText:true;
    http_url            @Common.Label: '{i18n>http_url}';
    messagecategory     @Common.Label: '{i18n>messagecategory}';
    businessstatus      @Common.Label: '{i18n>businessstatus}';
    processingstatus    @Common.Label: '{i18n>processingstatus}';
    technicalmessageid  @Common.Label: '{i18n>technicalmessageid}';
    processsequence     @Common.Label: '{i18n>processsequence}'
                        @Common.ValueList               : {
                            $Type         : 'Common.ValueListType',
                            Label         : '{i18n>processsequence}',
                            CollectionPath: 'VHProcesssequence',
                            Parameters    : [
                                {
                                    $Type            : 'Common.ValueListParameterInOut',
                                    LocalDataProperty: processsequence,
                                    ValueListProperty: 'code'
                                }
                            ]
                        };
    direction           @Common.Label: '{i18n>direction}'
                        @Common.ValueList               : {
                            $Type         : 'Common.ValueListType',
                            Label         : '{i18n>direction}',
                            CollectionPath: 'VHDirection',
                            Parameters    : [
                                {
                                    $Type            : 'Common.ValueListParameterInOut',
                                    LocalDataProperty: direction,
                                    ValueListProperty: 'code'
                                }
                            ]
                        };
    splitdirection      @Common.Label: '{i18n>splitdirection}';
    techmsgversion      @Common.Label: '{i18n>techmsgversion}';
    webapireferenceId   @Common.Label: '{i18n>webapireferenceId}';
    predecessorTestcase @Common.Label: '{i18n>predecessorTestcase}';
    successorTestcase   @Common.Label: '{i18n>successorTestcase}';
    splitScenarioName   @Common.Label: '{i18n>splitScenarioName}';
    oldinterchangeid    @Common.Label: '{i18n>oldinterchangeid}';
    newinterchangeid    @Common.Label: '{i18n>newinterchangeid}';
    numberoftransactions @Common.Label: '{i18n>numberoftransactions}';
    comments            @Common.Label: '{i18n>Comments}'
                        @UI.MultiLineText:true;
    synchedToAutoTest         @Common.ValueList               : {
                            $Type         : 'Common.ValueListType',
                            Label         : '{i18n>processsequence}',
                            CollectionPath: 'VHSynchAutoCaseStatus',
                            Parameters    : [
                                {
                                    $Type            : 'Common.ValueListParameterInOut',
                                    LocalDataProperty: synchedToAutoTest,
                                    ValueListProperty: 'code'
                                }
                            ]
                        };

};

annotate CatalogService.autoTestCases with @(UI: {
    HeaderInfo                 : {
        TypeName      : '{i18n>AutoTestcase}',
        TypeNamePlural: '{i18n>Testcase}',
        Title         : {Value: casename},
        Description   : {Value: '{i18n>casename}'}
    },
    SelectionFields            : [
        casename,
        synchedToAutoTest,
        sender,
        receiver,
        oldinterchangeid,
        exchgmethod,
        direction,
        createdAt
    ],
    Identification          : [
        {
        $Type  : 'UI.DataFieldForAction',
        Label  : '{i18n>postTestcase}',
        Action : 'CatalogService.postTestcase'
        }
    ],
    LineItem                   : [
        {Value: casename, },
        {Value: exchgmethod, },
        {Value: direction, },
        {Value: testenv, },
        {
            Value:  synchedToAutoTest,
            Criticality: synchStatus 
        },
        {Value: businessstatus, },
        {Value: processingstatus, },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>postTestcase}',
            Action            : 'CatalogService.postTestcase',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>runSelectedTestCases}',
            Action            : 'CatalogService.runSelectedTestCases',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>synchToAutoTest}',
            Action            : 'CatalogService.createAutoTestcase',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>synchFromAutoTest}',
            Action            : 'CatalogService.synchTestcaseFromAutoSplitter',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>synchSysConfigFromAutoSplitter}',
            Action            : 'CatalogService.synchSysConfigFromAutoSplitter',
            InvocationGrouping: #ChangeSet
        },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>copyAutoTestcase}',
            Action            : 'CatalogService.copyAutoTestcase',
            InvocationGrouping: #ChangeSet
        }

    ],
    HeaderFacets               : [
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.FieldGroup#Administrations'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.FieldGroup#HeaderMessage3'
        },
    ],
    FieldGroup #General        : {Data: [
        // {
        //     Value: casename,
        //     Label: '{i18n>casename}'
        // },
        // {
        //     Value                    : communicationPartnerID,
        //     Label                    : '{i18n>ExternalMarketPartner}',
        //     Criticality              : 5, // 5 - New Item (blue)
        //     CriticalityRepresentation: #WithoutIcon
        // },
        {
            Value: exchgmethod,
            Label: '{i18n>exchgmethod}'
        },
        {
            Value: direction,
            Label: '{i18n>direction}'
        }
    ]},
    FieldGroup #Administrations: {Data: [
        // {
        //     Value: casename,
        //     Label: '{i18n>casename}'
        // },
        // {
        //     Value                    : communicationPartnerID,
        //     Label                    : '{i18n>ExternalMarketPartner}',
        //     Criticality              : 5, // 5 - New Item (blue)
        //     CriticalityRepresentation: #WithoutIcon
        // },
        {Value: createdAt, },
        {Value: modifiedAt, }
    ]},
    Facets                     : [
        {
            $Type : 'UI.CollectionFacet',
            Label : '{i18n>CaseInfor}',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>General}',
                    Target: '@UI.FieldGroup#CurrentGeneral'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>Status}',
                    Target: '@UI.FieldGroup#Status'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>Communication}',
                    Target: '@UI.FieldGroup#Commu'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>InterchangeIdCom}',
                    Target: '@UI.FieldGroup#InterchangeIdCom'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>SpliterInfo}',
                    Target: '@UI.FieldGroup#Spliter'
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    Label : '{i18n>AS2Url}',
                    Target: '@UI.FieldGroup#Urls'
                }
            ]
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>Comments}',
            Target: '@UI.FieldGroup#Comment'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'fetc2',
            Label : '{i18n>Payload}',
            Target: '@UI.FieldGroup#Payload'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            ID    : 'fetc3',
            Target: toExecution.![@UI.LineItem],
            Label : '{i18n>caseExecution}'
        }
    ],
    FieldGroup #CurrentGeneral : {Data: [
        {Value: casename, },
        {
            Value: direction, 
            // ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: exchgmethod, 
            ![@Common.FieldControl] : #Mandatory
        },
        {
            Value: messagecategory, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: techmsgversion, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: technicalmessageid, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: webapireferenceId
        },
        {
            Value: processsequence,
            ![@Common.FieldControl]: #Mandatory
        },
        {
            Value: numberoftransactions, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: testenv, 
            ![@Common.FieldControl] : #Mandatory
        }
    ]},
    FieldGroup #Status : {Data: [
        {
            Value: businessstatus, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: processingstatus, 
            ![@Common.FieldControl]: #ReadOnly
        }
    ]},
    FieldGroup #Commu : {Data: [
        {
            Value: sender, 
            ![@Common.FieldControl]: #Mandatory
        },
        {
            Value: senderaddress, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: receiver, 
            ![@Common.FieldControl]: #Mandatory
        },
        {
            Value: receiveraddress, 
            ![@Common.FieldControl]: #ReadOnly
        }
    ]},
    FieldGroup #InterchangeIdCom : {Data: [
        {
            Value: oldinterchangeid, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: newinterchangeid, 
            ![@Common.FieldControl]: #ReadOnly
        }
    ]},
    FieldGroup #Spliter : {Data: [
        {
            Value: splitdirection, 
            ![@Common.FieldControl]: #ReadOnly
        },
        {
            Value: splitdirection, 
            ![@Common.FieldControl]: #ReadOnly
        }
    ]},
    FieldGroup #Urls           : {Data: [
        {
            Value: as2_url, 
            ![@Common.FieldControl]: #ReadOnly
        }
    ]},
    FieldGroup #Payload        : {Data: [
        {
            Value: payload, 
            ![@Common.FieldControl] : #Mandatory
        }
    ]},
    FieldGroup #Comment        : {Data: [
        {
            Value: comments
        }
    ]},
});

annotate CatalogService.targetSysConfig with {
    configName @Common.Label: '{i18n>casename}';
};

annotate CatalogService.targetSysConfig with @(UI: { 
    SelectionFields            : [
        configName
    ],
    Identification             : [{
        Value: configName,
        Label: '{i18n>casename}'
    }],
    LineItem                   : [
        {Value: configName, },
    ]

});

annotate CatalogService.caseExecution with {
    sentStatus          @Common.Label: '{i18n>sentStatus}';
    interchangeid       @Common.Label: '{i18n>interchangeid}';
    correlationId       @Common.Label: '{i18n>correlationId}';
    businessStatus      @Common.Label: '{i18n>businessStatus}';
    processingstatus    @Common.Label: '{i18n>processingstatus}';
    sender              @Common.Label: '{i18n>sender}';
    receiver            @Common.Label: '{i18n>receiver}';
    testenv             @Common.Label: '{i18n>testenv}';
    comment             @Common.Label: '{i18n>comment}';
    payload             @Common.Label: '{i18n>payload}';
    createdAt           @Common.Label: '{i18n>createdAt}';
};

annotate CatalogService.caseExecution with @(UI: { 
    HeaderInfo         : {
        TypeName      : '{i18n>RerunRoutingHistory}',
        TypeNamePlural: '{i18n>RerunRoutingHistory}'
    },
    SelectionFields            : [
        interchangeid,
        correlationId,
        businessStatus,
        processingstatus,
        sender,
        receiver,
        testenv,
    ],
    LineItem                   : [
        {Value: interchangeid, },
        {Value: correlationId, },
        {Value: testenv, },
        {Value: createdAt, },
        {Value: businessStatus, },
        {Value: processingstatus, },
        {Value: sender, },
        {Value: receiver, },
        {
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>fetchMsgResult}',
            Action            : 'CatalogService.fetchMsgResult',
            InvocationGrouping: #ChangeSet
        },
{
            $Type             : 'UI.DataFieldForAction',
            Label             : '{i18n>openCPILogPage}',
            Action            : 'CatalogService.openCPILogPage',
            InvocationGrouping: #ChangeSet
        }
    ]

});