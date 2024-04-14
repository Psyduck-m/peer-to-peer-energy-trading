const fs = require('fs');

function energyTrading(jsonFile) {
    // Load data from JSON file
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    // Prices at which the prosumers sell energy
    const prosumerPrices = {"P1": 7, "P2": 7.5, "P3": 8};

    // Initialize variables to store trading information
    const trades = [];
    const tradeMessages = {}; // Object to store trade messages for each hour

    // Loop through each hour
    for (let hour = 0; hour < 24; hour++) {
        // Find the prosumer or consumer with the most negative energy (the buyer)
        const buyer = Object.keys(data).reduce((a, b) => data[a][hour] < data[b][hour] ? a : b);

        // If the buyer is a consumer (negative energy), skip this hour
        if (data[buyer][hour] >= 0) {
            tradeMessages[hour] = `No trade at hour ${hour}`;
            continue;
        }

        // Find sellers with enough surplus energy to fulfill the buyer's need
        const sellers = Object.keys(data).filter(prosumer => data[prosumer][hour] >= Math.abs(data[buyer][hour]));

        if (sellers.length === 0) {
            // No sellers available for this hour
            tradeMessages[hour] = `No trade at hour ${hour}`;
            continue;
        }

        // Find the seller with the lowest price
        const seller = sellers.reduce((a, b) => prosumerPrices[a] < prosumerPrices[b] ? a : b);

        // Calculate the price of energy and trade
        const price = prosumerPrices[seller];
        const energySold = Math.abs(data[buyer][hour]);
        const trade = {"hour": hour, "buyer": buyer, "seller": seller, "price": price, "energy_sold": energySold};
        trades.push(trade);

        // Update energy data after trade
        data[buyer][hour] += energySold;
        data[seller][hour] -= energySold;

        tradeMessages[hour] = `At hour ${hour}: ${seller} sold ${energySold} energy to ${buyer} at a price of $${price} per unit.`;
    }

    // Print the trade messages in order
    for (let hour = 0; hour < 24; hour++) {
        console.log(tradeMessages[hour] || `No trade at hour ${hour}`);
    }

    return trades;
}

// Example usage
const trades = energyTrading("surplus_data.json");
