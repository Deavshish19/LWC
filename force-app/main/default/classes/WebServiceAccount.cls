@RestResource(urlMapping = '/v1/accountManager/*')
global class WebServiceAccount {
	
	@HttpGet
    global static List<Account> getAccountDetails(){
        List<Account> acc = [Select Id,Name,Industry from Account];
        return acc;
    } 
}