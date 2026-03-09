import { useEffect, useRef } from 'react';
import { useDesignStore } from '../stores/designStore';
import { useCalculationStore } from '../stores/calculationStore';

export function useCalculation() {
  const hardpoints = useDesignStore((s) => s.hardpoints);
  const vehicleParams = useDesignStore((s) => s.vehicleParams);
  const fetchAll = useCalculationStore((s) => s.fetchAll);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      fetchAll(hardpoints, vehicleParams);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hardpoints, vehicleParams, fetchAll]);
}
