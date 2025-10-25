// fillMissingDates.js
const fs = require("fs");
const records = require("[path to your data file]"); 

// Ensure sorted by date
records.sort((a, b) => a.date - b.date);

// Helper: format to YYYY-MM-DD
const formatDate = (d) => d.toISOString().split("T")[0];

// Create map for quick lookups
const recordMap = new Map(records.map(r => [formatDate(r.date), r]));

// Determine full date range
const startDate = new Date(records[0].date);
const endDate = new Date(records[records.length - 1].date);

// Linear interpolation
const interpolate = (y1, y2, fraction) => y1 + (y2 - y1) * fraction;

// Add light random noise (default ±3%)
const addNoise = (value, percent = 0.03) => {
    const factor = 1 + (Math.random() * 2 - 1) * percent; // 0.97–1.03
    return value * factor;
};

const filledRecords = [];
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);

    if (recordMap.has(dateStr)) {
        // Known day
        filledRecords.push(recordMap.get(dateStr));
    } else {
        // Missing day — fill
        const prev = records.filter(r => r.date < currentDate).slice(-1)[0];
        const next = records.find(r => r.date > currentDate);

        let water_height;
        if (prev && next) {
            const totalDays = (next.date - prev.date) / (1000 * 60 * 60 * 24);
            const daysFromPrev = (currentDate - prev.date) / (1000 * 60 * 60 * 24);
            const fraction = daysFromPrev / totalDays;
            water_height = interpolate(prev.water_height, next.water_height, fraction);
        } else if (prev) {
            water_height = prev.water_height;
        } else if (next) {
            water_height = next.water_height;
        } else {
            water_height = 0;
        }

        water_height = addNoise(water_height);

        filledRecords.push({
            date: new Date(currentDate),
            water_height: parseFloat(water_height.toFixed(2)),
            catch: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Increment by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
}

// Sort one last time (just in case)
filledRecords.sort((a, b) => a.date - b.date);

// Write back as JS file
const output = `module.exports = ${JSON.stringify(filledRecords, null, 2)};`;

fs.writeFileSync("filledRecords.js", output);

console.log(`✅ Filled dataset written to filledRecords.js with ${filledRecords.length} daily records.`);
