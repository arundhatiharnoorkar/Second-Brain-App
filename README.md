# NoteHub – Personal Knowledge Management System

NoteHub is a full-stack web application designed to help users create, organize, manage, and access their personal notes in one place. It provides a centralized platform for managing information with secure authentication, file attachments, and an intuitive interface.

## 🚀 Features

- **User Authentication:** Secure signup and signin using JWT authentication.
- **Note Management:** Create, view, edit, and delete personal notes.
- **Search Notes:** Quickly find notes using search functionality.
- **Categories and Tags:** Organize notes for easier access.
- **Pin Notes:** Keep important notes easily accessible.
- **File Attachments:** Upload and manage files using AWS S3.
- **Database Management:** Store user information and note data using PostgreSQL.
- **AI-Powered Note Assistance:** Ask questions based on saved notes. *(Include only if implemented and tested.)*

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Cloud Storage | AWS S3 |
| Validation | Zod |

## 🏗️ Architecture

The application follows a client-server architecture.

1. **Frontend:** React provides the user interface and communicates with the backend through API requests.
2. **Backend:** Express.js handles authentication, business logic, and API requests.
3. **Database:** PostgreSQL stores user accounts, notes, and attachment metadata.
4. **ORM:** Prisma manages database operations.
5. **Cloud Storage:** AWS S3 stores uploaded files, while their metadata and S3 references are maintained in PostgreSQL.

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/NoteHub.git
cd NoteHub
```

### 2. Install dependencies

Install frontend and backend dependencies separately:

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

*Adjust folder names if your project structure is different.*

### 3. Configure environment variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
