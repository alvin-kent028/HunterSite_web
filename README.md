# hunters.ph.com


# Job Portal System

## Introduction
The system is designed as a job portal that connects **Job Seekers, Employers, and Administrators** in one platform.  
Its main goal is to simplify job searching and application for Job Seekers while allowing Employers to post and manage job listings. Administrators ensure that all activities, such as job postings and user accounts, remain verified and secure.

### Key Features
- User Registration & Profile Management  
- Job Posting and Editing  
- Application Submission & Tracking  
- Database-driven storage of all records  

---

## Component Identification
The system is built using several key components:

- **User Interface** – Entry point for all users (Job Seekers, Employers, Admins).  
- **JobSeeker Component** – Manages profiles, resumes, and applications.  
- **Employer Component** – Manages job listings and reviews applicants.  
- **Admin Component** – Verifies accounts, monitors activities, and approves/rejects postings.  
- **Job Component** – Stores job information (title, description, salary, deadlines).  
- **Database** – Central storage for all data.  

---

## Interaction Between Components
- Job Seekers browse and apply for jobs.  
- Employers create and manage job listings.  
- Admins verify accounts and job posts.  
- The Database stores all information, acting as the system backbone.  

---

## Class Identification
Each component is represented by classes:

- **User / JobSeeker** – Handles personal details, resumes, skills, and applications.  
- **Employer** – Manages company details and job postings.  
- **Admin** – Oversees the platform, verifies accounts, and manages postings.  
- **Job** – Stores job details (ID, title, salary, deadlines).  
- **Application** – Records job applications and statuses.  
- **Search** – Provides job filtering and searching.  
- **Notification** – Sends updates and alerts to users.  
- **Database** – Manages data storage and retrieval.  

---

## Relationship Analysis
- Job Seekers apply for Jobs through Applications.  
- Employers post Jobs and review Applications.  
- Admins verify accounts and approve/reject Jobs.  
- Notifications keep users updated.  
- Search provides filtering and ease of use.  

---

## Conclusion
- **Findings**: The system’s structure is realistic and mirrors real job portals.  
- **Implications**: Modular design makes it secure, maintainable, and scalable.  
- **Recommendations**: Future improvements may include third-party integration (LinkedIn, email/SMS notifications).  

---

## How to Run the Project
1. Clone this repository:
   ```bash
   git clone https://github.com/camille-rose013/hunters.ph.com.git
