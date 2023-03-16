({
    
    /*************************************************************************************************************
    * @name            		B2C_B2B_CourseRegistrationController
    * @author         	    Pradyumn Sharma (TMC)
    * @created         		01 / Nov / 2021
    * @description     		JS Controller for B2C/B2B Registration
    * @last modified on  : 
    * @last modified by  : 
    **************************************************************************************************************/
        
        
        init: function(component, event, helper) {
            
            
            
            let crCode = helper.getCourseRunCode().courseruncode;
            component.set("v.courseRunCode", crCode);
    		
            
            var timer = setInterval(function() { 
                if(component.get("v.popupWin").closed) {
                    //clearInterval(timer);
                    //component.set("v.isSpinner", false); 
                    //component.find("isSkillbtn").set("v.disabled", false);
                    component.set("v.spinner", false);
                }
            }, 1000);
            window.addEventListener("message", $A.getCallback(function(event) {
                //console.log('addEventListener@@@@@@@@@@@@');
                console.log('event.data.statusCode @@'+event.data.statusCode);
                if (event.data.statusCode!=='200'){
                    //console.log('Code!==200');
                    //component.set("v.isSpinner", false); 
                    //component.find("isSkillbtn").set("v.disabled", false);
                    component.set("v.spinner", false);
                    //component.set("v.openRedirectPopUp",false);
                    component.get("v.popupWin").close();
                    setTimeout(function(){
                        //component.set("v.SFCFundingError",true);
                        //component.set("v.ErrorId",event.data.errorId);
                        //component.set("v.ErrorMsg",event.data.message);
                        helper.shoError(component,event,event.data.errorId +' - '+event.data.errorId);
                    }, 300);
                    return;
                }
                
                // Handle the message
                 console.log(event.data.Amount+'claimId '+event.data.claimId+' ');
                var fullFee = 0;
                var Amount = 0;
                var skillFutureRemainingFee = 0;
                var fundingList = component.get("v.fundingList");
                let validFunding = false;
                let currentGrandTotal = component.get("v.grandTotal");
                
                if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                    
                    fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee_with_GST__c");
                    Amount = event.data.Amount;
                    if(fundingList.length>0){
                        for(const fun of fundingList){
                            skillFutureRemainingFee = fun.RemainingFee -Amount ;   
                        }  
                    }else{
                        skillFutureRemainingFee = fullFee-Amount;  
                    }   
                }
                if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Course'){
                    
                    
                    if(component.find("isMemberValue").get("v.value")){
                        fullFee = component.get("v.courseRunRecord.Course__r.Member_Total_Fee__c");
                        Amount = event.data.Amount;
                        if(fundingList.length>0){
                            for(const fun of fundingList){
                                skillFutureRemainingFee = fun.RemainingFee - Amount ; 
                            }  
                        }else{
                            skillFutureRemainingFee = fullFee-Amount;  
                        }   
                    }
                    else{
                        fullFee = component.get("v.courseRunRecord.Course__r.Non_Member_Total_Fee__c");
                        Amount = event.data.Amount;
                        if(fundingList.length>0){
                            for(const fun of fundingList){
                                skillFutureRemainingFee = fun.RemainingFee - Amount ; 
                            }  
                        }else{
                            skillFutureRemainingFee = fullFee-Amount;  
                        }       
                    } 
                }
                //component.set("v.skillFutureRemainingFee", skillFutureRemainingFee.toFixed(2)); 
    
                
                if(Amount<currentGrandTotal){
                    console.log('Amount<currentGrandTotal '+Amount);
                    validFunding = true;
                    component.set("v.grandTotal",skillFutureRemainingFee.toFixed(2));
                }else{
                    component.set("v.isCreditFundingAdded", false);
                    helper.showError(component, event, $A.get("$Label.c.AmountFundingErrorHeader"));
                }     
                
                var fundingList = component.get("v.fundingList");
                console.log('validFunding '+validFunding);
            if(validFunding){
                fundingList.push({
                    'sobjectType': 'Learner_Funding__c',
                    'Funding__c': 'SkillsFuture Credit',
                    'SFC_Claim_Id__c': event.data.claimId,
                    'Amount__c': event.data.Amount,
                    'Status__c': 'Confirmed',
                    'RemainingFee':skillFutureRemainingFee.toFixed(2),
                    'NricId':component.find("NricId").get("v.value")
                });
                // console.log("fundingList@@@@@@@   "+fundingList);
                component.set("v.fundingList", fundingList);  
                component.set("v.grandTotal", skillFutureRemainingFee.toFixed(2));
                component.set("v.isFundingAdded", true);
                component.set("v.isCreditFundingAdded", true);
            }
                //component.set("v.isSpinner", false); 
                //component.find("isSkillbtn").set("v.disabled", false);
                // Error for Duplicate Funding 
                //helper.showDuplicateFunError(component, event);
                component.set("v.spinner", false);
                component.get("v.popupWin").close();
                //component.set("v.openRedirectPopUp",false);
            }), false);
            window.addEventListener("scroll", $A.getCallback(function(event) {
                if(component.get("v.showBillingPage")){
                    const FundingElement = document.getElementById('Funding-View');
                    const FundingResults = FundingElement.getBoundingClientRect();
                    
                    const BillingElement = document.getElementById('Billing-View');
                    const BillingResults = BillingElement.getBoundingClientRect();
                    
                    const SummaryElement = document.getElementById('Summary-View');
                    const SummaryResults = SummaryElement.getBoundingClientRect();
                    
                    const DeclarationElement = document.getElementById('Declaration-View');
                    const DeclarationResults = DeclarationElement.getBoundingClientRect();
                    
                    
                    if(FundingResults.top.toFixed() >= 60 && FundingResults.top.toFixed() <= 498){
                        
                        component.set("v.selectedStep", "step1"); 
                    }else if(BillingResults.top.toFixed() >= 60 && BillingResults.top.toFixed() <= 498 ){ 
                        
                        component.set("v.selectedStep", "step2");      
                    }else if(SummaryResults.top.toFixed() >= 420 && SummaryResults.top.toFixed() <= 498 ){ 
                        
                        component.set("v.selectedStep", "step3");
                        
                    }else if(DeclarationResults.top.toFixed() >= 498 && DeclarationResults.top.toFixed() <= 788){ 
                        
                        component.set("v.selectedStep", "step4");      
                    }
                    
                }
                
            }), false);  
            //component.set("v.contactRecord.Nationality__c", 'Singapore CITIZEN');
            //console.log('component.set("v.contactRecord.Nationality__c'+ component.get("v.contactRecord.Nationality__c"));
            var userId = $A.get("$SObjectType.CurrentUser.Id");
            
            console.log('userId '+userId);
            if(userId){
                component.set("v.userLoggedIn",true);
            }
            
            
            console.log('crCode '+crCode);
            var action = component.get("c.getAllData");
            action.setParams({ courseRunCode :crCode, userId :userId  });
            action.setCallback(this, function(response) {
                
                
                var state = response.getState();
                if (state === "SUCCESS") {
                    let responseValue =  response.getReturnValue();
                    let listOfCourseRun = [];
                    let courseRunRecord;
                    if(responseValue.listOfCourseRun.length > 0){
                     courseRunRecord  = responseValue.listOfCourseRun[0] 
                    }
                    
                    component.set("v.earlyBirdMemberDiscount",responseValue.earlyBirdMemberDiscount.toFixed(2));
                    component.set("v.earlyBirdNonMemberDiscount",responseValue.earlyBirdNonMemberDiscount.toFixed(2));
                    component.set("v.earlyBirdFundedDiscount",responseValue.earlyBirdFundedDiscount.toFixed(2));
                    component.set("v.promotionMemberDiscount",responseValue.promotionMemberDiscount.toFixed(2));
                    component.set("v.promotionNonMemberDiscount",responseValue.promotionNonMemberDiscount.toFixed(2));
                    component.set("v.promotionFundedDiscount",responseValue.promotionFundedDiscount.toFixed(2));
                    
                    console.log('responseValue '+responseValue+responseValue.listOfCourseRun.length );
                   console.log('responseValue String '+JSON.stringify(responseValue)+responseValue.currentUserProfile);
                     /*console.log('responseValue String '+responseValue.listOfCourseRun[0].Course_Run_Code__c+ responseValue.duplicateReg);
                    console.log('responseValue String '+responseValue.currentUserProfile);
                    console.log('contentVersionId String '+responseValue.contentVersionId);
                    console.log('ThumbnailURL__c String '+responseValue.listOfCourseRun[0].Course__r.ThumbnailURL__c);*/
                    
                    if(responseValue.currentUserProfile == 'B2B SPOC'){
                        var communityURLlabel = $A.get("$Label.c.Community_URL");
                        var redirectLinkForBulkRegistartion=communityURLlabel+"/s/bulk-registration?courseruncode="+crCode;
                        window.open(redirectLinkForBulkRegistartion,"_self");
                    }
    
                    if(responseValue.listOfCourseRun.length > 0 && responseValue.listOfCourseRun != null){
                    if (courseRunRecord.Id != null ){
                        component.set("v.courseRunStartDate",courseRunRecord.Start_Date__c);
                        let cRunRegStartDt = courseRunRecord.Registration_Open_Date__c;                
                        let cRunRegCloseDt = courseRunRecord.Registration_Close_Date__c;
                        let cRunActive = courseRunRecord.Active__c; 
                        let cRunCapacity = courseRunRecord.Capacity__c;                 
                        // logic to determine if a course run is full
                        let cRun_regCount = courseRunRecord.No_of_Participant__c;
                        if($A.util.isEmpty(cRun_regCount)) {                 
                            cRun_regCount = 0;
                        }
                        var todayDate = $A.localizationService.formatDate(new Date(), "YYYY-MM-DD");               
                        var overlap = (cRunRegStartDt <= todayDate) && (todayDate <= cRunRegCloseDt) ? 'true' : 'false';                
                        if(overlap == 'false' || cRunActive == false || (cRunCapacity == cRun_regCount || cRunCapacity < cRun_regCount)) {                        
                            component.set("v.isInvalidCRunModelOpen", true);
                        }
                        else {
                            
                            if(responseValue.duplicateReg){
                                helper.showError(component,event,$A.get("$Label.c.existingRegistrationForCourseRunError"));
                                var urlEvent = $A.get("e.force:navigateToURL");
                                urlEvent.setParams({
                                    "url": "/course-registration/"+responseValue.duplicateReg
                                });
                                urlEvent.fire();
                            }
                            
                            /* Remove this code and use courseRunRecord on Billing Page Side Bar on perticualrs already used   */
                            for(let key in responseValue.listOfCourseRun){ 
                                console.log(key + responseValue.listOfCourseRun[key].Course_Run_Code__c);
                                listOfCourseRun.push({value:responseValue[key], key:key});
                                
                            }
                            
                            //  ### show/Hide the Funding  buttons
                            console.log('listOfCourseRun '+listOfCourseRun+responseValue.listOfCourseRun[0]);
                            courseRunRecord = responseValue.listOfCourseRun[0];
                            console.log('listOfCourseRun 0'+JSON.stringify(responseValue.listOfCourseRun[0]));
                            console.log('courseRunRecord.Course__r.Funding__c 0'+courseRunRecord.Course__r.Funding__c);
                            if(courseRunRecord.Course__r.Funding__c != null && courseRunRecord.Course__r.Funding__c.includes('IBF Funding')){
                                 console.log('ibf ');
                                component.set("v.isIbfFunding",true);
                                
                            }
                            
                            if (courseRunRecord.CourseRecordType__c == 'Funded_Course') {
                                component.set("v.isFundedCourse", true);
                            } else {
                                component.set("v.isNonFundedCourse", true);
                            }
                            
                            console.log('sfc0 ');
                            if(courseRunRecord.Course__r.Funding__c != null && courseRunRecord.Course__r.Funding__c.includes('SkillsFuture Credit') && courseRunRecord.Course__r.SSG_Course_Reference_Number__c != null ){
                                 console.log('sfc ');
                                component.set("v.isSkillFutureCredit",true);
                                
                            }
                            console.log('sfc1 ');
                            if(courseRunRecord.Course__r.Funding__c != null && courseRunRecord.CourseRecordType__c=='Funded_Course' && courseRunRecord.Course__r.Funding__c.includes('SkillsFuture Funding')){
                                 console.log('ssg ');
                                component.set("v.ischeckGrant",true);
                            }
                            console.log('sfc2 ');
                            if(courseRunRecord.Course__r.Funding__c != null && courseRunRecord.Course__r.Funding__c.includes('ETSS')){
                                 console.log('etss ');
                                component.set("v.isETSS",true);
                            } 
                            console.log('sfc 3');
                            if(courseRunRecord.Course__r.Funding__c != null && courseRunRecord.Course__r.Funding__c.includes('UTAP Funding')){
                                 console.log('UTAP ');
                                component.set("v.isUTAP",true);
                            }
                            console.log('sfc 4');
                            if(courseRunRecord.CourseRecordType__c=='Funded_Course' || courseRunRecord.Course__r.Need_PII__c){  
                                 console.log('pii ');
                                component.set("v.piiSection",true);
                            }
                            console.log('listOfCourseRun');
                            
                            console.log('responseValue.listMarketingChannels '+responseValue.listMarketingChannels);
                            console.log('responseValue.currentUserProfile '+responseValue.currentUserProfile);
                            console.log('responseValue.contactValues '+JSON.stringify(responseValue.contactValues));
                            //console.log('responseValue.contactValues '+responseValue.contactValues.Account);
                            //console.log('responseValue.contactValues '+responseValue.contactValues.Account.UEN_No__c);
                            
                            
                            component.set("v.versionId",responseValue.contentVersionId);
                            component.set("v.currentUserProfile",responseValue.currentUserProfile);
                            component.set("v.marketingchanneloptions",responseValue.listMarketingChannels);
                            component.set("v.listOfCourseRun",responseValue.listOfCourseRun);
                            component.set("v.courseRunRecord", responseValue.listOfCourseRun[0]);
                            component.set("v.userProfileName", responseValue.currentUserProfile);
                            console.log('courseRunRecord '+component.get("v.courseRunRecord").Owner.Email);
                            console.log('responseValue.courseImageUrl '+responseValue.courseImageUrl);
                            if(responseValue.courseImageUrl){
                                
                                component.set("v.isThumbmailExist",true);
                                component.set("v.imageURL",responseValue.courseImageUrl);
                                
                            }
                            
                            if(userId){
                                component.set("v.contactRecord", responseValue.contactValues);
                                //console.log(' responseValue.contactValues '+ responseValue.contactValues[0]);
                                console.log(' responseValue.Marketing_Channel_Consented__c '+ responseValue.contactValues.Marketing_Channel_Consented__c);
                                console.log(' responseValue.Marketing_Consent_Clause__c '+ responseValue.contactValues.Marketing_Consent_Clause__c);
                                if(responseValue.contactValues.Marketing_Consent_Clause__c){
                                    
                                    let marketingChannelValues = (responseValue.contactValues.Marketing_Channel_Consented__c).split(";");
                                    console.log('marketingChannelValues '+marketingChannelValues);
                                    component.set("v.marketingchannelschosen", marketingChannelValues);
                                  component.set("v.disableMarketingChannels",false);
                                }
                                
                                component.set("v.membershipNo",responseValue.contactValues.Account.Membership_No__c);
                                component.set("v.memberCheckbox",responseValue.contactValues.Account.Membership_Active__c);
                                let simMembershipNo =responseValue.contactValues.Account.Membership_No__c;
                                let isSimMember = responseValue.contactValues.Account.Check_Membership_Status__c;
                                if((simMembershipNo!= null && simMembershipNo != 'undifined' && simMembershipNo != '') || isSimMember ){
                                    component.set("v.isMember",true);
                                }  
                            }
                            
                            if(courseRunRecord.CourseRecordType__c=='Funded_Course'){
                                var grandTotal = courseRunRecord.Course__r.Full_Fee_with_GST__c;
                                if(responseValue.earlyBirdFundedDiscount > 0){
                                    grandTotal = grandTotal - responseValue.earlyBirdFundedDiscount;
                                }else if(responseValue.promotionFundedDiscount > 0){
                                    grandTotal = grandTotal - responseValue.promotionFundedDiscount;
                                }
                                component.set("v.grandTotal",grandTotal);
                                
                            }else{
                                
                                if(component.get("v.memberCheckbox") ||component.get("v.isMember") ){
                                    var grandTotal = courseRunRecord.Course__r.Member_Total_Fee__c;
                                    if(responseValue.earlyBirdMemberDiscount > 0){
                                        grandTotal = grandTotal - responseValue.earlyBirdMemberDiscount;
                                    }else if(responseValue.promotionMemberDiscount > 0){
                                        grandTotal = grandTotal - responseValue.promotionMemberDiscount;
                                    }
                                    component.set("v.grandTotal",grandTotal);
                                }else{
                                    var grandTotal = courseRunRecord.Course__r.Non_Member_Total_Fee__c;
                                    if(responseValue.earlyBirdNonMemberDiscount > 0){
                                        grandTotal = grandTotal - responseValue.earlyBirdNonMemberDiscount;
                                    }else if(responseValue.promotionNonMemberDiscount > 0){
                                        grandTotal = grandTotal - responseValue.promotionNonMemberDiscount;
                                    }
                                    component.set("v.grandTotal",grandTotal);
                                }
                            }
                        } 
                    }   
                    }else{
                        //Course Run Not Found
                        console.log('responseValue.currentUserProfile '+responseValue.currentUserProfile);
                        if(responseValue.currentUserProfile == 'B2B SPOC'){
                            console.log('spoc');
                            
                        }else{
                            component.set("v.isInvalidCRunModelOpen", true);
                        }
                        component.set("v.isInvalidCRunModelOpen", true);
                        //helper.createModal(component, "", "Course is not available. Please contact us via the Help Center", "c.redirectToHelpCenter", false);
                    }
                    
                }
                else if (state === "INCOMPLETE") {
                }
                    else if (state === "ERROR") {
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                console.log("Error message: " + 
                                            errors[0].message);
                            }
                        } else {
                            console.log("Unknown error");
                        }
                    }
            });
            $A.enqueueAction(action);   
            
        },
        
        handleCompanySponsered  : function(component, event, helper){
            
            if(event.getParam('value') == 'true'){
                component.set("v.isCompanySponsered",true);   
            }else{
                component.set("v.isCompanySponsered",false);   
            } 
        },
        
        selectStep1 : function(component,event,helper){
            console.log('element 1');
            component.set("v.selectedStep", "step1");
            document.getElementById('Funding-View').scrollIntoView({behavior: "smooth"});
            
        },
        selectStep2 : function(component,event,helper){
            component.set("v.selectedStep", "step2");
            document.getElementById('Billing-View').scrollIntoView({behavior: "smooth"});
            
        },
        selectStep3 : function(component,event,helper){
            component.set("v.selectedStep", "step3");
            document.getElementById('Summary-View').scrollIntoView({behavior: "smooth"});
            
        },
        selectStep4 : function(component,event,helper){
            component.set("v.selectedStep", "step4");
            document.getElementById('Declaration-View').scrollIntoView({behavior: "smooth"});  
        },
        
        handleSIMSocietyMember  : function(component, event, helper){
			
            component.set("v.showTrialMembershipField", false);
            component.set("v.membershipNo", '');
			            
            let isMember = component.get("v.memberCheckbox");
            let membershipNo = component.get("v.membershipNo");
            console.log('isMember'+isMember+membershipNo);
            
            if(component.get("v.courseRunRecord.CourseRecordType__c")== 'Course'){
                
                component.set("v.fundingList", []);
                component.set("v.ibfFundingAdded", false);
                component.set("v.isGrantFundingAdded", false);
                component.set("v.isCreditFundingAdded", false);
                component.set("v.isFundingAdded", false);
                
                
                if(isMember){
                    console.log('isMember2'+isMember+membershipNo);
                    if(membershipNo == null || membershipNo.length<=0 || membershipNo == ''){
                        console.log('isMember3 Null'+isMember+membershipNo);
                        component.set("v.memberCheckbox",false);
                        component.set("v.isMember",false);
                        component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c); 
                    }else if(membershipNo.length  > 0){
                        component.set("v.memberCheckbox",false);
                        component.set("v.isMember",true);
                        component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c); 
                    }
                    
                    
                }else{
                    console.log('isMember else'+isMember+membershipNo);
                    component.set("v.memberCheckbox",true);
                    component.set("v.isMember",true);
                    component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c);
                     console.log(' component.set("v.memberCheckbox",true); else'+ component.get("v.memberCheckbox"));
                    
                }
                
                if(component.get("v.isPromoCodeApplied")){
                   
                    let currGrandTotal = component.get("v.grandTotal");
                    let promoAmt = component.get("v.PromoCodeAmount");
                    let finalAmt = currGrandTotal - promoAmt;
                    component.set("v.grandTotal", finalAmt.toFixed(2));
                    
                }else{
                    let currGrandTotal = component.get("v.grandTotal");
                    let memCheck = component.get("v.isMember");
                    
                    if(memCheck){
                        let earlyBirdMemberDiscount = component.get("v.earlyBirdMemberDiscount");
                        let promotionMemberDiscount = component.get("v.promotionMemberDiscount");
                        if(earlyBirdMemberDiscount>0){
                            currGrandTotal = currGrandTotal - earlyBirdMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }else if(promotionMemberDiscount>0){
                            currGrandTotal = currGrandTotal - promotionMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }
                    }else{
                        let earlyBirdNonMemberDiscount = component.get("v.earlyBirdNonMemberDiscount");
                        let promotionNonMemberDiscount = component.get("v.promotionNonMemberDiscount");
                        if(earlyBirdNonMemberDiscount>0){
                            currGrandTotal = currGrandTotal - earlyBirdNonMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }else if(promotionNonMemberDiscount>0){
                            currGrandTotal = currGrandTotal - promotionNonMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }
                    }
                }
            } else {
                component.set("v.memberCheckbox", !component.get("v.memberCheckbox"));
                component.set("v.isMember", !component.get("v.isMember"));
            }
            
        },
        
        handleMembershipNoChange : function(component, event, helper){
            
            console.log('MN');
            
            component.set("v.membershipValue", "trial_membership");
            component.set("v.showTrialMembershipField", true);
            component.set("v.memberCheckbox", false);
            
            let membershipNo = component.get("v.membershipNo");
            
            
            
            console.log('MNL'+membershipNo.length +' '+component.get("v.memberCheckbox"));
            if(component.get("v.courseRunRecord.CourseRecordType__c")== 'Course'){
                
                if(!component.get("v.memberCheckbox")){
                    
                    component.set("v.fundingList", []);
                    component.set("v.ibfFundingAdded", false);
                    component.set("v.isGrantFundingAdded", false);
                    component.set("v.isCreditFundingAdded", false);
                    component.set("v.isFundingAdded", false);
                }
                
                if(membershipNo.length  >0){
                    component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c);
                    component.set("v.isMember",true);
                }else if( (membershipNo == null || membershipNo.length<=0 || membershipNo == '') && component.get("v.memberCheckbox")){
                    component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c);  
                    component.set("v.isMember",true); 
                }else{
                    component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c);
                    component.set("v.isMember",false);
                }
                
                
                if(component.get("v.isPromoCodeApplied")){
                   
                    let currGrandTotal = component.get("v.grandTotal");
                    let promoAmt = component.get("v.PromoCodeAmount");
                    let finalAmt = currGrandTotal - promoAmt;
                    component.set("v.grandTotal", finalAmt.toFixed(2));
                    
                }else{
                    let currGrandTotal = component.get("v.grandTotal");
                    let memCheck = component.get("v.isMember");
                    
                    if(memCheck){
                        let earlyBirdMemberDiscount = component.get("v.earlyBirdMemberDiscount");
                        let promotionMemberDiscount = component.get("v.promotionMemberDiscount");
                        if(earlyBirdMemberDiscount>0){
                            currGrandTotal = currGrandTotal - earlyBirdMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }else if(promotionMemberDiscount>0){
                            currGrandTotal = currGrandTotal - promotionMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }
                    }else{
                        let earlyBirdNonMemberDiscount = component.get("v.earlyBirdNonMemberDiscount");
                        let promotionNonMemberDiscount = component.get("v.promotionNonMemberDiscount");
                        if(earlyBirdNonMemberDiscount>0){
                            currGrandTotal = currGrandTotal - earlyBirdNonMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }else if(promotionNonMemberDiscount>0){
                            currGrandTotal = currGrandTotal - promotionNonMemberDiscount;
                            component.set("v.grandTotal",currGrandTotal);
                        }
                    }
                }
            }
            
            component.set("v.showMembershipNoOutputfield", (membershipNo.length > 0 ? true : false));
            /*
            if (membershipNo.length > 0) {
                component.set("v.showMembershipNoOutputfield", true);
            } else {
                component.set("v.showMembershipNoOutputfield", false);
            }
            */
        },
        
        handleProceedToBilling : function(component, event, helper){
            var lNameId = component.find("PLastNameId");
            var mobileNum = component.find("PMobileNoId"); 
    
            if(component.get("v.isCompanySponsered")){
                var jobTitle = component.find("PjobTitleId");
                var compName = component.find("PCompanyNameId");
                var compUEN = component.find("PCompanyUENId");
    
                if ($A.util.isEmpty(lNameId.get("v.value")) || $A.util.isEmpty(lNameId.get("v.value").trim()) ||  
                    $A.util.isEmpty(mobileNum.get("v.value")) || $A.util.isEmpty(mobileNum.get("v.value").trim()) || 
                    $A.util.isEmpty(jobTitle.get("v.value")) || $A.util.isEmpty(jobTitle.get("v.value").trim()) ||
                    $A.util.isEmpty(compName.get("v.value")) || $A.util.isEmpty(compName.get("v.value").trim()) || 
                    $A.util.isEmpty(compUEN.get("v.value")) || $A.util.isEmpty(compUEN.get("v.value").trim()) ){
                        helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                    	helper.validateFields(component, event, helper);
                        return false;
                } 
            }else{ 
                if ($A.util.isEmpty(lNameId.get("v.value")) || $A.util.isEmpty(lNameId.get("v.value").trim()) || 
                    $A.util.isEmpty(mobileNum.get("v.value")) || $A.util.isEmpty(mobileNum.get("v.value").trim()) ){
                        helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                    	helper.validateFields(component, event, helper);
                        return false;
                }
            } 
    
            
            
            if(component.get("v.isCompanySponsered") || component.get("v.userLoggedIn") || component.get("v.userProfileName") == 'B2C Learner'){
                
                helper.validateFields(component,event,helper);
                if(component.get("v.pertFieldValidationDoneP") && component.get("v.markFieldValidationDoneP") && component.get("v.compFieldValidationDoneP")){
                    var extCr = component.get("c.checkExistingRegistration");
                    var runId = component.get("v.courseRunRecord.Id");
                    var email = component.get("v.contactRecord.Email");
                    extCr.setParams({email:email , courseRunId:runId});
                    extCr.setCallback(this, function(response) {
                        if(response.getState() === "SUCCESS") {
                            if(!response.getReturnValue()){
                            	component.set("v.showPerticularsPage",false);
                                component.set("v.showBillingPage",true);
                                //component.set("v.piiSection",true);
                                var editPII = component.get("c.EditPIISection"); 
                                if(component.get("v.piiSection")){
                                    $A.enqueueAction(editPII); 
                                }
                                document.getElementById('top-header').scrollIntoView({behavior: "smooth"});    
                            }else{
                                helper.showError(component,event,$A.get("$Label.c.existingRegistrationForCourseRunError"));
                            }
                        } else if(response.getState() == "ERROR"){
                            var errors = response.getError();    
                            console.log(errors[0].message);
                        }
                    });
 		            $A.enqueueAction(extCr);
                      
                    
                }
                
                
                
            }else{
                helper.validateFields(component,event,helper);
                console.log('component.get("v.pertFieldValidationDoneP") '+component.get("v.pertFieldValidationDoneP"));
                if(component.get("v.pertFieldValidationDoneP") && component.get("v.markFieldValidationDoneP")){
                    console.log('component.get("v.fieldValidationDoneP")');
                    var extCr = component.get("c.checkExistingRegistration");
                    var runId = component.get("v.courseRunRecord.Id");
                    var email = component.get("v.contactRecord.Email");
                    extCr.setParams({email:email , courseRunId:runId});
                    extCr.setCallback(this, function(response) {
                        if(response.getState() === "SUCCESS") {
                            if(!response.getReturnValue()){
                            	component.set("v.companySponseredModelOpen",true);    
                            }else{
                                helper.showError(component,event,$A.get("$Label.c.existingRegistrationForCourseRunError"));
                            }
                        } else if(response.getState() == "ERROR"){
                            var errors = response.getError();    
                            console.log(errors[0].message);
                        }
                    });
 		            $A.enqueueAction(extCr);
                    
                    //component.set("v.companySponseredModelOpen",false); 
                    //component.set("v.showPerticularsPage",false);
                    // component.set("v.showBillingPage",true);
                }}
            
            
        },
        
        proceedToBillingB2CLearner : function(component, event, helper){
            
            //helper.validateFields(component,event,helper); 
            component.set("v.companySponseredModelOpen",false);
            component.set("v.showPerticularsPage",false);
            component.set("v.showBillingPage",true);
            //component.set("v.piiSection",true);
            var editPII = component.get("c.EditPIISection"); 
            if(component.get("v.piiSection")){
                $A.enqueueAction(editPII); 
            }
            document.getElementById('top-header').scrollIntoView({behavior: "smooth"});
            
        },
        
        closeCompanyModel : function(component, event, helper){
            
            component.set("v.companySponseredModelOpen",false);  
            
        },
        
        
        
        backToPerticulars :function(component, event, helper){
            
            console.log('backToPerticulars ');
            component.set("v.showBillingPage",false);
            component.set("v.showPerticularsPage",true);
            
            //document.getElementById('top-header').scrollIntoView({behavior: "smooth"});
            
        },
        
        editDetail : function(component, event, helper){
            console.log('edit 1');
            component.set("v.disableSummary",false);
            component.set("v.showViewOnlySummary",false);
            component.set("v.showEditableSummary",true);
        },
        
        saveDetail : function(component, event, helper){
            console.log('Save 1');
            helper.validateFields(component,event,helper);
            
            
        },
        
        expandContactDetail : function(component, event, helper){
            console.log('expandContactDetail 1');
            component.set("v.collapsedContactDetails", false);
            component.set("v.showAllReadOnlyFieldsOfContactDetails", true);  
            
            if(component.get("v.showEditableSummary")){
                component.set("v.collapsedEditContactDetails", false);
                component.set("v.showAllEditFieldsOfContactDetails", true);
                
                
            }
            
        },
        
        collapseContactDetail : function(component, event, helper){
            console.log('toggleAccordion 1');
            component.set("v.collapsedContactDetails", true);
            component.set("v.showAllReadOnlyFieldsOfContactDetails", false);
            
            if(component.get("v.showEditableSummary")){
                component.set("v.collapsedEditContactDetails", true);
                component.set("v.showAllEditFieldsOfContactDetails", false); 
            }
            
        },
        
        expandParticipantDetail : function(component, event, helper){
            console.log('expandParticipantDetail 1');          
            component.set("v.collapsedParticipantDetails", false);
            component.set("v.showAllReadOnlyFieldsOfParticipantDetails", true); 
            
        },
        
        collapseParticipantDetail : function(component, event, helper){
            console.log('collapseParticipantDetail 1');
            component.set("v.collapsedParticipantDetails", true);
            component.set("v.showAllReadOnlyFieldsOfParticipantDetails", false);
            
        },
        
        expandParticipantEditDetail : function(component, event, helper){
            console.log('expandParticipantEditDetail 1');
            component.set("v.collapsedParticipantEditDetails", false);  
            component.set("v.showAllEditFieldsOfParticipantDetails", true);   
            
        },
        
        collapseParticipantEditDetail : function(component, event, helper){
            console.log('collapseParticipantEditDetail 1');
            component.set("v.collapsedParticipantEditDetails", true);  
            component.set("v.showAllEditFieldsOfParticipantDetails", false);  
            
            
        },
        
        expandEmploymentDetail : function(component, event, helper){
            console.log('expandParticipantDetail 1');          
            component.set("v.collapsedEmploymentDetails", false);
            component.set("v.showAllReadOnlyFieldsOfEmployment", true);
            
            if(component.get("v.showEditableSummary")){
                component.set("v.collapsedEditEmploymentDetails", false);
                component.set("v.showAllEditFieldsOfEmploymentDetails", true); 
            }
            
        },
        
        collapseEmploymentDetail : function(component, event, helper){
            console.log('collapseParticipantDetail 1');
            component.set("v.collapsedEmploymentDetails", true);
            component.set("v.showAllReadOnlyFieldsOfEmployment", false);
            
            if(component.get("v.showEditableSummary")){
                component.set("v.collapsedEditEmploymentDetails", true);
                component.set("v.showAllEditFieldsOfEmploymentDetails", false);   
            }   
        },
    
        expandMembershipInfo: function (component, event, helper) {
        console.log("inside membership expand");

        if (component.get("v.showEditableSummary")) {
            console.log("inside membership expand showeditable");
            component.set("v.collapsedEditMembershipInfo", false);
            component.set("v.showAllEditFieldsOfMembershipInfo", true);
        }

        },
    
        collapseMembershipInfo: function (component, event, helper) {
            console.log("inside membership collapse");
            console.log(component.get("v.showEditableSummary"));
            console.log(component.get("v.showAllEditFieldsOfMembershipInfo"));
    
            if (component.get("v.showEditableSummary")) {
                console.log("inside membership collapse showeditable");
                component.set("v.collapsedEditMembershipInfo", true);
                component.set("v.showAllEditFieldsOfMembershipInfo", false);
            }
    
        },
        
        getOTP : function(component, event, helper){
            
            let digits = '0123456789';
            let otpLength = 4;
            let otp = '';
            
            for(let indx=1; indx<=otpLength; indx++)
                
            {
                
                var index = Math.floor(Math.random()*(digits.length));
                otp = otp + digits[index];
                
            }
            
            component.set("v.OTP", otp);
            //console.log("otp"+otp+component.get("v.contactRecord.Email"));
            if(otp && component.get("v.contactRecord.Email")){
                var action = component.get("c.sendOTP");
                action.setParams({ otp :otp, emailId :component.get("v.contactRecord.Email")  });
                action.setCallback(this, function(response) {
                    
                    var state = response.getState();
                    
                    if (state === "SUCCESS") {
                        
                        let responseValue =  response.getReturnValue();
                        
                        console.log('responseValue '+responseValue);
                        console.log('Record', responseValue.record);
                        
                        var profile = responseValue.profile;
                        var record = responseValue.record;
                        
                        console.log(profile);
                        
                        component.set("v.userProfileNameAtOtpTime", profile);
                        component.set("v.recordObject", record);
                        
                        console.log(typeof component.get("v.recordObject") == 'undefined');
                        helper.showSuccess(component, event, $A.get("$Label.c.OTPSentSuccess"));
                        
                        /* Rohan Thakur - 09/02/2023 */
                        /* If 'B2B Learner' Profile & EmailId is already registered then populate Employment Detail fields in read-only mode.  */
                        /*if (profile == 'B2B Learner') {
                            component.set("v.userProfileNameAtOtpTime", profile);
                            component.set("v.contactRecord.Company_Name__c", record.Company_Name__c);
                            component.set("v.contactRecord.Account.UEN_No__c",record.Account.UEN_No__c);
                            component.set("v.contactRecord.Title ", record.Title);
                            component.set("v.contactRecord.Designation_Level__c", record.Designation_Level__c);
                        } else {
                            component.set("v.userProfileNameAtOtpTime ", profile);
                        }*/
                        
                       
                        
                    }
                    else if (state === "INCOMPLETE") {
                    }
                        else if (state === "ERROR") {
                            var errors = response.getError();
                            if (errors) {
                                if (errors[0] && errors[0].message) {
                                    console.log("Error message: " + 
                                                errors[0].message);
                                }
                            } else {
                                console.log("Unknown error");
                            }
                        }
                });
                $A.enqueueAction(action);
                
            }else{
                helper.showError(component, event, $A.get("$Label.c.invalidEmailAddressError"));
                console.log('Empty email');
            }        
            
            
        },
        
        verifyOTP : function(component, event, helper){
            
            let otpEntered = component.find("OTP").get("v.value");
            let userProfileName = component.get("v.userProfileNameAtOtpTime ");
            //console.log('userProfileName '+userProfileName);
            component.set("v.OTPValue", otpEntered);
            component.set("v.isOTPVerified", false);
            //console.log('OTP  otpEntered'+otpEntered);
            if(otpEntered ==  component.get("v.OTP") && otpEntered != null && otpEntered != 'undefined' && otpEntered != ''){
                //console.log('OTP  Correct'+otpEntered);
                component.set("v.isOTPVerified", true); 
                component.set("v.isOTPVerifiedOnce", true); 
                component.set("v.inValidOTP", false);
                
                var record = component.get("v.recordObject");
                
                if(userProfileName == 'B2C Learner'){
                    console.log("B2C Learner");
                    console.log('userProfileName '+userProfileName);
                    component.set("v.isCompanySponsered",false);
                    component.set("v.userProfileName ",'B2C Learner');
                    // setting logged in user true to hide personal employment info if guest user is B2C learner and already have user account
                    component.set("v.guestB2CUser ",true);
                    
                    if (typeof record != 'undefine') {
                        console.log(record.Office_No__c);
                        helper.existingUserHelper(component, event, record, false);
                    }
                    
                      
                }else if(userProfileName == 'B2B Learner'){
                    console.log('b2blearner');
                    component.set("v.isCompanySponsered",true);
                    //component.set("v.userTypeValue",['true']);
                    component.set("v.userProfileName ",'B2B Learner');
                    component.set("v.disableFieldForB2BLearner", true);
                    component.set("v.guestB2CUser ",true);
                    
                    if (typeof record != 'undefined') {
                        console.log(record.Office_No__c);
                        helper.existingUserHelper(component, event, record, true);
                    }
                    
                    
                } else if(userProfileName == 'B2B SPOC'){
                    console.log('B2B SPOC');
                    helper.createModal(component, "", $A.get("$Label.c.redirectToBulkRegPageMsg"), "c.redirectToBulkRegPage", false);
                } 
            }else{
                component.set("v.inValidOTP", true);
                console.log('OTP  inCorrect');
            }
            
            
            
        },
        
        /*validateNRIC : function(component, event, helper){
            
                console.log("validateNRIC");
    
            
        },*/
        
        redirectToBulkRegPage : function (component, event, helper) {
           var communityURLlabel = $A.get("$Label.c.Community_URL");
           var redirectLinkForBulkRegistartion=communityURLlabel+"/s/bulk-registration?courseruncode="+component.get("v.courseRunCode");
           window.open(redirectLinkForBulkRegistartion,"_self");
        },
        
        redirectToLoginPage  : function (component, event, helper) {  
            
            // location.href = '/s/login';
            
            var courseRunCode = helper.getCourseRunCode().courseruncode;
            var courseRunQueryParam = 'startURL=/s/courseregistration?courseruncode=' + courseRunCode;
            location.href = '/s/login?' + courseRunQueryParam;
            
        },
        
        onchangeMarketingConsent : function (component, event, helper) {
            
            let marketingConsent = component.find("checkbox_marketing");
            console.log('von '+marketingConsent.get("v.value"));
            let marketingchannelschosen = component.get("v.marketingchannelschosen").toString().replace(/,/g, ';');
            let channels = ['Email', 'Telephone call', 'Text messages', 'Post'];
            if(marketingConsent.get("v.value")){
                component.set("v.disableMarketingChannels",false);
                component.set("v.contactRecord.Marketing_Consent_Clause__c",true);
                component.set("v.marketingchannelschosen",channels)
                
                
            }else{
                component.set("v.disableMarketingChannels",true);
                component.set("v.marketingchannelschosen","")
                //component.set("v.disableProceedToBilling",true); ; 
            }
            
        },
        
        onchangeMarketingChannel : function (component, event, helper) {
			console.log(component.get("v.marketingchannelschosen"));
			console.log(component.get("v.marketingchannelschosen").toString());           
            let marketingchannelschosen = component.get("v.marketingchannelschosen").toString().replace(/,/g, ';');
            console.log('marketingchannelschosen '+marketingchannelschosen);
            
            /*if(marketingchannelschosen){
                component.set("v.disableProceedToBilling",false);
            }else{
               component.set("v.disableProceedToBilling",true); 
            }*/     
       },
        
        handlePaymentOption :function (component, event, helper) {
            
            let paymentOptionChosen = component.get("v.chosenPaymentMode");
            console.log('paymentOptionChosen '+paymentOptionChosen);
            
            
        },
        
        handleDeclaration :function (component, event, helper) {
            
            console.log('declarationCheckboxVal '+component.get("v.declarationDone"));
            if(component.get("v.declarationDone")){
                component.set("v.declarationDone",true);
                
            }else{
                console.log('declarationCheckboxVal');
                component.set("v.declarationDone",false);
                console.log('declarationCheckboxVal'+component.get("v.declarationDone") );
            }
            //let declarationCheckboxVal = component.find("declarationId");
            //console.log('declarationCheckboxVal '+declarationCheckboxVal);
            
            
        },
        
        validateDateOfBirth: function(component, event, helper) {         
            let dobField = component.find("dobId");
            let dobValue = dobField.get("v.value");
            let todayDate = $A.localizationService.formatDate(new Date(), "YYYY-MM-DD");
            if(dobValue != '' && dobValue > todayDate) {
                component.set("v.dateValidationError" , true);
            } else{
                component.set("v.dateValidationError" , false);
            }
            
        },
        
        validateNRIC : function(component, event, helper) {         
            
            let nricField = component.find("NricId");
            nricField.reportValidity();
            let nricTypeField = component.find("NricTypeId");
            nricTypeField.reportValidity(); 
            let nricIsValid = "valid";
            
            
            if(!$A.util.isEmpty(nricField.get("v.value")) && 
               (nricTypeField.get("v.value") == 'FIN' || 
                nricTypeField.get("v.value") == 'Singapore Citizen/PR')) {
                nricIsValid = 'invalid';
                var nricval = nricField.get("v.value");                    
                if (nricval.length != 9) {
                    component.set("v.nricValidationError", true);
                    nricIsValid = 'invalid';
                } else { 
                    var firstchar = nricval.charAt(0);
                    var lastchar = nricval.charAt(nricval.length - 1);
                    if(firstchar != 'S' && firstchar != 's' && firstchar != 'F' && firstchar != 'f' &&
                       firstchar != 'T' && firstchar != 't' && firstchar != 'G' && firstchar != 'g') {
                        //alert('First character of NRIC is not Invalid');
                        component.set("v.nricValidationError", true);
                        nricIsValid = 'invalid';
                    }
                    var numericNric = nricval.substr(1, nricval.length - 2);
                    if (isNaN(numericNric)) { 
                        //alert('First character of NRIC is not Invalid2');
                        component.set("v.nricValidationError", true);
                        nricIsValid = 'invalid';
                    }
                    var nricResult = component.get('c.validateNRICValue');
                    nricResult.setParams({nricVal: nricval});
                    nricResult.setCallback(this, function(response) { 
                        if(response.getState() === "SUCCESS") {
                            let resultOfNric = response.getReturnValue();
                            if(resultOfNric == 'invalid') {
                                nricIsValid = 'invalid';
                                component.set("v.nricValidationError", true);
                            } else {
                                nricIsValid = 'valid'; 
                                component.set("v.nricValidationError", false);
                                component.set("v.alertTest", false);
                                
                            }
                        } else if(response.getState() == "ERROR"){
                            nricIsValid = "invalid";
                            component.set("v.nricValidationError", true);
                            var errors = response.getError();    
                            console.log(errors[0].message);
                        }
                    });
                    $A.enqueueAction(nricResult);  
                }
            }else{
                
                component.set("v.nricValidationError", false);
            }
            
            
            
        },
        
        validateModalNRIC : function(component, event, helper) {         
            console.log('Method Called');
            let nricField = component.find("NricIdb");
            let nricTypeField = component.find("NricTypeIdb");
            let nricIsValid = "valid";
            
            console.log('Check1');
            
            if(!$A.util.isEmpty(nricField.get("v.value")) && 
               (nricTypeField.get("v.value") == 'FIN' || 
                nricTypeField.get("v.value") == 'Singapore Citizen/PR')) {
                console.log('Check2');
                nricIsValid = 'invalid';
                var nricval = nricField.get("v.value");                    
                if (nricval.length != 9) {
                    console.log('Check3');
                    component.set("v.nricValidationError", true);
                    nricIsValid = 'invalid';
                } else { 
                    console.log('Check4');
                    var firstchar = nricval.charAt(0);
                    var lastchar = nricval.charAt(nricval.length - 1);
                    if(firstchar != 'S' && firstchar != 's' && firstchar != 'F' && firstchar != 'f' &&
                       firstchar != 'T' && firstchar != 't' && firstchar != 'G' && firstchar != 'g') {
                        //alert('First character of NRIC is not Invalid');
                        component.set("v.nricValidationError", true);
                        nricIsValid = 'invalid';
                    }
                    var numericNric = nricval.substr(1, nricval.length - 2);
                    if (isNaN(numericNric)) { 
                        //alert('First character of NRIC is not Invalid2');
                        component.set("v.nricValidationError", true);
                        nricIsValid = 'invalid';
                    }
                    var nricResult = component.get('c.validateNRICValue');
                    nricResult.setParams({nricVal: nricval});
                    nricResult.setCallback(this, function(response) { 
                        if(response.getState() === "SUCCESS") {
                            console.log('Check5');
                            let resultOfNric = response.getReturnValue();
                            if(resultOfNric == 'invalid') {
                                nricIsValid = 'invalid';
                                component.set("v.nricValidationError", true);
                            } else {
                                nricIsValid = 'valid'; 
                                component.set("v.nricValidationError", false);
                                
                            }
                        } else if(response.getState() == "ERROR"){
                            console.log('Check6');
                            nricIsValid = "invalid";
                            component.set("v.nricValidationError", true);
                            var errors = response.getError();    
                            console.log(errors[0].message);
                        }
                    });
                    $A.enqueueAction(nricResult);  
                }
            }else{
                console.log('Check7');
                component.set("v.nricValidationError", false);
            }
            
            console.log('nricValidationError=='+component.get("v.nricValidationError"));
            
        },
        
        applyPromocode : function(component, event, helper) {
            
            let PromoCode = component.find("PromoCode");
            console.log('PromoCode --> '+PromoCode.get("v.value"));    
            if(!$A.util.isEmpty(PromoCode.get("v.value"))){
                helper.getPromoCode(component, event,PromoCode.get("v.value"))
                component.set("v.PromoCode", PromoCode.get("v.value"));
                component.set("v.InvalidPromo", false);
                
                //component.set("v.isPromoCodeApplied",true);
            }else{
                console.log('in else PromoCode --> '+PromoCode.get("v.value"));
                component.set("v.InvalidPromo", true);
                //helper.ShowToastEvent(component, event,$A.get("$Label.c.CourseRegistrationPromoCodeNullMsg"),'Warning','warning' ); 
            }
            
            
            
            
        },
        
        removePromocode : function(component, event, helper) {
            
            var PromoCode = component.find("PromoCode");
            console.log('PromoCode --> '+PromoCode.set("v.value",""));
            PromoCode.set("v.value","");
            component.set("v.isPromoCodeApplied",false);
            component.set("v.PromoCodeAmount","");
            component.set("v.PromoCodeId","");
            helper.setCorrectGrandTotalValue(component, event, helper);
            
            
        },
        
        handlePromoCodeChange: function(component, event, helper){
            
            component.set("v.isPromoCodeApplied",false);
            let PromoCode = component.find("PromoCode");
            console.log('PromoCode --> '+PromoCode.get("v.value")+PromoCode.get("v.value").length); 
            
            if(PromoCode.get("v.value").length < 8 && PromoCode.get("v.value").length != 0){
                component.set("v.InvalidPromo",true);      
            }
            
            
            
        },
        
        addIbfFunding : function(component, event, helper){
            console.log('addIbfFunding');
            
            var fullFee = 0;
            var Amount = 0;
            var ibfRemainingFee = 0;
            var fundingList = component.get("v.fundingList");
            let validFunding = false;
            let currentGrandTotal = component.get("v.grandTotal");
                
            //console.log(component.get("v.courseRunRecord.CourseRecordType__c"));
            if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee_with_GST__c");
                Amount = fullFee*$A.get("$Label.c.IBF_Funding")/100;
                if(fundingList.length>0){
                    for(const fun of fundingList){
                        ibfRemainingFee = fun.RemainingFee -Amount ;   
                    }  
                }else{
                    ibfRemainingFee = fullFee-Amount;  
                }
            }
            if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Course'){
                console.log('if Course addIbfFunding');
                if(component.get("v.memberCheckbox") || component.get("v.isMember")){
                    console.log('if Course isMemberValue addIbfFunding');
                    fullFee = component.get("v.courseRunRecord.Course__r.Member_Total_Fee__c");
                    Amount = fullFee*$A.get("$Label.c.IBF_Funding")/100;
                    if(fundingList.length>0){
                        for(const fun of fundingList){
                            ibfRemainingFee = fun.RemainingFee -Amount ; 
                        }  
                    }else{
                        ibfRemainingFee = fullFee-Amount;  
                    } 
                  
    
                }else{
                    console.log('else addIbfFunding '+$A.get("$Label.c.IBF_Funding"));
                    fullFee = component.get("v.courseRunRecord.Course__r.Non_Member_Total_Fee__c");
                    Amount = fullFee*$A.get("$Label.c.IBF_Funding")/100;
                    if(fundingList.length>0){
                        for(const fun of fundingList){
                            ibfRemainingFee = fun.RemainingFee -Amount ; 
                        }  
                    }else{
                        ibfRemainingFee = fullFee-Amount;  
                    }
                }
            }
            
            console.log('Amount 2 '+Amount);
            console.log('currentGrandTotal 2 '+currentGrandTotal);
            console.log('validFunding 2 '+validFunding);    
            if(Amount<currentGrandTotal){
                console.log('currentGrandTotal 2');
                    validFunding = true;
                    component.set("v.grandTotal",ibfRemainingFee.toFixed(2));
            }else{
                   component.set("v.ibfFundingAdded", false);
                   helper.showError(component, event, $A.get("$Label.c.AmountFundingErrorHeader"));
            }
    
            console.log('addIbfFunding 2');
            if(validFunding){
                console.log('addIbfFunding 3');
                var fundingList = component.get("v.fundingList");
                fundingList.push({
                    'sobjectType': 'Learner_Funding__c',
                    'Funding__c': 'IBF Funding',
                    'Amount__c': Amount.toFixed(2),
                    'Status__c': 'Confirmed',
                    'Details__c': '',
                    'RemainingFee':ibfRemainingFee.toFixed(2)
                });
                component.set("v.fundingList", fundingList);
                component.set("v.isFundingAdded", true);
                component.set("v.ibfFundingAdded", true);
            }
            
            
            
        },
        
        addSkillFutureGrantFunding:function(component, event, helper) {
            
            
            console.log("fundingList@@@@@@@   "+component.find("NricTypeId").get("v.value"));
            
            let isCompanySponsered = component.get("v.isCompanySponsered");
            //console.log("fundingList@@@@@@@"+ component.get("v.isCompanySponsered")+component.get("v.contactRecord").CompanyUEN);
            let checkVal='';
            if(component.find("NricTypeId").get("v.value") != null && component.find("NricTypeId").get("v.value") != '' && component.find("dobId").get("v.value") != null && component.find("dobId").get("v.value") != '' && component.find("NricId").get("v.value") != null && component.find("NricId").get("v.value") !='' && component.find("NricId").get("v.value") !='undefined'){
                checkVal+='NricId';
            }else{
                helper.showError(component, event, $A.get("$Label.c.nricDetailBeforeAddingFundingError"));
                //component.set("v.ssgIntegrationModalOpen",true);
                //component.set("v.ssgMsg",'Please fill in your NRIC details before adding funding');
            }
            var idType='';
            if(component.find("NricTypeId").get("v.value") != null && component.find("NricTypeId").get("v.value") != '' && component.find("dobId").get("v.value") != null && component.find("dobId").get("v.value") != '' && component.find("NricId").get("v.value") != null && component.find("NricId").get("v.value") !='' && component.find("NricId").get("v.value") !='undefined' && component.find("NricTypeId").get("v.value") != 'Singapore Citizen/PR'){
                //component.set("v.ssgIntegrationModalOpen",true);
                //component.set("v.ssgMsg",'Funding is only applicable for Singaporean/PRs');
                helper.showError(component, event, $A.get("$Label.c.addFundingError"));
            }else{
                idType='NRIC';
            }
            
            let validNRIC = false;
            if( component.find("NricId").get("v.value") != null && component.find("NricId").get("v.value") !='' && component.get("v.nricValidationError")){
                //component.set("v.ssgIntegrationModalOpen",true);
                //component.set("v.ssgMsg",'Funding is only applicable for Singaporean/PRs');
                helper.showError(component, event, $A.get("$Label.c.invalidNRICIdError"));
            }else{
                
                validNRIC = true;
            }
            
            
            if(component.get("v.ischeckGrant") && checkVal=='NricId' && idType=='NRIC' && validNRIC){
                event.getSource().set("v.disabled", true);
                console.log('ischeckGrant');
                let CourseRegistrationListRequest=[];
                var CourseRegistrationRecord = {
                    id:component.find("NricId").get("v.value"),
                    idType: idType, 
                    dateOfBirth: component.find("dobId").get("v.value"),
                    sponsoringEmployerUen: isCompanySponsered == true ? component.get("v.contactRecord.Account").UEN_No__c:'' // Added for B2B User
                };
                CourseRegistrationListRequest.push(CourseRegistrationRecord);
                console.log(CourseRegistrationListRequest);
                var action=component.get("c.checkGrants");
                action.setParams({
                    startDate:component.get("v.courseRunRecord").Start_Date__c,
                    referenceNumber:component.get("v.courseRunRecord").Course__r.SSG_Course_Reference_Number__c,
                    isCompanySponsered:isCompanySponsered,
                    listtrainee:JSON.stringify(CourseRegistrationListRequest)
                });
                action.setCallback(this,function(response){
                    console.log('response.getReturnValue() '+response.getReturnValue());
                    console.log('response.getReturnValue() '+JSON.stringify(response.getReturnValue()));
                    if(response.getReturnValue().status =='SUCCESS' && response.getState()=='SUCCESS' && response.getReturnValue() != null){
                        
                        console.log('response.getReturnValue() '+response.getReturnValue());
                        var fullFee = 0;
                        var Amount = 0;
                        var grantRemainingFee = 0;
                        var fundingList = component.get("v.fundingList");
                        let validFunding = false;
                        let currentGrandTotal = component.get("v.grandTotal");
                        
                        console.log('currentGrandTotal0'+currentGrandTotal);
                        console.log('fullFee 0 '+component.get("v.courseRunRecord.Course__r.Full_Fee_with_GST__c"));
                        if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                            fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee_with_GST__c");
                            console.log('fullFee '+fullFee);
                            //fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee__c");
                            Amount = response.getReturnValue().totalAMt;
                            if(fundingList.length>0){
                                console.log('fundingList.length '+fundingList.length);
                                for(const fun of fundingList){
                                    grantRemainingFee = fun.RemainingFee - Amount ;   
                                }  
                            }else{
                                console.log('fundingList Amount '+Amount);
                                grantRemainingFee = fullFee - Amount;  
                                
                            }
                            //component.set("v.grandTotal",grantRemainingFee.toFixed(2));
                        }
                        
                        if(Amount<currentGrandTotal){
                            console.log('Amount<currentGrandTotal '+Amount);
                            validFunding = true;
                            component.set("v.grandTotal",grantRemainingFee.toFixed(2));
                        }else{
                            component.set("v.isGrantFundingAdded", false);
                            event.getSource().set("v.disabled", false);
                            helper.showError(component, event, $A.get("$Label.c.AmountFundingErrorHeader"));
                        }
    
                        console.log('validFunding '+validFunding);
                        var fundingList = component.get("v.fundingList");
                        if(validFunding){
                            console.log('validFunding1 '+validFunding);
                            fundingList.push({
                            'sobjectType': 'Learner_Funding__c',
                            'Funding__c': response.getReturnValue().sponsoringEmployerUen,
                            'Amount__c': (response.getReturnValue().totalAMt).toFixed(2),
                            'Status__c': 'Confirmed',
                            'Details__c': response.getReturnValue().SSGFundingTypes, 
                            'SSG_Response__c': response.getReturnValue().response,
                            'SSG_Funding_Types__c':response.getReturnValue().SSGFundingTypes,
                            'RemainingFee':grantRemainingFee.toFixed(2)  
                        });
                        // console.log("fundingList@@@@@@@   "+fundingList);
                        component.set("v.fundingList", fundingList);
                        component.set("v.isFundingAdded", true);
                        component.set("v.isGrantFundingAdded", true); 
                            
                        }
                        
                        // console.log('grantFundingAdded '+ component.get("v.grantFundingAdded"));
                        //helper.showDuplicateFunError(component, event);
                        
                    }else if(response.getReturnValue().message !='' && response.getReturnValue().message !=null){
                        console.log("else If checkGrants@@@@@@@    828");
                        //component.set("v.ssgIntegrationErrorModal",true);
                        //component.set("v.ssgErrorMsg",response.getReturnValue().message);
                         component.set("v.isGrantFundingAdded", false);
                         event.getSource().set("v.disabled", false);
                         helper.showError(component, event, response.getReturnValue().message);
                    }else{
                        console.log("else checkGrants@@@@@@@    831");
                        //component.set("v.ssgIntegrationModalOpen",true);
                        //component.set("v.ssgMsg",'Funding is Not Applicable');
                        component.set("v.isGrantFundingAdded", false);
                        event.getSource().set("v.disabled", false);
                        helper.showError(component, event, $A.get("$Label.c.notApplicableFundingError"));
                    }
                });
                $A.enqueueAction(action);   
            }
            
        }, 
        
        addSkillFutureCreditFunding:function(component, event, helper) {
            
            console.log("addSkillFutureCreditFunding");
            
            // console.log('claimRequestObj ');        
            var checkVal='';
            if(component.find("NricTypeId").get("v.value") != null && component.find("NricTypeId").get("v.value") != '' && component.find("NricId").get("v.value") != null && component.find("NricId").get("v.value") !='' && component.find("NricId").get("v.value") !='undefined'){
                checkVal+='NricId';
            }else{
                helper.showError(component, event, $A.get("$Label.c.nricDetailBeforeAddingFundingError"));
                //component.set("v.sfcIntegrationModalOpen",true);
                //component.set("v.sfcMsg",'Please fill in your NRIC details before adding funding');
            }
            
            console.log('component.find("NricId").get("v.value") '+component.find("NricId").get("v.value"));
            var idType='';
            if(component.find("NricTypeId").get("v.value") != null && component.find("NricTypeId").get("v.value") != '' && component.find("NricId").get("v.value") != null && component.find("NricId").get("v.value") !='' && component.find("NricId").get("v.value") !='undefined' && component.find("NricTypeId").get("v.value") != 'Singapore Citizen/PR' ){
                
                helper.showError(component, event, $A.get("$Label.c.addFundingError"));
                //component.set("v.sfcIntegrationModalOpen",true);
                //component.set("v.sfcMsg",'Funding is only applicable for Singaporean/PRs');
            }else{
                idType='NRIC';
            }
            
            let validNRIC = false;
            if( component.find("NricId").get("v.value") != null && component.find("NricId").get("v.value") !='' && component.get("v.nricValidationError")){
                //component.set("v.ssgIntegrationModalOpen",true);
                //component.set("v.ssgMsg",'Funding is only applicable for Singaporean/PRs');
                helper.showError(component, event, $A.get("$Label.c.invalidNRICIdError"));
            }else{
                
                validNRIC = true;
            }
            if(component.get("v.isSkillFutureCredit") && checkVal=='NricId' && idType=='NRIC' && validNRIC){
                event.getSource().set("v.disabled", true);
                // Creating JSON Claim Request for API to Get Claim Request Data
                console.log('claimRequestObj3 ');
                var claimRequestObj ={
                    claimRequest: {
                        course: "",
                        individual: "",
                        additionalInformation:""
                    } 
                }
                
                
                var fullFee = 0;
                var feeForClaimReq = 0;
                var fundingList = component.get("v.fundingList");
                var gstCode = component.get("v.courseRunRecord.Course__r.GST_Code__c"); 
                var gstMode = component.get("v.courseRunRecord.Course__r.GST_Mode__c"); 
                
                // Gst Percent Calculation Added By Pradyumn 24/12/21
                let index = gstCode.indexOf("%"); 
                var gstPercent = gstCode.substr(0, index);
                var gstCodePerc = gstPercent/100;
                
                if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                    console.log('Funded ');
                    //edited by Ferlyn Vergel 06/09/22
                    //fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee__c");
                    fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee_with_GST__c");
                    console.log('Full_Fee__c '+fullFee);
                    if(fundingList.length>0){
                        for(const fun of fundingList){
                            //let gstFreeClaimFee = Math.ceil(fun.RemainingFee / (1 + gstCodePerc));
                            let gstFreeClaimFee = Math.ceil(fun.RemainingFee);
                            feeForClaimReq = gstFreeClaimFee; 
                            //console.log('feeForClaimReq '+feeForClaimReq);
                        }  
                    }else{
                        console.log('else feeForClaimReq ');
                        feeForClaimReq = fullFee;  
                    }   
                }
                console.log('CourseRecordType__c '+component.get("v.courseRunRecord.CourseRecordType__c")+component.get("v.memberCheckbox"));
                if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Course'){
                    console.log('Course '+component.get("v.memberCheckbox"));
                    if(component.get("v.memberCheckbox") || component.get("v.isMember")){
                        fullFee = component.get("v.courseRunRecord.Course__r.Member_Fee__c");
                        if(fundingList.length>0){
                            for(const fun of fundingList){
                                let gstFreeClaimFee = Math.ceil(fun.RemainingFee / (1 + gstCodePerc));
                                feeForClaimReq = gstFreeClaimFee; 
                                
                            }  
                        }else{
                            feeForClaimReq = fullFee;  
                        }   
                    }
                    else{
                        console.log('elsec course');
                        fullFee = component.get("v.courseRunRecord.Course__r.Non_Member_Fee__c");
                        if(fundingList.length>0){
                            console.log('fundingList');
                            for(const fun of fundingList){
                                let gstFreeClaimFee = Math.ceil(fun.RemainingFee / (1 + gstCodePerc));
                                feeForClaimReq = gstFreeClaimFee; 
                            }  
                        }else{
                            feeForClaimReq = fullFee;  
                        }       
                    } 
                }
                console.log('before Course0 ');
                console.log('before Course '+component.get("v.contactRecord").Email);
                var Course = {
                    id:component.get("v.courseRunRecord.Course__r").SSG_Course_Reference_Number__c,
                    fee:feeForClaimReq.toString(),
                    runId: component.get("v.courseRunRecord").SSG_Course_Run_ID__c,
                    startDate: component.get("v.courseRunRecord").Start_Date__c
                    
                };
                var individual = {
                    nric: component.find("NricId").get("v.value"),
                    email: component.get("v.contactRecord.Email"),
                    homeNumber: component.get("v.contactRecord.Mobile_Number__c"),
                    mobileNumber: component.get("v.contactRecord.Mobile_Number__c")
                    
                };
                console.log('claimRequestObj1 '+ claimRequestObj);
                claimRequestObj.claimRequest.course= Course;
                claimRequestObj.claimRequest.individual= individual;
                console.log('claimRequestObj '+ claimRequestObj);
                // console.log('claimRequestObj.claimRequest.course.fee '+claimRequestObj.claimRequest.course.fee);
                // Added to Check the Claim Request Fee should be greater >0
                if(parseFloat(claimRequestObj.claimRequest.course.fee) > 0 && claimRequestObj.claimRequest.course.fee !=''){
                    // Sending Claim Request Data to VF Page Using Dynamic URL
                    var URL = '/apex/SkillFutureCreditRedirect?id='+claimRequestObj.claimRequest.course.id
                    +'&fee='+claimRequestObj.claimRequest.course.fee
                    +'&runId='+claimRequestObj.claimRequest.course.runId
                    +'&startDate='+claimRequestObj.claimRequest.course.startDate
                    +'&nric='+claimRequestObj.claimRequest.individual.nric
                    +'&email='+claimRequestObj.claimRequest.individual.email
                    +'&homeNumber='+claimRequestObj.claimRequest.individual.homeNumber
                    +'&mobileNumber='+claimRequestObj.claimRequest.individual.mobileNumber
                    +'&additionalInformation='+claimRequestObj.claimRequest.additionalInformation;
                    
                    console.log(URL);
                    component.set("v.dynamicUrl", URL);
                    const reqBody = JSON.stringify(claimRequestObj);
                    var action=component.get("c.checkSkillFutureCreditController");
                    action.setParams({reqBody:reqBody});
                    action.setCallback(this,function(response){
                        if(response.getState()=='SUCCESS' && response.getReturnValue() != null){
                            console.log('URL');
                            console.log(response.getReturnValue());
                            //event.getSource().set("v.disabled", true);
                            const claimRequest = response.getReturnValue();
                            component.set("v.claimRequest",claimRequest);
                            // console.log('URL');
                            component.set("v.spinner", true);
                            //var popupWin = window.open(URL, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=400,left=400,width=600,height=600,menubar=no,status=no,titlebar=no,toolbar=no");
                            var w = 1475;
                            var h = 675;
                            var left = Number((screen.width/2)-(w/2));
                            var tops = Number((screen.height/2)-(h/2));
                            
                            var popupWin = window.open(URL, "_blank", 'toolbar=yes,scrollbars=yes,resizable=yes,status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+tops+', left='+left);
                            //  console.log('popupWin@@@@@@@ '+typeof popupWin);
                            component.set("v.popupWin",popupWin);
                            
                        }
                        else if(response.getReturnValue().message !='' && response.getReturnValue().message !=null){
                            console.log("In ELSE IF");
                            //component.set("v.sfcIntegrationErrorModal",true);
                            //component.set("v.sfcErrorMsg",response.getReturnValue().message);
                            helper.showError(component,event,response.getReturnValue().message);
                        }else{
                            console.log("In ELSE IF2");
                            //console.log("In ELSE");
                            //component.set("v.sfcIntegrationModalOpen",true);
                            //component.set("v.sfcMsg",'Funding is Not Applicable');
                            helper.showError(component, event, $A.get("$Label.c.notApplicableFundingError"));
                        }
                    });
                    $A.enqueueAction(action);    
                }
                else{
                     
                    //console.log('ELSE SKSILL'+ component.get("v.InvalidSkillFutureCreditAmt") );
                    //component.set("v.InvalidSkillFutureCreditAmt",true);
                    helper.showError(component, event, $A.get("$Label.c.InvalidClaimFee"));
                }
            }    
        },
        
        removeFunding: function(component, event, helper) {
            //Get the account list
            var fundingList = component.get("v.fundingList");
            //Get the target object
            var selectedItem = event.currentTarget;
            //Get the selected item index
            var index = parseInt(selectedItem.dataset.record);
            //set the var for full fee
            var fullFee = 0;
            
            var regId = component.get("v.courseRegistrationId");
            console.log('courseRegistrationId '+regId);
            console.log('Funding__c '+fundingList[index].Funding__c);
            
            if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                fullFee = component.get("v.courseRunRecord.Course__r.Full_Fee_with_GST__c");
            }else{
                //  console.log('isMemberValue'+component.get("v.isMemberValue"));
                if(component.get("v.memberCheckbox")){
                    fullFee = component.get("v.courseRunRecord.Course__r.Member_Total_Fee__c");    
                }
                else{
                    fullFee = component.get("v.courseRunRecord.Course__r.Non_Member_Total_Fee__c");
                }  
            }
            
            if(fundingList[index].Funding__c=='IBF Funding'){
                if(fundingList.length>1 ){
                    var allRemainFee = 0
                    for(const fun of fundingList){
                        if(allRemainFee==0 && fun.Funding__c!='IBF Funding'){
                            fun.RemainingFee = (fullFee - fun.Amount__c).toFixed(2); 
                            allRemainFee = fullFee - fun.Amount__c;  
                            component.set("v.grandTotal",allRemainFee);
                        }
                        else if(allRemainFee!=0 && fun.Funding__c!='IBF Funding'){
                            fun.RemainingFee = (allRemainFee - fun.Amount__c).toFixed(2);
                            allRemainFee = allRemainFee - fun.Amount__c;
                            component.set("v.grandTotal",allRemainFee);
                        } 
                    }
                }else{
                    fundingList[index].RemainingFee=0;
                    if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                        var grandTotal = component.get("v.courseRunRecord.Course__r").Full_Fee_with_GST__c;
                        var earlyBirdFundedDiscount = component.get("v.earlyBirdFundedDiscount");
                        var promotionFundedDiscount = component.get("v.promotionFundedDiscount");
                        if(earlyBirdFundedDiscount > 0){
                            grandTotal = grandTotal - earlyBirdFundedDiscount;
                        }else if(promotionFundedDiscount > 0){
                            grandTotal = grandTotal - promotionFundedDiscount;
                        }
                        component.set("v.grandTotal",grandTotal);
                    }else{
                         if(component.get("v.memberCheckbox")){
                             var grandTotal = component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c;
                             var earlyBirdMemberDiscount = component.get("v.earlyBirdMemberDiscount");
                             var promotionMemberDiscount = component.get("v.promotionMemberDiscount");
                             if(earlyBirdMemberDiscount > 0){
                                 grandTotal = grandTotal - earlyBirdMemberDiscount;
                             }else if(promotionMemberDiscount > 0){
                                 grandTotal = grandTotal - promotionMemberDiscount;
                             }
                             component.set("v.grandTotal",grandTotal);
                         }else{
                             var grandTotal = component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c;
                             var earlyBirdNonMemberDiscount = component.get("v.earlyBirdNonMemberDiscount");
                             var promotionNonMemberDiscount = component.get("v.promotionNonMemberDiscount");
                             if(earlyBirdNonMemberDiscount > 0){
                                 grandTotal = grandTotal - earlyBirdNonMemberDiscount;
                             }else if(promotionNonMemberDiscount > 0){
                                 grandTotal = grandTotal - promotionNonMemberDiscount;
                             }
                             component.set("v.grandTotal",grandTotal);
                         }
                    }
                }
                fundingList[index].RemainingFee=0;
                component.set("v.ibfFundingAdded", false);
                //component.set("v.ibfRemainingFee", 0);
                //helper.deleteLearnerFunding(component,regId,"IBF Funding");
            }
            
            if(fundingList[index].Funding__c=='SkillsFuture Funding'){
                if(fundingList.length>1 ){
                    var allRemainFee = 0
                    for(const fun of fundingList){
                        if(allRemainFee==0 && fun.Funding__c!='SkillsFuture Funding'){
                            fun.RemainingFee = (fullFee - fun.Amount__c).toFixed(2); 
                            allRemainFee = fullFee - fun.Amount__c;  
                            component.set("v.grandTotal",allRemainFee);
                        }
                        else if(allRemainFee!=0 && fun.Funding__c!='SkillsFuture Funding'){
                            fun.RemainingFee = (allRemainFee - fun.Amount__c).toFixed(2); 
                            allRemainFee = allRemainFee - fun.Amount__c; 
                            component.set("v.grandTotal",allRemainFee);
                        } 
                    }
                }else{
                    fundingList[index].RemainingFee=0; 
                    if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                        var grandTotal = component.get("v.courseRunRecord.Course__r").Full_Fee_with_GST__c;
                        var earlyBirdFundedDiscount = component.get("v.earlyBirdFundedDiscount");
                        var promotionFundedDiscount = component.get("v.promotionFundedDiscount");
                        if(earlyBirdFundedDiscount > 0){
                            grandTotal = grandTotal - earlyBirdFundedDiscount;
                        }else if(promotionFundedDiscount > 0){
                            grandTotal = grandTotal - promotionFundedDiscount;
                        }
                        component.set("v.grandTotal",grandTotal);
                    }else{
                         if(component.get("v.memberCheckbox")){
                             var grandTotal = component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c;
                             var earlyBirdMemberDiscount = component.get("v.earlyBirdMemberDiscount");
                             var promotionMemberDiscount = component.get("v.promotionMemberDiscount");
                             if(earlyBirdMemberDiscount > 0){
                                 grandTotal = grandTotal - earlyBirdMemberDiscount;
                             }else if(promotionMemberDiscount > 0){
                                 grandTotal = grandTotal - promotionMemberDiscount;
                             }
                             component.set("v.grandTotal",grandTotal);
                         }else{
                             var grandTotal = component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c;
                             var earlyBirdNonMemberDiscount = component.get("v.earlyBirdNonMemberDiscount");
                             var promotionNonMemberDiscount = component.get("v.promotionNonMemberDiscount");
                             if(earlyBirdNonMemberDiscount > 0){
                                 grandTotal = grandTotal - earlyBirdNonMemberDiscount;
                             }else if(promotionNonMemberDiscount > 0){
                                 grandTotal = grandTotal - promotionNonMemberDiscount;
                             }
                             component.set("v.grandTotal",grandTotal);
                         }
                    }
                }
                fundingList[index].RemainingFee=0;
                component.set("v.isGrantFundingAdded", false);
                //console.log('before deleteLearnerFunding');
                //helper.deleteLearnerFunding(component,regId,"SkillsFuture Funding");
                //component.set("v.grantRemainingFee", 0);
            }
            
            
            if(fundingList[index].Funding__c=='SkillsFuture Credit'){
                if(fundingList.length>1 ){
                    var allRemainFee = 0
                    for(const fun of fundingList){
                        if(allRemainFee==0 && fun.Funding__c!='SkillsFuture Credit'){
                            fun.RemainingFee = (fullFee - fun.Amount__c).toFixed(2); 
                            allRemainFee = fullFee - fun.Amount__c;  
                            component.set("v.grandTotal",allRemainFee);
                        }
                        else if(allRemainFee!=0 && fun.Funding__c!='SkillsFuture Credit'){
                            fun.RemainingFee = (allRemainFee - fun.Amount__c).toFixed(2); 
                            allRemainFee = allRemainFee - fun.Amount__c; 
                            component.set("v.grandTotal",allRemainFee);
                        } 
                    }
                }else{
                    fundingList[index].RemainingFee=0; 
                    if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Funded_Course'){
                        var grandTotal = component.get("v.courseRunRecord.Course__r").Full_Fee_with_GST__c;
                        var earlyBirdFundedDiscount = component.get("v.earlyBirdFundedDiscount");
                        var promotionFundedDiscount = component.get("v.promotionFundedDiscount");
                        if(earlyBirdFundedDiscount > 0){
                            grandTotal = grandTotal - earlyBirdFundedDiscount;
                        }else if(promotionFundedDiscount > 0){
                            grandTotal = grandTotal - promotionFundedDiscount;
                        }
                        component.set("v.grandTotal",grandTotal);
                    }else{
                         if(component.get("v.memberCheckbox")){
                             var grandTotal = component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c;
                             var earlyBirdMemberDiscount = component.get("v.earlyBirdMemberDiscount");
                             var promotionMemberDiscount = component.get("v.promotionMemberDiscount");
                             if(earlyBirdMemberDiscount > 0){
                                 grandTotal = grandTotal - earlyBirdMemberDiscount;
                             }else if(promotionMemberDiscount > 0){
                                 grandTotal = grandTotal - promotionMemberDiscount;
                             }
                             component.set("v.grandTotal",grandTotal);
                         }else{
                             var grandTotal = component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c;
                             var earlyBirdNonMemberDiscount = component.get("v.earlyBirdNonMemberDiscount");
                             var promotionNonMemberDiscount = component.get("v.promotionNonMemberDiscount");
                             if(earlyBirdNonMemberDiscount > 0){
                                 grandTotal = grandTotal - earlyBirdNonMemberDiscount;
                             }else if(promotionNonMemberDiscount > 0){
                                 grandTotal = grandTotal - promotionNonMemberDiscount;
                             }
                             component.set("v.grandTotal",grandTotal);
                         }
                    }
                }
                fundingList[index].RemainingFee=0;
                component.set("v.isCreditFundingAdded", false);
                component.set("v.isFundingAdded", true);
                //component.set("v.skillFutureRemainingFee", 0);
                //Need To add Cancel SFC Claim
                let claimId = fundingList[index].SFC_Claim_Id__c;
                let nric = fundingList[index].NricId;
                
                //  console.log('claimId '+claimId+ ' '+nric);
                //helper.cancelSFCClaim(component,claimId,51,nric);
                //helper.deleteLearnerFunding(component,regId,"SkillsFuture Credit");
            }
            
            fundingList.splice(index, 1);
            console.log('fun '+index);
            component.set("v.fundingList", fundingList);
            
            if(fundingList.length <= 0){
                console.log('fun '+index);
                component.set("v.isFundingAdded", false); 
                
            }
        },
        
        handleOnSubmit : function(component, event, helper) { 
            
            //var buttonLabel = component.get('v.buttonlabel'); 
            console.log("handleOnSubmit");
            event.preventDefault(); //Prevent default submit
            var allValid = true;
    
            var attenstionVal = component.find("Attention");
            var billingLine1 = component.find("BillingAddressLine1"); 
            var postalCode = component.find("BillingPostalCode");
            if ($A.util.isEmpty(attenstionVal.get("v.value").trim()) || $A.util.isEmpty(billingLine1.get("v.value").trim())
                         || $A.util.isEmpty(postalCode.get("v.value").trim())){
                allValid = false;
            }
    
            if (!allValid) {
                helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                return false;
            }
            console.log("Validation Success");
    
            component.set('v.disableClass','disableButton'); 
            console.log("validatePIISection"+component.get("v.piiSection"));
            //if promo code applied no need to validate pii
            if(component.get("v.piiSection") && !component.get("v.isPromoCodeApplied")){
                helper.validatePIISection(component, event, helper);
            }else{
                
                helper.submitRegistration(component, event, helper);
            }
           
            
        },
        
    	/* ********************************************************* */
    
        handlePaymentNowCustomSubmit : function(component, event, helper) {
            console.log("hello, World! payment now")
            //component.set('v.disableClass','disableButton');
            //component.set('v.disableClass','disableButton');
            
            
            
            var paymentNowButton = document.querySelector(".paymentNow");
            
            var courseType = component.get("v.courseRunRecord.CourseRecordType__c");
            
            
            var attentionVal = component.find("Attention");
            var billingLine1 = component.find("BillingAddressLine1"); 
            var postalCode = component.find("BillingPostalCode");
            
            
            console.log(attentionVal.get("v.value"));
            console.log(billingLine1.get("v.value"));
            console.log(postalCode.get("v.value"));
            
            
            if (courseType == "Funded_Course") {
                
                var dobField = component.find("dobId");
            	var nricTypeField = component.find("NricTypeId");
            	var nricField = component.find("NricId");
                
                    if (
                        $A.util.isEmpty(dobField.get("v.value")) || 
                        $A.util.isEmpty(nricTypeField.get("v.value")) || 
                        $A.util.isEmpty(nricField.get("v.value").trim()) ||
                        $A.util.isEmpty(attentionVal.get("v.value")) ||
                        $A.util.isEmpty(billingLine1.get("v.value")) ||
                        $A.util.isEmpty(postalCode.get("v.value")) 
                    ) {
                        helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                        if ($A.util.isEmpty(dobField.get("v.value"))) 		{ dobField.focus(); dobField.reportValidity() };
                        if ($A.util.isEmpty(nricTypeField.get("v.value"))) 	{ nricTypeField.focus(); nricTypeField.reportValidity() };
                        if ($A.util.isEmpty(nricField.get("v.value"))) 		{ nricField.focus(); nricField.reportValidity() };
                        if ($A.util.isEmpty(attentionVal.get("v.value"))) { attentionVal.focus(); attentionVal.reportValidity(); }
                        if ($A.util.isEmpty(billingLine1.get("v.value"))) { billingLine1.focus(); billingLine1.reportValidity(); }
                        if ($A.util.isEmpty(postalCode.get("v.value")))   { postalCode.focus(); postalCode.reportValidity(); }
                        return;
                	}
            }
            
            if (
            	$A.util.isEmpty(attentionVal.get("v.value")) ||
                $A.util.isEmpty(billingLine1.get("v.value")) ||
                $A.util.isEmpty(postalCode.get("v.value")) 
            ) {
                helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                if ($A.util.isEmpty(attentionVal.get("v.value"))) { attentionVal.focus(); attentionVal.reportValidity(); }
                if ($A.util.isEmpty(billingLine1.get("v.value"))) { billingLine1.focus(); billingLine1.reportValidity(); }
                if ($A.util.isEmpty(postalCode.get("v.value")))   { postalCode.focus(); postalCode.reportValidity(); }
                return;
            }
            
            component.set('v.buttonlabel','PaymentNow'); 
            paymentNowButton.click();
            
            //component.set("v.showSubmitSpinner",true);       
        },
        
        handlePaymentLaterCustomSubmit : function(component, event, helper) {
            
            console.log("Hello, World!");
            
            console.log(component.get("v.courseRunRecord.CourseRecordType__c"));
            
            var submitAndMakePaymentLaterButton = document.querySelector(".sumbitAndMakePaymentLater");
            var courseType = component.get("v.courseRunRecord.CourseRecordType__c");
            
            
            var attentionVal = component.find("Attention");
            var billingLine1 = component.find("BillingAddressLine1"); 
            var postalCode = component.find("BillingPostalCode");
            
            
            console.log(attentionVal.get("v.value"));
            console.log(billingLine1.get("v.value"));
            console.log(postalCode.get("v.value"));
            
            
            if (courseType == "Funded_Course") {
                
                var dobField = component.find("dobId");
            	var nricTypeField = component.find("NricTypeId");
            	var nricField = component.find("NricId");
                
                    if (
                        $A.util.isEmpty(dobField.get("v.value")) || 
                        $A.util.isEmpty(nricTypeField.get("v.value")) || 
                        $A.util.isEmpty(nricField.get("v.value").trim()) ||
                        $A.util.isEmpty(attentionVal.get("v.value")) ||
                        $A.util.isEmpty(billingLine1.get("v.value")) ||
                        $A.util.isEmpty(postalCode.get("v.value")) 
                    ) {
                        helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                        if ($A.util.isEmpty(dobField.get("v.value"))) 		{ dobField.focus(); dobField.reportValidity() };
                        if ($A.util.isEmpty(nricTypeField.get("v.value"))) 	{ nricTypeField.focus(); nricTypeField.reportValidity() };
                        if ($A.util.isEmpty(nricField.get("v.value"))) 		{ nricField.focus(); nricField.reportValidity() };
                        if ($A.util.isEmpty(attentionVal.get("v.value"))) { attentionVal.focus(); attentionVal.reportValidity(); }
                        if ($A.util.isEmpty(billingLine1.get("v.value"))) { billingLine1.focus(); billingLine1.reportValidity(); }
                        if ($A.util.isEmpty(postalCode.get("v.value")))   { postalCode.focus(); postalCode.reportValidity(); }
                        return;
                	}
            }
            
            if (
            	$A.util.isEmpty(attentionVal.get("v.value")) ||
                $A.util.isEmpty(billingLine1.get("v.value")) ||
                $A.util.isEmpty(postalCode.get("v.value")) 
            ) {
                helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                if ($A.util.isEmpty(attentionVal.get("v.value"))) { attentionVal.focus(); attentionVal.reportValidity(); }
                if ($A.util.isEmpty(billingLine1.get("v.value"))) { billingLine1.focus(); billingLine1.reportValidity(); }
                if ($A.util.isEmpty(postalCode.get("v.value")))   { postalCode.focus(); postalCode.reportValidity(); }
                return;
            }
            
            component.set('v.buttonlabel','PaymentLater');
            submitAndMakePaymentLaterButton.click();
           
            
           
            console.log(component.get("v.buttonlabel"));
            
            //component.set("v.showSubmitSpinner",true);
        },
        
        handleSaveDraftCustomSubmit : function(component, event, helper) {
            
            console.log("hello world, save draft");
            
            //component.set('v.disableClass','disableButton');
            //component.set('v.disableClass','disableButton');
            
            
            var submitAndDraftButton = document.querySelector(".submitAndDraft");
            var courseType = component.get("v.courseRunRecord.CourseRecordType__c");
            
            
            var attentionVal = component.find("Attention");
            var billingLine1 = component.find("BillingAddressLine1"); 
            var postalCode = component.find("BillingPostalCode");
            
            
            console.log(attentionVal.get("v.value"));
            console.log(billingLine1.get("v.value"));
            console.log(postalCode.get("v.value"));
            
            
            if (courseType == "Funded_Course") {
                
                var dobField = component.find("dobId");
            	var nricTypeField = component.find("NricTypeId");
            	var nricField = component.find("NricId");
                
                    if (
                        $A.util.isEmpty(dobField.get("v.value")) || 
                        $A.util.isEmpty(nricTypeField.get("v.value")) || 
                        $A.util.isEmpty(nricField.get("v.value").trim()) ||
                        $A.util.isEmpty(attentionVal.get("v.value")) ||
                        $A.util.isEmpty(billingLine1.get("v.value")) ||
                        $A.util.isEmpty(postalCode.get("v.value")) 
                    ) {
                        helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
                        if ($A.util.isEmpty(dobField.get("v.value"))) 		{ dobField.focus(); dobField.reportValidity() };
                        if ($A.util.isEmpty(nricTypeField.get("v.value"))) 	{ nricTypeField.focus(); nricTypeField.reportValidity() };
                        if ($A.util.isEmpty(nricField.get("v.value"))) 		{ nricField.focus(); nricField.reportValidity() };
                        if ($A.util.isEmpty(attentionVal.get("v.value"))) { attentionVal.focus(); attentionVal.reportValidity(); }
                        if ($A.util.isEmpty(billingLine1.get("v.value"))) { billingLine1.focus(); billingLine1.reportValidity(); }
                        if ($A.util.isEmpty(postalCode.get("v.value")))   { postalCode.focus(); postalCode.reportValidity(); }
                        return;
                	}
            }
            
            if (
            	$A.util.isEmpty(attentionVal.get("v.value")) ||
                $A.util.isEmpty(billingLine1.get("v.value")) ||
                $A.util.isEmpty(postalCode.get("v.value")) 
            ) {
                helper.ShowToastEvent(component, event, $A.get("$Label.c.missingMandatoryFieldsError"), 'Warning', 'warning');
				if ($A.util.isEmpty(attentionVal.get("v.value"))) { attentionVal.focus(); attentionVal.reportValidity(); }
                if ($A.util.isEmpty(billingLine1.get("v.value"))) { billingLine1.focus(); billingLine1.reportValidity(); }
                if ($A.util.isEmpty(postalCode.get("v.value")))   { postalCode.focus(); postalCode.reportValidity(); }
                return;
            }
            
            
            component.set('v.buttonlabel','Draft');   
            submitAndDraftButton.click();
            //component.set("v.showSubmitSpinner",true);
        },
    
    	/* ********************************************************* */
        
        handleOnSuccess : function(component, event, helper) {  
            
            var param = event.getParams(); //get event params
            var fields = param.response.fields; 
            var recordId = param.response.id;
            console.log("response SuCCEESS"+fields); 
            console.log("response recordId"+recordId);
            component.set("v.courseRegistrationId" ,recordId);
                      
            
            if(component.get('v.buttonlabel') == 'PaymentNow'){
                var getinvoice = component.get('c.returnInvoice');
                getinvoice.setParams({courseRegId:recordId});
                getinvoice.setCallback(this, function(response) { 
                    if(response.getState() === "SUCCESS") {
                        console.log('success');
                        console.log('invoiceId '+response.getReturnValue());
                        var invoiceId = response.getReturnValue(); 
                        component.set("v.invoiceId" , invoiceId);  
                        //component.set("v.selTabId" , 'Payment');
                        console.log('invoiceId '+invoiceId);
                        console.log('success');  
                        if(invoiceId != null && invoiceId != '' && invoiceId != 'undefined'){
                            component.set("v.redirectToPayment",true);
                            component.set("v.showSubmitSpinner",false);      
                        }else{
                            component.set("v.showSubmitSpinner",false);
                           console.log('invoiceId empty'+invoiceId);  
                            
                        }
                        
                        
                    } else if(response.getState() == "ERROR"){
                        component.set("v.showSubmitSpinner",false);
                        var errors = response.getError();    
                        console.log(errors[0].message);
                    }
                    
                }); 
                $A.enqueueAction(getinvoice); 
                
            }else if(component.get('v.buttonlabel') == 'PaymentLater'|| component.get('v.buttonlabel') == 'Draft' ){
                
                console.log("Registration Created Successfully")
                
                if(!$A.util.isEmpty(component.get("v.fundingList"))) {
                    console.log("createLearnerFunding")
                    helper.createLearnerFunding(component, event); 
                }
                if( component.get('v.buttonlabel') == 'Draft'){
                 helper.showSuccess(component, event,'Registration Saved as Draft Successfully!!');   
                }else{ 
                  helper.showSuccess(component, event,'Registration Done Successfully!!'); 
                }
                
                if(!component.get("v.userLoggedIn")){
                    
                    /*var urlEvent = $A.get("e.force:navigateToURL");
                    urlEvent.setParams({
                        "url": "/login"
                    });
                    urlEvent.fire();      
                    component.set("v.showSubmitSpinner",false);*/
                    location.href = '/s/thank-you';
                }else{
                    
                    var urlEvent = $A.get("e.force:navigateToURL");
                    urlEvent.setParams({
                        "url": "/course-registration/"+recordId
                    });
                    urlEvent.fire(); 
                    
                    
                }
                
                
                
            }
            
            
        },
        
        handleError: function(component, event) {
            var errors = event.getParams();   
            component.set("v.showSubmitSpinner",false); 
            console.log("response Error", JSON.stringify(errors));
            component.find('ErrMessage').setError('Undefined error occured');
            component.set('v.disableClass','');
        },
        
        redirectToBulkReg : function(component,event,helper){
            
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                "url": "/bulk-registration?courseruncode="+component.get("v.courseRunCode")
            });
            urlEvent.fire();
            
        },
        
         redirectToDeclaration : function(component,event,helper){
            var communityURLlabel = $A.get("$Label.c.Community_URL");
            window.open(communityURLlabel+'/s/declaration', '_blank');
            
        },
        
    
        EditPIISection : function (component, event, helper) {
            var valueNRIC = component.get("v.contactRecord.NRIC__c")
            var typeOfNRIC = component.get("v.contactRecord.NRIC_Type__c")
            var DOBirthNRIC = component.get("v.contactRecord.Date_of_Birth__c")
            component.set("v.valNRIC",valueNRIC);
            component.set("v.typeNRIC",typeOfNRIC);
            component.set("v.dobNRIC",DOBirthNRIC);
            component.set("v.alertTest",true);
            
            
        },
        
        closeSSGAlertModal: function(component, event, helper) {
            component.set("v.alertTest", false);
            //component.set("v.nricValidationError", false);
            component.set("v.dateValidationError", false);
            component.set("v.validationError", false);
        },
        
        EditPIISectionVal : function (component, event, helper) {
            //valueNRIC.reportValidity();
            //typeOfNRIC.reportValidity();
            //DOBirthNRIC.reportValidity(); 
            console.log('EditPIISectionVal ');
            var dobField = component.find("dobIdb");
            var dobValue = dobField.get("v.value");
            var todayDate = $A.localizationService.formatDate(new Date(), "YYYY-MM-DD");
            console.log(dobValue + 'dob==');
            console.log(todayDate + 'for==');
            if(dobValue != '' && dobValue > todayDate) {
                component.set("v.dateValidationError" , true);
            } else{
                component.set("v.dateValidationError" , false);
            }
            
            
            //component.set("v.spinner2", true);
            /*var cgv = component.get('c.checkGrantValidation');
            $A.enqueueAction(cgv);*/
            
            if(component.get("v.dateValidationError")){
                console.log('EditPIISectionVal1 ');
                component.set("v.alertTest", true);
            } 
            else if(component.find("NricTypeIdb").get("v.value") == null || component.find("NricTypeIdb").get("v.value") == '' || component.find("dobIdb").get("v.value") == null || component.find("dobIdb").get("v.value") == '' || component.find("NricIdb").get("v.value") == null || component.find("NricIdb").get("v.value") =='' || component.find("NricIdb").get("v.value") =='undefined'){
                console.log('EditPIISectionVal 2');
                component.set("v.alertTest", true);
                component.set("v.validationError", true);
            } else {
                console.log('EditPIISectionVal3 ');
                /*var action= component.get("c.validateNRIC");
                $A.enqueueAction(action); */
                component.set("v.alertTest", false);
                component.set("v.contactRecord.NRIC__c", component.get("v.valNRIC"));
                component.set("v.contactRecord.NRIC_Type__c", component.get("v.typeNRIC"));
                component.set("v.contactRecord.Date_of_Birth__c", component.get("v.dobNRIC"));
            }
            
            
        },
        
        //checkGrantValidation
        removeFundOnNricChng:function(component, event, helper) {
            
            var fundingList = component.get("v.fundingList");
            var flnth = fundingList.length;
            for(var i=flnth-1;i>=0;i--){
                console.log(fundingList.length);
                if(fundingList[i].Status__c=='Confirmed' && fundingList[i].Status__c !='undefined'){
                    fundingList.splice(i, 1);
                    // console.log(fundingList);
                }
            }
            
            component.set("v.fundingList", fundingList);
            component.set("v.isFundingAdded", false);
            component.set("v.ibfFundingAdded", false);
            component.set("v.ETSSAdded", false);
            component.set("v.isCreditFundingAdded", false);
            
            console.log('fundingList462');
            helper.setCorrectGrandTotalValue(component, event, helper);
            //validate NRIC
            var action= component.get("c.validateNRIC");
            $A.enqueueAction(action); 
            
        },
        
        
        EditPIISection : function (component, event, helper) {
            var valueNRIC = component.get("v.contactRecord.NRIC__c")
            var typeOfNRIC = component.get("v.contactRecord.NRIC_Type__c")
            var DOBirthNRIC = component.get("v.contactRecord.Date_of_Birth__c")
            component.set("v.valNRIC",valueNRIC);
            component.set("v.typeNRIC",typeOfNRIC);
            component.set("v.dobNRIC",DOBirthNRIC);
            component.set("v.alertTest",true);
            
            
        },
        
        
        changeName : function (component, event, helper) {
            var lName = component.get("v.contactRecord.LastName");
            component.set("v.contactRecord.Preferred_Certificate_Name__c",lName);
            component.set("v.contactRecord.Attention__c",lName);
        },
    
    handleTrialMembershipCheckbox: function (component, event, helper) {
         
        console.log(component.get("v.isMember"));
        console.log(component.get("v.memberCheckbox"));
        
        component.set("v.isMember", false);
        component.set("v.memberCheckbox", false);
		component.set("v.showTrialMembershipField", !component.get("v.showTrialMembershipField"));
        
        
        if(component.get("v.courseRunRecord.CourseRecordType__c") == 'Course') {
            
            component.set("v.fundingList", []);
            component.set("v.ibfFundingAdded", false);
            component.set("v.isGrantFundingAdded", false);
            component.set("v.isCreditFundingAdded", false);
            component.set("v.isFundingAdded", false);
            
            component.set("v.membershipNo", '');
			
            component.set("v.grandTotal", component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c);    
        	var currentGrandTotal = component.get("v.grandTotal");
            
            if (component.get("v.isPromoCodeApplied")) {
                
            	var promoAmount = component.get("v.PromoCodeAmount");
                var finalAmount = currentGrandTotal - promoAmount;
                
                component.set("v.grandTotal", finalAmount.toFixed(2));
                
            } else {
                
                var earlyBirdMemberDiscount = component.get("v.earlyBirdMemberDiscount");
                var promotionMemberDiscount = component.get("v.promotionMemberDiscount");
                
                
                if (earlyBirdMemberDiscount > 0) {
                    component.set("v.grandTotal", (currentGrandTotal - earlyBirdMemberDiscount));
                } else if (promotionMemberDiscount > 0) {
                    component.set("v.grandTotal", (currentGrandTotal - promotionMemberDiscount));
                }
            }
        }
    },
    
    handlerMembershipChange: function (component, event, helper) {
        
        console.log(event.getParam("value"));
        console.log(component.get("v.courseRunRecord.CourseRecordType__c"));
        
        var selectedMembershipOption = event.getParam("value");
        
        if (component.get("v.courseRunRecord.CourseRecordType__c") == 'Course') {
            
            
            
            console.log("membershipNo: " + component.get("v.membershipNo"));
            
            if (selectedMembershipOption == "trial_membership") {
                
                
                component.set("v.isMember", false);
                component.set("v.showTrialMembershipField", true);
                component.set("v.memberCheckbox", false);
                component.set("v.grandTotal",component.get("v.courseRunRecord.Course__r").Non_Member_Total_Fee__c); 
                    
                
                if (component.get("v.membershipNo") != null && component.get("v.membershipNo").length > 0) {
                    component.set("v.grantTotal", component.get("v.courseRunRecord.Course__r").Member_Total_Fee__c);
                    component.set("v.isMember", true);
                } 
               
                
                
            } else if (selectedMembershipOption == "sim_society_membership") {
                component.set("v.showTrialMembershipField", false);
                helper.simSocietyHelper(component, event);
            }
        } else if (component.get("v.courseRunRecord.CourseRecordType__c") == "Funded_Course") {
            
            if (selectedMembershipOption == "trial_membership") {
                
                component.set("v.isMember", false);
                component.set("v.showTrialMembershipField", true);
                component.set("v.memberCheckbox", false);
                
            } else if (selectedMembershipOption == "sim_society_membership") {
                component.set("v.showTrialMembershipField", false);
                component.set("v.memberCheckbox", true);
            }
        }
    },
    
    handleSimHelpPopup : function (component, event, helper) {
      	var simHelpText = component.find("simHelpText");
        if ($A.util.hasClass(simHelpText, "slds-fall-into-ground")) {
            $A.util.removeClass(simHelpText, "slds-fall-into-ground");
            $A.util.addClass(simHelpText, "slds-rise-from-ground");
        } else if ($A.util.hasClass(simHelpText, "slds-rise-from-ground")) {
            $A.util.removeClass(simHelpText, "slds-rise-from-ground");
            $A.util.addClass(simHelpText, "slds-fall-into-ground");
        }
    },
    
    handleTrialHelpPopup : function (component, event, helper) {
      	var trialHelpText = component.find("trialHelpText");
        if ($A.util.hasClass(trialHelpText, "slds-fall-into-ground")) {
            $A.util.removeClass(trialHelpText, "slds-fall-into-ground");
            $A.util.addClass(trialHelpText, "slds-rise-from-ground");
        } else if ($A.util.hasClass(trialHelpText, "slds-rise-from-ground")) {
            $A.util.removeClass(trialHelpText, "slds-rise-from-ground");
            $A.util.addClass(trialHelpText, "slds-fall-into-ground");
        }
    },
    
     handleOTPHelp : function (component, event, helper) {
        
        var otpHelp = component.find("otpHelp");
          
        if ($A.util.hasClass(otpHelp, "slds-rise-from-ground")) {
            console.log("inside rise from ground");
            $A.util.removeClass(otpHelp, "slds-rise-from-ground");
            $A.util.addClass(otpHelp, "slds-fall-into-ground");
        } else if ($A.util.hasClass(otpHelp, "slds-fall-into-ground")) {
            console.log("inside fall from ground");
            $A.util.removeClass(otpHelp, "slds-fall-into-ground");
            $A.util.addClass(otpHelp, "slds-rise-from-ground");
        }
    }
})
