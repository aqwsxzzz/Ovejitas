# User Interface Design Goals

*(Inherited from backend PRD, section 4)*

## Key Screens & Components
1. **Auth**: Login/Register
2. **Dashboard**: Farm overview, quick stats
3. **Animals**: List (filterable), Detail, Add/Edit Form
4. **Events**: Timeline view, Add Event modal
5. **Farms**: Farm switcher, Manage/Settings
6. **Profile**: User settings, language, logout
7. **Offline Indicator**: Persistent banner/toast

## Component Architecture
- **Atomic Design**: Atoms → Molecules → Organisms → Templates
- **Feature Modules**: Self-contained features with own components/hooks
- **Shared Components**: Button, Input, Card, Modal, etc. (shadcn/ui)
