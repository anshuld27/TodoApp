# ToDo Application - Full Stack Solution

A **full-featured task management system** with a React/TypeScript frontend and a C#/.NET backend. Users can create, manage, and track tasks with deadlines, advanced filtering, and pagination features.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Setup and Running](#setup-and-running)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Structure

```
TodoApp/
├── TodoApi/                  # C# Backend (ASP.NET Core)
│   ├── Controllers/          # API controllers
│   ├── Data/                 # Database context
│   ├── Interfaces/           # Service interfaces
│   ├── Migrations/           # Database migrations
│   ├── Models/               # Data models
│   ├── Services/             # Business logic
│   ├── appsettings.json      # Configuration
│   └── Program.cs            # Startup configuration
│
├── TodoApi.Tests/            # Unit tests for TodoApi
│   ├── Controllers/          # Tests for controllers
│   ├── Services/             # Tests for services
│   └── TodoApi.Tests.csproj  # Test project file
|
├── todo-frontend/            # React Frontend
│   ├── public/               # Static assets
│   └── src/                  # Application source
│       ├── components/       # UI components
│       ├── services/         # API services
│       ├── types/            # Type definitions
│       └── App.tsx           # Main application
|
├── TodoApp.sln               # Solution file 
└── README.md                 # Project documentation
```

---

## Key Features

- **Task Management**
  - Create tasks (title min. 10 chars)
  - Set deadlines
  - Mark complete / delete tasks
  - **Quick Edit**:
    - **Double-click** on the existing task **title** to edit it.
    - **Double-click** on the **date** field to edit the deadline. If the date does not exist, double-click the date area (where a '**-**' dash symbol is shown) to add one.
- **Filtering**
  - All / Active / Completed tasks
- **Visual Indicators**
  - Overdue: red highlight
  - Completed: strikethrough
  - Active count display
- **Pagination**
  - Navigate pages
  - Select items per page (5/10/20/50)
  - Current range display
- **Responsive Design**
  - Works on desktop & mobile

---

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Axios (HTTP)
- CSS Modules

**Backend:**
- ASP.NET Core 9
- Entity Framework Core
- SQL Server / SQL Express
- xUnit (testing)

**Development Tools:**
- Visual Studio / VS Code
- SQL Server Management Studio
- Postman (API testing)

---

## Prerequisites

### Backend
- .NET 9 SDK
- SQL Server or SQL Server Express
- Entity Framework Core Tools

### Frontend
- Node.js 16+
- npm 8+ or Yarn

---

## Setup and Running

### 1. Clone the Repository

```bash
git clone https://github.com/anshuld27/TodoApp.git
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd TodoApi

# Restore dependencies
dotnet restore

# Create and apply database migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the API (default port: 5000)
dotnet run
```
> The API will be available at: `https://localhost:5000/api/todos`

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd todo-frontend

# Install dependencies
npm install

# Start the development server (default port: 3000)
npm start
```
> The app will open in your browser at: [http://localhost:3000](http://localhost:3000)

---

## Testing

### Backend Tests

```bash
# Navigate to frontend directory
cd TodoApi.Tests

# Run the tests
dotnet test
```
**Covers:**
- Todo create/update/delete
- Validation (min 10 chars)
- Pagination/filtering
- Error handling

### Frontend Tests

```bash
# Navigate to frontend directory
cd todo-frontend

# Run the tests
npm test
```
**Covers:**
- Component rendering
- User interactions (add/edit/delete)
- Filtering & pagination
- Form validation
- Error handling

---

## API Endpoints

| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| GET    | /api/todos           | Get paginated todo items       |
| POST   | /api/todos           | Create new todo item           |
| PUT    | /api/todos/{id}      | Update existing todo item      |
| DELETE | /api/todos/{id}      | Delete todo item               |

#### Request/Response Examples

**Create Todo (POST /api/todos)**
```json
{
  "title": "Learn React with TypeScript",
  "deadline": "2023-12-31",
  "isCompleted": false
}
```

**Get Todos (GET /api/todos?page=2&size=10&filter=active)**
```json
{
  "pageNumber": 2,
  "pageSize": 10,
  "totalCount": 45,
  "totalPages": 5,
  "activeCount": 30,
  "items": [
    {
      "id": 11,
      "title": "Learn React with TypeScript",
      "deadline": "2023-12-31T00:00:00",
      "isCompleted": false
    }
  ]
}
```

---

## Deployment Notes

### Backend

- Build for production:
  ```bash
  dotnet publish -c Release -o ./publish
  ```
- Configure connection string in `appsettings.json`
- Set environment to `Production`

### Frontend

- Create production build:
  ```bash
  npm run build
  ```
- Deploy `build` folder to any static hosting service
- Update API URL in `src/services/todoService.ts` if needed

---

## Troubleshooting

**Database Issues**
- Ensure SQL Server is running
- Check connection string in `appsettings.json`
- Run `dotnet ef database update` if migrations are missing

**Frontend/Backend Connection**
- Make sure both servers are running
- Check CORS settings in `Program.cs`
- Verify API URL in `src/services/todoService.ts`

**Test Failures**
- Run `npm install` to resolve dependencies
- Clear Jest cache: `npm test -- --clearCache`
- Ensure backend is running for integration tests

---

## License

This project is licensed under the MIT License.