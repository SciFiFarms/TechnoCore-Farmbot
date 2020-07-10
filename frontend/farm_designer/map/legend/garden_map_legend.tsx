import * as React from "react";
import { LayerToggle } from "../legend/layer_toggle";
import { GardenMapLegendProps } from "../interfaces";
import { atMaxZoom, atMinZoom } from "../zoom";
import { ImageFilterMenu } from "../../../photos/images/image_filter_menu";
import { BugsControls } from "../easter_eggs/bugs";
import { MoveModeLink } from "../../move_to";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import { t } from "../../../i18next_wrapper";
import { Feature } from "../../../devices/interfaces";
import { SelectModeLink } from "../../plants/select_plants";
import { DeviceSetting, Content } from "../../../constants";
import { Help } from "../../../ui";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { ToggleButton } from "../../../controls/toggle_button";

export const ZoomControls = ({ zoom, getConfigValue }: {
  zoom: (value: number) => () => void,
  getConfigValue: GetWebAppConfigValue
}) => {
  const plusBtnClass = atMaxZoom(getConfigValue) ? "disabled" : "";
  const minusBtnClass = atMinZoom(getConfigValue) ? "disabled" : "";
  return <div className="zoom-buttons">
    <button
      className={"fb-button gray zoom " + plusBtnClass}
      title={t("zoom in")}
      onClick={zoom(1)}>
      <i className="fa fa-2x fa-plus" />
    </button>
    <button
      className={"fb-button gray zoom zoom-out " + minusBtnClass}
      title={t("zoom out")}
      onClick={zoom(-1)}>
      <i className="fa fa-2x fa-minus" />
    </button>
  </div>;
};

interface NonLayerToggleProps {
  setting: WebAppBooleanConfigKey;
  label: string;
  helpText?: string;
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

const NonLayerToggle = (props: NonLayerToggleProps) => {
  const value = !!props.getConfigValue(props.setting);
  return <div className={"non-layer-config-toggle"}>
    <label>{t(props.label)}</label>
    {props.helpText && <Help text={props.helpText} />}
    <ToggleButton
      title={t(props.label)}
      toggleAction={() =>
        props.dispatch(setWebAppConfigValue(props.setting, !value))}
      toggleValue={value} />
  </div>;
};

interface LayerSubMenuProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export const PointsSubMenu =
  ({ dispatch, getConfigValue }: LayerSubMenuProps) =>
    <div className="map-points-submenu">
      <NonLayerToggle
        setting={BooleanSetting.show_historic_points}
        label={DeviceSetting.showRemovedWeeds}
        getConfigValue={getConfigValue}
        dispatch={dispatch} />
    </div>;

export const FarmbotSubMenu =
  ({ dispatch, getConfigValue }: LayerSubMenuProps) =>
    <div className="farmbot-layer-submenu">
      <NonLayerToggle
        setting={BooleanSetting.show_camera_view_area}
        label={DeviceSetting.showCameraViewAreaInMap}
        helpText={Content.SHOW_CAMERA_VIEW_AREA}
        getConfigValue={getConfigValue}
        dispatch={dispatch} />
    </div>;

const LayerToggles = (props: GardenMapLegendProps) => {
  const { toggle, getConfigValue, dispatch } = props;
  const subMenuProps = { dispatch, getConfigValue };
  return <div className="toggle-buttons">
    <LayerToggle
      value={props.showPlants}
      label={DeviceSetting.showPlants}
      onClick={toggle(BooleanSetting.show_plants)} />
    <LayerToggle
      value={props.showPoints}
      label={DeviceSetting.showPoints}
      onClick={toggle(BooleanSetting.show_points)} />
    <LayerToggle
      value={props.showWeeds}
      label={DeviceSetting.showWeeds}
      onClick={toggle(BooleanSetting.show_weeds)}
      submenuTitle={t("extras")}
      popover={<PointsSubMenu {...subMenuProps} />} />
    <LayerToggle
      value={props.showSpread}
      label={DeviceSetting.showSpread}
      onClick={toggle(BooleanSetting.show_spread)} />
    <LayerToggle
      value={props.showFarmbot}
      label={DeviceSetting.showFarmbot}
      onClick={toggle(BooleanSetting.show_farmbot)}
      submenuTitle={t("extras")}
      popover={<FarmbotSubMenu {...subMenuProps} />} />
    <LayerToggle
      value={props.showImages}
      label={DeviceSetting.showPhotos}
      onClick={toggle(BooleanSetting.show_images)}
      submenuTitle={t("filter")}
      popover={<div className={"image-options"}>
        <ImageFilterMenu {...subMenuProps}
          timeSettings={props.timeSettings}
          imageAgeInfo={props.imageAgeInfo} />
        <NonLayerToggle {...subMenuProps}
          setting={BooleanSetting.crop_images}
          label={DeviceSetting.cropMapImages}
          helpText={Content.CROP_MAP_IMAGES} />
      </div>} />
    {props.shouldDisplay(Feature.criteria_groups) &&
      <LayerToggle
        value={props.showZones}
        label={DeviceSetting.showAreas}
        onClick={toggle(BooleanSetting.show_zones)} />}
    {props.hasSensorReadings &&
      <LayerToggle
        value={props.showSensorReadings}
        label={DeviceSetting.showReadings}
        onClick={toggle(BooleanSetting.show_sensor_readings)} />}
  </div>;
};

export function GardenMapLegend(props: GardenMapLegendProps) {
  const menuClass = props.legendMenuOpen ? "active" : "";
  return <div className={`garden-map-legend ${menuClass} ${props.className}`}>
    <div className={"menu-pullout " + menuClass}
      onClick={props.toggle(BooleanSetting.legend_menu_open)}>
      <span>
        {t("Menu")}
      </span>
      <i className="fa fa-2x fa-arrow-left" />
    </div>
    <div className="content">
      <ZoomControls zoom={props.zoom} getConfigValue={props.getConfigValue} />
      <LayerToggles {...props} />
      <MoveModeLink />
      <SelectModeLink />
      <BugsControls />
    </div>
  </div>;
}
