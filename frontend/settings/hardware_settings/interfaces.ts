import {
  BotState, SourceFwConfig,
  ControlPanelState, Axis, ShouldDisplay,
} from "../../devices/interfaces";
import { McuParamName, McuParams, FirmwareHardware, Xyz } from "farmbot";
import { IntegerSize } from "../../util";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { ResourceIndex } from "../../resources/interfaces";
import { DeviceSetting } from "../../constants";

export interface ZeroRowProps {
  botDisconnected: boolean;
}

export interface AxisSettingsProps {
  dispatch: Function;
  bot: BotState;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
  botOnline: boolean;
  firmwareHardware: FirmwareHardware | undefined;
  shouldDisplay: ShouldDisplay;
}

export interface BooleanMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  tooltip: string;
  label: DeviceSetting;
  x: McuParamName;
  y: McuParamName;
  z: McuParamName;
  disable?: Record<Xyz, boolean>;
  grayscale?: Record<Xyz, boolean>;
  caution?: boolean | undefined;
  displayAlert?: string | undefined;
  disabled?: boolean;
  disabledBy?: string;
}

export interface CalibrationRowProps {
  type: "find_home" | "calibrate" | "zero";
  mcuParams: McuParams;
  arduinoBusy: boolean;
  botOnline: boolean;
  action(axis: Axis): void;
  toolTip: string;
  title: DeviceSetting;
  axisTitle: string;
  stallUseDisabled?: boolean;
}

export interface NumericMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  tooltip: string;
  label: DeviceSetting;
  x: McuParamName;
  xScale?: number;
  y: McuParamName;
  yScale?: number;
  z: McuParamName;
  zScale?: number;
  float?: boolean;
  intSize?: IntegerSize;
  gray?: Record<Xyz, boolean>;
  min?: number;
  max?: number;
  disabled?: boolean;
  disabledBy?: string;
}

export interface PinGuardMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  label: DeviceSetting;
  pinNumKey: McuParamName;
  timeoutKey: McuParamName;
  activeStateKey: McuParamName;
  resources: ResourceIndex;
  disabled: boolean;
}

export interface PinGuardProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  resources: ResourceIndex;
  arduinoBusy: boolean;
}

export interface MotorsProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  arduinoBusy: boolean;
}

export interface EncodersOrStallDetectionProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  shouldDisplay: ShouldDisplay;
  arduinoBusy: boolean;
}

export interface LimitSwitchesProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  arduinoBusy: boolean;
}

export interface ErrorHandlingProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  arduinoBusy: boolean;
}

export interface ParameterManagementProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  onReset(): void;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  botOnline: boolean;
  arduinoBusy: boolean;
}
