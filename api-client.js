class AlprApiClient {
    constructor(apiUrl = "http://192.168.137.249:8000/process_frame") {
        this.apiUrl = apiUrl;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    async processFrame(imageElement) {
        try {
            const imageBase64 = this.imageToBase64(imageElement);
            
            const payload = JSON.stringify({
                "image": imageBase64
            });
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: this.headers,
                body: payload,
                timeout: 10000
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                console.error(`API request failed with status code ${response.status}: ${response.statusText}`);
                return null;
            }
                
        } catch (error) {
            console.error(`Error during API request: ${error.message}`);
            return null;
        }
    }
    
    imageToBase64(imageElement) {
        if (imageElement instanceof HTMLCanvasElement) {
            return imageElement.toDataURL('image/jpeg').split(',')[1];
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageElement.width || imageElement.naturalWidth;
        canvas.height = imageElement.height || imageElement.naturalHeight;
        ctx.drawImage(imageElement, 0, 0);
        return canvas.toDataURL('image/jpeg').split(',')[1];
    }
    
    parseResponse(response) {
        try {
            if (!response || !response.success) {
                console.warn("API returned unsuccessful response");
                return [];
            }
            
            const vehicles = response.vehicles || [];
            const result = [];
            
            for (const vehicle of vehicles) {
                const vehicleData = {
                    vehicleType: vehicle.vehicle_type || '',
                    confidence: vehicle.confidence || 0.0,
                    plateText: vehicle.plate_text || '',
                    plateConfidence: vehicle.plate_confidence || 0.0,
                    bbox: vehicle.bbox || [],
                    plateImage: vehicle.plate_image || '',
                    vehicleImage: vehicle.vehicle_image || '',
                    otherObjects: []
                };
                
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
            
            return result;
                
        } catch (error) {
            console.error(`Error parsing API response: ${error.message}`);
            return [];
        }
    }
}