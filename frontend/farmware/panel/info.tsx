import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../../farm_designer/designer_panel";
import { Panel } from "../../farm_designer/panel_header";
import { ShouldDisplay, UserEnv } from "../../devices/interfaces";
import { selectAllFarmwareInstallations } from "../../resources/selectors";
import { Everything } from "../../interfaces";
import {
  getShouldDisplayFn, saveOrEditFarmwareEnv, getEnv, generateFarmwareDictionary,
} from "../state_to_props";
import { Farmwares, SaveFarmwareEnv } from "../interfaces";
import { SyncStatus, TaggedFarmwareInstallation } from "farmbot";
import { getStatus } from "../../connectivity/reducer_support";
import { t } from "../../i18next_wrapper";
import { isBotOnline } from "../../devices/must_be_online";
import {
  setActiveFarmwareByName,
} from "../set_active_farmware_by_name";
import { NetworkState } from "../../connectivity/interfaces";
import { FarmwareInfo } from "../farmware_info";
import { needsFarmwareForm, FarmwareForm } from "../farmware_forms";
import { BasicFarmwarePage } from "../basic_farmware_page";

export interface DesignerFarmwareInfoProps {
  dispatch: Function;
  env: UserEnv;
  botToMqttStatus: NetworkState;
  farmwares: Farmwares;
  syncStatus: SyncStatus | undefined;
  currentFarmware: string | undefined;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  taggedFarmwareInstallations: TaggedFarmwareInstallation[];
}

export const mapStateToProps = (props: Everything): DesignerFarmwareInfoProps => {
  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);
  const taggedFarmwareInstallations =
    selectAllFarmwareInstallations(props.resources.index);
  return {
    currentFarmware: props.resources.consumers.farmware.currentFarmware,
    farmwares: generateFarmwareDictionary(props.bot, props.resources.index),
    botToMqttStatus: getStatus(props.bot.connectivity.uptime["bot.mqtt"]),
    env,
    dispatch: props.dispatch,
    syncStatus: props.bot.hardware.informational_settings.sync_status,
    shouldDisplay,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    taggedFarmwareInstallations,
  };
};

export class RawDesignerFarmwareInfo
  extends React.Component<DesignerFarmwareInfoProps, {}> {

  get current() { return this.props.currentFarmware; }

  get botOnline() {
    return isBotOnline(this.props.syncStatus, this.props.botToMqttStatus);
  }

  componentDidMount() {
    const farmwareNames = Object.values(this.props.farmwares).map(x => x.name);
    setActiveFarmwareByName(farmwareNames);
  }

  render() {
    const farmware = this.props.farmwares[this.current || ""];
    const panelName = "designer-farmware-info";
    return <DesignerPanel panelName={panelName} panel={Panel.Farmware}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Farmware}
        title={farmware?.name || t("No Farmware selected")}
        backTo={"/app/designer/farmware"} />
      <DesignerPanelContent panelName={panelName}>
        {farmware && needsFarmwareForm(farmware)
          ? <FarmwareForm farmware={farmware}
            env={this.props.env}
            shouldDisplay={this.props.shouldDisplay}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            botOnline={this.botOnline}
            dispatch={this.props.dispatch} />
          : <BasicFarmwarePage
            farmwareName={this.current || ""}
            farmware={farmware}
            botOnline={this.botOnline} />}
        <FarmwareInfo
          dispatch={this.props.dispatch}
          botOnline={this.botOnline}
          farmware={farmware}
          installations={this.props.taggedFarmwareInstallations}
          shouldDisplay={this.props.shouldDisplay}
          firstPartyFarmwareNames={[]}
          showFirstParty={false} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const DesignerFarmwareInfo =
  connect(mapStateToProps)(RawDesignerFarmwareInfo);
