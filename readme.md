const http = require('http');
const fs = require('fs');
const { parse } = require('url');

const PORT = 3000;
let items = [];

// Load data from JSON file at the start
fs.readFile('./items.json', (err, data) => {
    if (!err) {
        items = JSON.parse(data);
    }
});





const server = http.createServer((req, res) => {
    const url = parse(req.url, true);
    const method = req.method;
    const headers = { 'Content-Type': 'application/json' };

    if (url.pathname === '/items' && method === 'GET') {
        // Retrieve all items
        res.writeHead(200, headers);
        res.end(JSON.stringify(items));
    } else if (url.pathname === '/items' && method === 'POST') {
        // Add new item
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const newItem = JSON.parse(body);
            items.push(newItem);
            saveItems(res, 201, newItem, headers);
        });
    } else if (url.pathname.startsWith('/items/') && method === 'PUT') {
        // Update an item by ID
        const id = url.pathname.split('/')[2];
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const updatedItem = JSON.parse(body);
            const index = items.findIndex(item => item.id == id);
            if (index !== -1) {
                items[index] = updatedItem;
                saveItems(res, 200, updatedItem, headers);
            } else {
                res.writeHead(404, headers);
                res.end(JSON.stringify({ message: 'Item not found' }));
            }
        });
    } else if (url.pathname.startsWith('/items/') && method === 'DELETE') {
        // Delete an item by ID
        const id = url.pathname.split('/')[2];
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            const deletedItem = items.splice(index, 1);
            saveItems(res, 200, deletedItem, headers);
        } else {
            res.writeHead(404, headers);
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else {
        res.writeHead(404, headers);
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

const saveItems = (res, statusCode, data, headers) => {
    fs.writeFile('items.json', JSON.stringify(items), err => {
        if (err) {
            res.writeHead(500, headers);
            res.end(JSON.stringify({ message: 'Server Error' }));
        } else {
            res.writeHead(statusCode, headers);
            res.end(JSON.stringify(data));
        }
    });
};

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
