import { LightningElement,wire } from 'lwc';
import getContactRecord from '@salesforce/apex/CustomLookupController.getContactRecord';
import {
    subscribe,
    unsubscribe,
    MessageContext,
} from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/sendAccountid__c';

const contactColumns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email', type: 'Email' },
    { label: 'Phone', fieldName: 'Phone', type: 'Phone' },
]

export default class ContactGallery extends LightningElement {
    subscription = null;
    accountRecordId;
    @wire(MessageContext)
    messageContext;
    isLoading = false;
    showContact = false;
    contactData = [];
    columns = contactColumns;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                recordSelected,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        this.accountRecordId = message.accountIdFromFilter;
        console.log(' this.accountRecordId>>> ',  this.accountRecordId)
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    @wire(getContactRecord, {accountIdParam : '$accountRecordId'})
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