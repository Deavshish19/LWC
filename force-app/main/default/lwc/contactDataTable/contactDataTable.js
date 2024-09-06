import { api, LightningElement, wire } from 'lwc';
import getRealtedContactList from '@salesforce/apex/DataTableController.getRealtedContactList';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import LEAD_SOURCE_FIELD from '@salesforce/schema/Contact.LeadSource';
import NAME_FIELD from '@salesforce/schema/Contact.Name';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import ACCOUNT_NAME from '@salesforce/schema/Contact.AccountId';

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Edit details', name: 'edit' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Phone', fieldName: 'Phone', editable: true },
    { label: 'Email', fieldName: 'Email', editable: true },
    { label: 'Title', fieldName: 'Title', editable: true },
    {
        label: 'Lead Source', type: 'customPicklist', fieldName: 'LeadSource', editable: true,
        typeAttributes: {
            options: { fieldName: "picklistOption" },
            value: { fieldName: "LeadSource" },
            context: { fieldName: "Id" }
        }
    },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }
];
export default class ContactDataTable extends LightningElement {

    @api recordId;
    relatedConData = [];
    cols = columns;
    draftValuesArray = [];
    refreshData;
    leadSourceOptions = [];
    fieldvalue = [NAME_FIELD,EMAIL_FIELD,PHONE_FIELD,ACCOUNT_NAME,TITLE_FIELD,LEAD_SOURCE_FIELD];

    selectedContactRecord;
    isModalOpen = false;
    viewMode = false;
    editMode = false;

    @wire(getRealtedContactList, { selectedAccountId: '$recordId', picklistValue: '$leadSourceOptions' })
    contactRecord(result) {
        this.refreshData = result;
        if (result.data) {
            this.relatedConData = result.data.map(currItem => {
                let picklistOptions = this.leadSourceOptions
                console.log('picklistOptions>>', picklistOptions)
                return {
                    ...currItem,
                    picklistOption: picklistOptions
                }
            })
            console.log('this.relatedConData>>', this.relatedConData);
        } else if (result.error) {
            console.log('error loading data', error);
        }
    }

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    contactObject;

    @wire(getPicklistValues, { recordTypeId: '$contactObject.data.defaultRecordTypeId', fieldApiName: LEAD_SOURCE_FIELD })
    picklistValue({ data, error }) {
        if (data) {
            this.leadSourceOptions = data.values;
            console.log('this.leadSourceOptions>> ', this.leadSourceOptions);
        } else if (error) {
            console.log('error loading Picklist', error);
        }
    }

    async handleSave(event) {
        console.log('Inside handle Save')
        let record = event.detail.draftValues;
        let updateRecordArray = record.map(currItem => {
            let fieldInput = { ...currItem };
            return {
                fields: fieldInput
            };
        });

        this.draftValuesArray = [];

        //record updation using updatewire Adapter
        let updateRecordArrayPromise = updateRecordArray.map((curritem) =>
            updateRecord(curritem)
        );

        await Promise.all(updateRecordArrayPromise);
        refreshApex(this.refreshData);
        console.log('after refresh');
        this.showNotification('Success', 'Record Updated', 'success');

    }

    async handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.selectedContactRecord = row.Id;
        console.log('this.selectedContactRecord >>3 ', this.selectedContactRecord)
        this.isModalOpen = false;
        this.viewMode = false;
        this.editMode = false;

        switch (actionName) {
            case 'show_details':
                this.viewMode = true;
                this.isModalOpen = true;
                break;
            case 'edit':
                this.editMode = true;
                this.isModalOpen = true;
                break;
            case 'delete':
                console.log('this.selectedContactRecord >> ', this.selectedContactRecord)
                await this.deleteContact(this.selectedContactRecord);
                break;
            default:
                break;
        }

    }

    async deleteContact(contactRecordId) {
        console.log('this.selectedContactRecord2 >> ', this.selectedContactRecord)
        try {
            await deleteRecord(contactRecordId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account deleted',
                    variant: 'success'
                })
            );
            await refreshApex(this.refreshData);
        } catch (error) {
            let errorMessage = 'Check related case and opportunity. ';
            this.showNotification('Error deleting record', errorMessage, 'error');
        }
    }

    showNotification(toastTitle, toastMessage, toastVariant) {
        const evt = new ShowToastEvent({
            title: toastTitle,
            message: toastMessage,
            variant: toastVariant,
        });
        this.dispatchEvent(evt);
    }

    async handleCloseModal(){
        this.isModalOpen =false;
        await refreshApex(this.refreshData);
    }
}