const isProduction = false

export const environement = {
    production: false,
    api_url: isProduction ? "https://stock.grg-group.com.tn/api" : "http://localhost:4000/api"
}