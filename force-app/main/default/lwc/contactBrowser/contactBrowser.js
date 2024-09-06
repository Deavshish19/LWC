import { LightningElement } from 'lwc';

export default class ContactBrowser extends LightningElement {
    idOfAccount;
    accountIndustry;
    
    handleFilterChange(event){
        this.idOfAccount =  event.detail.accountId;
        this.accountIndustry = event.detail.industry;
        //console.log('this.idOfAccount>>> ', this.idOfAccount);
        //console.log('this.accountIndustry>> ', this.accountIndustry);
    }
}