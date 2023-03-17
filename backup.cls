global without sharing class marketo_TRIG_ConstituentHandler extends ucinn_ascendv2.ascend_TDTM_Runnable {
	
    global override ucinn_ascendv2.ascend_TDTM_Runnable.DmlWrapper run(List<SObject> newList, List<SObject> oldList, ucinn_ascendv2.ascend_TDTM_Runnable.Action triggerAction, Schema.DescribeSObjectResult objResult) {
        
        System.debug('Inside constituent (contact) trigger');
        if (triggerAction == ucinn_ascendv2.ascend_TDTM_Runnable.Action.BeforeUpdate) {
            System.debug('inside before update');
            updateIntRegionCodeAndGeoMarketDescFieldsBeforeUpdate((List<Contact>) newList, (List<Contact>) oldList);
        } else if (triggerAction == ucinn_ascendv2.ascend_TDTM_Runnable.Action.AfterUpdate) {
            System.debug('inside after update');
            updateServiceIndicatorAndCreateNewServiceIndicator((List<Contact>) newList, (List<Contact>) oldList);
        }
        
        
        return new ucinn_ascendv2.ascend_TDTM_Runnable.DmlWrapper();
    }
    
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
        
        
        
        if ( !contactForCEI.isEmpty() ) {
            for ( ucinn_ascendv2__Service_Indicator__c record : [
                                                            SELECT
                                                                ID,
                                                                ucinn_ascendv2__Code_Formula__c,
                                                                Status__c,
                                                                ucinn_ascendv2__Contact__c
                                                            FROM ucinn_ascendv2__Service_Indicator__c
                                                            WHERE
                                                                ucinn_ascendv2__Code_Formula__c = 'CEI' AND
                                                                ucinn_ascendv2__Contact__c IN :contactForCEI 
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
        
        
        if ( !contactForCEI.isEmpty() ) {
            
            Map<ID, ID> contactAccountMap = new Map<ID, ID>();
            
            List<ucinn_ascendv2__Service_Indicator_Value__c> serviceIndicatorValueRecord = [SELECT ID FROM ucinn_ascendv2__Service_Indicator_Value__c WHERE ucinn_ascendv2__Code__c = 'CEI' AND Name = 'Canada Anti-Spam Opt-In' LIMIT 1];
            
            ID contactServiceIndicatorRecordTypeId = Schema.SObjectType.ucinn_ascendv2__Service_Indicator__c.getRecordTypeInfosByDeveloperName().get('Contact_Service_Indicator').getRecordTypeId();
            
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
        
        contactIds.addAll( newContactMap.keySet() );
        contactIds.removeAll( passedContactIds );
        
        if ( !serviceIndicatorsToUpdateMap.isEmpty() ) {
           serviceIndicatorList.addAll( serviceIndicatorsToUpdateMap.values() );
        }
        
        
        if ( !contactIds.isEmpty() ) {
            
            ID contactServiceIndicatorRecordTypeId = Schema.SObjectType.ucinn_ascendv2__Service_Indicator__c.getRecordTypeInfosByDeveloperName().get('Contact_Service_Indicator').getRecordTypeId();
            ucinn_ascendv2__Service_Indicator_Value__c serviceIndicatorValueRecord = [ SELECT ID FROM ucinn_ascendv2__Service_Indicator_Value__c WHERE ucinn_ascendv2__Code__c = 'CEO' AND Name = 'Canada Anti-Spam Opt-Out' LIMIT 1];
            
            for ( ID contactId : contactIds ) {
                ucinn_ascendv2__Service_Indicator__c newServiceIndicatorRecord = new ucinn_ascendv2__Service_Indicator__c();
                newServiceIndicatorRecord.ucinn_ascendv2__Contact__c = contactId;
                newServiceIndicatorRecord.ucinn_ascendv2__Service_Indicator_Value__c = serviceIndicatorValueRecord.Id;
                newServiceIndicatorRecord.Status__c = 'AC';
                newServiceIndicatorRecord.RecordTypeId = contactServiceIndicatorRecordTypeId;
                
                serviceIndicatorList.add( newServiceIndicatorRecord );
            }
        }
        
        
        
		
        if ( !serviceIndicatorList.isEmpty() ) {
            ucinn_ascendv2.ascend_UTIL_TDTMTrigger.toggleTDTMTrigger(new ucinn_ascendv2__Service_Indicator__c().getSObjectType().getDescribe().getName(), false);
            UPSERT serviceIndicatorList;
            ucinn_ascendv2.ascend_UTIL_TDTMTrigger.toggleTDTMTrigger(new  ucinn_ascendv2__Service_Indicator__c().getSObjectType().getDescribe().getName(), true);
        }
        
    }
    
    global static void updateIntRegionCodeAndGeoMarketDescFieldsBeforeUpdate( List<Contact> newList, List<Contact> oldList ) {    
         
        
        Map<ID, Contact> newContactMap = new Map<ID, Contact>();
        Map<ID, Contact> oldContactMap = new Map<ID, Contact>();
        Map<String, ucinn_ascendv2__Address_Relation__c> addressRelationMap = new Map<String, ucinn_ascendv2__Address_Relation__c>();
        
        Set<ID> updatedContacts = new Set<ID>();
        
        for ( Contact oldContact : oldList ) {
            oldContactMap.put( oldContact.ID, oldContact );
        }
        
        for ( Contact newContact : newList ) {
            
            if (
                ( !String.isBlank( newContact.ucinn_ascendv2__Preferred_Address_City__c ) && oldContactMap.get( newContact.ID ).ucinn_ascendv2__Preferred_Address_City__c != newContact.ucinn_ascendv2__Preferred_Address_City__c ) ||
                ( !String.isBlank( newContact.ucinn_ascendv2__Preferred_Address_State__c ) && oldContactMap.get( newContact.ID ).ucinn_ascendv2__Preferred_Address_State__c != newContact.ucinn_ascendv2__Preferred_Address_State__c ) ||
                ( !String.isBlank( newContact.ucinn_ascendv2__Preferred_Address_Postal_Code__c ) && oldContactMap.get( newContact.ID ).ucinn_ascendv2__Preferred_Address_Postal_Code__c != newContact.ucinn_ascendv2__Preferred_Address_Postal_Code__c ) ||
                ( !String.isBlank( newContact.ucinn_ascendv2__Preferred_Address_Country__c ) && oldContactMap.get( newContact.ID ).ucinn_ascendv2__Preferred_Address_Country__c != newContact.ucinn_ascendv2__Preferred_Address_Country__c )
            ) {
                updatedContacts.add( newContact.ID );
                newContactMap.put( newContact.ID, newContact );
            }
            
        }
        
        if ( !updatedContacts.isEmpty() ) {
            
            for ( ucinn_ascendv2__Address_Relation__c addressRelationRecord : [
                					SELECT
                						ID, 
                						ucinn_ascendv2__Address__c, 
                						ucinn_ascendv2__Contact__c, 
                						ucinn_ascendv2__Address_City_Formula__c,
                						ucinn_ascendv2__Address_State_Formula__c,
                						ucinn_ascendv2__Address_Postal_Code_Formula__c,
                						Address_Country_Formula__c,
                						ucinn_ascendv2__Address__r.Geo_Description__c,
                						ucinn_ascendv2__Address__r.International_Region_Code__c
                					FROM ucinn_ascendv2__Address_Relation__c
                					WHERE ucinn_ascendv2__Contact__c IN :updatedContacts
            ] ) {
                
                String ids = addressRelationRecord.ID + ';' + addressRelationRecord.ucinn_ascendv2__Contact__c;
                addressRelationMap.put( ids, addressRelationRecord );
                
            }
            
        }
        
        if ( !addressRelationMap.isEmpty() ) {
            
            for ( String recordID : addressRelationMap.keySet() ) {
                
                ID contactID = recordID.split(';')[1];
                
                String addCity = addressRelationMap.get( recordID ).ucinn_ascendv2__Address_City_Formula__c != null ? addressRelationMap.get( recordID ).ucinn_ascendv2__Address_City_Formula__c.toLowerCase() : '';
                String addState = addressRelationMap.get( recordID ).ucinn_ascendv2__Address_State_Formula__c != null ? addressRelationMap.get( recordID ).ucinn_ascendv2__Address_State_Formula__c.toLowerCase() : '';
				String addPostalCode = addressRelationMap.get( recordID ).ucinn_ascendv2__Address_Postal_Code_Formula__c != null ? addressRelationMap.get( recordID ).ucinn_ascendv2__Address_Postal_Code_Formula__c: '';
                String addCountry = addressRelationMap.get( recordID ).Address_Country_Formula__c != null ? addressRelationMap.get( recordID ).Address_Country_Formula__c.toLowerCase() : '';
                
                String conCity = newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_City__c != null ? newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_City__c.toLowerCase() : '';
                String conState = newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_State__c != null ? newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_State__c.toLowerCase() : '';
                String conPostalCode = newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_Postal_Code__c != null ? newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_Postal_Code__c : '';
				String conCountry = newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_Country__c != null ? newContactMap.get( contactID ).ucinn_ascendv2__Preferred_Address_Country__c.toLowerCase() : '';
                
                if ( 
                    conCity == addCity &&
                    conState == addState &&
                    conPostalCode == addPostalCode &&
                    conCountry == addCountry
                ) {
                    newContactMap.get( contactID ).marketo_Pref_Address_Int_Region_Code__c = addressRelationMap.get( recordID ).ucinn_ascendv2__Address__r.International_Region_Code__c != null ? addressRelationMap.get( recordID ).ucinn_ascendv2__Address__r.International_Region_Code__c : '';
                    newContactMap.get( contactID ).marketo_Pref_Address_Geo_Market_Desc__c = addressRelationMap.get( recordID ).ucinn_ascendv2__Address__r.Geo_Description__c != null ? addressRelationMap.get( recordID ).ucinn_ascendv2__Address__r.Geo_Description__c : '';
                }
                
            }
            
        }
        
    }
    
      
}
