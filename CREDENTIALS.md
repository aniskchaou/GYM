# GymFlow - User Access Credentials

## Application URLs

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API Server | http://localhost:4000/api/v1 |
| Swagger Docs | http://localhost:4000/api/docs |

---

## Demo Accounts

### Super Admin
| Field | Value |
|-------|-------|
| Email | `superadmin@gymflow.com` |
| Password | `Admin@1234` |
| Dashboard | http://localhost:3000/dashboard/owner |
| Access | Full platform access, all gyms |

### Gym Owner
| Field | Value |
|-------|-------|
| Email | `owner@demogym.com` |
| Password | `Owner@1234` |
| Dashboard | http://localhost:3000/dashboard/owner |
| Access | Members, Classes, Trainers, Payments, Analytics, Branches, Settings |

### Receptionist
| Field | Value |
|-------|-------|
| Email | `reception@demogym.com` |
| Password | `Reception@1234` |
| Dashboard | http://localhost:3000/dashboard/reception |
| Access | Check-in, Members, Attendance, Classes, Memberships |

### Trainer
| Field | Value |
|-------|-------|
| Email | `trainer@demogym.com` |
| Password | `Trainer@1234` |
| Dashboard | http://localhost:3000/dashboard/trainer |
| Access | Classes, Workouts, Notifications |

### Member
| Field | Value |
|-------|-------|
| Email | `member@demogym.com` |
| Password | `Member@1234` |
| Dashboard | http://localhost:3000/dashboard/member |
| Access | My Membership, Classes, Bookings, Workouts, Notifications |

---

## Database

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `gymflow` |
| Username | `gymflow` |
| Password | `gymflow_dev` |
| Connection URL | `postgresql://gymflow:gymflow_dev@localhost:5432/gymflow` |

### PostgreSQL Admin
| Field | Value |
|-------|-------|
| Superuser | `postgres` |
| Password | `admin` |

---

## Role Permissions Summary

| Feature | Super Admin | Gym Owner | Receptionist | Trainer | Member |
|---------|:-----------:|:---------:|:------------:|:-------:|:------:|
| Owner Dashboard | Yes | Yes | - | - | - |
| Members Management | Yes | Yes | Yes | - | - |
| Attendance / Check-in | Yes | Yes | Yes | - | - |
| Classes | Yes | Yes | Yes | Yes | Yes |
| Trainers | Yes | Yes | - | - | - |
| Memberships | Yes | Yes | Yes | - | - |
| Payments | Yes | Yes | - | - | - |
| Analytics / Reports | Yes | Yes | - | - | - |
| Branches | Yes | Yes | - | - | - |
| Workouts | - | - | - | Yes | Yes |
| My Membership | - | - | - | - | Yes |
| My Bookings | - | - | - | - | Yes |
| Notifications | Yes | Yes | Yes | Yes | Yes |
| Settings | Yes | Yes | - | - | - |

---

## Starting the App

```bash
# From the project root: c:\Users\anisk\OneDrive\Desktop\projects\group2-nodejs\gym\GYM

# Start API (NestJS on port 4000)
cd apps/api
npm run dev

# Start Web (Next.js on port 3000) - in a new terminal
cd apps/web
npm run dev
```

> Make sure PostgreSQL service `postgresql-x64-15` is running before starting the API.
