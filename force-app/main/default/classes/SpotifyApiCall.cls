global class SpotifyApiCall {
    global static String getSpotifyAccessToken(){
        
        string endPointUrl = 'https://accounts.spotify.com/api/token';
        
        string clientId = '49d9eb7db9984229a0680fe0612c1221';
        String clientSecret = '562dd78bba114aea9301136bdc63eaba';
        String authHeader = EncodingUtil.base64Encode(Blob.valueOf(clientId + ':' + clientSecret));
        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endPointUrl);
        req.setMethod('POST');
        req.setHeader('Content-type','application/x-www-form-urlencoded');
        req.setHeader('Authorization', 'Basic ' + authHeader);
        req.setBody('grant_type=client_credentials');
        
        String accessToken;
        HttpResponse res = http.send(req);
        if(res.getStatusCode() == 200 ){
            Map<String,Object> accessTokenMap = (Map<String,Object>) JSON.deserializeUntyped(res.getBody()); 
            accessToken = (String)accessTokenMap.get('access_token');	
        }
        else {
            throw new CalloutException('Error retrieving Access token. Status: ' + res.getStatus());
        }
        
        return accessToken;
    }
    
    global Static void getArtistDetails(String artistId){
        
        String endUrl = 'https://api.spotify.com/v1/artists/' +artistId ; 
        
        String accessToken = getSpotifyAccessToken();
        
        Http http = new Http();
        HttpRequest req = new Httprequest();
        req.setEndpoint(endUrl);
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        
        HttpResponse res = http.send(req);
        if(res.getStatusCode() == 200){
            Map<String,Object> result = (Map<String,Object>) JSON.deserializeUntyped(res.getBody());
            String name = (String) result.get('name');
            Integer popularity = (Integer) result.get('popularity');
            String type = (String) result.get('type'); 
            String idOfArtist = (String) result.get('id');
            
            //conversion to add value in multiselect picklist
            List<Object> genresListObj = (List<Object>) result.get('genres');
            List<String> genresList = new List<String>();
            
            for (Object genre : genresListObj) {
                genresList.add((String) genre);
            }
            
            String genres = String.join(genresList, ';');
            
            Map<String,Object> followers = (Map<String,Object>) result.get('followers');
            Integer total = (Integer) followers.get('total');
            Map<String,Object> Url = (Map<String,Object>) result.get('external_urls');
            String spotifyUrl = (String) Url.get('spotify');
            
            Artist__c artist = new Artist__c();
            artist.Name = name;
            artist.Genre__c = genres;
            artist.ArtistId__c = idOfArtist;
            artist.Popularity__c = popularity ;
            artist.SpotifyUrl__c = spotifyUrl;
            artist.Type__c = type;
            artist.Total_Followers__c = total;
            
            insert artist;
        }
        else {
            throw new CalloutException('Error retrieving artist information. Status: ' + res.getStatus());
        }
    }
}