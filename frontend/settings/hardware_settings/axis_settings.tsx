import * as React from "react";
import { BooleanMCUInputGroup } from "./boolean_mcu_input_group";
import { ToolTips, DeviceSetting } from "../../constants";
import { NumericMCUInputGroup } from "./numeric_mcu_input_group";
import { CalibrationRow } from "./calibration_row";
import { disabledAxisMap } from "./axis_tracking_status";
import { AxisSettingsProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { calculateScale } from "./motors";
import { hasEncoders } from "../firmware/firmware_hardware_support";
import { getDevice } from "../../device";
import { commandErr } from "../../devices/actions";
import { CONFIG_DEFAULTS } from "farmbot/dist/config";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import {
  settingRequiredLabel, encodersOrLimitSwitchesRequired,
} from "./encoders_or_stall_detection";

export function AxisSettings(props: AxisSettingsProps) {

  const {
    dispatch, bot, sourceFwConfig, firmwareConfig, botOnline,
    firmwareHardware
  } = props;
  const mcuParams = firmwareConfig ? firmwareConfig : bot.hardware.mcu_params;
  const { axis_settings } = props.bot.controlPanelState;
  const { busy } = bot.hardware.informational_settings;

  /**
   * Tells us if X/Y/Z have a means of checking their position.
   * FARMBOT WILL CRASH INTO WALLS IF THIS IS WRONG! BE CAREFUL.
   */
  const disabled = disabledAxisMap(mcuParams);

  const axisLengthDisabled = {
    x: !sourceFwConfig("movement_axis_nr_steps_x").value,
    y: !sourceFwConfig("movement_axis_nr_steps_y").value,
    z: !sourceFwConfig("movement_axis_nr_steps_z").value
  };

  const showEncoders = hasEncoders(firmwareHardware);

  const scale = calculateScale(sourceFwConfig);

  return <Highlight className={"section"}
    settingName={DeviceSetting.axisSettings}>
    <Header
      title={DeviceSetting.axisSettings}
      panel={"axis_settings"}
      dispatch={dispatch}
      expanded={axis_settings} />
    <Collapse isOpen={!!axis_settings}>
      <SpacePanelHeader />
      <CalibrationRow
        type={"find_home"}
        title={DeviceSetting.findHome}
        axisTitle={t("FIND HOME")}
        toolTip={!showEncoders
          ? ToolTips.FIND_HOME_STALL_DETECTION
          : ToolTips.FIND_HOME_ENCODERS}
        action={axis => getDevice()
          .findHome({ speed: CONFIG_DEFAULTS.speed, axis })
          .catch(commandErr("'Find Home' request"))}
        mcuParams={mcuParams}
        arduinoBusy={busy}
        botOnline={botOnline} />
      <CalibrationRow
        type={"zero"}
        title={DeviceSetting.setHome}
        axisTitle={t("SET HOME")}
        toolTip={ToolTips.SET_HOME_POSITION}
        action={axis => getDevice().setZero(axis)
          .catch(commandErr("Set home"))}
        mcuParams={mcuParams}
        arduinoBusy={busy}
        botOnline={botOnline} />
      <BooleanMCUInputGroup
        label={DeviceSetting.findHomeOnBoot}
        tooltip={!showEncoders
          ? ToolTips.FIND_HOME_ON_BOOT_STALL_DETECTION
          : ToolTips.FIND_HOME_ON_BOOT_ENCODERS}
        grayscale={disabled}
        disabledBy={encodersOrLimitSwitchesRequired(showEncoders)}
        disabled={busy}
        x={"movement_home_at_boot_x"}
        y={"movement_home_at_boot_y"}
        z={"movement_home_at_boot_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig}
        caution={true} />
      <BooleanMCUInputGroup
        label={DeviceSetting.stopAtHome}
        tooltip={ToolTips.STOP_AT_HOME}
        disabled={busy}
        x={"movement_stop_at_home_x"}
        y={"movement_stop_at_home_y"}
        z={"movement_stop_at_home_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        label={DeviceSetting.stopAtMax}
        tooltip={ToolTips.STOP_AT_MAX}
        disabled={busy}
        grayscale={axisLengthDisabled}
        disabledBy={settingRequiredLabel([DeviceSetting.axisLength])}
        x={"movement_stop_at_max_x"}
        y={"movement_stop_at_max_y"}
        z={"movement_stop_at_max_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <BooleanMCUInputGroup
        label={DeviceSetting.negativeCoordinatesOnly}
        tooltip={ToolTips.NEGATIVE_COORDINATES_ONLY}
        disabled={busy}
        x={"movement_home_up_x"}
        y={"movement_home_up_y"}
        z={"movement_home_up_z"}
        dispatch={dispatch}
        sourceFwConfig={sourceFwConfig} />
      <CalibrationRow
        type={"calibrate"}
        title={DeviceSetting.findAxisLength}
        axisTitle={t("FIND LENGTH")}
        toolTip={!showEncoders
          ? ToolTips.FIND_LENGTH_STALL_DETECTION
          : ToolTips.FIND_LENGTH_ENCODERS}
        action={axis => getDevice().calibrate({ axis })
          .catch(commandErr("Find axis length"))}
        mcuParams={mcuParams}
        arduinoBusy={busy}
        botOnline={botOnline} />
      <NumericMCUInputGroup
        label={DeviceSetting.axisLength}
        tooltip={ToolTips.AXIS_LENGTH}
        disabled={busy}
        x={"movement_axis_nr_steps_x"}
        y={"movement_axis_nr_steps_y"}
        z={"movement_axis_nr_steps_z"}
        xScale={scale.x}
        yScale={scale.y}
        zScale={scale.z}
        gray={{
          x: !sourceFwConfig("movement_stop_at_max_x").value,
          y: !sourceFwConfig("movement_stop_at_max_y").value,
          z: !sourceFwConfig("movement_stop_at_max_z").value,
        }}
        disabledBy={settingRequiredLabel([DeviceSetting.stopAtMax])}
        sourceFwConfig={sourceFwConfig}
        dispatch={dispatch}
        intSize={"long"} />
    </Collapse>
  </Highlight>;
}
