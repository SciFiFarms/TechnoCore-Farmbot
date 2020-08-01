import * as React from "react";
import { LockableButton } from "./lockable_button";
import { axisTrackingStatus } from "./axis_tracking_status";
import { Row, Col, Help } from "../../ui/index";
import { CalibrationRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Position } from "@blueprintjs/core";
import { Highlight } from "../maybe_highlight";

export class CalibrationRow extends React.Component<CalibrationRowProps> {
  Axes = () => {
    const {
      type, botOnline, axisTitle, mcuParams, action, arduinoBusy,
    } = this.props;
    return <div className="calibration-row-axes">
      {axisTrackingStatus(mcuParams, this.props.stallUseDisabled)
        .map(row => {
          const { axis } = row;
          const hardwareDisabled = type == "zero" ? false : row.disabled;
          return <Col xs={4} key={axis}
            className={"centered-button-div"}>
            <LockableButton
              disabled={arduinoBusy || hardwareDisabled || !botOnline}
              title={t(axisTitle)}
              onClick={() => action(axis)}>
              {`${t(axisTitle)} ${axis}`}
            </LockableButton>
          </Col>;
        })}
    </div>;
  }

  render() {
    return <Highlight settingName={this.props.title}>
      <Row>
        <Col xs={12} className={"widget-body-tooltips"}>
          <label>
            {t(this.props.title)}
          </label>
          <Help text={t(this.props.toolTip)} position={Position.TOP_RIGHT} />
        </Col>
      </Row>
      <Row><this.Axes /></Row>
    </Highlight>;
  }
}
