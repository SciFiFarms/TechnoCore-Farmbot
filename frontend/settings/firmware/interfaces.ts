import {
  BotState, ShouldDisplay, SourceFbosConfig,
} from "../../devices/interfaces";
import { Alert, FirmwareHardware } from "farmbot";
import { TimeSettings } from "../../interfaces";

export interface FirmwareProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
}

export interface FlashFirmwareRowProps {
  botOnline: boolean;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface BoardTypeProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
  firmwareHardware: FirmwareHardware | undefined;
}
