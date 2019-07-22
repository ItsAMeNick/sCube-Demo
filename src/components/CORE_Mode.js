import React, { Component } from 'react';
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { connect } from "react-redux";

class CORE_Event extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.update({
            event_type: event.target.value
        });
        event.preventDefault();
    };

    componentDidMount() {
        //Have Conditions be on by default
        document.getElementById("event_script").checked = true;
    };

    render() {
        return (
        <Row>
            <Col>
                <Form.Check id="event_script" type="radio" name = "mode" label="Event Script"/>
            </Col> <Col>
                <Form.Check id="function" type="radio" name = "mode" label="Function"/>
            </Col> <Col>
                <Form.Check id="batch_script" type="radio" name = "mode" label="Batch Script"/>
            </Col>
        </Row>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.mode
});

const mapDispatchToProps = dispatch => ({
    update: item => dispatch({
        type: "update_mode",
        payload: item
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(CORE_Event);
