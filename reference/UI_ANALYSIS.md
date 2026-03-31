# Current SCM UI Analysis & CuroSCM Design Direction

## What Current SCM Does Well (Keep the Pattern)

### 1. Layout & Navigation
- **Left sidebar with icon-only collapsed state** — good use of screen real estate
- **Project context in top bar** — always know which project you're in
- **Two-tier nav**: team resources at top, project-scoped items below — clear mental model
- **Quick Access panel** — recent projects, orders, bids for fast switching

### 2. Entity Page Structure
- **Consistent tab pattern** across all entities (Info, BOM, Notes, Files, Tasks)
- **Top-level tabs for major sections** (Information, BOM, Purchase Order, Locations, Material Releases, Expediting, Invoicing)
- **Sub-tabs within sections** (Information > Information, Key Dates, Grouping, Cost Coding)
- **Workflow status button** in top-right corner (e.g., "Ready To Bid", "Order In Progress", "Issued")

### 3. BOM with 4 Item Types
- **Tab-based type switching** (Purchase Items 8, Client Supplied 0, Vendor Supplied 0, Feed Through 0) with counts
- **Contextual view toggles** on tables: Core, Financial, Material Control, Planning, Meta

### 4. Bid Comparison Grid
- **Top summary**: vendor rows with totals, recommended flags, compliance
- **Bottom detail**: line items with per-vendor columns, color-coded by vendor
- Good at-a-glance comparison

### 5. Dynamic Reporting Engine
- **Report categories**: Bids, Orders, Requisitions, Material Management, Cost
- **Pre-built report templates** with multiple saved views per report
- **Saved Views dropdown** with "Default View", custom user views, and shared team views
- **Customize View** button to modify columns on the fly

### 6. Project Reporting Dashboard
- **KPI cards** at top: Project Start, End, Planned Spend, Committed Spend, Invoiced
- **Deliverable Counts** horizontal bar chart (Requisitions, Bids, Offers, Orders)
- **Bid Status Breakdown** bar chart
- **Task Status** and **Milestone Date Status** donut charts

### 7. Common Patterns
- Notes/Files/Tasks on every entity — good standardization
- Notification subscription toggle (browser/email per entity)
- "Hide Inactive" toggle on list views
- Export icons (Excel/PDF) on every table
- "Saved Views" + "Customize View" on every list table

---

## What Current SCM Does Poorly (Improve in CuroSCM)

### 1. Visual Design — Dated & Cluttered
- **Purple-heavy color scheme** feels enterprise-2015, not modern SaaS
- **Dense tables with small text** — hard to scan, no breathing room
- **Modal forms** (Add Business) look like Bootstrap 3 — plain inputs, no visual hierarchy
- **Inconsistent button styles** — red Cancel, green Submit, purple View, green Add — too many colors fighting
- **Status badges** are garish colored rectangles (bright green "In Progress", bright red overdue)
- **Illustrations** (the box-opening person) are generic stock SVGs, feel disconnected

### 2. Navigation UX Issues
- **Icon-only sidebar** with no labels until hover — learning curve for new users
- **Too many tabs** on entity pages (Order has 10+ tabs across the top) — overwhelming
- **Sub-tabs within tabs** creates 3 levels of navigation — gets lost
- **No breadcrumbs** — hard to know where you are in the hierarchy

### 3. Data Tables
- **No row hover states or selection** — hard to track across wide tables
- **Filter inputs below headers** are always visible even when empty — wastes space
- **Pagination** (1, 2, >) instead of infinite scroll or virtual scrolling — feels outdated
- **Column headers don't indicate sort direction** clearly

### 4. Forms & Inputs
- **Label-left, input-right** layout in modals wastes vertical space and scans poorly on mobile
- **Toggle switches for Business Types** look like settings, not a multi-select — confusing
- **No inline validation** visible
- **Date inputs** show raw datetime format (2020-08-15 @2:28 am) — could be cleaner

