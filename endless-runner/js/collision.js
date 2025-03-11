class Collision {
    /**
     * Check if two objects are colliding using bounding box collision detection
     * @param {Object} obj1 - First object with x, y, width, height properties
     * @param {Object} obj2 - Second object with x, y, width, height properties
     * @returns {boolean} - True if objects are colliding, false otherwise
     */
    static checkCollision(obj1, obj2) {
        try {
            // Ensure objects have required properties
            if (!this.validateObject(obj1) || !this.validateObject(obj2)) {
                console.warn('Invalid objects passed to collision check');
                return false;
            }

            return (
                obj1.x < obj2.x + obj2.width &&
                obj1.x + obj1.width > obj2.x &&
                obj1.y < obj2.y + obj2.height &&
                obj1.y + obj1.height > obj2.y
            );
        } catch (error) {
            console.error('Error in collision detection:', error);
            return false;
        }
    }

    /**
     * Validate if an object has the required properties for collision detection
     * @param {Object} obj - Object to validate
     * @returns {boolean} - True if object is valid, false otherwise
     */
    static validateObject(obj) {
        return (
            obj &&
            typeof obj.x === 'number' &&
            typeof obj.y === 'number' &&
            typeof obj.width === 'number' &&
            typeof obj.height === 'number'
        );
    }

    /**
     * Check if an object is within the game boundaries
     * @param {Object} obj - Object to check
     * @param {number} canvasWidth - Width of the game canvas
     * @param {number} canvasHeight - Height of the game canvas
     * @returns {boolean} - True if object is within boundaries, false otherwise
     */
    static isWithinBounds(obj, canvasWidth, canvasHeight) {
        try {
            if (!this.validateObject(obj)) {
                console.warn('Invalid object passed to boundary check');
                return false;
            }

            return (
                obj.x >= 0 &&
                obj.x + obj.width <= canvasWidth &&
                obj.y >= 0 &&
                obj.y + obj.height <= canvasHeight
            );
        } catch (error) {
            console.error('Error in boundary check:', error);
            return false;
        }
    }

    /**
     * Get the intersection depth between two objects
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {Object} - Intersection depths { x: number, y: number }
     */
    static getIntersectionDepth(obj1, obj2) {
        try {
            if (!this.validateObject(obj1) || !this.validateObject(obj2)) {
                return { x: 0, y: 0 };
            }

            // Calculate the distance between the objects' centers
            const halfWidths = (obj1.width + obj2.width) / 2;
            const halfHeights = (obj1.height + obj2.height) / 2;
            const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
            const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);

            return {
                x: halfWidths - Math.abs(dx),
                y: halfHeights - Math.abs(dy)
            };
        } catch (error) {
            console.error('Error calculating intersection depth:', error);
            return { x: 0, y: 0 };
        }
    }

    /**
     * Check if a point is inside an object
     * @param {number} x - Point x coordinate
     * @param {number} y - Point y coordinate
     * @param {Object} obj - Object to check against
     * @returns {boolean} - True if point is inside object, false otherwise
     */
    static isPointInside(x, y, obj) {
        try {
            if (!this.validateObject(obj)) {
                return false;
            }

            return (
                x >= obj.x &&
                x <= obj.x + obj.width &&
                y >= obj.y &&
                y <= obj.y + obj.height
            );
        } catch (error) {
            console.error('Error in point collision check:', error);
            return false;
        }
    }
}
