import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
//import NAME_FIELD from '@salesforce/schema/Contact.Name';

//const field = [NAME_FIELD];
export default class EditContactForm extends LightningElement {
    @api isViewMode = false; 
    @api isEditMode =false; 
    @api recordInputId;
    @api fieldsToDisplay;
    //fields = field;
    
    get header(){
        console.log('recordInputId', this.recordInputId);
        if(this.isViewMode) return 'Contact Details';
        else if(this.isEditMode) return 'Edit Contact';
        else return "";
    }

    closeModalHandler(){
        let closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }

    handleSuccess(){
        //console.log('record id' , recordInputId);
        this.showNotification('Success', 'Record Saved Successfully', 'success');
        this.closeModalHandler();
    }

    showNotification(toastTitle, toastMessage, toastVariant) {
        const evt = new ShowToastEvent({
            title: toastTitle,
            message: toastMessage,
            variant: toastVariant,
        });
        this.dispatchEvent(evt);
    }
}