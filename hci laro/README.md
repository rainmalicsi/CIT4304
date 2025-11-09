# Weekly - Project Management Platform

A responsive, web-based collaborative productivity and project management platform designed for teams composed of Team Leaders and Team Members.

## Features

- **Role-Based Access Control**: Separate interfaces for Team Leaders and Team Members
- **Project Management**: Create, edit, and manage projects with team assignments
- **Task Management**: Comprehensive task tracking with priorities and status
- **Dashboard**: Overview with statistics and charts
- **Calendar View**: Visual scheduling of tasks and deadlines
- **Gantt Chart**: Interactive timeline visualization using DHTMLX Gantt
- **Team Management**: Add and manage team members (Leader only)
- **My Tasks & Progress**: Personal task management and progress tracking for members
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Recharts (for charts)
- DHTMLX Gantt
- Axios
- Heroicons

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- bcryptjs
- express-validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "hci laro"
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   Or install separately:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/weekly
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```
   
   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weekly
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running locally, or use MongoDB Atlas connection string.

5. **Run the application**
   
   To run both frontend and backend concurrently:
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Creating Your First Account

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Create an account with role "Leader" to get full access
4. Or create a "Member" account for limited access

### Team Leader Features

- Create and manage projects
- Assign team members to projects
- Create and assign tasks
- View all projects and tasks
- Manage team members
- Edit Gantt chart timelines
- Full dashboard access

### Team Member Features

- View assigned projects
- View and manage own tasks
- Create personal tasks
- View My Progress page
- View calendar and Gantt chart (read-only)
- Limited dashboard access

## Project Structure

```
weekly-project-management/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── team.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Projects.js
│   │   │   ├── Tasks.js
│   │   │   ├── MyTasks.js
│   │   │   ├── MyProgress.js
│   │   │   ├── Calendar.js
│   │   │   ├── Gantt.js
│   │   │   ├── Team.js
│   │   │   └── Settings.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects (role-based)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Leader only)
- `PUT /api/projects/:id` - Update project (Leader only)
- `DELETE /api/projects/:id` - Delete project (Leader only)

### Tasks
- `GET /api/tasks` - Get all tasks (role-based)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Team
- `GET /api/team` - Get all team members
- `GET /api/team/:id` - Get single team member
- `POST /api/team` - Add team member (Leader only)
- `PUT /api/team/:id` - Update team member (Leader only)
- `DELETE /api/team/:id` - Remove team member (Leader only)

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a secure `JWT_SECRET`
3. Deploy to Railway, Render, or similar platform
4. Update MongoDB connection string

### Frontend
1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to Vercel, Netlify, or similar platform
3. Update API endpoints in production

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use environment variables for sensitive data

## Future Enhancements

- Real-time chat or comment system per task
- File upload and document sharing
- Email or in-app notifications
- Time tracking and reports
- Dark mode toggle
- Advanced filtering and search
- Export functionality (PDF, CSV)

## License

ISC

## Support

For issues or questions, please contact your team leader or create an issue in the repository.

