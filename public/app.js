const API_BASE = '/api/sales';
let editingId = null;

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadSales();
    loadStats();
    setupFormHandler();
    setDefaultDate();
});

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('saleDate').value = today;
}

// Load all sales
async function loadSales() {
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();
        displaySales(data.sales);
    } catch (error) {
        console.error('Error loading sales:', error);
        document.getElementById('salesTableBody').innerHTML = 
            '<tr><td colspan="9" class="loading">Error loading sales</td></tr>';
    }
}

// Display sales in table
function displaySales(sales) {
    const tbody = document.getElementById('salesTableBody');
    
    if (!sales || sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No sales found</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${sale.product_name}</td>
            <td>${sale.quantity}</td>
            <td>$${parseFloat(sale.price).toFixed(2)}</td>
            <td>$${parseFloat(sale.total).toFixed(2)}</td>
            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
            <td>${sale.customer_name || '-'}</td>
            <td>${sale.region || '-'}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editSale(${sale.id})">Edit</button>
                <button class="btn-delete" onclick="deleteSale(${sale.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        displayStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display statistics
function displayStats(stats) {
    // Total Sales
    if (stats.totalSales && stats.totalSales[0]) {
        document.getElementById('totalSales').textContent = 
            `$${parseFloat(stats.totalSales[0].total || 0).toFixed(2)}`;
    }
    
    // Total Quantity
    if (stats.totalQuantity && stats.totalQuantity[0]) {
        document.getElementById('totalQuantity').textContent = 
            stats.totalQuantity[0].quantity || 0;
    }
    
    // Sales Count
    if (stats.salesCount && stats.salesCount[0]) {
        document.getElementById('salesCount').textContent = 
            stats.salesCount[0].count || 0;
    }
    
    // Average Sale
    if (stats.avgSale && stats.avgSale[0]) {
        document.getElementById('avgSale').textContent = 
            `$${parseFloat(stats.avgSale[0].average || 0).toFixed(2)}`;
    }
    
    // Region Stats
    if (stats.byRegion && stats.byRegion.length > 0) {
        const regionHTML = stats.byRegion.map(region => `
            <div class="region-item">
                <span>${region.region || 'Unknown'}</span>
                <span>$${parseFloat(region.total).toFixed(2)}</span>
            </div>
        `).join('');
        document.getElementById('regionStats').innerHTML = regionHTML;
    }
    
    // Top Products
    if (stats.topProducts && stats.topProducts.length > 0) {
        const productsHTML = stats.topProducts.map(product => `
            <div class="product-item">
                <span>${product.product_name}</span>
                <span>${product.quantity} units - $${parseFloat(product.revenue).toFixed(2)}</span>
            </div>
        `).join('');
        document.getElementById('topProducts').innerHTML = productsHTML;
    }
}

// Setup form submission handler
function setupFormHandler() {
    const form = document.getElementById('saleForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            product_name: document.getElementById('productName').value,
            quantity: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value),
            sale_date: document.getElementById('saleDate').value,
            customer_name: document.getElementById('customerName').value,
            region: document.getElementById('region').value
        };
        
        try {
            let response;
            if (editingId) {
                response = await fetch(`${API_BASE}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }
            
            if (response.ok) {
                form.reset();
                setDefaultDate();
                editingId = null;
                document.getElementById('cancelEdit').style.display = 'none';
                loadSales();
                loadStats();
                alert(editingId ? 'Sale updated successfully!' : 'Sale added successfully!');
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            console.error('Error saving sale:', error);
            alert('Error saving sale');
        }
    });
    
    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('saleForm').reset();
        setDefaultDate();
        editingId = null;
        document.getElementById('cancelEdit').style.display = 'none';
    });
}

// Edit sale
async function editSale(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const sale = await response.json();
        
        document.getElementById('productName').value = sale.product_name;
        document.getElementById('quantity').value = sale.quantity;
        document.getElementById('price').value = sale.price;
        document.getElementById('saleDate').value = sale.sale_date;
        document.getElementById('customerName').value = sale.customer_name || '';
        document.getElementById('region').value = sale.region || '';
        
        editingId = id;
        document.getElementById('cancelEdit').style.display = 'inline-block';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading sale:', error);
        alert('Error loading sale for editing');
    }
}

// Delete sale
async function deleteSale(id) {
    if (!confirm('Are you sure you want to delete this sale?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadSales();
            loadStats();
            alert('Sale deleted successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale');
    }
}
