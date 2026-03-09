import type { DoubleWishboneHardpoints, VehicleParams, SuspensionDesignPayload } from '../types/suspension';

export function buildPayload(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams,
  name = '',
): SuspensionDesignPayload {
  return {
    name,
    suspensionType: 0,
    axlePosition: 0,
    upperWishboneFrontPivot: hardpoints.upperWishboneFrontPivot,
    upperWishboneRearPivot: hardpoints.upperWishboneRearPivot,
    upperBallJoint: hardpoints.upperBallJoint,
    lowerWishboneFrontPivot: hardpoints.lowerWishboneFrontPivot,
    lowerWishboneRearPivot: hardpoints.lowerWishboneRearPivot,
    lowerBallJoint: hardpoints.lowerBallJoint,
    tieRodInner: hardpoints.tieRodInner,
    tieRodOuter: hardpoints.tieRodOuter,
    springDamperUpper: hardpoints.springDamperUpper,
    springDamperLower: hardpoints.springDamperLower,
    pushrodWheelEnd: hardpoints.pushrodWheelEnd,
    pushrodRockerEnd: hardpoints.pushrodRockerEnd,
    trackWidth: vehicleParams.trackWidth,
    wheelbase: vehicleParams.wheelbase,
    sprungMass: vehicleParams.sprungMass,
    unsprungMass: vehicleParams.unsprungMass,
    springRate: vehicleParams.springRate,
    dampingCoefficient: vehicleParams.dampingCoefficient,
    rideHeight: vehicleParams.rideHeight,
    tireRadius: vehicleParams.tireRadius,
    cgHeight: vehicleParams.cgHeight,
    frontBrakeProportion: vehicleParams.frontBrakeProportion,
  };
}
