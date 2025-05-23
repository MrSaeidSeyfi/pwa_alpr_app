class AlprApiClient {
    constructor(apiUrl = "http://193.151.147.18:8000/api/process_frame_cmp") {
        this.apiUrl = apiUrl;
    }

    async processFrame(imageElement) {
        try {
            const imageBase64 = this.imageToBase64(imageElement);
            
            // Simple fetch request matching the working example
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageBase64 })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                return data;
            } else {
                console.error(`API request failed with status code ${response.status}: ${response.statusText}`);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                return null;
            }
                
        } catch (error) {
            console.error(`Error during API request: ${error.message}`);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('Network error - check if the server is running and the endpoint is correct');
            }
            return null;
        }
    }
    
    imageToBase64(imageElement) {
        if (imageElement instanceof HTMLCanvasElement) {
            return imageElement.toDataURL('image/jpeg', 0.8).split(',')[1];
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageElement.width || imageElement.naturalWidth;
        canvas.height = imageElement.height || imageElement.naturalHeight;
        ctx.drawImage(imageElement, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    }
    
    parseResponse(response) {
        try {
            // Handle the response format from your server
            if (!response) {
                console.warn("API returned null response");
                return [];
            }
            
            // Check if the response has a success field
            if (response.hasOwnProperty('success') && !response.success) {
                console.warn("API returned unsuccessful response:", response);
                return [];
            }
            
            // Handle vehicles array from response
            const vehicles = response.vehicles || [];
            const result = [];
            
            for (const vehicle of vehicles) {
                const vehicleData = {
                    vehicleType: vehicle.vehicle_type || 'Unknown',
                    confidence: vehicle.confidence || 0.0,
                    plateText: vehicle.plate_text || '',
                    plateConfidence: vehicle.plate_confidence || 0.0,
                    bbox: vehicle.bbox || [],
                    plateImage: vehicle.plate_image || '',
                    vehicleImage: vehicle.vehicle_image || '',
                    otherObjects: [],
                    vhfResults: vehicle.vhf_results || null
                };
                
                // Handle other objects if they exist
                for (const obj of (vehicle.other_objects || [])) {
                    const objectData = {
                        label: obj.label || '',
                        confidence: obj.confidence || 0.0,
                        bbox: obj.bbox || []
                    };
                    vehicleData.otherObjects.push(objectData);
                }
                
                result.push(vehicleData);
            }
            
            console.log(`Parsed ${result.length} vehicles from API response`);
            return result;
                
        } catch (error) {
            console.error(`Error parsing API response: ${error.message}`, response);
            return [];
        }
    }
}