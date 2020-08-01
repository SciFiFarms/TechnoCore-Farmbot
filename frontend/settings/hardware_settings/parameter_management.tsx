import * as React from "react";
import { ParameterManagementProps } from "./interfaces";
import { Row, Col, BlurableInput, Help } from "../../ui/index";
import { Header } from "./header";
import { Collapse, Popover, Position } from "@blueprintjs/core";
import { Content, DeviceSetting, ToolTips } from "../../constants";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { SettingLoadProgress } from "./setting_load_progress";
import {
  FwParamExportMenu, importParameters, resendParameters,
} from "./export_menu";

export function ParameterManagement(props: ParameterManagementProps) {

  const { dispatch, onReset, botOnline, arduinoBusy, firmwareHardware } = props;
  const { parameter_management } = props.controlPanelState;
  return <Highlight className={"section"}
    settingName={DeviceSetting.parameterManagement}>
    <Header
      expanded={parameter_management}
      title={DeviceSetting.parameterManagement}
      panel={"parameter_management"}
      dispatch={dispatch} />
    <Collapse isOpen={!!parameter_management}>
      <Highlight settingName={DeviceSetting.paramLoadProgress}>
        <Row>
          <Col xs={7}>
            <label style={{ lineHeight: "1.5rem", display: "inline" }}>
              {t(DeviceSetting.paramLoadProgress)}
            </label>
            <Help text={ToolTips.PARAMETER_LOAD_PROGRESS} />
          </Col>
          <Col xs={5} className={"centered-button-div"}>
            <SettingLoadProgress botOnline={botOnline}
              firmwareHardware={firmwareHardware}
              firmwareConfig={props.firmwareConfig}
              sourceFwConfig={props.sourceFwConfig} />
          </Col>
        </Row>
      </Highlight>
      <Highlight settingName={DeviceSetting.paramResend}>
        <Row>
          <Col xs={8}>
            <label style={{ lineHeight: "1.5rem" }}>
              {t(DeviceSetting.paramResend)}
            </label>
          </Col>
          <Col xs={4} className={"centered-button-div"}>
            <button
              className="fb-button yellow"
              disabled={arduinoBusy || !botOnline}
              title={t("RESEND")}
              onClick={() => props.dispatch(resendParameters())}>
              {t("RESEND")}
            </button>
          </Col>
        </Row>
      </Highlight>
      <Highlight settingName={DeviceSetting.exportParameters}>
        <Row>
          <Col xs={8}>
            <label style={{ lineHeight: "1.5rem" }}>
              {t(DeviceSetting.exportParameters)}
            </label>
          </Col>
          <Col xs={4} className={"centered-button-div"}>
            <Popover position={Position.BOTTOM_RIGHT}>
              <i className="fa fa-download" />
              <FwParamExportMenu firmwareConfig={props.firmwareConfig} />
            </Popover>
          </Col>
        </Row>
      </Highlight>
      <ParameterImport dispatch={dispatch} arduinoBusy={arduinoBusy} />
      <Highlight settingName={DeviceSetting.resetHardwareParams}>
        <Row>
          <Col xs={8}>
            <label style={{ lineHeight: "1.5rem" }}>
              {t(DeviceSetting.resetHardwareParams)}
            </label>
          </Col>
          <Col xs={4} className={"centered-button-div"}>
            <button
              className="fb-button red"
              disabled={arduinoBusy || !botOnline}
              title={t("RESET")}
              onClick={onReset}>
              {t("RESET")}
            </button>
          </Col>
        </Row>
        <Row><p>{t(Content.RESTORE_DEFAULT_HARDWARE_SETTINGS)}</p></Row>
      </Highlight>
    </Collapse>
  </Highlight>;
}

export interface ParameterImportProps {
  dispatch: Function;
  arduinoBusy: boolean;
}

interface ParameterImportState {
  input: string;
}

export class ParameterImport
  extends React.Component<ParameterImportProps, ParameterImportState> {
  state: ParameterImportState = { input: "" };
  render() {
    return <Highlight settingName={DeviceSetting.importParameters}>
      <Row>
        <Col xs={12}>
          <label>
            {t(DeviceSetting.importParameters)}
          </label>
          <Help text={ToolTips.PARAMETER_IMPORT} />
        </Col>
      </Row>
      <Row>
        <Col xs={9} className={"centered-button-div"}>
          <BlurableInput value={this.state.input} onCommit={e =>
            this.setState({ input: e.currentTarget.value })} />
        </Col>
        <Col xs={3} className={"centered-button-div"}>
          <button
            className="fb-button yellow"
            disabled={this.props.arduinoBusy}
            title={t("IMPORT")}
            onClick={() => confirm(Content.PARAMETER_IMPORT_CONFIRM) &&
              this.props.dispatch(importParameters(this.state.input))}>
            {t("IMPORT")}
          </button>
        </Col>
      </Row>
    </Highlight>;
  }
}
