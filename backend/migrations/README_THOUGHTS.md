# Thought of the Day Feature - Implementation Guide

## Overview
This feature allows branch admins and superadmins to create and manage inspirational thoughts/quotes that are displayed on the dashboard. Each branch has its own collection of thoughts, and users see a random thought from their branch's collection.

## Database Schema

### Table: `thoughts`
```sql
CREATE TABLE thoughts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

## Installation Steps

### 1. Database Migration
Run the SQL migration to create the thoughts table:

```bash
# Using MySQL CLI
mysql -u root -p intranet_portal < backend/migrations/create_thoughts_table.sql
```

Or manually execute in your MySQL client:
```sql
USE intranet_portal;

CREATE TABLE IF NOT EXISTS thoughts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_branch (branch),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
);
```

### 2. Backend Files Created
- ✅ `backend/models/thought.model.js` - Database model
- ✅ `backend/controllers/thought.controller.js` - Business logic
- ✅ `backend/routes/thought.routes.js` - API routes
- ✅ `backend/server.js` - Updated to include thought routes

### 3. Frontend Updates
- ✅ `src/pages/Dashboard.tsx` - Updated to fetch and display thoughts
- ✅ Modal with two input fields: Content and Author
- ✅ API integration for creating and fetching thoughts

## API Endpoints

### Public Endpoints (Authenticated Users)

#### Get Random Thought for Branch
```http
GET /api/thoughts/random/:branch
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "thought": {
      "id": 1,
      "content": "Success is not final, failure is not fatal...",
      "author": "Winston Churchill",
      "branch": "Guindy",
      "created_by": 1,
      "created_at": "2026-02-16T07:51:04.000Z",
      "first_name": "Admin",
      "last_name": "User"
    }
  }
}
```

#### Get All Thoughts for Branch
```http
GET /api/thoughts/branch/:branch
Authorization: Bearer {token}
```

### Admin/SuperAdmin Only Endpoints

#### Create New Thought
```http
POST /api/thoughts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "branch": "Guindy"  // Optional for superadmin
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thought created successfully",
  "data": {
    "thought": {
      "id": 4,
      "content": "The only way to do great work is to love what you do.",
      "author": "Steve Jobs",
      "branch": "Guindy",
      "created_by": 1
    }
  }
}
```

#### Update Thought
```http
PUT /api/thoughts/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated content",
  "author": "Updated Author"
}
```

#### Delete Thought (Soft Delete)
```http
DELETE /api/thoughts/:id
Authorization: Bearer {token}
```

#### Get All Thoughts (Admin View)
```http
GET /api/thoughts
Authorization: Bearer {token}
```

## Access Control

### Who Can Create Thoughts?
- ✅ **Branch Admins**: Can create thoughts for their own branch only
- ✅ **SuperAdmins**: Can create thoughts for any branch

### Who Can View Thoughts?
- ✅ **All Authenticated Users**: Can view thoughts from their branch

## Frontend Usage

### Dashboard Display
The thought card on the dashboard:
- Shows a random thought from the user's branch
- Displays both the content and author
- Has a loading state while fetching
- Shows a default thought if none are available

### Adding a New Thought
1. Click the **"Add Thought"** button (visible only to admins)
2. Fill in the modal form:
   - **Content**: The inspirational quote or thought
   - **Author**: The person who said/wrote it
3. Click **"Add Thought"** to save
4. The display automatically refreshes to show a random thought

## Features

### Branch Isolation
- Each branch (Guindy, Nungambakkam) has its own thought collection
- Users only see thoughts from their branch
- Admins can only create thoughts for their branch
- SuperAdmins can create thoughts for any branch

### Random Display
- Each page load shows a random thought from the branch's collection
- Ensures variety and keeps the dashboard fresh
- Falls back to a default thought if none exist

### Soft Delete
- Deleted thoughts are marked as inactive (`is_active = FALSE`)
- They don't appear in queries but remain in the database
- Can be restored if needed by updating the database directly

## Testing

### Test Creating a Thought
1. Log in as an admin or superadmin
2. Navigate to the Dashboard
3. Click "Add Thought" button
4. Enter:
   - Content: "Innovation distinguishes between a leader and a follower."
   - Author: "Steve Jobs"
5. Click "Add Thought"
6. Verify the thought appears on the dashboard

### Test Branch Isolation
1. Create thoughts for Guindy branch
2. Create thoughts for Nungambakkam branch
3. Log in as a Guindy user - should only see Guindy thoughts
4. Log in as a Nungambakkam user - should only see Nungambakkam thoughts

### Test Permissions
1. Log in as a regular employee
2. Verify the "Add Thought" button is NOT visible
3. Log in as an admin
4. Verify the "Add Thought" button IS visible

## Sample Data

The migration includes sample thoughts:
```sql
INSERT INTO thoughts (content, author, branch, created_by, is_active) VALUES
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'Guindy', 1, TRUE),
('The only way to do great work is to love what you do.', 'Steve Jobs', 'Nungambakkam', 1, TRUE),
('Innovation distinguishes between a leader and a follower.', 'Steve Jobs', 'Guindy', 1, TRUE);
```

## Troubleshooting

### Thought Not Displaying
- Check if thoughts exist for the user's branch in the database
- Verify the API endpoint is returning data
- Check browser console for errors

### Can't Create Thought
- Verify user is logged in as admin or superadmin
- Check if both Content and Author fields are filled
- Verify the backend server is running
- Check network tab for API errors

### Wrong Branch Thoughts Showing
- Verify the user's branch is correctly set in the database
- Check the API response to ensure it's filtering by branch
- Clear browser cache and reload

## Future Enhancements

Potential improvements:
- [ ] Daily rotation (show same thought for entire day)
- [ ] Thought categories/tags
- [ ] Like/favorite thoughts
- [ ] Thought history/archive view
- [ ] Scheduled thoughts (publish on specific dates)
- [ ] Multi-language support
- [ ] Image attachments for thoughts
- [ ] Thought analytics (views, engagement)

---

**Implementation Date**: February 16, 2026  
**Status**: ✅ Complete and Tested
