let recommendedCrop = ""; // Store the predicted crop globally
let soilData = null; // Store the soil data globally to reuse for fertilizer prediction

// Handle crop recommendation and save soil data
async function getCropRecommendation() {
    soilData = getSoilInputData(); // Store soil data for later use
    
    try {
        const response = await fetch('/api/soil-input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(soilData)
        });
        const result = await response.json();

        if (response.ok) {
            recommendedCrop = result.crop;
            document.getElementById('crop-result').innerText = `Recommended Crop: ${recommendedCrop}`;
            
            // Enable the fertilizer button after crop prediction
            const fertilizerBtn = document.getElementById('fertilizer-recommend-btn');
            fertilizerBtn.disabled = false;
            fertilizerBtn.setAttribute('data-crop', recommendedCrop);

            // Optionally display any alerts
            if (result.alert) {
                alert(result.alert);
            }

            renderChart(soilData);
        } else {
            alert(`Crop recommendation failed: ${result.error}`);
            recommendedCrop = "";
            soilData = null;
            document.getElementById('fertilizer-recommend-btn').disabled = true;
        }
    } catch (error) {
        console.error('Error fetching crop recommendation:', error);
        alert('An error occurred while fetching crop recommendation.');
    }
}

// Handle fertilizer recommendation and save it
async function getFertilizerRecommendation() {
    if (!recommendedCrop || !soilData) {
        alert("Please get a crop recommendation first.");
        return;
    }

    try {
        const response = await fetch('/api/fertilizer-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...soilData, crop: recommendedCrop })
        });
        const result = await response.json();

        if (response.ok) {
            document.getElementById('fertilizer-result').innerText = `Recommended Fertilizer: ${result.fertilizer}`;

            // Save the fertilizer recommendation to the database
            await saveFertilizerRecommendation(recommendedCrop, result.fertilizer);
        } else {
            alert(`Fertilizer recommendation failed: ${result.error}`);
        }
    } catch (error) {
        console.error('Error fetching fertilizer recommendation:', error);
        alert('An error occurred while fetching fertilizer recommendation.');
    }
}

// Save fertilizer recommendation to the database
async function saveFertilizerRecommendation(crop, fertilizer) {
    try {
        const response = await fetch('/api/save-fertilizer-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ crop, fertilizer })
        });
        const result = await response.json();

        if (!response.ok) {
            console.error('Failed to save fertilizer recommendation:', result.error);
        }
    } catch (error) {
        console.error('Error saving fertilizer recommendation:', error);
    }
}

// Get soil input data
function getSoilInputData() {
    return {
        nitrogen: parseFloat(document.getElementById('nitrogen').value) || 0,
        phosphorus: parseFloat(document.getElementById('phosphorus').value) || 0,
        potassium: parseFloat(document.getElementById('potassium').value) || 0,
        temperature: parseFloat(document.getElementById('temperature').value) || 0,
        humidity: parseFloat(document.getElementById('humidity').value) || 0,
        ph: parseFloat(document.getElementById('ph').value) || 0,
        rainfall: parseFloat(document.getElementById('rainfall').value) || 0,
        moisture: parseFloat(document.getElementById('moisture').value) || 0,
        soil_type: document.getElementById('soil_type').value || ""
    };
}

// Render soil nutrients chart
function renderChart(soilData) {
    const canvas = document.getElementById('nutrientChart');
    if (!canvas) {
        console.error('Chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for chart canvas');
        return;
    }

    // Destroy existing chart only if it exists
    if (window.nutrientChart && typeof window.nutrientChart.destroy === 'function') {
        window.nutrientChart.destroy();
    }

    window.nutrientChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
            datasets: [{
                label: 'Nutrient Levels (mg/kg)',
                data: [soilData.nitrogen, soilData.phosphorus, soilData.potassium],
                backgroundColor: 'rgba(66, 165, 81, 0.7)',
                borderColor: 'rgba(46, 125, 50, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            width: 400,
            height: 200
        }
    });
    // Update chart colors based on current theme
    updateChartColors();
}

// Ensure DOM elements are loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    const cropButton = document.getElementById("crop-recommend-btn");
    const fertilizerButton = document.getElementById("fertilizer-recommend-btn");

    if (cropButton) {
        cropButton.addEventListener("click", getCropRecommendation);
    } else {
        console.error("Crop Recommendation button not found.");
    }

    if (fertilizerButton) {
        fertilizerButton.addEventListener("click", getFertilizerRecommendation);
    } else {
        console.error("Fertilizer Recommendation button not found.");
    }
});