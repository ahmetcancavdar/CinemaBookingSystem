#  CinemaBook — Movie Theater Seat Reservation System

A modern, interactive movie theater seat reservation system built with pure **HTML**, **CSS**, and **JavaScript**. This single-page application features a premium dark-themed cinema UI, role-based access control, dynamic seating grid, and real-time pricing.

---

## Features

- **Three-Panel Layout** — User form (left), seating grid (center), and reservation details (right)
- **Role-Based Access**
  - **User:** Can browse and reserve available seats
  - **Admin:** Can configure the salon (rows & columns) via a dedicated admin panel
- **Age-Based Dynamic Pricing**
  - Children (0–17): $10
  - Students (18–25): $15
  - Adults (26–65): $25
  - Seniors (65+): $10
- **Real-Time Seat Selection** — Click to select/deselect seats with instant visual feedback
- **Form Validation** — Name (letters only), email format, 11-digit phone number, and positive age
- **Blur Overlay** — Center and right panels are locked behind a blur effect until the user logs in
- **Responsive Seat Grid** — Dynamically generated seating layout with row labels (A, B, C, …)
- **Reservation Confirmation** — Detailed summary with total price calculation before purchase
- **User Switching** — Log out and switch to a different user without page reload

---

## Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic page structure |
| **CSS3** | Premium dark-themed styling, animations, glassmorphism effects |
| **JavaScript (Vanilla)** | Application logic, DOM manipulation, state management |
| **Google Fonts (Inter)** | Modern typography |

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- No server, build tools, or dependencies required

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cinema-reservation-system.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd cinema-reservation-system
   ```
3. **Open `index.html` in your browser:**
   ```bash
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

That's it! No installation or compilation needed.

---

## Usage

### As a Regular User

1. Fill in the **User Information** form (name, surname, email, phone, age)
2. Click **Submit** to log in
3. Click on available seats in the seating grid to select them
4. Review your selection and total price on the right panel
5. Click **Confirm Selection** to complete your reservation

### As an Admin

1. Log in with the email: **`admin@admin.com`**
2. The **Admin Interface** will appear above the seating grid
3. Set the desired number of **rows** (1–26) and **columns** (1–20)
4. Click **Set** to reconfigure the salon layout

> **Note:** Reconfiguring the salon resets all existing reservations.

---

## Project Structure

```
cinema-reservation-system/
├── index.html      # Main HTML structure
├── style.css       # All styling (CSS variables, animations, responsive design)
├── script.js       # Application logic (form validation, seat management, state)
└── README.md       # Project documentation
```

---

## Design Highlights

- **Dark Cinema Theme** — Deep navy/midnight background with blue accent gradients
- **Glassmorphism Effects** — Blur overlays for locked panels
- **Micro-Animations** — Hover effects on seats, chip animations, button transitions
- **Movie Screen Element** — 3D perspective-transformed screen element above the seating grid
- **Seat Backrest Design** — CSS `::before` pseudo-elements create a realistic seat shape
- **Color-Coded Seats:**
  - 🟦 Available (hover: blue glow)
  - 🟩 Selected (green gradient)
  - 🟥 Reserved (dark red, non-clickable)

---

## Configuration

The default salon is initialized as a **5×5** grid. Admins can change this at any time:

| Setting | Range | Default |
|---------|-------|---------|
| Rows | 1–26 | 5 |
| Columns | 1–20 | 5 |

---

##  Author

Developed as a homework project for Internet Programming course.

---

> **CinemaBook** © 2026 — Movie Theater Reservation System
