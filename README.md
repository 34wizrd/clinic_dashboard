# Clinic Dashboard

A modern, modular clinic management dashboard built with React, TypeScript, and Vite. This application provides tools for managing appointments, doctors, patients, facilities, and prescriptions, with a clean UI and robust state management.

## Features
- Appointment scheduling and calendar
- Doctor, patient, facility, and prescription management
- Authentication and OTP verification
- Responsive design and sidebar navigation
- Modular component architecture
- State management with Redux Toolkit

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd clinic-dashboard
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```

## Usage
- Access the dashboard at `http://localhost:5173` (default Vite port).
- Log in to access protected routes and features.
- Use the sidebar to navigate between appointments, doctors, patients, facilities, and prescriptions.

## Project Structure
```
clinic-dashboard/
├── public/                # Static assets
├── src/
│   ├── api/               # API client
│   ├── assets/            # Images and icons
│   ├── components/        # UI and layout components
│   ├── features/          # Domain features (appointments, doctors, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   ├── router/            # Routing logic
│   ├── store/             # Redux store
│   └── utils/             # Utility functions
├── package.json           # Project metadata and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # Project documentation
```

## Technologies Used
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router](https://reactrouter.com/)

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.

