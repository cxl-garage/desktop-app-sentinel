const getHumanFriendlyErrorMessage = (originalError: string): string => {
  if (originalError.includes('HTTP code 500')) {
    return 'Failed to detect Docker Desktop. Please ensure that Docker Desktop is installed and running. If it is, please restart the Sentinel app.';
  }
  return originalError;
};

export default getHumanFriendlyErrorMessage;
