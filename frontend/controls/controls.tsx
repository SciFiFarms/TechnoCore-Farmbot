import * as React from "react";
import { connect } from "react-redux";
import { DesignerPanel, DesignerPanelContent } from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { MustBeOnline, isBotOnlineFromState } from "../devices/must_be_online";
import { getStatus } from "../connectivity/reducer_support";
import { JogControlsGroup } from "./move/jog_controls_group";
import { BotPositionRows } from "./move/bot_position_rows";
import { BooleanSetting } from "../session_keys";
import { MotorPositionPlot } from "./move/motor_position_plot";
import { BotState, UserEnv } from "../devices/interfaces";
import {
  TaggedWebcamFeed, TaggedPeripheral, McuParams, FirmwareHardware,
} from "farmbot";
import {
  GetWebAppConfigValue, getWebAppConfigValue, toggleWebAppBool,
} from "../config_storage/actions";
import { Everything } from "../interfaces";
import { validFwConfig, validFbosConfig, validBotLocationData } from "../util";
import { getFirmwareConfig, getFbosConfig } from "../resources/getters";
import { getShouldDisplayFn, getEnv } from "../farmware/state_to_props";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { isFwHardwareValue } from "../settings/firmware/firmware_hardware_support";
import {
  selectAllWebcamFeeds, selectAllPeripherals,
} from "../resources/selectors";
import { uniq } from "lodash";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { Peripherals } from "./peripherals";
import { WebcamPanel } from "./webcam";
import { Popover, Position } from "@blueprintjs/core";
import { MoveWidgetSettingsMenu } from "./move/settings_menu";

export interface DesignerControlsProps {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  firmwareSettings: McuParams;
  getWebAppConfigVal: GetWebAppConfigValue;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
}

export const mapStateToProps = (props: Everything): DesignerControlsProps => {
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;

  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

  const { configuration } = props.bot.hardware;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig = sourceFbosConfigValue(fbosConfig, configuration);
  const { value } = sourceFbosConfig("firmware_hardware");
  const firmwareHardware = isFwHardwareValue(value) ? value : undefined;

  return {
    feeds: selectAllWebcamFeeds(props.resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    peripherals: uniq(selectAllPeripherals(props.resources.index)),
    firmwareSettings: fwConfig || mcu_params,
    getWebAppConfigVal: getWebAppConfigValue(() => props),
    env,
    firmwareHardware,
  };
};

export class RawDesignerControls
  extends React.Component<DesignerControlsProps, {}> {
  get arduinoBusy() {
    return !!this.props.bot.hardware.informational_settings.busy;
  }

  get botOnline() {
    return isBotOnlineFromState(this.props.bot);
  }

  getValue = (key: BooleanConfigKey): boolean =>
    !!this.props.getWebAppConfigVal(BooleanSetting[key]);

  toggle = (key: BooleanConfigKey) => (): void =>
    this.props.dispatch(toggleWebAppBool(key));

  render() {
    const { bot } = this.props;
    const { location_data, informational_settings } = bot.hardware;
    const locationData = validBotLocationData(location_data);
    return <DesignerPanel panelName={"controls"} panel={Panel.Controls}>
      <DesignerNavTabs />
      <DesignerPanelContent panelName={"controls"}>
        <div className={"move"}>
          <Popover position={Position.LEFT_TOP} className={"move-settings"}>
            <i className="fa fa-gear" />
            <MoveWidgetSettingsMenu
              toggle={this.toggle}
              getValue={this.getValue}
              firmwareHardware={this.props.firmwareHardware} />
          </Popover>
          <MustBeOnline
            lockOpen={process.env.NODE_ENV !== "production"}
            networkState={getStatus(bot.connectivity.uptime["bot.mqtt"])}
            syncStatus={informational_settings.sync_status}>
            <JogControlsGroup
              dispatch={this.props.dispatch}
              stepSize={bot.stepSize}
              botPosition={locationData.position}
              getValue={this.getValue}
              arduinoBusy={this.arduinoBusy}
              env={this.props.env}
              firmwareSettings={this.props.firmwareSettings} />
            <BotPositionRows
              locationData={locationData}
              getValue={this.getValue}
              arduinoBusy={this.arduinoBusy}
              firmwareSettings={this.props.firmwareSettings}
              firmwareHardware={this.props.firmwareHardware} />
          </MustBeOnline>
          {this.props.getWebAppConfigVal(BooleanSetting.show_motor_plot) &&
            <MotorPositionPlot locationData={locationData} />}
        </div>
        <hr />
        <Peripherals
          firmwareHardware={this.props.firmwareHardware}
          bot={this.props.bot}
          peripherals={this.props.peripherals}
          dispatch={this.props.dispatch}
          disabled={this.arduinoBusy || !this.botOnline} />
        <hr />
        {!this.props.getWebAppConfigVal(BooleanSetting.hide_webcam_widget) &&
          <WebcamPanel
            feeds={this.props.feeds}
            dispatch={this.props.dispatch} />}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerControls = connect(mapStateToProps)(RawDesignerControls);
