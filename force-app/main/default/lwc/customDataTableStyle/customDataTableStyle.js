import { LightningElement, wire } from 'lwc';
import getContactList from '@salesforce/apex/DataTableController.getContactList';
const columns = [
    {label:'Name', type: "customName",
        typeAttributes: {
            contactName: { fieldName: "Name" },
        },
    },
    {label:'Account Name',fieldName:'accountLink',type:'url',
    typeAttributes:{
        label: {fieldName:'accountName'},
        target: '_blank'
        }
    },    
    {label:'Phone',fieldName:'Phone',type:'phone'},
    {label:'Email',fieldName:'Email',type:'email'},
    {label:'Title',fieldName:'Title'},
    {label:'Rank',fieldName:'Rank__c', type: "customRank",
        typeAttributes: {
            contactRankIcon: { fieldName: "rankIcon" },
        },
        cellAttributes: {
          class: "slds-theme_alert-texture",
        },
    },
    {label:'Picture',type: "customPicture",
        typeAttributes: {
            contactPicture: { fieldName: "contactUrl" },
        },
        cellAttributes : {
            alignment : "center"
        },
    },
];

export default class CustomDataTableStyle extends LightningElement {

    contactData = [];
    columns = columns;

    @wire(getContactList)
    contactRecords({data,error}){

        if(data){
            /* this.contactData = data;
            console.log(this.contactData); */
            this.contactData = data.map(record=>{
                let accountLink = '/'+record.AccountId;
                let accountName = record.Account.Name;
                let rankIcon = record.Rank__c > 5 ? "utility:ribbon" : "";
                let contactUrl = record.Picture__c;
                console.log('URL1', contactUrl);
                return {
                    ...record,
                    accountName : accountName,
                    accountLink : accountLink,
                    rankIcon : rankIcon,
                    contactUrl : contactUrl
                    
                };
            });
            
        }
        else if(error){
            console.log('Error in Data', error);
        }
    }
}