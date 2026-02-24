const Event = require('../models/event.model');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, event_date, event_time, location } = req.body;
        const created_by = req.userId; // From auth toke

        if (!title || !event_date || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title, date, and description are required.'
            });
        }

        // Handle uploaded images
        const files = req.files;
        let imageUrls = [];
        let primaryImage = '';

        if (files && files.length > 0) {
            imageUrls = files.map(file => {
                // Construct URL: current domain + /uploads/ + filename
                // For simplicity, we store relative path /uploads/filename
                // Frontend can update base URL or backend can return full URL
                // Let's store full URL if possible, but cleaner is relative path
                // But for now let's store /uploads/filename so it's portable
                return `/uploads/${file.filename}`;
            });
            // Determine cover image based on user selection or default to first
            let coverIndex = parseInt(req.body.cover_index) || 0;
            if (coverIndex < 0 || coverIndex >= imageUrls.length) coverIndex = 0;

            primaryImage = imageUrls.length > 0 ? imageUrls[coverIndex] : '';

            // If no file uploaded, check if image_url was sent manually (legacy support)
            if (!primaryImage && req.body.image_url) {
                primaryImage = req.body.image_url;
                imageUrls.push(primaryImage);
            }

            const eventId = await Event.create({
                title,
                description,
                event_date,
                event_time,
                location,
                image_url: primaryImage, // Set primary cover
                created_by,
                image_type: primaryImage ? (primaryImage.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image') : 'image'
            });

            // Add all images to event_images table
            if (imageUrls.length > 0) {
                await Event.addImages(eventId, imageUrls);
            }

            res.status(201).json({
                success: true,
                message: 'Event created successfully!',
                data: { id: eventId, images: imageUrls }
            });

        } else {
            // No files uploaded, but maybe legacy image_url?
            // If no file uploaded, check if image_url was sent manually (legacy support)
            let primaryImage = '';
            let imageUrls = [];
            if (req.body.image_url) {
                primaryImage = req.body.image_url;
                imageUrls.push(primaryImage);
            }

            const eventId = await Event.create({
                title,
                description,
                event_date,
                event_time,
                location,
                image_url: primaryImage, // Set primary cover
                created_by,
                image_type: primaryImage ? (primaryImage.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image') : 'image'
            });

            res.status(201).json({
                success: true,
                message: 'Event created successfully!',
                data: { id: eventId, images: imageUrls }
            });
        }

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
};

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();

        // Process results to format images array
        const formattedEvents = events.map(event => {
            const imageArray = event.all_images ? event.all_images.split(',') : [];
            // Ensure unique if duplicates
            const uniqueImages = [...new Set(imageArray)];

            return {
                ...event,
                images: uniqueImages,
                // Ensure image_url is fully qualified if relative
                image_url: event.image_url ? (event.image_url.startsWith('http') ? event.image_url : `http://localhost:5000${event.image_url}`) : null,
                // Also format the images array with full URLs
                images_full: uniqueImages.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`),
                image_type: event.image_url ? (event.image_url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image') : 'image'
            };
        });

        res.status(200).json({
            success: true,
            data: formattedEvents
        });
    } catch (error) {
        console.error('Get all events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const imageArray = event.all_images ? event.all_images.split(',') : [];
        const uniqueImages = [...new Set(imageArray)];

        const formattedEvent = {
            ...event,
            images: uniqueImages,
            // Ensure image_url is fully qualified if relative
            image_url: event.image_url ? (event.image_url.startsWith('http') ? event.image_url : `http://localhost:5000${event.image_url}`) : null,
            // Also format the images array with full URLs
            images_full: uniqueImages.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`),
            image_type: event.image_url ? (event.image_url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image') : 'image'
        };

        res.status(200).json({
            success: true,
            data: formattedEvent
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
};


// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Event.delete(id);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, event_time, location } = req.body;
        const files = req.files;

        if (!title || !event_date || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title, date, and description are required.'
            });
        }

        let updateData = {
            title,
            description,
            event_date,
            event_time,
            location
        };

        // Handle new uploaded images if any
        if (files && files.length > 0) {
            let imageUrls = files.map(file => `/uploads/${file.filename}`);

            // Determine if cover index refers to a new image
            if (req.body.cover_index !== undefined) {
                const coverIndex = parseInt(req.body.cover_index);
                if (coverIndex >= 0 && coverIndex < imageUrls.length) {
                    updateData.image_url = imageUrls[coverIndex];
                } else {
                    updateData.image_url = imageUrls[0];
                }
            } else {
                updateData.image_url = imageUrls[0];
            }

            // Add all new images to the galleries
            await Event.addImages(id, imageUrls);
        }

        const success = await Event.update(id, updateData);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event updated successfully!',
            // Return new images if any were uploaded
            new_images: files ? files.map(f => `/uploads/${f.filename}`) : []
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
};
