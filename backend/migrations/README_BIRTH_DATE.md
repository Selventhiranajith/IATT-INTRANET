# Database Migration Guide

## Adding Birth Date Feature

### Overview
This migration adds a `birth_date` field to the employee registration system, allowing administrators to record employee date of birth information.

### Changes Made

#### Frontend (Employee.tsx)
- ✅ Added `birth_date` field to employee form state
- ✅ Added date input field in the registration modal
- ✅ Positioned between Password and Department/Position fields
- ✅ Proper form validation and reset handling

#### Backend
- ✅ `auth.controller.js` - Already configured to accept `birth_date` (line 9, 80)
- ✅ `user.model.js` - Already includes `birth_date` in INSERT query (line 46, 49-51)
- ✅ Database migration script created

### Database Setup

#### Option 1: Using MySQL Command Line
```bash
# Navigate to backend directory
cd backend

# Run the migration
mysql -u root -p intranet_portal < migrations/add_birth_date_column.sql
```

#### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open your MySQL client
2. Select the `intranet_portal` database
3. Run the following SQL:

```sql
USE intranet_portal;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER position;

CREATE INDEX IF NOT EXISTS idx_birth_date ON users(birth_date);
```

#### Option 3: Manual Verification
Check if the column already exists:
```sql
DESCRIBE users;
```

If `birth_date` is not listed, add it manually:
```sql
ALTER TABLE users ADD COLUMN birth_date DATE NULL AFTER position;
```

### Testing the Feature

1. **Start the backend server** (if not already running):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (if not already running):
   ```bash
   npm run dev
   ```

3. **Test the registration flow**:
   - Log in as an admin user
   - Navigate to the Employees page
   - Click "Add Employee"
   - Fill in all fields including the new "Date of Birth" field
   - Submit the form
   - Verify the employee is created successfully

4. **Verify in database**:
   ```sql
   SELECT employee_id, first_name, last_name, birth_date 
   FROM users 
   WHERE birth_date IS NOT NULL;
   ```

### Field Specifications

- **Field Name**: `birth_date`
- **Data Type**: `DATE`
- **Nullable**: Yes (NULL allowed)
- **Format**: YYYY-MM-DD (standard SQL date format)
- **Frontend Input**: HTML5 date picker
- **Position**: After `position` column in database

### API Endpoint

**POST** `/api/auth/admin/users`

**Request Body**:
```json
{
  "employee_id": "EMP001",
  "email": "john.doe@company.com",
  "password": "tempPassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "employee",
  "department": "Engineering",
  "position": "Software Developer",
  "birth_date": "1990-05-15",
  "phone": "+1234567890"
}
```

### Troubleshooting

#### Issue: Column already exists error
**Solution**: The migration script uses `IF NOT EXISTS`, so this shouldn't happen. If it does, the column is already present.

#### Issue: Date format error
**Solution**: Ensure dates are in YYYY-MM-DD format. The HTML5 date input automatically formats correctly.

#### Issue: NULL values for existing employees
**Solution**: This is expected. Existing employees will have NULL birth_date until updated. You can update them manually:
```sql
UPDATE users SET birth_date = '1990-01-01' WHERE id = 1;
```

### Future Enhancements

Consider adding:
- Age calculation display
- Birthday reminders/notifications
- Age-based reporting
- Validation for reasonable date ranges (e.g., 18-100 years old)
- Edit employee functionality to update birth_date

---

**Migration Date**: February 16, 2026  
**Status**: ✅ Complete
