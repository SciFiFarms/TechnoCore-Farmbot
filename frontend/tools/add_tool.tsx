import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import { SaveBtn } from "../ui";
import { SpecialStatus } from "farmbot";
import { initSave, destroy, init, save } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { history } from "../history";
import { selectAllTools } from "../resources/selectors";
import { betterCompact } from "../util";
import {
  getFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "../resources/getters";
import { ToolSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { AddToolProps, AddToolState } from "./interfaces";

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
});

export class RawAddTool extends React.Component<AddToolProps, AddToolState> {
  state: AddToolState = { toolName: "", toAdd: [], uuid: undefined };

  filterExisting = (n: string) => !this.props.existingToolNames.includes(n);

  add = (n: string) => this.filterExisting(n) && !this.state.toAdd.includes(n) &&
    this.setState({ toAdd: this.state.toAdd.concat([n]) });

  remove = (n: string) =>
    this.setState({ toAdd: this.state.toAdd.filter(name => name != n) });

  componentDidMount = () => this.setState({
    toAdd: this.stockToolNames().filter(this.filterExisting)
  });

  newTool = (name: string) => this.props.dispatch(initSave("Tool", { name }));

  save = () => {
    const initTool = init("Tool", { name: this.state.toolName });
    this.props.dispatch(initTool);
    const { uuid } = initTool.payload;
    this.setState({ uuid });
    this.props.dispatch(save(uuid))
      .then(() => {
        this.setState({ uuid: undefined });
        history.push("/app/designer/tools");
      }).catch(() => { });
  }

  componentWillUnmount = () =>
    this.state.uuid && this.props.dispatch(destroy(this.state.uuid));

  stockToolNames = () => {
    switch (this.props.firmwareHardware) {
      case "arduino":
      case "farmduino":
      case "farmduino_k14":
      default:
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
        ];
      case "farmduino_k15":
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
      case "express_k10":
        return [
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
    }
  }

  StockToolCheckbox = ({ toolName }: { toolName: string }) => {
    const alreadyAdded = !this.filterExisting(toolName);
    const checked = this.state.toAdd.includes(toolName) || alreadyAdded;
    return <div className={`fb-checkbox ${alreadyAdded ? "disabled" : ""}`}>
      <input type="checkbox" key={JSON.stringify(this.state.toAdd)}
        title={alreadyAdded ? t("Already added.") : ""}
        name="toolName"
        checked={checked}
        onChange={() => checked
          ? this.remove(toolName)
          : this.add(toolName)} />
    </div>;
  }

  AddStockTools = () => {
    const add = this.state.toAdd.filter(this.filterExisting);
    return <div className="add-stock-tools"
      hidden={this.props.firmwareHardware == "none"}>
      <label>{t("stock names")}</label>
      <ul>
        {this.stockToolNames().map(n =>
          <li key={n}>
            <this.StockToolCheckbox toolName={n} />
            <p onClick={() => this.setState({ toolName: n })}>{n}</p>
          </li>)}
      </ul>
      <button
        className={`fb-button green ${add.length > 0 ? "" : "pseudo-disabled"}`}
        title={add.length > 0 ? t("Add selected") : t("None to add")}
        onClick={() => {
          add.map(n => this.newTool(n));
          history.push("/app/designer/tools");
        }}>
        <i className="fa fa-plus" />
        {t("selected")}
      </button>
    </div>;
  }

  render() {
    const { toolName, uuid } = this.state;
    const alreadyAdded = !uuid && !this.filterExisting(toolName);
    const panelName = "add-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add new")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        <div className="add-new-tool">
          <ToolSVG toolName={this.state.toolName} />
          <label>{t("Name")}</label>
          <input defaultValue={this.state.toolName}
            name="name"
            onChange={e =>
              this.setState({ toolName: e.currentTarget.value })} />
          <SaveBtn
            onClick={this.save}
            disabled={!this.state.toolName || alreadyAdded}
            status={SpecialStatus.DIRTY} />
          <p className="name-error">
            {alreadyAdded ? t("Already added.") : ""}
          </p>
        </div>
        <this.AddStockTools />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddTool = connect(mapStateToProps)(RawAddTool);
