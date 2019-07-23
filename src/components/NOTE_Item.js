import React, { Component } from 'react';
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";

class NOTE_Item extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        let newNotifications = this.props.notifications;
        let newValue = event.target.value;
        if (event.target.id === "report_bool") {
            newValue = event.target.checked;
        }
        if (event.target.id === "contacts" || event.target.id === "professionals") {
            newValue = "DEBUG";
        }
        newNotifications[this.props.note_number][event.target.id] = newValue;
        this.props.update({
            note: newNotifications
        });
        this.forceUpdate();
    };

    render() {
        return (
        <React.Fragment>
        <tr>
            <td>{this.props.note_number}</td>
            <td>
                <Form.Control id="template" type="text" onChange={this.handleChange}/>
            </td>
            <td>
                <Form.Control id="fromEmail" type="email" onChange={this.handleChange}/>
            </td>
            <td>
                <Form.Control id="contacts" type="text" onChange={this.handleChange}/>
            </td>
            <td>
                <Form.Control id="professionals" type="text" onChange={this.handleChange}/>
            </td>
            <td>
                <Form.Check id="report_bool" onChange={this.handleChange}/>
            </td>
            {this.props.note_number !== 1 ?
            <td>
                <button onClick={() => {
                    this.props.delete(this.props.note_number);
                }}>
                    Delete
                </button>
            </td>
            : <td></td>}
        </tr>
        {this.props.notifications[this.props.note_number].report_bool ?
            <tr>
                <td colSpan="4"/>
                <td>
                    <p>Report Module:</p>
                    <p>Report Name:</p>
                    <p>Report Parameter:</p>
                </td>
                <td>
                    <Form.Control id="report_module" type="text" onChange={this.handleChange}/>
                    <Form.Control id="report_name" type="text" onChange={this.handleChange}/>
                    <Form.Control id="report_parameter" type="text" onChange={this.handleChange}/>
                </td>
            </tr>
        : null}
        </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    notifications: state.notifications
});

const mapDispatchToProps = dispatch => ({
    update: n => dispatch({
        type: "update_notes",
        payload: n
    }),
    delete: n => dispatch({
        type: "delete_note",
        payload: n
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(NOTE_Item);