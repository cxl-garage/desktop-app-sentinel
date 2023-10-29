const getHumanFriendlyErrorMessage = (originalError: string): string => {
  if (originalError.includes('HTTP code 500')) {
    return 'Failed to detect docker desktop. Please ensure that docker desktop is installed and running and restart the Sentinel app.';
  }
  return originalError;
};

export default getHumanFriendlyErrorMessage;