### 5. Reporting Dashboard
- **KPI cards are colored blocks** with no context (no trend, no comparison to plan)
- **Charts are static-looking** — no interactivity visible
- **"This Week at a Glance"** is just text — missed opportunity for a timeline

### 6. Material Allocation Modal
- **Simple modal** with basic table — no drag-and-drop or visual allocation
- **"Close" button** styled as a danger button (red) — confusing

---

## CuroSCM Design Direction

### Design Philosophy
- **Clean, modern, spacious** — think Linear, Vercel Dashboard, or Notion
- **Data-dense but not cluttered** — smart use of whitespace, clear hierarchy
- **Subtle color coding** — muted status colors, not traffic-light garish
- **Dark mode support** from day one
- **Responsive** — works on tablets for field/site use

### Specific Improvements

#### Navigation
- **Collapsible sidebar with labels** (not icon-only) — expand/collapse toggle
- **Breadcrumbs** below top bar for full context path
- **Command palette** (Cmd+K) for power users to jump anywhere
- **Reduce tab overload** — group related tabs, use vertical side-nav on detail pages instead of 10+ horizontal tabs

#### Data Tables
- **Virtual scrolling** instead of pagination for long lists
- **Row hover highlighting** with subtle background
- **Filters as a collapsible panel** or filter bar (not always-visible inputs)
- **Column resize, reorder, pin** built into every table
- **Inline editing** where appropriate (status updates, quick notes)
- **Bulk actions** (select multiple items, batch status update)

#### Forms
- **Stacked label-above-input** layout — scans better, mobile-friendly
- **Sheet/drawer pattern** instead of modals for entity creation — more room
- **Inline validation** with clear error states
- **Auto-save** where possible (notes, descriptions)

#### Bid Comparison Grid
- **Heatmap coloring** for price comparison (green=lowest, red=highest)
- **Sticky headers** and **frozen first columns** for large comparisons
- **Side-by-side vendor cards** as an alternative view to the grid
- **One-click award** with visual confirmation

#### Reporting Dashboard
- **KPI cards with sparklines/trends** — show trajectory, not just a number
- **Interactive charts** — click to drill down
- **Customizable dashboard layout** — drag widgets to arrange
- **Comparison indicators** (planned vs actual, with % deviation)

#### Workflow & Status
- **Step indicator / progress bar** showing where the entity is in its lifecycle
- **Status transitions as dropdown menu** with clear next-available actions
- **Timeline view** of all status changes (not just audit log table)

#### Notifications
- **Slide-over notification panel** (not a small dropdown)
- **Grouped by entity** — "3 updates on Tubing Order"
- **Mark as read/unread** with swipe on mobile

#### Material Management
- **Visual allocation board** — Kanban or Gantt-style for release planning
- **Drag-to-allocate** instead of modal form
- **Shipment timeline** with live status dots

### Component Library Decision
**Use shadcn/ui as the base** but heavily customize:
- shadcn gives us accessible, unstyled primitives (Dialog, Dropdown, Table, Tabs, etc.)
- We customize with our own design tokens, spacing, colors
- For complex data features (virtual tables, drag-drop columns), layer TanStack Table on top
- For charts, use Recharts with our color palette
- This gives us the speed of a component library with full design control

### Color Palette Direction
- **Primary**: Deep navy/slate (not purple) — professional, modern
- **Accent**: Teal or blue — for CTAs and interactive elements
- **Status colors**: Muted/pastel versions — sage green (complete), amber (in progress), rose (overdue), slate (draft)
- **Data visualization**: Consistent palette across all charts
- **Dark mode**: True dark (not just inverted) with adjusted contrast

### Typography
- **Inter or Geist** for UI text — clean, modern, excellent readability at small sizes
- **Monospace (Geist Mono)** for IDs, codes, financial figures
- Clear size hierarchy: page title > section > table header > body > caption
