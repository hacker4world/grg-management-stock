const isProduction = true;

export const environement = {
  api_url: isProduction
    ? 'https://stock.grg-group.com.tn/api'
    : 'http://localhost:4000/api',
};
