# Admin User Management Frontend

Complete React admin user management interface with data table, pagination, search, filtering, and user actions.

## Features

- ✅ **Data Table** - Display all users with their information
- ✅ **Pagination** - Navigate through pages with configurable page size
- ✅ **Search** - Search by email or full name
- ✅ **Filters** - Filter by role (CANDIDATE, EMPLOYER, ADMIN, GUEST) and status (ACTIVE, LOCKED, DELETED)
- ✅ **Lock/Unlock** - Manage account lock status with confirmation
- ✅ **Delete** - Soft delete users with reason tracking
- ✅ **Status Display** - Show user status and role with color coding
- ✅ **Toast Notifications** - Real-time feedback for actions
- ✅ **Loading States** - Visual feedback during data loading
- ✅ **Error Handling** - Comprehensive error messages and handling
- ✅ **Confirmation Modal** - Prevent accidental actions
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

## File Structure

```
frontend/
├── lib/
│   └── admin-api.ts                 # API client with interceptors
├── types/
│   └── admin.types.ts               # TypeScript types
├── hooks/
│   ├── useToast.ts                  # Toast notification hook
│   └── useUsers.ts                  # User data fetching hook
├── components/admin/
│   ├── ToastContainer.tsx           # Toast notification display
│   ├── ConfirmationModal.tsx        # Confirmation dialog
│   ├── FilterBar.tsx                # Search and filter inputs
│   ├── UserTable.tsx                # Main users table
│   ├── UserActions.tsx              # Action buttons
│   ├── Pagination.tsx               # Pagination controls
│   └── States.tsx                   # Loading/Error/Empty states
├── styles/
│   └── admin.css                    # Admin page styles
└── app/admin/users/
    └── page.tsx                     # Main admin page
```

## Component Hierarchy

```
AdminUsersPage
├── FilterBar
│   ├── Search input
│   ├── Role filter select
│   ├── Status filter select
│   └── Clear filters button
├── UserTable
│   ├── Table header
│   └── UserRow (repeated)
│       └── UserActions
│           ├── Lock button
│           ├── Unlock button
│           └── Delete button
├── Pagination
│   ├── Items info
│   ├── Page size selector
│   └── Page navigation buttons
├── ConfirmationModal
│   ├── Modal header
│   ├── Modal body
│   └── Modal footer (Cancel/Confirm buttons)
└── ToastContainer
    └── Toast (repeated for each notification)
```

## Usage

### Import the page in your Next.js app

```tsx
import AdminUsersPage from '@/app/admin/users/page';
```

### API Integration

The admin page automatically connects to the backend API:

```typescript
// Example API calls
adminApi.listUsers({
  search: "john",
  role: "CANDIDATE",
  status: "ACTIVE",
  page: 1,
  pageSize: 10
});

adminApi.lockUser(userId, "Reason for locking");
adminApi.unlockUser(userId);
adminApi.deleteUser(userId, "Reason for deletion");
adminApi.updateUserRole(userId, "EMPLOYER");
```

## Key Hooks

### useToast()

```typescript
const { toasts, addToast, removeToast } = useToast();

// Add notifications
addToast("success", "User locked successfully");
addToast("error", "Failed to lock user");
addToast("warning", "This action cannot be undone");
addToast("info", "User has been updated");
```

### useUsers()

```typescript
const {
  data,           // User data with pagination
  loading,        // Loading state
  error,          // Error message
  filters,        // Current filters
  fetchUsers,     // Fetch with new filters
  handleSearch,   // Handle search input
  handleRoleFilter,    // Handle role filter
  handleStatusFilter,   // Handle status filter
  handlePageChange,    // Handle page navigation
  handlePageSizeChange // Handle page size change
} = useUsers(10); // 10 = default page size
```

## Components

### FilterBar

```tsx
<FilterBar
  search={search}
  role={role}
  status={status}
  onSearchChange={handleSearch}
  onRoleChange={handleRoleFilter}
  onStatusChange={handleStatusFilter}
  isLoading={loading}
/>
```

### UserTable

```tsx
<UserTable
  users={users}
  isLoading={loading}
  onLock={(user) => handleLock(user)}
  onUnlock={(user) => handleUnlock(user)}
  onDelete={(user) => handleDelete(user)}
/>
```

### Pagination

