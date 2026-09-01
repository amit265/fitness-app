# SINI AI — GLOBAL CYCLE-ADAPTIVE THEME SYSTEM

## 🚨 CRITICAL IMPLEMENTATION RULE — READ THIS FIRST

The existing Sini AI application is **already built, functional, and visually designed**.

This task is **NOT a redesign**.

This task is to introduce a **global, centralized, cycle-adaptive theme system underneath the existing UI** so that the existing application can automatically change its visual atmosphere according to the user's cycle phase.

### DO NOT immediately start changing colors.

Before modifying ANY UI color, perform a complete **visual color audit and extraction of the existing application**.

This audit is mandatory.

---

# PHASE 0 — EXISTING COLOR AUDIT & EXTRACTION

## Step 0.1 — Inspect the entire project

Before writing or modifying theme code, inspect:

- All screens
- All reusable components
- Navigation
- Tab bar
- Headers
- Cards
- Buttons
- Inputs
- Modals
- Bottom sheets
- Charts
- Progress indicators
- Cycle calendar
- AI chat
- Empty states
- Loading states
- Error states
- Onboarding
- Profile
- Settings

Understand how the current visual system is currently implemented.

---

## Step 0.2 — Find every existing color

Search the entire codebase for:

```text
#...
rgb(...)
rgba(...)
hsl(...)
hsla(...)
backgroundColor
color
borderColor
tintColor
shadowColor
fill
stroke
```

Also inspect:

- SVG files
- SVG components
- image assets containing brand colors
- gradient definitions
- chart configurations
- navigation theme configuration
- status bar configuration
- animation/interpolation colors

Do not assume colors only exist inside StyleSheet files.

---

# Step 0.3 — Build an existing color inventory

Create an internal audit table before making changes.

Example:

| Existing color | Where used | Approx. purpose | Proposed semantic token |
|---|---|---|---|
| `#FFFFFF` | Cards | Surface | `surface` |
| `#3B2938` | Buttons/headings | Primary | `primary` |
| `#29252A` | Text | Primary text | `textPrimary` |
| `#E6D9CE` | Borders | Border | `border` |
| `#8FA89A` | Activity | Activity | `activity` |

The exact values above are examples only.

**Use the actual colors found in the existing application.**

---

# Step 0.4 — Identify duplicated colors

Look for situations such as:

```text
#FFFFFF
#FEFEFE
#FCFCFC
#FDFDFD
```

or:

```text
#3B2938
#3B2A38
#3C2938
```

Determine whether these are intentionally different or accidental duplicates.

Do not blindly merge them.

Preserve intentional distinctions.

---

# Step 0.5 — Identify semantic usage

For every important color, determine what it actually means.

For example:

```text
Background
Surface
Elevated surface
Primary action
Secondary action
Primary text
Secondary text
Muted text
Border
Divider
Success
Warning
Error
Calories
Nutrition
Activity
Cycle
Recovery
Chart
Navigation
```

The goal is to move from:

```text
color = #8FA89A
```

to:

```text
color = activity
```

---

# Step 0.6 — Create SINI CLASSIC from the audit

The current application becomes:

> **Sini Classic**

This theme must reproduce the application's current visual appearance as closely as possible.

Do NOT reinterpret the current design.

Do NOT "improve" the existing colors during this step.

Do NOT replace the current palette with the proposed cycle palette.

First preserve what already works.

Conceptually:

```text
CURRENT APP
     ↓
COLOR AUDIT
     ↓
SEMANTIC TOKENS
     ↓
SINI CLASSIC
```

After this stage:

> **Sini Classic should look essentially the same as the current application.**

Only after this is verified should the cycle-adaptive themes be introduced.

---

# Step 0.7 — Produce a migration map

Before modifying screens, create a mapping such as:

```text
Existing hardcoded color
        ↓
Semantic meaning
        ↓
Theme token
        ↓
Sini Classic value
```

Example:

```text
#3B2938
↓
Primary brand/action
↓
theme.colors.primary
↓
#3B2938
```

Another:

```text
#8FA89A
↓
Activity
↓
theme.colors.activity
↓
#8FA89A
```

This migration map should guide the rest of the implementation.

---

# 🚨 DO NOT PROCEED TO CYCLE THEMES UNTIL THIS IS DONE

