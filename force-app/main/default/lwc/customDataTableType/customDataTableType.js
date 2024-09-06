import LightningDataTable from "lightning/datatable";
import customNameTemplate from "./customName.html";
import customRankTemplate from "./customRank.html";
import customPictureTemplate from "./customPicture.html";
import customPicklistTemplate from "./customPicklist.html";
import editPicklistTemplate from "./editPicklistTemplate.html";

export default class CustomDataTableType extends LightningDataTable {

    static customTypes = {
        customName: {
          template: customNameTemplate,
          standardCellLayout: true,
          typeAttributes: ["contactName"],
        },
        customRank: {
          template: customRankTemplate,
          standardCellLayout: false,
          typeAttributes: ["contactRankIcon"],
        },
        customPicture: {
            template: customPictureTemplate,
            standardCellLayout : true,
            typeAttributes : ["contactPicture"]
        },
        customPicklist : {
          template : customPicklistTemplate,
          editTemplate: editPicklistTemplate,
          standardCellLayout : true,
          typeAttributes : ["options","value","context"]
        }
    }
}