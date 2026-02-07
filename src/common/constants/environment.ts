export const getEnvironment = () => {
  return process.env.NEXT_PUBLIC_ENV || 'development';
};

export const isProdEnvironment = getEnvironment() === 'production';
export const isStagingEnvironment = getEnvironment() === 'staging';
export const isDevEnvironment =
  getEnvironment() === 'development' || !process.env.NEXT_PUBLIC_ENV;
export const isIntegrationEnvironment = getEnvironment() === 'integration';