The purpose of this audit is to avoid the most common failure mode of theme implementations:

> Changing colors screen-by-screen until the application ends up with inconsistent shades, duplicated color definitions, and components that don't respond to theme changes.

The existing visual design is valuable.

**Preserve it first. Abstract it second. Extend it third.**

---

# PHASE 1 — BUILD THE GLOBAL THEME ARCHITECTURE

Once the existing color audit is complete, implement the global theme system described below.

The theme system must sit underneath the existing UI.

Do not redesign individual screens.

Do not create six separate visual implementations of the application.

Instead:

```text
                     THEME TOKENS
                          ↓
                  ACTIVE THEME
                          ↓
                  THEME PROVIDER
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
       Shared Components          Screens
              ↓                       ↓
       Button/Card/etc.        Home/Calendar/etc.
              └───────────┬───────────┘
                          ↓
                   ENTIRE APPLICATION
```

Every component should consume semantic tokens from the active theme.

---

# PHASE 2 — CYCLE-ADAPTIVE THEMES

Create four cycle themes:

### Menstrual
**Rose Dawn**

Quiet · Soft · Restorative

### Follicular
**Sage Bloom**

Fresh · Light · Renewing

### Ovulatory
**Golden Glow**

Bright · Energetic · Vibrant

### Luteal
**Plum Dusk**

Grounded · Warm · Reflective

These are **visual atmospheres**, not assumptions about the user's emotional state.

Do NOT assume:

```text
Menstrual = sad
Follicular = happy
Ovulation = confident
Luteal = irritated
```

The actual mood tracker remains independent.

---

# PHASE 3 — MANUAL THEMES

The user gets three appearance choices:

```text
Automatic
Sini Classic
Dark Mode
```

### Automatic

Theme follows current cycle phase.

### Sini Classic

Always use the existing application's original theme.

### Dark Mode

Always use the dedicated dark theme.

Manual selection overrides cycle-adaptive behavior.

---

# PHASE 4 — GLOBAL AUTOMATIC RESOLUTION

The final architecture must work like this:

```text
User preference
       ↓
 ┌─────┴──────────┐
 ↓                ↓
Automatic       Manual
 ↓              ↓      ↓
Cycle phase   Classic  Dark
 ↓
Current theme
 ↓
Theme Provider
 ↓
Entire application
```

The existing cycle engine determines:

```text
Current cycle day
Current cycle phase
```

The theme system consumes the existing phase.

Do NOT create a second cycle engine.

---

# PHASE 5 — ZERO HARD-CODED UI COLORS

After migration, reusable UI components should not contain arbitrary brand colors.

Bad:

```typescript
backgroundColor: '#F5EEE6'
```

Good:

```typescript
backgroundColor: theme.colors.background
```

Bad:

```typescript
color: '#3B2938'
```

Good:

```typescript
color: theme.colors.textPrimary
```

Bad:

```typescript
backgroundColor:
  cyclePhase === 'menstrual'
    ? '#D9939E'
    : '#8FA89A'
```

Good:

```typescript
backgroundColor: theme.colors.cycle
```

The component should not know which cycle theme is active.

---

# PHASE 6 — VERIFY SINI CLASSIC

After converting the existing application to semantic tokens:

1. Run the app.
2. Select `Sini Classic`.
3. Compare it against the original application.
4. Inspect every major screen.
5. Confirm that the visual appearance has not unintentionally changed.

Only when Classic is stable should the cycle themes be activated.

---

# PHASE 7 — ACTIVATE CYCLE THEMES

Then connect:

```text
Existing cycle engine
        ↓
Current phase
        ↓
Theme resolver
        ↓
Active theme
        ↓
Theme Provider
        ↓
All components
        ↓
Entire application
```

Test:

```text
Menstrual → Rose Dawn
Follicular → Sage Bloom
Ovulatory → Golden Glow
Luteal → Plum Dusk
```

---

# FINAL NON-NEGOTIABLE RULE

**Audit first. Extract second. Preserve Classic third. Build cycle themes fourth.**

Do not treat the current application as a blank canvas.

The objective is:

> **Preserve what already looks good, turn its colors into a proper semantic design system, and then make that system dynamically adapt to the user's cycle.**

The final result should feel like the same Sini AI application throughout the entire cycle — simply changing its visual atmosphere naturally as the user's cycle changes.