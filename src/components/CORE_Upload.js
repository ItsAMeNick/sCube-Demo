import React, { Component } from 'react';
import { connect } from "react-redux";

import jszip from "jszip";
import fxp from "fast-xml-parser";

class CORE_Upload extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        if (event.target.files[0] && event.target.files[0].type === "application/x-zip-compressed") {
            jszip.loadAsync(event.target.files[0]).then(zip => {
                let file_names = Object.keys(zip.files).filter(f => {
                    return !zip.files[f].dir
                });
                for (let f in file_names) {
                    let file = zip.files[file_names[f]]
                    file.async("text").then(file_text => {
                        switch(file_names[f]) {
                            case "CapTypeModel.xml": {
                                console.log("LOADING File: " + file_names[f]);
                                let rawJSON = fxp.parse(file_text).list.capType;
                                let filteredJSON = [];
                                if (!Object.keys(rawJSON).includes("0")) {
                                    let cap = rawJSON;
                                    filteredJSON.push({
                                        key: filteredJSON.length,
                                        module: cap.group,
                                        type: cap.type,
                                        subtype: cap.subType,
                                        category: cap.category,
                                        alias: cap.alias,
                                        asi_code: cap.specInfoCode,
                                        fee_code: cap.feeScheduleName,
                                        insp_code: cap.inspectionGroupCode ? cap.inspectionGroupCode : null,
                                    });
                                } else {
                                    for (let i in rawJSON) {
                                        let cap = rawJSON[i];
                                        filteredJSON.push({
                                            key: filteredJSON.length,
                                            module: cap.group,
                                            type: cap.type,
                                            subtype: cap.subType,
                                            category: cap.category,
                                            alias: cap.alias,
                                            asi_code: cap.specInfoCode,
                                            fee_code: cap.feeScheduleName,
                                            insp_code: cap.inspectionGroupCode ? cap.inspectionGroupCode : null,
                                        });
                                    }
                                }
                                this.props.update("caps", filteredJSON);
                                break;
                            }
                            case "ASIGroupModel.xml": {
                                console.log("LOADING File: " + file_names[f]);
                                let rawJSON = fxp.parse(file_text).list.asiGroup;
                                let filteredJSON = [];
                                if (!Object.keys(rawJSON).includes("0")) {
                                    for (let a in rawJSON.asiModels.asiModel) {
                                        let asi = rawJSON.asiModels.asiModel[a];
                                        filteredJSON.push({
                                            key: filteredJSON.length,
                                            code: asi.r1CheckboxCode,
                                            name: asi.r1CheckboxDesc,
                                            group: asi.r1CheckboxGroup,
                                            type: asi.r1CheckboxType,
                                            alias: asi.subGroupAlias
                                        });
                                    }
                                } else {
                                    for (let i in rawJSON) {
                                        for (let a in rawJSON[i].asiModels.asiModel) {
                                            let asi = rawJSON[i].asiModels.asiModel[a];
                                            filteredJSON.push({
                                                key: filteredJSON.length,
                                                code: asi.r1CheckboxCode,
                                                name: asi.r1CheckboxDesc,
                                                group: asi.r1CheckboxGroup,
                                                type: asi.r1CheckboxType,
                                                alias: asi.subGroupAlias
                                            });
                                        }
                                    }
                                }
                                this.props.update("asis", filteredJSON);
                                break;
                            }
                            case "RefFeeScheduleModel.xml": {
                                console.log("LOADING File: " + file_names[f]);
                                let rawJSON = fxp.parse(file_text).list.refFeeSchedule;
                                let filteredJSON = [];
                                if (!Object.keys(rawJSON).includes("0")) {
                                    for (let f in rawJSON.refFeeItemModels.refFeeItem) {
                                        let fee = rawJSON.refFeeItemModels.refFeeItem[f];
                                        filteredJSON.push({
                                            key: filteredJSON.length,
                                            schedule: fee.feeScheduleName,
                                            code: fee.feeCod,
                                            desc: fee.feeDes
                                        });
                                    }
                                } else {
                                    for (let i in rawJSON) {
                                        for (let f in rawJSON[i].refFeeItemModels.refFeeItem) {
                                            let fee = rawJSON[i].refFeeItemModels.refFeeItem[f];
                                            filteredJSON.push({
                                                key: filteredJSON.length,
                                                schedule: fee.feeScheduleName,
                                                code: fee.feeCod,
                                                desc: fee.feeDes
                                            });
                                        }
                                    }
                                }
                                this.props.update("fees", filteredJSON);
                                break;
                            }

                            case "NotificationTemplateModel.xml": {
                                console.log("LOADING File: " + file_names[f]);
                                let rawJSON = fxp.parse(file_text).list.notificationTemplate;
                                let filteredJSON = [];
                                if (!Object.keys(rawJSON).includes("0")) {
                                    let note = rawJSON.emailTemplate;
                                    filteredJSON.push({
                                        key: filteredJSON.length,
                                        template: note.templateName,
                                        from: note.from,
                                    });
                                } else {
                                    for (let i in rawJSON) {
                                        let note = rawJSON[i].emailTemplate;
                                        filteredJSON.push({
                                            key: filteredJSON.length,
                                            template: note.templateName,
                                            from: note.from,
                                        });
                                    }
                                }
                                this.props.update("notes", filteredJSON);
                                break;
                            }

                            case "InspectionGroupModel.xml": {
                                console.log("LOADING File: " + file_names[f]);
                                let rawJSON = fxp.parse(file_text).list.inspectionGroup;
                                console.log(rawJSON);
                                let filteredJSON = [];
                                if (!Object.keys(rawJSON).includes("0")) {
                                    for (let ii in rawJSON.inspectionTypeModels.inspectionTypeModel) {
                                        let insp = rawJSON.inspectionTypeModels.inspectionTypeModel[ii];
                                        filteredJSON.push({
                                            key: filteredJSON.length,
                                            code: insp.inspCode,
                                            group: insp.inspGroupName,
                                            result: insp.inspResultGroup,
                                            type: insp.inspType
                                        });
                                    }
                                } else {
                                    for (let i in rawJSON) {
                                        for (let ii in rawJSON[i].inspectionTypeModels.inspectionTypeModel) {
                                            let insp = rawJSON[i].inspectionTypeModels.inspectionTypeModel[ii];
                                            filteredJSON.push({
                                                key: filteredJSON.length,
                                                code: insp.inspCode,
                                                group: insp.inspGroupName,
                                                result: insp.inspResultGroup,
                                                type: insp.inspType
                                            });
                                        }
                                    }
                                    console.log(filteredJSON);
                                }
                                this.props.update("inspections", filteredJSON);
                                break;
                            }

                            case "StandardChoiceModel.xml": {
                                console.log("LOADING File: " + file_names[f]);
                                let rawJSON = fxp.parse(file_text).list.standardChoice;
                                for (let i in rawJSON) {
                                    switch(rawJSON[i].name) {
                                        case "CONTACT TYPE": {
                                            let filteredJSON = []
                                            for (let s in rawJSON[i].standardChoiceValueModels.standardChoiceValue) {
                                                let std = rawJSON[i].standardChoiceValueModels.standardChoiceValue[s];
                                                filteredJSON.push({
                                                    key: filteredJSON.length,
                                                    value: std.value,
                                                });
                                            }
                                            this.props.update("contact_types", filteredJSON);
                                            break;
                                        }
                                        case "LICENSED PROFESSIONAL TYPE": {
                                            let filteredJSON = []
                                            for (let s in rawJSON[i].standardChoiceValueModels.standardChoiceValue) {
                                                let std = rawJSON[i].standardChoiceValueModels.standardChoiceValue[s];
                                                filteredJSON.push({
                                                    key: filteredJSON.length,
                                                    value: std.value,
                                                });
                                            }
                                            this.props.update("lp_types", filteredJSON);
                                            break;
                                        }
                                        default: break;
                                    }
                                }
                                break;
                            }

                            // case "WorkflowModel.xml": {
                            //     console.log("LOADING File: " + file_names[f]);
                            //     let rawJSON = fxp.parse(file_text).list.workflow;
                            //     console.log(rawJSON);
                            //     let filteredJSON = [];
                            //     for (let i in rawJSON) {
                            //         let meta_text = rawJSON[i].workflowMetadata.metaDataDefinition.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&quot;/g, "\"");
                            //         console.log(meta_text);
                            //         // let chunks = meta_text.match(/<Flow[\s\S]customObject="([\s\S]+?}]")/g);
                            //         // chunks = chunks.map(s => /<Flow[\s\S]customObject="([\s\S]+?}]")/.exec(s)[1])
                            //         // console.log(chunks);
                            //         let status = meta_text.match(/"statusDescription":"([-.\w\s]+)/g);
                            //         status = status.map(s => /"statusDescription":"([-.\w\s]+)/.exec(s)[1]);
                            //         let task = meta_text.match(/"taskName":"([-.\w\s]+)/g);
                            //         task = task.map(t => /"taskName":"([-.\w\s]+)/.exec(t)[1]);
                            //         console.log(status)
                            //     }
                            //     // this.props.update("fees", filteredJSON);
                            //     break;
                            // }

                            default: {
                                console.log("Ignoring File: " + file_names[f]);
                                break;
                            }
                        }
                    });
                }
            })
        } else {
            console.log("INVALID FILE UPLOAD!");
        }
    }

    render() {
        return (
        <div>
             <input type="file" name="file" onChange={this.handleChange}/>
        </div>
        );
    }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    update: (type, data) => dispatch({
        type: "load_file_data",
        payload: {
            type: type,
            data: data
        }
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CORE_Upload);
