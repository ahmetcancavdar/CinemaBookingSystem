/* ===================================
   MOVIE THEATER RESERVATION SYSTEM
   Main Application Logic
   =================================== */

// --- State ---
let currentUser = null;
let salonConfig = null;
let seatMatrix = [];
let currentSelections = [];
let confirmedReservations = []; // Array of { seatId, userId, userName }

// --- DOM Elements ---
const userForm = document.getElementById('userForm');
const nameInput = document.getElementById('nameInput');
const surnameInput = document.getElementById('surnameInput');
const emailInput = document.getElementById('emailInput');
const phoneInput = document.getElementById('phoneInput');
const ageInput = document.getElementById('ageInput');
const submitBtn = document.getElementById('submitBtn');
const currentUserBadge = document.getElementById('currentUserBadge');
const badgeRole = document.getElementById('badgeRole');
const badgeName = document.getElementById('badgeName');
const badgeEmail = document.getElementById('badgeEmail');
const switchUserBtn = document.getElementById('switchUserBtn');

const centerPanel = document.getElementById('centerPanel');
const centerBlurOverlay = document.getElementById('centerBlurOverlay');
const adminInterface = document.getElementById('adminInterface');
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const setBtn = document.getElementById('setBtn');
const seatGrid = document.getElementById('seatGrid');
const movieScreen = document.getElementById('movieScreen');
const seatLegend = document.getElementById('seatLegend');

const rightPanel = document.getElementById('rightPanel');
const rightBlurOverlay = document.getElementById('rightBlurOverlay');
const detailName = document.getElementById('detailName');
const detailRole = document.getElementById('detailRole');
const selectedSeatsList = document.getElementById('selectedSeatsList');
const ticketPriceDisplay = document.getElementById('ticketPriceDisplay');
const seatCountDisplay = document.getElementById('seatCountDisplay');
const totalPriceDisplay = document.getElementById('totalPriceDisplay');
const confirmBtn = document.getElementById('confirmBtn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    initializeDefaultSalon();
    enforcePhoneMaxLength();
});

/**
 * Bind all event listeners
 */
function bindEvents() {
    userForm.addEventListener('submit', handleFormSubmit);
    setBtn.addEventListener('click', handleSetSalon);
    confirmBtn.addEventListener('click', handleConfirmReservation);
    switchUserBtn.addEventListener('click', handleSwitchUser);
}

/**
 * Enforce phone input to accept only digits and max 11 characters
 */
function enforcePhoneMaxLength() {
    phoneInput.setAttribute('maxlength', '11');
    phoneInput.addEventListener('input', function () {
        // Remove non-digit characters
        this.value = this.value.replace(/\D/g, '');
        // Enforce max length
        if (this.value.length > 11) {
            this.value = this.value.slice(0, 11);
        }
    });
}

/**
 * Initialize a default 5x5 salon so users can reserve before admin logs in
 */
function initializeDefaultSalon() {
    salonConfig = { rows: 5, cols: 5 };
    seatMatrix = [];
    for (var r = 0; r < 5; r++) {
        seatMatrix[r] = [];
        for (var c = 0; c < 5; c++) {
            seatMatrix[r][c] = null;
        }
    }
    renderSeatGrid();
}

/**
 * Generate a 5x5 placeholder seat grid for the blurred preview
 */
function generatePlaceholderSeats() {
    seatGrid.innerHTML = '';
    seatGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const rowLetter = String.fromCharCode(65 + r);
            const seatId = rowLetter + (c + 1);
            const seat = document.createElement('div');
            seat.className = 'seat placeholder';
            seat.textContent = seatId;
            seatGrid.appendChild(seat);
        }
    }
}

// ===========================
// FORM HANDLING & VALIDATION
// ===========================

/**
 * Handle form submission: validate inputs and create user
 */
