import React, { Component } from 'react';
import { connect } from "react-redux";
import _ from "lodash";

var script_text = "";

class CORE_GenerateOutput extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.parseConditions = this.parseConditions.bind(this);
    }

    genName = u => {
        if (this.props.state.event_type != null && this.props.state.structure.module !== "NA") {
            let n = this.props.state.event_type+":"
                +this.props.state.structure.module+"/"
                +this.props.state.structure.type+"/"
                +this.props.state.structure.subtype+"/"
                +this.props.state.structure.category+"\n";
            if (u) n = n.toUpperCase();
            return n;
            }
    }

    appendScript = (tab, text) => {
        //This function will add one line to the script text with tabbing of tab
        if (!text) return null;
        script_text += tab + text + "\n";
    }

    generateHelper() {
        script_text = "";

        switch(this.props.state.mode) {
            case "event_script": {
                if (this.props.state.event_type !== null && (this.props.state.structure.module !== "NA" && this.props.state.structure.module !== "")) {
                    this.generateEventScriptStart();
                    this.parseParameters(1);
                    this.parseConditions(1, "", 1);
                    this.generateEventScriptEnd();
                    break;
                } else {
                    //Must provide event and module before anything can generate.
                    return "Please provide an Event and a Module.";
                }
            }
            case "function": {
                if (this.props.state.mode_extras.function_name) {
                    this.generateFunctionScriptStart();
                    this.parseParameters(1);
                    this.parseConditions(1, "", 1);
                    this.generateFunctionScriptEnd();
                    break;
                } else {
                    //Must provide function name
                    return "Please provide a Name for the function.";
                }
            }
            case "pageflow": {
                if (true) { //Some pageflow thing
                    this.generatePageflowScriptStart();
                    this.parseParameters(0);
                    this.parseConditions(1, "", 0);
                    this.generatePageflowScriptEnd();
                    script_text = script_text.replace(/getAppSpecific\(([^)]+)\)/g, "AInfo[$1]")
                    break;
                } else {
                    //Must provide function name
                    return "Cannot generate pageflow correctly.";
                }
            }
            case "batch_script": {
                if (this.props.state.batch.name !== null && (this.props.state.batch.structures["1"].module !== "NA" && this.props.state.batch.structures["1"].module !== "")) {
                    this.generateBatchScriptStart();
                    this.parseParameters(3);
                    this.parseConditions(1, "", 3);
                    this.generateBatchScriptEnd();
                    break;
                } else {
                    //Must provide event and module before anything can generate.
                    return "Please provide a Name and at least one Structure";
                }
            }
            default:
                return "ERROR: A Script can not be generated for this mode"
        }
        return script_text;
    }

    generateFunctionScriptStart = () => {
        script_text += "function "+this.props.state.mode_extras.function_name.replace(/\W/g, '_')+"() {\n";

        script_text += "\t//This Function REQUIRES \"INCLUDES_CUSTOM_GENERATED_SCRIPTS\"\n\n"

        script_text += "\t/*\n";
            let today = new Date();
            script_text += "\tCreated: " + (today.getMonth()+1) +"/"
                                                + today.getDate() + "/"
                                                + today.getFullYear() + "\n";
            script_text += "\t" + this.props.state.mode_extras.function_desc.replace(/(\.+)\s/g,".\n").replace(/\n/g,"\n\t") + "\n";
        script_text += "\t*/\n\n";

        if (this.props.state.show_debug === true) {
            script_text += "\tshowDebug = true;\n";
        } else {
            script_text += "\tshowDebug = false;\n";
        }
    }

    generateFunctionScriptEnd = () => {
        if (this.cancelIsUsed()) {
            this.appendScript("\t", this.genCancelExtra(""));
        }
        this.appendScript("", "}");
    }

    generateEventScriptStart = () => {
        let today = new Date();

        let app_string = this.props.state.structure.module+"/"
                        +this.props.state.structure.type+"/"
                        +this.props.state.structure.subtype+"/"
                        +this.props.state.structure.category

        script_text += "//"+this.props.state.event_type+":"
                            +app_string+"\n";
        script_text += "//Created: " + (today.getMonth()+1) +"/"
                                            + today.getDate() + "/"
                                            + today.getFullYear() + "\n";

        script_text += "if (appMatch(\"" + app_string + "\"))\n{\n"

        script_text += "\teval(\"INCLUDES_CUSTOM_GENERATED_SCRIPTS\");\n"

        if (this.props.state.show_debug === true) {
            script_text += "\tshowDebug = true;\n\n";
        } else {
            script_text += "\tshowDebug = false;\n\n";
        }
    }

    generateEventScriptEnd = () => {
        if (this.cancelIsUsed()) {
            this.appendScript("\t", this.genCancelExtra(""));
        }
        this.appendScript("", "}");
        this.appendScript("", "//End of "+this.genName());
    }

    //I used a little python script to generate this, cause I sure as hell was not about to type all this.
    generatePageflowScriptStart = () => {
        script_text += "/*------------------------------------------------------------------------------------------------------/\n";
        script_text += "| START User Configurable Parameters\n";
        script_text += "|\n";
        script_text += "|     Only variables in the following section may be changed.  If any other section is modified, this\n";
        script_text += "|     will no longer be considered a \"Master\" script and will not be supported in future releases.  If\n";
        script_text += "|     changes are made, please add notes above.\n";
        script_text += "/------------------------------------------------------------------------------------------------------*/\n";
        script_text += "var showMessage = false;				// Set to true to see results in popup window\n";
        script_text += "var showDebug = true;					// Set to true to see debug messages in popup window\n";
        script_text += "var preExecute = \"PreExecuteForBeforeEvents\"\n";
        script_text += "var controlString = \"\";		// Standard choice for control\n";
        script_text += "var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps\n";
        script_text += "var disableTokens = false;						// turn off tokenizing of std choices (enables use of \"{} and []\")\n";
        script_text += "var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values\n";
        script_text += "var useTaskSpecificGroupName = false;			// Use Group name when populating Task Specific Info Values\n";
        script_text += "var enableVariableBranching = false;			// Allows use of variable names in branching.  Branches are not followed in Doc Only\n";
        script_text += "var maxEntries = 99;							// Maximum number of std choice entries.  Entries must be Left Zero Padded\n";
        script_text += "var SCRIPT_VERSION = 2.0\n";
        script_text += "\n";
        script_text += "eval(getScriptText(\"INCLUDES_ACCELA_FUNCTIONS\"));\n";
        script_text += "eval(getScriptText(\"INCLUDES_ACCELA_GLOBALS\"));\n";
        script_text += "eval(getScriptText(\"INCLUDES_CUSTOM\"));\n";
        script_text += "eval(getScriptText(\"INCLUDES_CUSTOM_GENERATED_SCRIPTS\"));\n";
        script_text += "\n";
        script_text += "if (documentOnly) {\n";
        script_text += "	doStandardChoiceActions(controlString,false,0);\n";
        script_text += "	aa.env.setValue(\"ScriptReturnCode\", \"0\");\n";
        script_text += "	aa.env.setValue(\"ScriptReturnMessage\", \"Documentation Successful.  No actions executed.\");\n";
        script_text += "	aa.abortScript();\n";
        script_text += "	}\n";
        script_text += "\n";
        script_text += "	\n";
        script_text += "function getScriptText(vScriptName){\n";
        script_text += "	vScriptName = vScriptName.toUpperCase();\n";
        script_text += "	var emseBiz = aa.proxyInvoker.newInstance(\"com.accela.aa.emse.emse.EMSEBusiness\").getOutput();\n";
        script_text += "	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);\n";
        script_text += "	return emseScript.getScriptText() + \"\";	\n";
        script_text += "}\n";
        script_text += "\n";
        script_text += "/*------------------------------------------------------------------------------------------------------/\n";
        script_text += "| END User Configurable Parameters\n";
        script_text += "/------------------------------------------------------------------------------------------------------*/\n";
        script_text += "var cancel = false;\n";
        script_text += "var startDate = new Date();\n";
        script_text += "var startTime = startDate.getTime();\n";
        script_text += "var message =	\"\";							// Message String\n";
        script_text += "var debug = \"\";								// Debug String\n";
        script_text += "var br = \"<BR>\";							// Break Tag\n";
        script_text += "var feeSeqList = new Array();						// invoicing fee list\n";
        script_text += "var paymentPeriodList = new Array();					// invoicing pay periods\n";
        script_text += "\n";
        script_text += "if (documentOnly) {\n";
        script_text += "	doStandardChoiceActions(controlString,false,0);\n";
        script_text += "	aa.env.setValue(\"ScriptReturnCode\", \"0\");\n";
        script_text += "	aa.env.setValue(\"ScriptReturnMessage\", \"Documentation Successful.  No actions executed.\");\n";
        script_text += "	aa.abortScript();\n";
        script_text += "	}\n";
        script_text += "\n";
        script_text += "var cap = aa.env.getValue(\"CapModel\");\n";
        script_text += "var capId = cap.getCapID();\n";
        script_text += "var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code\n";
        script_text += "var publicUser = false ;\n";
        script_text += "var currentUserID = aa.env.getValue(\"CurrentUserID\");\n";
        script_text += "if (currentUserID.indexOf(\"PUBLICUSER\") == 0) { currentUserID = \"ADMIN\" ; publicUser = true }  // ignore public users\n";
        script_text += "var capIDString = capId.getCustomID();					// alternate cap id string\n";
        script_text += "var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object\n";
        script_text += "var appTypeResult = cap.getCapType();\n";
        script_text += "var appTypeString = appTypeResult.toString();				// Convert application type to string (\"Building/A/B/C\")\n";
        script_text += "var appTypeArray = appTypeString.split(\"/\");				// Array of application type string\n";
        script_text += "var currentUserGroup;\n";
        script_text += "var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()\n";
        script_text += "if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();\n";
        script_text += "var capName = cap.getSpecialText();\n";
        script_text += "var capStatus = cap.getCapStatus();\n";
        script_text += "var sysDate = aa.date.getCurrentDate();\n";
        script_text += "var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),\"\");\n";
        script_text += "var parcelArea = 0;\n";
        script_text += "\n";
        script_text += "var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations\n";
        script_text += "var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation\n";
        script_text += "if (valobj.length) {\n";
        script_text += "	estValue = valobj[0].getEstimatedValue();\n";
        script_text += "	calcValue = valobj[0].getCalculatedValue();\n";
        script_text += "	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();\n";
        script_text += "	}\n";
        script_text += "\n";
        script_text += "var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data\n";
        script_text += "var capDetail = \"\";\n";
        script_text += "var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail\n";
        script_text += "if (capDetailObjResult.getSuccess())\n";
        script_text += "	{\n";
        script_text += "	capDetail = capDetailObjResult.getOutput();\n";
        script_text += "	var houseCount = capDetail.getHouseCount();\n";
        script_text += "	var feesInvoicedTotal = capDetail.getTotalFee();\n";
        script_text += "	var balanceDue = capDetail.getBalance();\n";
        script_text += "	}\n";
        script_text += "var addrState = '';\n";
        script_text += "var AInfo = new Array();						// Create array for tokenized variables\n";
        script_text += "loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info\n";
        script_text += "//loadTaskSpecific(AInfo);						// Add task specific info\n";
        script_text += "//loadParcelAttributes(AInfo);						// Add parcel attributes\n";
        script_text += "//loadASITables4ACA();\n";
        script_text += "\n";
        script_text += "logDebug(\"<B>EMSE Script Results for \" + capIDString + \"</B>\");\n";
        script_text += "logDebug(\"capId = \" + capId.getClass());\n";
        script_text += "logDebug(\"cap = \" + cap.getClass());\n";
        script_text += "logDebug(\"currentUserID = \" + currentUserID);\n";
        script_text += "logDebug(\"currentUserGroup = \" + currentUserGroup);\n";
        script_text += "logDebug(\"systemUserObj = \" + systemUserObj.getClass());\n";
        script_text += "logDebug(\"appTypeString = \" + appTypeString);\n";
        script_text += "logDebug(\"capName = \" + capName);\n";
        script_text += "logDebug(\"capStatus = \" + capStatus);\n";
        script_text += "logDebug(\"sysDate = \" + sysDate.getClass());\n";
        script_text += "logDebug(\"sysDateMMDDYYYY = \" + sysDateMMDDYYYY);\n";
        script_text += "logDebug(\"parcelArea = \" + parcelArea);\n";
        script_text += "logDebug(\"estValue = \" + estValue);\n";
        script_text += "logDebug(\"calcValue = \" + calcValue);\n";
        script_text += "logDebug(\"feeFactor = \" + feeFactor);\n";
        script_text += "\n";
        script_text += "logDebug(\"houseCount = \" + houseCount);\n";
        script_text += "logDebug(\"feesInvoicedTotal = \" + feesInvoicedTotal);\n";
        script_text += "logDebug(\"balanceDue = \" + balanceDue);\n";
        script_text += "\n";
        script_text += "/*------------------------------------------------------------------------------------------------------/\n";
        script_text += "| <===========Main=Loop================>\n";
        script_text += "/-----------------------------------------------------------------------------------------------------*/\n";

        let today = new Date();
        script_text += "//Created: " + (today.getMonth()+1) +"/"
                                            + today.getDate() + "/"
                                            + today.getFullYear() + "\n";
    }

    //I used a little python script to generate this, cause I sure as hell was not about to type all this.
    generatePageflowScriptEnd = () => {

        if (this.cancelIsUsed()) {
            this.appendScript("", this.genCancelExtra(""));
        }

        script_text += "/*------------------------------------------------------------------------------------------------------/\n";
        script_text += "| <===========END=Main=Loop================>\n";
        script_text += "/-----------------------------------------------------------------------------------------------------*/\n";
        script_text += "\n";
        script_text += "if (debug.indexOf(\"**ERROR\") > 0) {\n";
        script_text += "    aa.env.setValue(\"ErrorCode\", \"1\");\n";
        script_text += "    aa.env.setValue(\"ErrorMessage\", debug);\n";
        script_text += "}\n";
        script_text += "else {\n";
        script_text += "    if (cancel) {\n";
        script_text += "        aa.env.setValue(\"ErrorCode\", \"-2\");\n";
        script_text += "        if (showMessage) aa.env.setValue(\"ErrorMessage\", message);\n";
        script_text += "        if (showDebug) aa.env.setValue(\"ErrorMessage\", debug);\n";
        script_text += "    }\n";
        script_text += "    else {\n";
        script_text += "        aa.env.setValue(\"ErrorCode\", \"0\");\n";
        script_text += "        if (showMessage) aa.env.setValue(\"ErrorMessage\", message);\n";
        script_text += "        if (showDebug) aa.env.setValue(\"ErrorMessage\", debug);\n";
        script_text += "    }\n";
        script_text += "}\n";
        script_text += "\n";
        script_text += "function determineACADocumentAttached(docType) \n";
        script_text += "{\n";
        script_text += "    var docList = aa.document.getDocumentListByEntity(capId, \"TMP_CAP\");\n";
        script_text += "    if (docList.getSuccess()) \n";
        script_text += "	{\n";
        script_text += "        docsOut = docList.getOutput();\n";
        script_text += "		logDebug(\"Docs Out \" + docsOut.isEmpty());\n";
        script_text += "        if (docsOut.isEmpty()) \n";
        script_text += "		{\n";
        script_text += "            return false;\n";
        script_text += "        }\n";
        script_text += "        else \n";
        script_text += "		{\n";
        script_text += "            attach = false;\n";
        script_text += "            docsOuti = docsOut.iterator();\n";
        script_text += "            while (docsOuti.hasNext()) \n";
        script_text += "			{\n";
        script_text += "                doc = docsOuti.next();\n";
        script_text += "				debugObject(doc);\n";
        script_text += "                docCat = doc.getDocCategory();\n";
        script_text += "                if (docCat.equals(docType)) \n";
        script_text += "				{\n";
        script_text += "                    attach = true;\n";
        script_text += "                }\n";
        script_text += "            }\n";
        script_text += "            if (attach) \n";
        script_text += "			{\n";
        script_text += "                return true;\n";
        script_text += "            }\n";
        script_text += "            else \n";
        script_text += "			{\n";
        script_text += "                return false;\n";
        script_text += "            }\n";
        script_text += "        }\n";
        script_text += "    }\n";
        script_text += "    else \n";
        script_text += "	{\n";
        script_text += "        return false;\n";
        script_text += "    }\n";
        script_text += "}\n";
    }

    generateBatchScriptStart = () => {
        if (this.props.state.batch.use_lic) {
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| Program: "
            script_text += this.props.state.batch.name;
            script_text += ".js  Trigger: Batch\n";
            script_text += "| Version 1.0 Zachary McVicker\n";
            script_text += "| Built with sCube Script Builder - ";
            let today = new Date();
            script_text += (today.getMonth()+1) +"/"
                            + today.getDate() + "/"
                            + today.getFullYear() + "\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| START: USER CONFIGURABLE PARAMETERS\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "var emailText = \"\";\n";
            script_text += "var showDebug = true;// Set to true to see debug messages in email confirmation\n";
            script_text += "var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60\n";
            script_text += "var showMessage = false;\n";
            script_text += "var useAppSpecificGroupName = true;\n";
            script_text += "var br = \"<BR>\";\n";
            script_text += "var currentUserID = \"ADMIN\";\n";
            script_text += "sysDate = aa.date.getCurrentDate();\n";
            script_text += "batchJobResult = aa.batchJob.getJobID();\n";
            script_text += "batchJobName = \"\" + aa.env.getValue(\"BatchJobName\");\n";
            script_text += "wfObjArray = null;\n";
            script_text += "batchJobID = 0;\n";
            script_text += "if (batchJobResult.getSuccess()) \n";
            script_text += "{\n";
            script_text += "	batchJobID = batchJobResult.getOutput();\n";
            script_text += "	logDebug(\"Batch Job \" + batchJobName + \" Job ID is \" + batchJobID + br);\n";
            script_text += "}\n";
            script_text += "else\n";
            script_text += "{\n";
            script_text += "	logDebug(\"Batch job ID not found \" + batchJobResult.getErrorMessage());\n";
            script_text += "}\n";
            script_text += "\n";
            script_text += "eval(getScriptText(\"INCLUDES_ACCELA_FUNCTIONS\"));\n";
            script_text += "eval(getScriptText(\"INCLUDES_ACCELA_GLOBALS\"));\n";
            script_text += "eval(getScriptText(\"INCLUDES_CUSTOM\"));\n";
            script_text += "eval(getScriptText(\"INCLUDES_CUSTOM_GENERATED_SCRIPTS\"));\n";
            script_text += "	\n";
            script_text += "function getScriptText(vScriptName){\n";
            script_text += "	vScriptName = vScriptName.toUpperCase();\n";
            script_text += "	var emseBiz = aa.proxyInvoker.newInstance(\"com.accela.aa.emse.emse.EMSEBusiness\").getOutput();\n";
            script_text += "	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);\n";
            script_text += "	return emseScript.getScriptText() + \"\";	\n";
            script_text += "}\n";
            script_text += "/*----------------------------------------------------------------------------------------------------/\n";
            script_text += "| Start: BATCH PARAMETERS\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "var startDate = new Date();\n";
            script_text += "var timeDate = new Date();\n";
            script_text += "var startTime = timeDate.getTime();// Start timer\n";
            script_text += "var systemUserObj = aa.person.getUser(\"ADMIN\").getOutput();\n";
            script_text += "var timeExpired = false;\n";
            script_text += "var emailAddress = \"\";//email to send report\n";
            script_text += "var fromDate; \n";
            script_text += "var toDate;\n";
            script_text += "var statusCheck;\n";
            script_text += "var statusSet;\n";
            script_text += "var workAppStatus = \"\";\n";
            script_text += "var childCapId;\n";
            script_text += "var capId;\n";
            script_text += "var altId;\n";
            script_text += "var cap;\n";
            script_text += "var appTypeResult;\n";
            script_text += "var appTypeString;\n";
            script_text += "var appTypeArray;\n";
            script_text += "/*----------------------------------------------------------------------------------------------------/\n";
            script_text += "| End: BATCH PARAMETERS\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| <===========Main=Loop=================>\n";
            script_text += "/-----------------------------------------------------------------------------------------------------*/\n";
            script_text += "logDebug(\"Run Date: \" + startDate);\n";
            script_text += "var ateDate = new Date(dateAdd((startDate.getMonth() + 1) + \"/\" + startDate.getDate() + \"/\" + startDate.getFullYear(), "
            script_text += this.props.state.batch.lic_only.range;
            script_text += "));\n";
            script_text += "fromDate = (ateDate.getMonth() + 1) + \"/\" + ateDate.getDate() + \"/\" + ateDate.getFullYear(); \n";
            script_text += "toDate = (ateDate.getMonth() + 1) + \"/\" + ateDate.getDate() + \"/\" + ateDate.getFullYear();\n";
            script_text += "statusCheck = \""
            script_text += this.props.state.batch.lic_only.current_status;
            script_text += "\";\n";
            script_text += "statusSet = \""
            script_text += this.props.state.batch.lic_only.new_status;
            script_text += "\";\n";
            script_text += "workAppStatus = \""
            script_text += this.props.state.batch.lic_only.new_status;
            script_text += "\";\n";
            script_text += "\n";
            script_text += "logDebug(\"Set currently \" + statusCheck + \" licenses to \" + statusSet + \" for date range -- From Date: \" + fromDate + \", To Date: \" + toDate + \".\" + br);\n";
            script_text += "var expResult = aa.expiration.getLicensesByDate(statusCheck, fromDate, toDate);\n";
            script_text += "if (expResult.getSuccess()) \n";
            script_text += "{\n";
            script_text += "	myExp = expResult.getOutput();\n";
            script_text += "	logDebug(\"Processing \" + myExp.length + \" expiration records.\" + br);\n";
            script_text += "}\n";
            script_text += "else \n";
            script_text += "{ \n";
            script_text += "	logDebug(\"ERROR: Getting Expirations, reason is: \" + expResult.getErrorType() + \":\" + expResult.getErrorMessage()); \n";
            script_text += "	return false;\n";
            script_text += "}	\n";
            script_text += "for (thisExp in myExp) \n";
            script_text += "{	\n";
            script_text += "	if (elapsed() > maxSeconds) \n";
            script_text += "	{\n";
            script_text += "		logDebug(\"A script timeout has caused partial completion of this process.  Please re-run.  \" + elapsed() + \" seconds elapsed, \" + maxSeconds + \" allowed.\");\n";
            script_text += "		timeExpired = true;\n";
            script_text += "		break;\n";
            script_text += "	}	\n";
            script_text += "	b1Exp = myExp[thisExp];\n";
            script_text += "	var expDate = b1Exp.getExpDate();\n";
            script_text += "	if (expDate) \n";
            script_text += "	{	\n";
            script_text += "		var b1ExpDate = expDate.getMonth() + \"/\" + expDate.getDayOfMonth() + \"/\" + expDate.getYear();\n";
            script_text += "		var b1Status = b1Exp.getExpStatus();\n";
            script_text += "		capId = aa.cap.getCapID(b1Exp.getCapID().getID1(),b1Exp.getCapID().getID2(),b1Exp.getCapID().getID3()).getOutput();   \n";
        } else {
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| Program: "
            script_text += this.props.state.batch.name;
            script_text += ".js  Trigger: Batch\n";
            script_text += "| Version 1.0 Zachary McVicker\n";
            script_text += "| Built with sCube Script Builder - ";
            let today = new Date();
            script_text += (today.getMonth()+1) +"/"
                            + today.getDate() + "/"
                            + today.getFullYear() + "\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| START: USER CONFIGURABLE PARAMETERS\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "var emailText = \"\";\n";
            script_text += "var showDebug = true;// Set to true to see debug messages in email confirmation\n";
            script_text += "var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60\n";
            script_text += "var showMessage = false;\n";
            script_text += "var useAppSpecificGroupName = false;\n";
            script_text += "var br = \"<BR>\";\n";
            script_text += "sysDate = aa.date.getCurrentDate();\n";
            script_text += "batchJobResult = aa.batchJob.getJobID();\n";
            script_text += "batchJobName = \"\" + aa.env.getValue(\"BatchJobName\");\n";
            script_text += "batchJobID = 0;\n";
            script_text += "if (batchJobResult.getSuccess()) \n";
            script_text += "{\n";
            script_text += "	batchJobID = batchJobResult.getOutput();\n";
            script_text += "	logDebug(\"Batch Job \" + batchJobName + \" Job ID is \" + batchJobID + br);\n";
            script_text += "}\n";
            script_text += "else\n";
            script_text += "{\n";
            script_text += "	logDebug(\"Batch job ID not found \" + batchJobResult.getErrorMessage());\n";
            script_text += "}\n";
            script_text += "\n";
            script_text += "eval(getScriptText(\"INCLUDES_ACCELA_FUNCTIONS\"));\n";
            script_text += "eval(getScriptText(\"INCLUDES_ACCELA_GLOBALS\"));\n";
            script_text += "eval(getScriptText(\"INCLUDES_CUSTOM\"));\n";
            script_text += "eval(getScriptText(\"INCLUDES_CUSTOM_GENERATED_SCRIPTS\"));\n";
            script_text += "	\n";
            script_text += "function getScriptText(vScriptName){\n";
            script_text += "	vScriptName = vScriptName.toUpperCase();\n";
            script_text += "	var emseBiz = aa.proxyInvoker.newInstance(\"com.accela.aa.emse.emse.EMSEBusiness\").getOutput();\n";
            script_text += "	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);\n";
            script_text += "	return emseScript.getScriptText() + \"\";	\n";
            script_text += "}\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| START: END CONFIGURABLE PARAMETERS\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "\n";
            script_text += "/*----------------------------------------------------------------------------------------------------/\n";
            script_text += "| Start: BATCH PARAMETERS\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "var message = \"\";\n";
            script_text += "var startDate = new Date();\n";
            script_text += "var startTime = startDate.getTime(); // Start timer\n";
            script_text += "var todayDate = \"\" + startDate.getFullYear() + \"-\" + (startDate.getMonth() + 1) + \"-\" + startDate.getDate();\n";
            script_text += "var rtArray = ["
            for (let s in this.props.state.batch.structures) {
                if (s !== "1") {
                    script_text += ", ";
                }
                let struct = this.props.state.batch.structures[s];
                script_text += "\""
                script_text += struct.module + "/";
                script_text += struct.type + "/";
                script_text += struct.subtype + "/";
                script_text += struct.category + "\"";
            }
            script_text += "];\n";
            script_text += "/*----------------------------------------------------------------------------------------------------/\n";
            script_text += "| End: BATCH PARAMETERS//\n";
            script_text += "/------------------------------------------------------------------------------------------------------*/\n";
            script_text += "\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| <===========Main=Loop================>\n";
            script_text += "/-----------------------------------------------------------------------------------------------------*/\n";
            script_text += "try \n";
            script_text += "{\n";
            script_text += "	for (var i in rtArray) \n";
            script_text += "	{\n";
            script_text += "		var thisType = rtArray[i];\n";
            script_text += "		var capModel = aa.cap.getCapModel().getOutput();\n";
            script_text += "		var appTypeArray = thisType.split(\"/\");\n";
            script_text += "		// Specify the record type to query\n";
            script_text += "		capTypeModel = capModel.getCapType();\n";
            script_text += "		capTypeModel.setGroup(appTypeArray[0]);\n";
            script_text += "		capTypeModel.setType(appTypeArray[1]);\n";
            script_text += "		capTypeModel.setSubType(appTypeArray[2]);\n";
            script_text += "		capTypeModel.setCategory(appTypeArray[3]);\n";
            script_text += "		capModel.setCapType(capTypeModel);\n";
            script_text += "		//capModel.setCapStatus(sArray[i]); if needed\n";
            script_text += "\n";
            script_text += "		var recordListResult = aa.cap.getCapIDListByCapModel(capModel);\n";
            script_text += "		if (!recordListResult.getSuccess()) \n";
            script_text += "		{\n";
            script_text += "			logDebug(\"**ERROR: Failed to get capId List : \" + recordListResult.getErrorMessage());\n";
            script_text += "			continue;\n";
            script_text += "		}\n";
            script_text += "		var recArray = recordListResult.getOutput();\n";
            script_text += "		logDebug(\"Looping through \" + recArray.length + \" records of type \" + thisType);\n";
            script_text += "\n";
            script_text += "		for (var j in recArray) \n";
            script_text += "		{\n";
            script_text += "			capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();\n";
            script_text += "\n";
        }
    }

    generateBatchScriptEnd = () => {
        if (this.props.state.batch.use_lic) {
            script_text += "\n";
            script_text += "		altId = capId.getCustomID();\n";
            script_text += "		cap = aa.cap.getCap(capId).getOutput();	\n";
            script_text += "		if (cap) \n";
            script_text += "		{\n";
            script_text += "			appTypeResult = cap.getCapType();\n";
            script_text += "			appTypeString = appTypeResult.toString();\n";
            script_text += "			appTypeArray = appTypeString.split(\"/\");\n";
            script_text += "			if(appTypeArray[0] == \"Licenses\" && appTypeArray[1] == \"Contractor Registration\" && appTypeArray[2] == \"Registration\" && appTypeArray[3] == \"NA\") \n";
            script_text += "			{\n";
            script_text += "				logDebug(\"<b>\" + altId + \"</b>\");\n";
            script_text += "				logDebug(\"Registration: \" + appTypeArray[1]);\n";
            script_text += "				b1Exp.setExpStatus(statusSet);\n";
            script_text += "				aa.expiration.editB1Expiration(b1Exp.getB1Expiration());\n";
            script_text += "				updateAppStatus(workAppStatus, \"Set to \" + workAppStatus + \" by batch process.\");\n";
            script_text += "				updateTask(\"Registration Status\", workAppStatus, \"Updated by renewal batch\", \"Updated by renewal batch\", \"LIC_CON\", capId);\n";
            script_text += "			} \n";
            script_text += "		}\n";
            script_text += "	}\n";
            script_text += "}\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| <===========END=Main=Loop================>\n";
            script_text += "/-----------------------------------------------------------------------------------------------------*/\n";
        } else {
            script_text += "            \n";
            script_text += "		}\n";
            script_text += "	}\n";
            script_text += "} \n";
            script_text += "catch (err) \n";
            script_text += "{\n";
            script_text += "	logDebug(\"**ERROR** runtime error \" + err.message + \" at \" + err.lineNumber + \" stack: \" + err.stack);\n";
            script_text += "}\n";
            script_text += "logDebug(\"End of Job: Elapsed Time : \" + elapsed() + \" Seconds\");\n";
            script_text += "/*------------------------------------------------------------------------------------------------------/\n";
            script_text += "| <===========END=Main=Loop================>\n";
            script_text += "/-----------------------------------------------------------------------------------------------------*/\n";
        }
    }

    parseParameters(initialTab=0) {
        let set_tab = "\t".repeat(initialTab);
        if (this.props.state.functionality.notifications) {
            let sets = this.props.state.parameter_sets;
            for (let s in sets) {
                this.appendScript(set_tab, "//Generating the Hashtable for Set: "+sets[s].key+", Named: "+sets[s].name+", Style: "+sets[s].style);
                let clean_name = null;
                if (sets[s].name) clean_name = sets[s].name.replace(/\W/g, '_');
                let hash_name = "set_"+sets[s].key+"_"+clean_name;
                if (sets[s].style === "email") {
                    this.appendScript(set_tab, "var "+hash_name+" = aa.util.newHashtable();\n");
                } else if (sets[s].style === "report") {
                    this.appendScript(set_tab, "var "+hash_name+" = aa.util.newHashMap();\n");
                }
                //First assign all variables
                for (let p in sets[s].parameters) {
                    let param = sets[s].parameters[p];
                    let param_ref = null;
                    if (param.ref) param_ref = param.ref.replace(/\W/g, '_');
                    let param_name = "set"+sets[s].key+"_p"+param.key+"_"+param_ref;
                    this.appendScript(set_tab,"var "+param_name+" = "+param.script+";")
                }
                this.appendScript(set_tab,""); //Blank Line
                //Add to hash
                for (let p in sets[s].parameters) {
                    let param = sets[s].parameters[p];
                    let param_ref = null;
                    if (param.ref) param_ref = param.ref.replace(/\W/g, '_');
                    let param_name = "set"+sets[s].key+"_p"+param.key+"_"+param_ref;
                    if (sets[s].style === "email") {
                        this.appendScript(set_tab,"addParameter("+hash_name+", \"$$"+param.ref+"$$\", "+param_name+");");
                    } else if (sets[s].style === "report") {
                        this.appendScript(set_tab,hash_name+".put(\""+param.ref+"\", "+param_name+");");
                    }
                }
                this.appendScript(set_tab,""); //Blank Line
            }
        }
    }

    parseConditions = (level, parent, initialTab=0) => {
        //Create a list of condition only at my level.
        let conditions = Object.keys(this.props.state.conditions).map(c => {
            if (this.props.state.conditions[c].level === level) {
                return this.props.state.conditions[c];
            } else {
                return null;
            }
        }).filter(c => {
            return (c !== null);
        }).filter(c => {
            return (_.initial(c.key.split(".")).join(".") === parent);
        });
        //Escape
        if (conditions.length === 0) return null;

        var set_tab = "\t".repeat(initialTab+level-1);
        var set_tab_in = set_tab + "\t";
        if (!this.props.state.functionality.conditions) {
            set_tab = "\t".repeat(initialTab);
            set_tab_in = "\t".repeat(initialTab);
        }

        //BEGIN CONDTION PARSEING
        if (this.props.state.functionality.conditions) {
            for (let c in conditions) {

                //Build the if statement
                let condition_start = "if (";
                if (conditions[c].comparison_type === "Attached") {
                    condition_start += conditions[c].comparison_x + " ";
                    condition_start += "== true)";
                } else if (conditions[c].comparison_type === "Not Attached") {
                    condition_start += conditions[c].comparison_x + " ";
                    condition_start += "== false)";
                } else {
                    condition_start += conditions[c].comparison_x + " ";
                    condition_start += conditions[c].comparison_type + " ";
                    condition_start += "\"" + conditions[c].comparison_y + "\")";
                }

                this.appendScript(set_tab, condition_start);
                this.appendScript(set_tab, "{");

                for (let a in conditions[c].actions) {
                    if (conditions[c].actions[a].split("-")[0] === "Cancelation") {
                        if (!this.cancelIsSetup(conditions[c], conditions[c].actions[a])) {
                            this.parseAction(set_tab_in, conditions[c].actions[a], false)
                        } else {
                            this.parseAction(set_tab_in, conditions[c].actions[a], true)
                        }
                    } else {
                        this.parseAction(set_tab_in, conditions[c].actions[a]);
                    }
                }

                this.parseConditions(level+1, conditions[c].key, initialTab);

                this.appendScript(set_tab, "}");
            }
        } else {
            //Parse everything individually
            //New Records
            if (this.props.state.functionality.new_record === true) {
                for (let r in this.props.state.new_records) {
                    this.appendScript(set_tab, this.genRecordText(r));
                }
            }

            //StatusItem
            if (this.props.state.functionality.status_update === true) {
                for (let s in this.props.state.status) {
                    this.appendScript(set_tab, this.genStatusText(s));
                }
            }

            //Fees
            if (this.props.state.functionality.fees === true) {
                for (let f in this.props.state.fees) {
                    this.appendScript(set_tab, this.genFeeText(f));
                }
            }

            //Notifications
            if (this.props.state.functionality.notifications === true) {
                for (let n in this.props.state.notifications) {
                    this.appendScript(set_tab, this.genNoteText(n));
                }
            }

            //Workflows
            if (this.props.state.functionality.workflow === true) {
                for (let w in this.props.state.workflows) {
                    this.appendScript(set_tab, this.genWorkText(w));
                }
            }

            //Inspections
            if (this.props.state.functionality.inspections === true) {
                for (let i in this.props.state.inspections) {
                    this.appendScript(set_tab, this.genInspectionText(i));
                }
            }

            //ASIs
            if (this.props.state.functionality.asi === true) {
                for (let a in this.props.state.asis) {
                    this.appendScript(set_tab, this.genASIText(a));
                }
            }

            //Cancels: THIS SHOULD ALWASY BE THE LAST ONE
            if (this.props.state.functionality.cancel === true
                && ((this.props.state.event_type
                && ["ASB", "IRSB", "WTUB"].includes(this.props.state.event_type))
                || this.props.state.mode === "pageflow"))
            {
                for (let c in this.props.state.cancels) {
                    this.appendScript(set_tab, this.genCancelText(c, set_tab, c!=="1"));
                }
            }

        }
        //Conditions or Not
    }

    parseAction = (tab, action, optional=false) => {
        if (action === null) {
            return null;
        }
        action = action.split("-");
        let action_text = "";
        switch (action[0]) {
            case "Status": {
                action_text = this.genStatusText(action[1]);
                break;
            }
            case "Fee": {
                action_text = this.genFeeText(action[1], tab);
                break;
            }
            case "Notification": {
                action_text = this.genNoteText(action[1]);
                break;
            }
            case "Workflow": {
                action_text = this.genWorkText(action[1]);
                break;
            }
            case "Inspection": {
                action_text = this.genInspectionText(action[1], tab);
                break;
            }
            case "Cancelation": {
                action_text = this.genCancelText(action[1], tab, optional);
                break;
            }
            case "ASI": {
                action_text = this.genASIText(action[1], tab);
                break;
            }
            case "New Record": {
                action_text = this.genRecordText(action[1], tab);
                break;
            }
            default: return null;
        }
        this.appendScript(tab, action_text);
    }

    genStatusText = status_num => {
        let status_text = "";
        if (this.props.state.functionality.status_update === true) {
            let stat = this.props.state.status[status_num];
            let comment_text = "";
            let optional_text = "";
            //Fix up the parameters
            if (!(stat.comment === "" || stat.comment === null)) {
                comment_text = " - " + stat.comment;
            }
            if (stat.cap !== null && stat.cap !== "" && stat.optional_cap === true) {
                optional_text = ", " + stat.cap.toString();
            }
            status_text += "updateAppStatus(\"" + stat.label + "\", "
                                    + "\"Updated via Script" + comment_text + "\""
                                    + optional_text
                                    + ");"
        }
        return status_text;
    }

    genFeeText = (fee_num, tab="") => {
        let fees_text = "";
        if (this.props.state.functionality.fees === true) {
            let fee = this.props.state.fees[fee_num];
            if (!isNaN(parseFloat(fee.quantity))) {
                fees_text += "updateFee(\"" + fee.code + "\", "
                            + "\"" + fee.schedule + "\", "
                            + "\"" + fee.period + "\", "
                            + fee.quantity + ", "
                            + "\"" + fee.invoice + "\");"
            } else {
                fees_text += "var fee_"+fee_num+" = getAppSpecific(\""+fee.quantity+"\");\n";
                fees_text += tab;
                fees_text += "updateFee(\"" + fee.code + "\", "
                            + "\"" + fee.schedule + "\", "
                            + "\"" + fee.period + "\", "
                            + "fee_"+fee_num+", "
                            + "\"" + fee.invoice + "\");"
            }
        }
        return fees_text;
    }

    genNoteText = note_num => {
        let note_text = "";
        if (this.props.state.functionality.notifications === true) {
            let note = this.props.state.notifications[note_num];
            let contacts = note.contacts;
            let professionals = note.professionals;
            let reportName = null;
            if (this.props.state.notifications[note_num].report_name) {
                reportName = "\""+this.props.state.notifications[note_num].report_name+"\"";
            }
            let reportModule = null;
            if (this.props.state.notifications[note_num].report_module) {
                reportModule = "\""+this.props.state.notifications[note_num].report_module+"\"";
            }
            let reportParameter = null;
            if (this.props.state.notifications[note_num].report_parameters) {
                let params = this.props.state.parameter_sets[this.props.state.notifications[note_num].report_parameters];
                reportParameter = "set_" + params.key + "_" + params.name;
            }
            let emailParams = null;
            if (this.props.state.notifications[note_num].email_params) {
                let params = this.props.state.parameter_sets[this.props.state.notifications[note_num].email_params];
                emailParams = "set_" + params.key + "_" + params.name;
            }
            note_text += "sendNotificationSCUBE(\"" + note.template + "\", "
                                                + "\"" + note.from + "\", "
                                                + contacts + ", "
                                                + professionals + ", "
                                                + reportName + ", "
                                                + reportParameter + ", "
                                                + reportModule + ", "
                                                + "capId, "
                                                + emailParams + ");";
        }
        return note_text;
    }

    genWorkText = work_num => {
        let work_text = "";
        if (this.props.state.functionality.workflow === true) {
            let work = this.props.state.workflows[work_num];
            if (work.action === "Open") {
                work_text += "activateTask(\""+work.task+"\");";
            } else if (work.action === "Close") {
                work_text += "closeTask(\""+work.task+"\", "
                            + "\"" + work.status + "\", "
                            + "\"" + work.comment + "\", "
                            + "null);"
            } else {
                work_text += ""
            }
        }
        return work_text;
    }

    genInspectionText = (insp_num, tab="") => {
        let insp_text = "";
        if (this.props.state.functionality.inspections === true) {
            let insp = this.props.state.inspections[insp_num];
            //scheduleInspectDate("Dumpster Inspection",  nextWorkDay(dateAdd(r,30)), "JCLARK4", null, "Scheduled by Script");
            insp_text += "var n = aa.date.getCurrentDate();\n"
	        insp_text += tab + "var r = dateFormatted(n.getMonth(), n.getDayOfMonth(), n.getYear(), \"MM/DD/YYYY\");\n"
            insp_text += tab + "scheduleInspectDate(\""
                        + insp.type + "\", nextWorkDay(dateAdd(r, "
                        + insp.days_out + "));";
        }
        return insp_text;
    }

    genCancelText = (cancel_num, tab="", setup=false) => {
        let cancel_text = "";
        if (this.props.state.functionality.cancel === true
            && ((this.props.state.event_type
            && ["ASB", "IRSB", "WTUB"].includes(this.props.state.event_type))
            || this.props.state.mode === "pageflow"))
        {
            cancel_text = "";
            let cancel = this.props.state.cancels[cancel_num];
            if (!setup) {
                cancel_text += "cancel = true;\n";
                cancel_text += tab + "showMessage = true;\n";
                cancel_text += tab + "var sCube_comment = \"" + cancel.message + "\\n\";";
            } else {
                cancel_text += "sCube_comment += \"" + cancel.message + "\\n\";";
            }
        }
        return cancel_text;
    }

    cancelIsSetup(check, myId) {
        if (myId) {
            //Check if this is the first action of this level
            if (!(check.actions[Object.keys(check.actions)[0]] === myId)) {
                return true;
            }
        }

        //Do I have a parent?
        let myParent = _.initial(check.key.split(".")).join(".");
        if (!myParent) {
            return false;
        } else {
            //Does my parent set it up?
            for (let a in this.props.state.conditions[myParent].actions) {
                console.log(a);
                if (this.props.state.conditions[myParent].actions[a].split("-")[0] === "Cancelation") return true;
            }
            //How about their parent?
            return this.cancelIsSetup(this.props.state.conditions[myParent], null)
        }
    }

    genCancelExtra(tab="") {
        if (!this.props.state.functionality.cancel) return null;
        let extra_text = "if (cancel) comment(sCube_comment);";
        return extra_text;
    }

    cancelIsUsed() {
        if (this.props.state.functionality.conditions === false) return true;
        let tree = _.cloneDeep(this.props.state.conditions);
        for (let c in tree) {
            for (let a in tree[c].actions) {
                if (tree[c].actions[a].split("-")[0] === "Cancelation") return true;
            }
        }
        return false;
    }

    genASIText = (asi_num) => {
        let asi_text = "";
        if (this.props.state.functionality.asi === true) {
            let asi = this.props.state.asis[asi_num];
            asi_text += "editAppSpecific(\""
                        + asi.name + "\", \""
                        + asi.value + "\");";
        }
        return asi_text;
    }

    genRecordText = (rec_num, tab="") => {
        let rec_text = "";
        if (this.props.state.functionality.new_record === true) {
            let rec = this.props.state.new_records[rec_num];
            rec_text += "var new_record_" + rec.key + " = createCap(\""
                        + rec.structure.module + "/"
                        + rec.structure.type + "/"
                        + rec.structure.subtype + "/"
                        + rec.structure.category + "\", \"\");";

            switch (rec.relationship) {
                case "parent": {
                    rec_text += "\n" + tab + "aa.cap.createAppHierarchy(new_record_" + rec.key + " , capId)";
                    break;
                }
                case "child": {
                    rec_text += "\n" + tab + "aa.cap.createAppHierarchy(capId, new_record_" + rec.key + ")";
                    break;
                }
                default: break;
            }

            if (rec.copy_data.asi) {
                rec_text += "\n" + tab + "copyAppSpecificInfoForLic(capId, new_record_" + rec.key + ");";
            }
            if (rec.copy_data.asit) {
                rec_text += "\n" + tab + "copyAppSpecificTableForLic(capId, new_record_" + rec.key + ");";
            }
            if (rec.copy_data.contacts) {
                rec_text += "\n" + tab + "copyPeopleForLic(capId, new_record_" + rec.key + ");";
            }
            if (rec.copy_data.address) {
                rec_text += "\n" + tab + "copyAddressForLic(capId, new_record_" + rec.key + ");";
            }
            if (rec.copy_data.parcel) {
                rec_text += "\n" + tab + "copyParcelForLic(capId, new_record_" + rec.key + ");";
            }
            if (rec.copy_data.owners) {
                rec_text += "\n" + tab + "copyOwnerForLic(capId, new_record_" + rec.key + ");";
            }
            if (rec.copy_data.Professionals) {
                rec_text += "\n" + tab + "copyLicenseProfessionalForLic(capId, new_record_" + rec.key + ");";
            }


        /*
        var newRecordCapID = createCap(cap"Licenses/Plumbing/Contractor/Renewal","");
                copyAppSpecificInfoForLic(srcCapId, targetCapId);
                copyAddressForLic(srcCapId, targetCapId);
                copyAppSpecificTableForLic(srcCapId, targetCapId);
                copyParcelForLic(srcCapId, targetCapId);
                copyPeopleForLic(srcCapId, targetCapId);
                copyLicenseProfessionalForLic(srcCapId, targetCapId);
                copyOwnerForLic(srcCapId, targetCapId);
        */
        }
        return rec_text;
    }

    render() {
        return (
        <div>
            {this.props.state.mode === "event_script" ? <div>
            { this.props.state.event_type !== null && (this.props.state.structure.module !== "NA" && this.props.state.structure.module !== "") ?
                <React.Fragment>
                    <p>Script Code: {this.genName(true)}</p>
                    <p>Script Name: {this.genName()}</p>
                </React.Fragment>
            : null}
            </div> : null }
            {this.props.state.mode === "function" ? <div>
                <p>Function Name: {this.props.state.mode}</p>
            </div> : null }
            {this.props.state.mode === "batch_script" ? <div>
            </div> : null }
            {this.props.state.mode === "pageflow" ? <div>
            </div> : null }
            <textarea rows="20" style={{width: "100%"}} value={this.generateHelper()} readOnly={true} />
        </div>
        );
    }
}

const mapStateToProps = state => ({
    state: state
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(CORE_GenerateOutput);