```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  isLoading={loading}
/>
```

### ConfirmationModal

```tsx
<ConfirmationModal
  isOpen={isOpen}
  title="Lock Account"
  message="Are you sure?"
  confirmText="Lock"
  cancelText="Cancel"
  isDangerous={true}
  isLoading={loading}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  showInput={true}
  inputPlaceholder="Enter reason..."
  onInputChange={handleReasonChange}
/>
```

### ToastContainer

```tsx
<ToastContainer
  toasts={toasts}
  onRemove={(id) => removeToast(id)}
/>
```

## Styling

The components use **TailwindCSS** classes. Key utility classes used:

- Layout: `flex`, `grid`, `space-y-*`, `gap-*`
- Colors: `bg-*`, `text-*`, `border-*`
- Typography: `text-*`, `font-*`
- Interactive: `hover:*`, `disabled:*`, `focus:*`
- Animations: `animate-spin`, `animate-slide-in`, `transition-*`

### Custom Animations

Define these in your global CSS or `admin.css`:

```css
@keyframes slide-in {
  from { opacity: 0; transform: translateX(400px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
```

## Type Safety

All components are TypeScript-enabled with proper types:

```typescript
interface User {
  id: number;
  fullName: string;
  email: string;
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN" | "GUEST";
  status: "ACTIVE" | "LOCKED" | "DELETED";
  violationCount: number;
  lockedAt: string | null;
  lockedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ListUsersResponse {
  items: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}
```

## Error Handling

### API Errors

```typescript
try {
  await adminApi.lockUser(userId);
} catch (err: any) {
  const message = err.response?.data?.message || "Failed to lock user";
  addToast("error", message);
}
```

### Network Errors

All network errors are caught and displayed in toast notifications. If token is expired (401), user is automatically redirected to login.

## Status Management

Users have three possible statuses:

- **ACTIVE** - User can login and use the system
- **LOCKED** - User cannot login, their JWT tokens are rejected
- **DELETED** - User is soft-deleted (data retained), cannot login

## Response Examples

### Lock User Response

```json
{
  "message": "User locked successfully",
  "item": {
    "id": 5,
    "email": "user@example.com",
    "status": "LOCKED",
    "lockedAt": "2026-04-25T15:30:00Z",
    "lockedBy": 1
  }
}
```

### List Users Response

```json
{
  "items": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "CANDIDATE",
      "status": "ACTIVE",
      "violationCount": 0,
      "createdAt": "2026-04-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Best Practices

1. **Debounce Search** - Consider adding debouncing to search input for better performance
2. **Batch Operations** - For bulk user operations, implement batch endpoints
3. **Caching** - Consider caching user list with React Query
4. **Audit Logs** - View detailed audit logs for each user action
5. **Permissions** - Only ADMIN role can access this page
6. **Confirmation** - Always show confirmation before destructive actions

## Testing

### Test Scenarios

1. Load users list
2. Search by email
3. Filter by role
4. Filter by status
5. Change page size
6. Navigate pages
7. Lock active user
8. Unlock locked user
9. Delete user
10. Clear filters
11. Handle errors
12. Check loading states

### Example Test Cases

```typescript
// Test search functionality
test("Search should filter users by email", async () => {
  render(<AdminUsersPage />);
  const searchInput = screen.getByPlaceholderText("Email or name...");
  
  await userEvent.type(searchInput, "john");
  
  await waitFor(() => {
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });
});

// Test lock functionality
test("Lock button should show confirmation modal", async () => {
  render(<AdminUsersPage />);
  const lockButton = screen.getByText("Lock");
  
  fireEvent.click(lockButton);
  
  expect(screen.getByText("Lock User Account")).toBeInTheDocument();
});
```

## Troubleshooting

### Q: Toast notifications not showing
A: Ensure ToastContainer is rendered in the page component.

### Q: API calls failing with 401
A: Check token in localStorage and verify admin role.

### Q: Filters not working
A: Ensure backend API supports filter query parameters.

### Q: Modal not closing after action
A: Check that closeModal function is called after successful API response.

## Environment Variables

Create `.env.local` in your frontend root:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Dependencies

- **react** - UI library
- **axios** - HTTP client
- **tailwindcss** - CSS framework
- **typescript** - Type safety

All are already installed in the Next.js project.