function handleFormSubmit(e) {
    e.preventDefault();
    clearErrors();

    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const ageRaw = ageInput.value.trim();

    let isValid = true;

    // Name validation: required, letters only
    if (!name) {
        showError('nameError', 'Name is required.');
        nameInput.classList.add('input-error');
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
        showError('nameError', 'Name must contain only letters.');
        nameInput.classList.add('input-error');
        isValid = false;
    }

    // Surname validation: required, letters only
    if (!surname) {
        showError('surnameError', 'Surname is required.');
        surnameInput.classList.add('input-error');
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(surname)) {
        showError('surnameError', 'Surname must contain only letters.');
        surnameInput.classList.add('input-error');
        isValid = false;
    }

    // Email validation
    if (!email) {
        showError('emailError', 'Email is required.');
        emailInput.classList.add('input-error');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address.');
        emailInput.classList.add('input-error');
        isValid = false;
    }

    // Phone validation: must be exactly 11 digits
    if (!phone) {
        showError('phoneError', 'Phone number is required.');
        phoneInput.classList.add('input-error');
        isValid = false;
    } else if (!/^\d{11}$/.test(phone)) {
        showError('phoneError', 'Phone must be exactly 11 digits.');
        phoneInput.classList.add('input-error');
        isValid = false;
    }

    // Age validation: positive integer > 0
    if (!ageRaw) {
        showError('ageError', 'Age is required.');
        ageInput.classList.add('input-error');
        isValid = false;
    } else {
        const age = parseInt(ageRaw, 10);
        if (isNaN(age) || age < 1 || !Number.isInteger(Number(ageRaw))) {
            showError('ageError', 'Age must be a positive integer.');
            ageInput.classList.add('input-error');
            isValid = false;
        }
    }

    if (!isValid) return;

    // Create user object
    const age = parseInt(ageRaw, 10);
    const role = email.toLowerCase() === 'admin@admin.com' ? 'admin' : 'user';
    const ticketPrice = calculateTicketPrice(age);

    currentUser = {
        name: name,
        surname: surname,
        email: email,
        phone: phone,
        age: age,
        role: role,
        ticketPrice: ticketPrice,
        id: Date.now() // Simple unique ID
    };

    // Clear current selections for the new user
    currentSelections = [];

    // Update UI
    activateUserSession();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Calculate ticket price based on age
 */
function calculateTicketPrice(age) {
    if (age >= 0 && age < 18) return 10;
    if (age >= 18 && age <= 25) return 15;
    if (age >= 26 && age <= 65) return 25;
    if (age > 65) return 10;
    return 0;
}

/**
 * Show an error message for a specific field
 */
function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

/**
 * Clear all error messages and input error styles
 */
function clearErrors() {
    const errorMsgs = document.querySelectorAll('.error-msg');
    errorMsgs.forEach(function (el) {
        el.textContent = '';
    });
    const inputs = userForm.querySelectorAll('input');
    inputs.forEach(function (input) {
        input.classList.remove('input-error');
    });
}

// ===========================
// USER SESSION
// ===========================

/**
 * Activate the user session after successful login
 */
function activateUserSession() {
    // Hide form, show badge
    userForm.style.display = 'none';
    currentUserBadge.style.display = 'block';

    // Set badge info
    badgeName.textContent = currentUser.name + ' ' + currentUser.surname;
    badgeEmail.textContent = currentUser.email;
    badgeRole.textContent = currentUser.role;
    if (currentUser.role === 'admin') {
        badgeRole.classList.add('admin-role');
    } else {
        badgeRole.classList.remove('admin-role');
    }

    // Unlock panels (remove blur)
    centerBlurOverlay.classList.add('hidden');
    rightBlurOverlay.classList.add('hidden');

    // Show/hide admin interface
    if (currentUser.role === 'admin') {
        adminInterface.style.display = 'block';
    } else {
        adminInterface.style.display = 'none';
    }

    // If salon is already configured, render the actual seats
    if (salonConfig) {
        renderSeatGrid();
    }

    // Update right panel
    updateReservationPanel();
}

/**
 * Switch to a different user
 */
function handleSwitchUser() {
    // Deselect any current selections (don't confirm them)
    currentSelections = [];
    currentUser = null;

    // Show form, hide badge
    userForm.style.display = 'block';
    currentUserBadge.style.display = 'none';
    userForm.reset();

    // Re-blur panels
    centerBlurOverlay.classList.remove('hidden');
    rightBlurOverlay.classList.remove('hidden');

    // Hide admin interface
    adminInterface.style.display = 'none';

    // Re-render seats if salon exists (to clear selection styling)
    if (salonConfig) {
        renderSeatGrid();
    }

    // Reset right panel
    resetReservationPanel();
}

// ===========================
// SALON CONFIGURATION (ADMIN)
// ===========================

/**
 * Handle the "Set" button click from admin interface
 */
function handleSetSalon() {
    const rows = parseInt(rowsInput.value, 10);
    const cols = parseInt(colsInput.value, 10);

    if (isNaN(rows) || rows < 1 || rows > 26) {
        alert('Number of rows must be between 1 and 26.');
        return;
    }
    if (isNaN(cols) || cols < 1 || cols > 20) {
        alert('Number of columns must be between 1 and 20.');
        return;
    }

    // Reset everything
    salonConfig = { rows: rows, cols: cols };
    seatMatrix = [];
    confirmedReservations = [];
    currentSelections = [];

    // Initialize seat matrix (all empty)
    for (let r = 0; r < rows; r++) {
        seatMatrix[r] = [];
        for (let c = 0; c < cols; c++) {
            seatMatrix[r][c] = null; // null = empty
        }
    }

    renderSeatGrid();
    updateReservationPanel();
}

// ===========================
// SEAT GRID RENDERING
// ===========================

/**
 * Render the seat grid based on salonConfig and seatMatrix
 */
function renderSeatGrid() {
    if (!salonConfig) return;

    seatGrid.innerHTML = '';
    seatGrid.style.gridTemplateColumns = 'repeat(' + salonConfig.cols + ', 1fr)';

    for (let r = 0; r < salonConfig.rows; r++) {
        for (let c = 0; c < salonConfig.cols; c++) {
            const rowLetter = String.fromCharCode(65 + r);
            const seatId = rowLetter + (c + 1);
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.dataset.row = r;
            seat.dataset.col = c;
            seat.dataset.seatId = seatId;

            // Determine seat state
            const reservation = seatMatrix[r][c];
            const isSelectedByCurrent = currentSelections.indexOf(seatId) !== -1;

            if (reservation) {
                // Reserved by someone (confirmed)
                if (currentUser && reservation.userId === currentUser.id) {
                    // Reserved by current user (confirmed)
                    seat.classList.add('reserved');
                    seat.title = 'Reserved by you';
                } else {
                    // Reserved by another user
                    seat.classList.add('reserved');
                }
            } else if (isSelectedByCurrent) {
                // Selected by current user (not yet confirmed)
                seat.classList.add('selected');
            } else {
                // Available
                seat.classList.add('available');
            }

            // Seat label
            seat.textContent = seatId;

            // Tooltip
            if (currentUser) {
                const tooltip = document.createElement('div');
                tooltip.className = 'seat-tooltip';
                if (reservation) {
                    tooltip.textContent = seatId + ' — Reserved';
                } else {
                    tooltip.textContent = seatId + ' — $' + currentUser.ticketPrice;
                }
                seat.appendChild(tooltip);
            }

            // Click handler
            if (!reservation && currentUser) {
                seat.addEventListener('click', function () {
                    handleSeatClick(seatId);
                });
            }

            seatGrid.appendChild(seat);
        }
    }
}

// ===========================
// SEAT SELECTION
// ===========================

/**
 * Handle clicking on a seat
 */
function handleSeatClick(seatId) {
    if (!currentUser) return;

    const index = currentSelections.indexOf(seatId);
    if (index !== -1) {
        // Deselect
        currentSelections.splice(index, 1);
    } else {
        // Select
        currentSelections.push(seatId);
    }

    renderSeatGrid();
    updateReservationPanel();
}

// ===========================
// RESERVATION PANEL (RIGHT)
// ===========================

/**
 * Update the right panel with current user info and selections
 */
function updateReservationPanel() {
    if (!currentUser) {
        resetReservationPanel();
        return;
    }

    // User info
    detailName.textContent = currentUser.name + ' ' + currentUser.surname;
    detailRole.textContent = currentUser.role;
    if (currentUser.role === 'admin') {
        detailRole.classList.add('admin-tag');
    } else {
        detailRole.classList.remove('admin-tag');
    }

    // Ticket price
    ticketPriceDisplay.textContent = '$' + currentUser.ticketPrice;

    // Selected seats
    selectedSeatsList.innerHTML = '';
    if (currentSelections.length === 0) {
        selectedSeatsList.innerHTML = '<p class="no-seats-msg">No seats selected yet</p>';
    } else {
        // Sort selections for display
        const sorted = currentSelections.slice().sort();
        sorted.forEach(function (seatId) {
            const chip = document.createElement('span');
            chip.className = 'seat-chip';
            chip.textContent = '💺 ' + seatId;
            selectedSeatsList.appendChild(chip);
        });
    }

    // Totals
    seatCountDisplay.textContent = currentSelections.length;
    totalPriceDisplay.textContent = '$' + (currentSelections.length * currentUser.ticketPrice);

    // Enable/disable confirm button
    confirmBtn.disabled = currentSelections.length === 0;
}

/**
 * Reset the right panel to default state
 */
function resetReservationPanel() {
    detailName.textContent = '-';
    detailRole.textContent = '-';
    detailRole.classList.remove('admin-tag');
    selectedSeatsList.innerHTML = '<p class="no-seats-msg">No seats selected yet</p>';
    ticketPriceDisplay.textContent = '$0';
    seatCountDisplay.textContent = '0';
    totalPriceDisplay.textContent = '$0';
    confirmBtn.disabled = true;
}

// ===========================
// CONFIRM RESERVATION
// ===========================

/**
 * Handle the confirm reservation button click
 */
function handleConfirmReservation() {
    if (!currentUser || currentSelections.length === 0) return;

    const total = currentSelections.length * currentUser.ticketPrice;
    const sortedSeats = currentSelections.slice().sort();

    // Build confirm message
    let message = 'Dear ' + currentUser.name + ' ' + currentUser.surname + '\n';
    sortedSeats.forEach(function (seatId) {
        message += seatId + '\n';
    });
    message += 'Total amount is $' + total + '\n';
    message += 'Would you like to complete your purchase?';

    const confirmed = confirm(message);

    if (confirmed) {
        // Mark seats as permanently reserved in the matrix
        currentSelections.forEach(function (seatId) {
            const row = seatId.charCodeAt(0) - 65;
            const col = parseInt(seatId.substring(1), 10) - 1;
            seatMatrix[row][col] = {
                userId: currentUser.id,
                userName: currentUser.name + ' ' + currentUser.surname
            };
        });

        // Store the confirmed reservation
        confirmedReservations.push({
            user: currentUser.name + ' ' + currentUser.surname,
            seats: sortedSeats.slice(),
            total: total
        });

        // Clear current selections
        currentSelections = [];

        // Re-render
        renderSeatGrid();
        updateReservationPanel();
    }
}
