# Employer Dashboard User Guide

## Getting Started

### 1. Login as Employer
1. Navigate to `/login/login.html`
2. Select "Employer" from the user type dropdown
3. Enter your credentials
4. You'll be redirected to `/employer/dashboard.html`

### 2. Dashboard Overview

The employer dashboard displays:
- **Active Jobs** count
- **Total Applications** received
- **Profile Views** (placeholder)
- **Total Posted Jobs** (active + pending)

### 3. Post a New Job

Click the **"Post New Job"** button (top right)

Fill in the job posting form:
- Job Title *
- Company Name *
- Location *
- Job Type (Full-time, Part-time, Contract, Freelance)
- Experience Level (Entry, Mid-level, Senior, Executive)
- Salary Range *
- Description *
- Requirements *
- Benefits

Fields marked with * are required.

Click **"Post Job"** to publish.

### 4. Manage Posted Jobs

Each job card shows:
- Job title and company
- Location and job type
- Salary range
- Status badge (Active/Pending)
- Posted date
- Number of applications

Actions available:
- **View Applications** - See all applicants
- **Delete Job** - Remove the posting

### 5. View Applications

Click **"View Applications"** on any job card to see:
- Applicant name
- Email address
- Phone number
- Cover letter
- Application date
- Application status

### 6. Job Status System

**Active Jobs:**
- Visible to job seekers
- Appears in job listings
- Accepts applications
- Green status badge

**Pending Jobs:**
- Not visible to job seekers
- Awaiting approval (future feature)
- Yellow status badge

**Closed Jobs:** (Future feature)
- No longer accepting applications
- Red status badge

### 7. User Account

**View Account Details:**
- Click your name in the header (top right)
- This will take you to your profile page

**Logout:**
- Click the menu icon (☰) on mobile
- Click **"Logout"** in the mobile menu
- You'll be redirected to the login page

When you logout:
- Your session is cleared
- Your posted jobs remain saved
- Your profile data is removed from cache

### 8. Data Persistence

Your data is saved locally in the browser:
- Posted jobs → `employer_jobs`
- Profile data → `huntersite_employer_profile`
- Company info → `huntersite_employer_company`

**Important:** This is a demo using localStorage. Data is not synced across devices or browsers.

## Features Breakdown

### Statistics Dashboard
Shows real-time counts of:
- Active jobs currently visible to job seekers
- Total applications received across all jobs
- Profile views (placeholder for future analytics)
- Total jobs posted (all statuses)

### Job Management
- Post unlimited jobs
- Edit job details (future feature)
- Change job status (future feature)
- Delete jobs permanently
- View application statistics per job

### Application Tracking
- See all applications for each job
- View applicant details
- Read cover letters
- Track application dates
- Filter by status (future feature)

### Integration with Job Seekers
- Active jobs automatically appear in job seeker listings
- Job seekers can view job details
- Job seekers can apply directly
- Applications are linked to specific jobs
- Application count updates in real-time

## Technical Details

### How Jobs Become Visible

1. Employer posts a job
2. Job is saved with `status: "active"`
3. Job seeker pages load jobs from:
   - Static JSON file (`/assets/data/jobs.json`)
   - Employer jobs (`employer_jobs` in localStorage)
4. Jobs are merged and filtered by status
5. Only `status: "active"` jobs are shown

### Data Structure

Jobs are stored with this structure:
```json
{
  "id": "emp_1234567890",
  "title": "Senior Developer",
  "company": "Tech Corp",
  "location": "Remote",
  "type": "Full-time",
  "experience": "Mid-level",
  "salary": "$80,000 - $120,000",
  "description": "Job description...",
  "requirements": "Required skills...",
  "benefits": "Company benefits...",
  "postedBy": "employer@example.com",
  "postedDate": "2025-01-15T10:30:00.000Z",
  "status": "active",
  "applications": 5
}
```

### Data Separation

Employers and job seekers have completely separate data:

**Employers CAN:**
- Post jobs
- View applications
- Manage their profile
- Delete their jobs

**Employers CANNOT:**
- Save jobs (like job seekers do)
- Submit applications
- Access job seeker profiles
- See other employers' jobs (in dashboard)

**Job Seekers CAN:**
- Save jobs for later
- Submit applications
- View all active jobs (including employer-posted)
- Manage their profile

**Job Seekers CANNOT:**
- Post jobs
- View applications
- Access employer dashboards
- See pending/closed employer jobs

## Troubleshooting

### "No jobs found"
- Make sure you've posted at least one job
- Check that job status is "active"
- Try refreshing the page

### Applications not showing
- Verify job is active
- Check that job seekers can see the job
- Ensure job ID matches in applications

### Can't logout
- Use the mobile menu (☰ icon)
- Click "Logout" in the menu
- Alternative: Clear browser data

### Jobs not visible to job seekers
- Check job status is "active" (not "pending")
- Verify job was saved successfully
- Check browser console for errors

### Lost my data
- Data is stored in browser localStorage
- Clearing browser data will delete everything
- Use the same browser/device to access your data
- Future: Backend database will sync across devices

## Best Practices

1. **Complete all required fields** when posting jobs
2. **Use clear, descriptive titles** for better visibility
3. **Provide detailed requirements** to attract qualified applicants
4. **Include salary ranges** to set expectations
5. **Review applications promptly** to maintain engagement
6. **Update job status** when position is filled
7. **Delete old jobs** to keep dashboard clean

## Keyboard Shortcuts (Future Feature)

- `Ctrl/Cmd + N` - Post new job
- `Esc` - Close modal
- `Ctrl/Cmd + S` - Save job (in edit mode)

## Mobile Experience

The dashboard is fully responsive:
- **Mobile:** Stack layout, simplified cards
- **Tablet:** 2-column grid for jobs
- **Desktop:** Full dashboard with sidebar navigation

## Coming Soon

- [ ] Edit posted jobs
- [ ] Mark applications as reviewed
- [ ] Email notifications for new applications
- [ ] Analytics dashboard with charts
- [ ] Bulk job management
- [ ] Job templates for faster posting
- [ ] Application screening tools
- [ ] Interview scheduling
- [ ] Candidate messaging
- [ ] Company profile customization

## Support

For technical issues or questions:
1. Check the browser console for errors
2. Review `docs/DATA_SEPARATION.md` for data logic
3. Review `docs/EMPLOYER_IMPLEMENTATION.md` for feature details
4. Check `docs/CODE_ORGANIZATION.md` for file structure

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Platform:** Web (localStorage-based demo)
