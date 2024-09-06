public class QuickBooksIntegeration {
    
    //get metadata details
    public PageReference authorize(){
        
        QuickBooks_Metadata__mdt config = QuickBooks_Metadata__mdt.getInstance('QBToken');
        if(config!= null){
            String redirect_uri = System.URL.getOrgDomainURL().toExternalForm()+'/apex/'+config.PageName__c;
            System.System.debug( redirect_uri );
            
            String auth_Url = config.auth_url__c+'?client_id='+config.client_Id__c+'&response_type=code'
                +'&scope=openid profile email com.intuit.quickbooks.accounting'
                +'&redirect_uri='+redirect_uri+'&state='+UserInfo.getOrganizationId()+redirect_uri;
            System.System.debug( auth_Url );
            return new PageReference(auth_Url);
        }else{
            // Show the Error
            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.WARNING, 'Config not found' ));
            return null;
        }
    } 
    
    public static void getAccessToken(){
        System.System.debug( 'Inside get token' );
        QuickBooks_Metadata__mdt config = QuickBooks_Metadata__mdt.getInstance('QBToken');
        if(config!= null){
            String code    = ApexPages.currentPage().getParameters().get('code');
            String realmId = ApexPages.currentPage().getParameters().get('realmId');
            
            String redirect_uri = System.URL.getOrgDomainURL().toExternalForm()+'/apex/'+config.Pagename__c;
            System.System.debug( redirect_uri );
            
            HttpRequest request = new HttpRequest();
            request.setEndpoint(config.token_url__c);
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setHeader('Accept', 'application/json');
            
            /*	grant_type=authorization_code&
                code=L3114709614564VSU8JSEiPkXx1xhV8D9mv4xbv6sZJycibMUI&
                redirect_uri=https://www.mydemoapp.com/oauth-redirect*/
            //grant_type=authorization_code
            String tokenBody = 'grant_type=authorization_code&code='+code+'&redirect_uri='+redirect_uri
                            +'&client_id='+config.client_Id__c+'&client_secret='+config.client_secret__c;
            request.setBody(tokenBody);
            System.debug(tokenBody);
            HttpResponse response = (new Http()).send(request);
            try{
                System.debug('response.getStatusCode()' + response.getStatusCode());
                System.debug('response.getBody()' + response.getBody());
                if(response.getStatusCode() == 200 || response.getStatusCode() == 201){
                Map<String, Object> fieldWithValuesMap = prepareMetadata(response.getBody(),'');
                	System.debug('after prepare');
                    String fullName = 'QuickBooks_Metadata.QBToken';
                    String label    = 'QBToken';
                    CreateUpdateMetadataUtils.createUpdateMetadata(fullName, label, fieldWithValuesMap);
                    ApexPages.addmessage(new ApexPages.message(ApexPages.severity.CONFIRM,'Successfull!'));
                }else{
                    System.debug(response.getBody());
                    ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR, response.getBody()));
                }
            }catch (CalloutException ex) {
                System.debug(ex);
                ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR, ex.getMessage() ));
            }catch (Exception ex) {
                System.debug(ex);
                ApexPages.addmessage(new ApexPages.message(ApexPages.severity.ERROR, ex.getMessage() ));
            }
   
        }else{
            // Show the Error
            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.WARNING, 'Config not found' ));
            //return null;
        }
        
    } 
    
    public static Boolean isValid(QuickBooks_Metadata__mdt config){
        Boolean isValid = true;
        if(config.expires_in_time__c <= System.now()){
            isValid = false;
        }
        return isValid;
    }
    
    public static Map<String, Object> refreshToken(QuickBooks_Metadata__mdt config){
        string tokenUrl = config.token_url__c;
        
        String requestBody = 'grant_type=refresh_token&refresh_token='+ config.refresh_token__c+'&client_id='
            				 +config.client_Id__c+'&client_secret='+config.client_secret__c;
        HttpRequest httpReq = new HttpRequest();
        httpReq.setEndpoint(tokenUrl);
        httpReq.setBody(requestBody);
        httpReq.setMethod('POST');
        httpReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        httpReq.setHeader('Accept', 'application/json');
        
        Map<String, Object> fieldWithValuesMap = new Map<String, Object>();
        try{
            HttpResponse response = (new Http()).send(httpReq);
            if(response.getStatusCode() == 200 || response.getStatusCode() == 201){
                fieldWithValuesMap =  prepareMetadata(response.getBody(),'');
            }else{
                System.debug('Error in else');
            }
        }catch(System.CalloutException ex){
            
        }catch(System.Exception ex){
            
        }
        return fieldWithValuesMap;
		
    }
    
    public static Map<String, Object> prepareMetadata(String requestBody, String realmId){
        Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(requestBody);
        String access_token  = (String)responseMap.get('access_token');
        String refresh_token = (String)responseMap.get('refresh_token');
        Integer expires_in   = (Integer)responseMap.get('expires_in');
        System.debug(' in after');
        Map<String, Object> fieldWithValuesMap = new Map<String, Object>();
        fieldWithValuesMap.put('access_token__c', access_token);
        fieldWithValuesMap.put('expires_in__c',expires_in);
        fieldWithValuesMap.put('expires_in_time__c', System.now().addSeconds(expires_in) );
        fieldWithValuesMap.put('refresh_token__c', refresh_token);
        if(!String.isBlank(realmId)){
            fieldWithValuesMap.put('realmId__c', realmId);
        }
        return fieldWithValuesMap;
    }
}