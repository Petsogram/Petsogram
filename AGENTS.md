# Petsogram Project Rules

These rules dictate the architecture, design, and functionality of the Petsogram project. They must be strictly adhered to during all development phases.

## Product Identity
- **Name**: Petsogram
- **Forbidden**: Never use the terms "PawSetu" or "Pawsetu".

## Design Aesthetics
The existing `Petsogram (3).jsx` design is the absolute visual reference.
- **Primary Theme**: Emerald/green
- **Surfaces**: White/stone
- **Accents**: Amber for emergency accents
- **Danger**: Rose/red must *only* be used for danger states
- **Forbidden Colors**: Do not introduce purple or blue as the primary design.
- **Typography**: 
  - Headings: `Sora`
  - Body: `Inter`
- **UI Elements**: Strictly preserve the existing rounded cards, shadows, glassmorphism, buttons, badges, and icon style.

## Functionality Principles
- **No Regressions**: Never remove existing working functionality.
- **Single Source of Truth**: Do not create duplicate systems for:
  - Routing
  - Authentication
  - Rewards system
  - Location system
  - Chatbot system
  - Database layer

## Access Control & Auth
### Public Features (No login required)
Users must be able to freely access:
- Find Help
- Emergency
- Report Abuse
- Find Vet
- Browse Adoption
- Browse Community
- Browse Events
- Donate
- Browse Marketplace
- Miko

### Protected Features (Login required)
Login is required ONLY for account-specific actions:
- Dashboard
- Personal Rewards
- Profile
- Settings
- Adoption application submission
- Community posting/interactions
- Service booking
- Marketplace purchase
- Personal event registration
- Personal history

### Emergency Exemption
- **Login must NEVER be required** to access or submit an emergency report.

## Location Architecture
- **Current Location**: A one-time GPS snapshot of where the reporter currently is. Never continuously track users.
- **Pickup Point**: Where the animal actually is. This is fixed after submission.
- **Navigation**: Google Maps navigation must use the **Pickup Point** as the rescue destination.

## Privacy & Security
- Never expose secrets.
- Never expose service-role keys.
- Never fabricate GPS coordinates.
- Never fabricate medical diagnoses.

## AI & Miko
- Miko must not block emergency assistance.
- Miko must not diagnose animals.

## Quality & Development
After every major implementation:
1. Run a build (`npm run build`).
2. Check the console for warnings.
3. Fix errors immediately.
- Do not modify unrelated pages.
- Keep the application SIH-demo friendly at all times.
