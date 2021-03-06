const mockDevice = {
  setUserEnv: jest.fn(() => Promise.resolve({})),
  execScript: jest.fn(() => Promise.resolve({})),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import { scanImage, detectPlants } from "../actions";
import { error } from "../../../toast/toast";

describe("scanImage()", () => {
  it("executes with selected image id", () => {
    scanImage(1)(5);
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-plant-detection", [{
        args: { label: "PLANT_DETECTION_selected_image", value: "5" },
        kind: "pair"
      }]);
    expect(error).not.toHaveBeenCalled();
  });

  it("errors without calibration", () => {
    scanImage(0)(5);
    expect(mockDevice.execScript).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Calibrate camera first");
  });
});

describe("detectPlants()", () => {
  it("executes", () => {
    detectPlants(1)();
    expect(mockDevice.execScript).toHaveBeenCalledWith("plant-detection");
    expect(error).not.toHaveBeenCalled();
  });

  it("does not execute", () => {
    detectPlants(0)();
    expect(mockDevice.execScript).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Calibrate camera first");
  });
});
