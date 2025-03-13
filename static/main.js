document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadEmployees();
    updateDailySummary();

    // Form submissions
    document.getElementById('employeeForm').addEventListener('submit', addEmployee);
    document.getElementById('paymentForm').addEventListener('submit', recordTransaction);

    // Show/hide payment type based on transaction type
    document.getElementById('transactionType').addEventListener('change', function(e) {
        const paymentTypeDiv = document.getElementById('paymentTypeDiv');
        paymentTypeDiv.style.display = e.target.value === 'payment' ? 'block' : 'none';
    });
});

async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        const employees = await response.json();
        updateEmployeeList(employees);
        updateEmployeeSelect(employees);
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Failed to load employees');
    }
}

async function updateDailySummary() {
    try {
        const response = await fetch('/api/daily-totals');
        const data = await response.json();
        
        document.getElementById('totalGross').textContent = data.total_gross.toFixed(2);
        document.getElementById('totalMpesa').textContent = data.total_mpesa.toFixed(2);
        document.getElementById('totalCash').textContent = data.total_cash.toFixed(2);
    } catch (error) {
        console.error('Error updating daily summary:', error);
    }
}

function updateEmployeeList(employees) {
    const tbody = document.getElementById('employeeList');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.daily_rate.toFixed(2)} KES</td>
            <td>${employee.balance.toFixed(2)} KES</td>
        `;
        tbody.appendChild(row);
    });
}

function updateEmployeeSelect(employees) {
    const select = document.getElementById('employeeSelect');
    select.innerHTML = '<option value="">Select Employee</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        select.appendChild(option);
    });
}

async function addEmployee(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('employeeName').value,
        daily_rate: parseFloat(document.getElementById('dailyRate').value)
    };

    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('employeeForm').reset();
            loadEmployees();
        } else {
            alert('Failed to add employee');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Failed to add employee');
    }
}

async function recordTransaction(e) {
    e.preventDefault();
    
    const transactionType = document.getElementById('transactionType').value;
    const data = {
        employee_id: parseInt(document.getElementById('employeeSelect').value),
        amount: parseFloat(document.getElementById('amount').value)
    };

    if (transactionType === 'payment') {
        data.payment_type = document.getElementById('paymentType').value;
        await recordPayment(data);
    } else {
        await recordAdvance(data);
    }
}

async function recordPayment(data) {
    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('paymentForm').reset();
            loadEmployees();
            updateDailySummary();
        } else {
            alert('Failed to record payment');
        }
    } catch (error) {
        console.error('Error recording payment:', error);
        alert('Failed to record payment');
    }
}

async function recordAdvance(data) {
    try {
        const response = await fetch('/api/advances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('paymentForm').reset();
            loadEmployees();
            updateDailySummary();
        } else {
            alert('Failed to record advance');
        }
    } catch (error) {
        console.error('Error recording advance:', error);
        alert('Failed to record advance');
    }
}
