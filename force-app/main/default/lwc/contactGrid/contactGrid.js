import { LightningElement,wire,api } from 'lwc';
import getContactRecord from '@salesforce/apex/CustomLookupController.getContactRecord';

const contactColumns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email', type: 'Email' },
    { label: 'Phone', fieldName: 'Phone', type: 'Phone' },
]

export default class ContactGrid extends LightningElement {

    contactData = [];
    columns = contactColumns;
    @api selectedAccountId ;
    isLoading = false;
    showContact = false;

    @wire(getContactRecord, {accountIdParam : '$selectedAccountId'})
    contactRecords({data,error}){
        if(data){
            this.isLoading = true;
            this.showContact = true;
            this.contactData = data;
            console.log('ContactData >>' , this.contactData);
        }else if(error){
            this.isLoading = false;
            this.showContact = false;
            console.log('Error in Else if>>> ', error);
        }
    };    
}