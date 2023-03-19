global static void updateServiceIndicatorAndCreateNewServiceIndicator(List<Contact> newList, List<Contact> oldList) {
        
        Set<ID> contactIds = new Set<ID>();
        Map<ID, Contact> newContactMap = new Map<ID, Contact>(); 
        Map<ID, Contact> oldContactMap = new Map<ID, Contact>();
        Set<ID> contactForCEI = new Set<ID>();
        Set<ID> contactForInsertCEI = new Set<ID>();
        Set<ID> passedContactIDs = new Set<ID>();
        
        List<ucinn_ascendv2__Service_Indicator__c> serviceIndicatorList = new List<ucinn_ascendv2__Service_Indicator__c>();
        Map<ID, ucinn_ascendv2__Service_Indicator__c> serviceIndicatorsToUpdateMap = new Map<ID, ucinn_ascendv2__Service_Indicator__c>();
        
        for ( Contact record : oldList ) {
            oldContactMap.put( record.Id, record );
        }
        
        for ( Contact record: newList ) {
            String newCanadianOptInValue = record.marketo_Canadian_Opt_In__c;
            String oldCanadianOptInValue = oldContactMap.get(record.Id).marketo_Canadian_Opt_In__c;
            if ( !String.isBlank(newCanadianOptInValue) && newCanadianOptInValue != oldCanadianOptInValue ) {
               newContactMap.put(record.Id, record);
            }
        }
        
        if ( !newContactMap.isEmpty() ) {
            
            for ( ucinn_ascendv2__Service_Indicator__c record : [
                                                            SELECT
                                                                ID,
                                                                ucinn_ascendv2__Code_Formula__c,
                                                                Status__c,
                                                                Reason__c,
                                                                ucinn_ascendv2__Contact__c
                                                            FROM ucinn_ascendv2__Service_Indicator__c
                                                            WHERE
                                                                ucinn_ascendv2__Code_Formula__c = 'CEO' AND
                                                                ucinn_ascendv2__Contact__c IN :newContactMap.keySet()                  
            ]) {
                if ( newContactMap.get( record.ucinn_ascendv2__Contact__c ).marketo_Canadian_Opt_In__c == 'COO' ) {
                    if ( record.ucinn_ascendv2__Code_Formula__c == 'CEO' && record.Status__c == 'AC' ) {
                        record.Reason__c = 'ER';
                        contactForCEI.add( record.ucinn_ascendv2__Contact__c );
                        serviceIndicatorsToUpdateMap.put( record.Id, record );
                    }  	
                } else if ( newContactMap.get( record.ucinn_ascendv2__Contact__c ).marketo_Canadian_Opt_In__c == 'COI' ) {
                    if ( record.ucinn_ascendv2__Code_Formula__c == 'CEO' && record.Status__c == 'AC' ) {
                        record.Status__c = 'IN';
                        contactForCEI.add( record.ucinn_ascendv2__Contact__c );
                        serviceIndicatorsToUpdateMap.put( record.Id, record );
                    }
                }
                
                passedContactIds.add( record.ucinn_ascendv2__Contact__c );
            }
        }
        
        
        
        if ( !newContactMap.isEmpty() ) {
            for ( ucinn_ascendv2__Service_Indicator__c record : [
                                                            SELECT
                                                                ID,
                                                                ucinn_ascendv2__Code_Formula__c,
                                                                Status__c,
                                                                ucinn_ascendv2__Contact__c
                                                            FROM ucinn_ascendv2__Service_Indicator__c
                                                            WHERE
                                                                ucinn_ascendv2__Code_Formula__c = 'CEI' AND
                                                                ucinn_ascendv2__Contact__c IN :newContactMap.keySet() 
            ] ) {
                if ( newContactMap.get( record.ucinn_ascendv2__Contact__c ).marketo_Canadian_Opt_In__c == 'COO' ) {
                    if ( record.ucinn_ascendv2__Code_Formula__c == 'CEI' && record.Status__c == 'AC' ) {
                        record.Status__c = 'IN';
                        serviceIndicatorsToUpdateMap.put( record.Id, record );
                        contactForCEI.remove( record.ucinn_ascendv2__Contact__c );
                    }
                } else if ( newContactMap.get( record.ucinn_ascendv2__Contact__c ).marketo_Canadian_Opt_In__c == 'COI' ) {
                    if ( record.ucinn_ascendv2__Code_Formula__c == 'CEI' ) {
                        contactForCEI.remove( record.ucinn_ascendv2__Contact__c );
                    }
                }
            }
        }
        
        List<ucinn_ascendv2__Service_Indicator_Value__c> serviceIndicatorValueRecord = [SELECT ID FROM ucinn_ascendv2__Service_Indicator_Value__c WHERE ucinn_ascendv2__Code__c = 'CEI' AND (Name LIKE '%In%' OR Name LIKE '%IN%' OR Name LIKE '%in%') LIMIT 1];
        ID contactServiceIndicatorRecordTypeId = Schema.SObjectType.ucinn_ascendv2__Service_Indicator__c.getRecordTypeInfosByDeveloperName().get('Contact_Service_Indicator').getRecordTypeId();
        
        if ( !contactForCEI.isEmpty() ) {
            
            for ( ID contactID : contactForCEI ) {
                if ( newContactMap.get(contactID).marketo_Canadian_Opt_In__c == 'COI' ) {
                    
                    ucinn_ascendv2__Service_Indicator__c serviceIndicatorRecord = new ucinn_ascendv2__Service_Indicator__c();
                    serviceIndicatorRecord.ucinn_ascendv2__Service_Indicator_Value__c = serviceIndicatorValueRecord[0].Id;
                    serviceIndicatorRecord.ucinn_ascendv2__Contact__c = contactID;
                    serviceIndicatorRecord.RecordTypeId = contactServiceIndicatorRecordTypeId;
                    serviceIndicatorRecord.Reason__c = 'ER';
                    
                    serviceIndicatorList.add( serviceIndicatorRecord );
                }
            }
        }
        
        Set<ID> inActiveCOECOI = new Set<ID>();
        inActiveCOECOI.addAll( newContactMap.keySet() );
        inActiveCOECOI.removeAll( contactForCEI );
        
        if ( !inActiveCOECOI.isEmpty() ) {
            for ( ID contactID : inActiveCOECOI ) {
                if ( newContactMap.get(contactID).marketo_Canadian_Opt_In__c == 'COI' ) {
                    
                    ucinn_ascendv2__Service_Indicator__c serviceIndicatorRecord = new ucinn_ascendv2__Service_Indicator__c();
                    serviceIndicatorRecord.ucinn_ascendv2__Service_Indicator_Value__c = serviceIndicatorValueRecord[0].Id;
                    serviceIndicatorRecord.ucinn_ascendv2__Contact__c = contactID;
                    serviceIndicatorRecord.RecordTypeId = contactServiceIndicatorRecordTypeId;
                    serviceIndicatorRecord.Reason__c = 'ER';
                    
                    serviceIndicatorList.add( serviceIndicatorRecord );
                }
            }
        }
        
        contactIds.addAll( newContactMap.keySet() );
        contactIds.removeAll( passedContactIds );
        
        if ( !serviceIndicatorsToUpdateMap.isEmpty() ) {
           serviceIndicatorList.addAll( serviceIndicatorsToUpdateMap.values() );
        }
        
        
        if ( !contactIds.isEmpty() ) {
            
            ID contactServiceIndicatorRecordTypeId2 = Schema.SObjectType.ucinn_ascendv2__Service_Indicator__c.getRecordTypeInfosByDeveloperName().get('Contact_Service_Indicator').getRecordTypeId();
            ucinn_ascendv2__Service_Indicator_Value__c serviceIndicatorValueRecord2 = [ SELECT ID FROM ucinn_ascendv2__Service_Indicator_Value__c WHERE ucinn_ascendv2__Code__c = 'CEO' AND (Name LIKE '%Out%' OR Name LIKE '%out%' OR Name LIKE '%OUT%') LIMIT 1];
            
            for ( ID contactId : contactIds ) {
                if ( newContactMap.get(contactId).marketo_Canadian_Opt_In__c == 'COO' ) {
                    
                    ucinn_ascendv2__Service_Indicator__c newServiceIndicatorRecord = new ucinn_ascendv2__Service_Indicator__c();
                    newServiceIndicatorRecord.ucinn_ascendv2__Contact__c = contactId;
                    newServiceIndicatorRecord.ucinn_ascendv2__Service_Indicator_Value__c = serviceIndicatorValueRecord2.Id;
                    newServiceIndicatorRecord.Status__c = 'AC';
                    newServiceIndicatorRecord.RecordTypeId = contactServiceIndicatorRecordTypeId2;
                    
                    serviceIndicatorList.add( newServiceIndicatorRecord );
				}
            }
        }
        
        
        
		
        if ( !serviceIndicatorList.isEmpty() ) {
            ucinn_ascendv2.ascend_UTIL_TDTMTrigger.toggleTDTMTrigger(new ucinn_ascendv2__Service_Indicator__c().getSObjectType().getDescribe().getName(), false);
            UPSERT serviceIndicatorList;
            ucinn_ascendv2.ascend_UTIL_TDTMTrigger.toggleTDTMTrigger(new  ucinn_ascendv2__Service_Indicator__c().getSObjectType().getDescribe().getName(), true);
        }
        
    }
