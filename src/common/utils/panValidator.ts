export const normalizePan = (panNumber: string) => {
  return panNumber.trim().toUpperCase();
};

export const isValidPan = (panNumber: string) => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizePan(panNumber));
};
