// Import the HTTP module to create an HTTP server
const http = require('http');
// Import the File System (fs) module to read/write files
const fs = require('fs');
// Destructure the 'parse' method from the 'url' module to parse URLs
const { parse } = require('url');

// Define the port number where the server will listen
const PORT = 3000;
// Initialize an empty array to store items
let items = [];

// Load data from JSON file at the start to initialize 'items' array
fs.readFile('./items.json', (err, data) => {
    if (!err) {
        // Parse JSON data if no error occurs
        items = JSON.parse(data);
    }
});

// Create an HTTP server that handles requests
const server = http.createServer((req, res) => {
    // Parse the request URL and method
    const url = parse(req.url, true);
    const method = req.method;
    // Set the response header to indicate the content type is JSON
    const headers = { 'Content-Type': 'application/json' };

    // Handle GET request to retrieve all items
    if (url.pathname === '/items' && method === 'GET') {
        // Respond with the items in JSON format
        res.writeHead(200, headers);
        res.end(JSON.stringify(items));

    // Handle POST request to add a new item
    } else if (url.pathname === '/items' && method === 'POST') {
        let body = '';
        // Collect data chunks and concatenate them into 'body'
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            // Parse the new item from the request body and add it to 'items'
            const newItem = JSON.parse(body);
            items.push(newItem);
            // Save updated items and respond with status 201 (Created)
            saveItems(res, 201, newItem, headers);
        });

    // Handle PUT request to update an existing item by ID
    } else if (url.pathname.startsWith('/items/') && method === 'PUT') {
        const id = url.pathname.split('/')[2]; // Extract item ID from URL
        let body = '';
        // Collect data chunks for the updated item
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const updatedItem = JSON.parse(body); // Parse updated item
            const index = items.findIndex(item => item.id == id); // Find item by ID
            if (index !== -1) {
                // Update item if found and save changes
                items[index] = updatedItem;
                saveItems(res, 200, updatedItem, headers);
            } else {
                // If item not found, respond with 404 (Not Found)
                res.writeHead(404, headers);
                res.end(JSON.stringify({ message: 'Item not found' }));
            }
        });

    // Handle DELETE request to remove an item by ID
    } else if (url.pathname.startsWith('/items/') && method === 'DELETE') {
        const id = url.pathname.split('/')[2]; // Extract item ID from URL
        const index = items.findIndex(item => item.id == id); // Find item by ID
        if (index !== -1) {
            // Remove item from the array and save changes
            const deletedItem = items.splice(index, 1);
            saveItems(res, 200, deletedItem, headers);
        } else {
            // If item not found, respond with 404 (Not Found)
            res.writeHead(404, headers);
            res.end(JSON.stringify({ message: 'Item not found' }));
        }

    // Respond with 404 (Not Found) for any other routes
    } else {
        res.writeHead(404, headers);
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

// Helper function to save the updated 'items' array to 'items.json'
const saveItems = (res, statusCode, data, headers) => {
    fs.writeFile('items.json', JSON.stringify(items), err => {
        if (err) {
            // Respond with 500 (Server Error) if file write fails
            res.writeHead(500, headers);
            res.end(JSON.stringify({ message: 'Server Error' }));
        } else {
            // Respond with the provided status code and data if successful
            res.writeHead(statusCode, headers);
            res.end(JSON.stringify(data));
        }
    });
};

// Start the server and listen on the defined port
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
