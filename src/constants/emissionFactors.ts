// ============================================
// Emission Factors — Constants
// Source: PRD §9, TRD §6.1
// 12 entries across 4 categories
// ============================================

import type { EmissionFactorsMap } from '../types';

export const EMISSION_FACTORS: EmissionFactorsMap = {
  Transport: [
    { id: 'car_petrol',    label: 'Car – Petrol',       hpChange: -6,  maxInput: 500, inputUnit: 'km' },
    { id: 'car_electric',  label: 'Car – Electric',     hpChange: -2,  maxInput: 500, inputUnit: 'km' },
    { id: 'bus',           label: 'Bus',                hpChange: -3,  maxInput: 500, inputUnit: 'km' },
    { id: 'flight',        label: 'Flight',             hpChange: -25, maxInput: 500, inputUnit: 'km' },
  ],
  Food: [
    { id: 'beef_meal',     label: 'Beef Meal',          hpChange: -8,  maxInput: null, inputUnit: null },
    { id: 'vegan_meal',    label: 'Vegan Meal',         hpChange: -1,  maxInput: null, inputUnit: null },
  ],
  Energy: [
    { id: 'ac_hour',       label: 'AC – 1 Hour',       hpChange: -5,  maxInput: null, inputUnit: null },
    { id: 'lights_off',    label: 'Lights Off – 1 Hour', hpChange: +2, maxInput: null, inputUnit: null },
  ],
  Offset: [
    { id: 'tree_planted',  label: 'Tree Planted',       hpChange: +15, maxInput: null, inputUnit: null },
    { id: 'recycled',      label: 'Recycled Waste',     hpChange: +5,  maxInput: null, inputUnit: null },
    { id: 'public_transit',label: 'Used Public Transit', hpChange: +3,  maxInput: null, inputUnit: null },
    { id: 'bike_walk',     label: 'Biked / Walked',     hpChange: +4,  maxInput: 500, inputUnit: 'km' },
  ],
};

// Category display metadata
export const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  Transport: { emoji: '🚗', label: 'TRANSPORT' },
  Food:      { emoji: '🥗', label: 'FOOD' },
  Energy:    { emoji: '⚡', label: 'ENERGY' },
  Offset:    { emoji: '🌿', label: 'OFFSET' },
};
