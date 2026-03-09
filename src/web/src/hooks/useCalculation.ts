import { useEffect, useRef } from 'react';
import { useDesignStore } from '../stores/designStore';
import { useCalculationStore } from '../stores/calculationStore';

export function useCalculation() {
  const hardpoints = useDesignStore((s) => s.hardpoints);
  const vehicleParams = useDesignStore((s) => s.vehicleParams);
  const { fetchGeometry, fetchCamberCurve, fetchDynamics, fetchRollCenter } =
    useCalculationStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      await Promise.all([
        fetchGeometry(hardpoints),
        fetchCamberCurve(hardpoints),
        fetchDynamics(hardpoints, vehicleParams),
        fetchRollCenter(hardpoints, vehicleParams),
      ]);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hardpoints, vehicleParams, fetchGeometry, fetchCamberCurve, fetchDynamics, fetchRollCenter]);
}
