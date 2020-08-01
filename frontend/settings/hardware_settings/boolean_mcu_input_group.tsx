import * as React from "react";
import { ToggleButton } from "../../controls/toggle_button";
import { settingToggle } from "../../devices/actions";
import { Row, Col, Help } from "../../ui";
import { BooleanMCUInputGroupProps } from "./interfaces";
import { Position } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export class BooleanMCUInputGroup
  extends React.Component<BooleanMCUInputGroupProps> {

  Toggles = () => {
    const {
      sourceFwConfig, dispatch, disable, grayscale, displayAlert, disabledBy,
      x, y, z,
    } = this.props;
    const xParam = sourceFwConfig(x);
    const yParam = sourceFwConfig(y);
    const zParam = sourceFwConfig(z);
    const width = 4;
    return <div className={"mcu-inputs"}>
      <Col xs={width} className={"centered-button-div"}>
        <ToggleButton
          grayscale={grayscale?.x}
          disabled={this.props.disabled || disable?.x}
          dim={!xParam.consistent}
          title={grayscale?.x ? disabledBy : undefined}
          toggleValue={xParam.value}
          toggleAction={() =>
            dispatch(settingToggle(x, sourceFwConfig, displayAlert))} />
      </Col>
      <Col xs={width} className={"centered-button-div"}>
        <ToggleButton
          grayscale={grayscale?.y}
          disabled={this.props.disabled || disable?.y}
          dim={!yParam.consistent}
          title={grayscale?.y ? disabledBy : undefined}
          toggleValue={yParam.value}
          toggleAction={() =>
            dispatch(settingToggle(y, sourceFwConfig, displayAlert))} />
      </Col>
      <Col xs={width} className={"centered-button-div"}>
        <ToggleButton
          grayscale={grayscale?.z}
          disabled={this.props.disabled || disable?.z}
          dim={!zParam.consistent}
          title={grayscale?.z ? disabledBy : undefined}
          toggleValue={zParam.value}
          toggleAction={() =>
            dispatch(settingToggle(z, sourceFwConfig, displayAlert))} />
      </Col>
    </div>;
  }

  render() {
    const { tooltip, label, caution } = this.props;
    return <Highlight settingName={label}>
      <Row>
        <Col xs={12} className={"widget-body-tooltips"}>
          <label>
            {t(label)}
            {caution &&
              <i className="fa fa-exclamation-triangle caution-icon" />}
          </label>
          <Help text={tooltip} position={Position.TOP_RIGHT} />
        </Col>
      </Row>
      <Row><this.Toggles /></Row>
    </Highlight>;
  }
}
