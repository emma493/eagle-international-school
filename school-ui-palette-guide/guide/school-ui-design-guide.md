# School Management System: UI Design Guide (Facebook-inspired)

> **For the implementing agent (e.g. Opencode.ai):** This document is a set of *suggestions and starting points*, not a strict specification. Use it to get a familiar, friendly, blue-and-white feel. Adapt freely where your framework, component library, accessibility needs or the screen at hand call for something different. When in doubt, favour consistency and usability over matching any number exactly.

> **Accuracy note:** The values below approximate Facebook's public web UI as commonly observed. Facebook changes its design often, so treat them as close estimates. Verify with browser DevTools if you need an exact match.

---

## 1. The overall feel

A good way to describe the look: **calm, light, and friendly, with one confident blue**.

- Large areas are a soft grey-blue page background with clean white cards on top.
- Blue is the single main accent. It marks the main action, the active item and links.
- Green appears rarely, for a "create / register" type action.
- Red is kept for notification counts and errors.
- Plenty of whitespace, rounded corners that are small rather than pill-shaped (except search and avatars), and subtle shadows instead of heavy borders.

Suggested principle: *one primary action per view, in blue.*

---

## 2. Colour palette

### 2.1 Brand and action colours
| Role | Suggested value | Notes |
|---|---|---|
| Primary blue | `#1877F2` | Main buttons, links, active nav, focus ring |
| Primary blue (hover) | `#166FE5` | Slightly darker on hover |
| Blue tint | `#E7F3FF` | Selected sidebar item, soft highlights, info banners |
| Success green | `#42B72A` | "Register / Create" style buttons |
| Success green (hover) | `#36A420` | |
| Alert red | `#FA383E` | Notification badges, destructive actions, errors |
| Warning amber | `#F7B928` | Pending / needs-attention states |

### 2.2 Surfaces and neutrals
| Role | Suggested value |
|---|---|
| Page background | `#F0F2F5` |
| Card / panel | `#FFFFFF` |
| Hover background (rows, list items) | `#F2F2F2` |
| Secondary button / icon circle | `#E4E6EB` |
| Secondary button (hover) | `#D8DADF` |
| Input border | `#DDDFE2` |
| Divider / hairline | `#CED0D4` |

### 2.3 Text
| Role | Suggested value |
|---|---|
| Primary text | `#1C1E21` |
| Secondary text (captions, labels) | `#65676B` |
| Placeholder | `#8A8D91` |
| Text on blue or green | `#FFFFFF` |
| Link | `#1877F2` |

### 2.4 Status colours for school data
Soft tinted background with a darker text of the same hue reads well for pills and tags.

| Meaning | Background | Text | Example use |
|---|---|---|---|
| Good / paid / present | `#E6F4EA` | `#1E7B34` | Fees paid, attendance present |
| Attention / partial | `#FFF4D6` | `#8A6100` | Partial payment, late |
| Problem / owing / absent | `#FFE5E6` | `#C2262B` | Fees owing, absent |
| Info / neutral | `#E7F3FF` | `#1877F2` | New, scheduled |

---

## 3. Colour combinations that work well

Suggested pairings (contrast figures are approximate; check yours):

1. **Page + card:** `#F0F2F5` background with `#FFFFFF` cards. The core of the whole look.
2. **Primary button:** white text on `#1877F2`. Strong contrast, instantly recognisable.
3. **Secondary button:** `#1C1E21` text on `#E4E6EB`. Quiet next to a primary button.
4. **Active nav item:** `#1877F2` text on `#E7F3FF`, with the icon circle filled blue and white icon.
5. **Inputs:** white fill, `#DDDFE2` border, `#1877F2` border plus a faint blue glow on focus.
6. **Table:** `#65676B` small header text, `#CED0D4` row dividers, `#F2F2F2` on hover.
7. **Badge:** white bold text on `#FA383E`.
8. **Create / register:** white on `#42B72A`, used sparingly so it stays special.

Things to consider avoiding: putting blue text on a blue tint at small sizes, using green and red side by side without text or icons (colour-blind users), and using more than one strong accent per screen.

---

## 4. Element sizes

These are suggested starting dimensions. Round to your design system's spacing scale if you have one.

### 4.1 Login screen
| Element | Suggestion |
|---|---|
| Login card width | about 396px (full width minus padding on small phones) |
| Card padding | about 20px |
| Card radius | 8px |
| Card shadow | soft, layered (roughly `0 2px 4px` and `0 8px 16px` at 10% black) |
| Input height | about 52px |
| Input padding | about 14px 16px |
| Input font size | about 17px |
| Input radius | about 6px |
| Input border | 1px |
| Space between inputs | about 12px |
| Login button height | about 48px, full width, 20px bold text |
| Create / register button | about 48px, 17px bold text, green, not full width |
| Divider | 1px, with about 20px above and below |
| Layout | brand/tagline on the left and card on the right on desktop; stacked and centred on mobile |
| Brand wordmark | large (about 60px), bold, blue, tight letter spacing |
| Tagline | about 28px, regular weight |

### 4.2 App shell
| Element | Suggestion |
|---|---|
| Top bar height | about 56px, white, light shadow |
| Logo mark | 40px circle, blue |
| Search field | about 40px tall, fully rounded, `#F0F2F5` fill, no border |
| Round icon buttons | about 40px circle, `#E4E6EB` fill |
| Notification badge | about 18px tall, red, bold 11px text |
| Sidebar width | about 280px on desktop, becoming a horizontal scroller or drawer on mobile |
| Sidebar item height | about 52px, 8px radius, 36px icon circle |
| Content max width | about 1280px, centred, with about 16px gutters |
| Gap between cards | about 16px |

### 4.3 Content components
| Element | Suggestion |
|---|---|
| Card radius / padding | 8px / 16px |
| Card shadow | very light, about `0 1px 2px` at 20% black |
| Stat card | about 16px padding, small grey label above a large (about 28px) bold number |
| Avatar | 40px for lists, larger (about 80 to 120px) for profile headers |
| Small button height | about 36px |
| Table cell padding | about 12px vertical, 8px horizontal |
| Status pill | about 13px bold text, 12px radius |

---

## 5. Typography

- **Font family:** the system UI stack (`system-ui`, `-apple-system`, Segoe UI, Roboto, Helvetica, Arial). Fast, familiar, and close to what Facebook uses.
- **Body:** 15px, line height about 1.33.
- **Small / captions:** 13px.
- **Card headings:** about 20px, bold.
- **Page headings and big numbers:** about 28px.
- **Weights:** regular for body, 500 or 600 for nav and labels, 700 for buttons and numbers.
- Sentence case everywhere; avoid ALL CAPS labels.

---

## 6. Interaction and feel

- **Hover:** a gentle background shift (to `#F2F2F2` or `#E4E6EB`) rather than a dramatic change.
- **Focus:** a visible blue border with a soft glow (about 2px, 20% blue). Never remove focus indication without a replacement.
- **Transitions:** short and subtle (about 100 to 150ms). Motion should confirm an action, not decorate.
- **Icons:** simple, filled or outlined consistently, sitting inside soft circles in the sidebar.
- **Empty states:** a short sentence saying what to do next, plus one blue button.

---

## 7. School-specific ideas

A few ways the Facebook feel could map onto school screens, all optional:

- **Dashboard:** stat cards for students, teachers, attendance today and fees collected, then a recent-activity card.
- **Student profile:** a cover-and-avatar header similar to a social profile, with tabs (Overview, Attendance, Results, Fees).
- **Notices / announcements:** a feed of white cards, newest first, each with an author avatar and timestamp. This is where the social-feed feel fits best.
- **Attendance:** large tap targets for mobile teachers, using green, amber and red pills with text labels as well as colour.
- **Results:** a clean table with a blue header accent and grade pills.
- **Fees:** paid / partial / owing pills, with a blue primary "Record payment" button.
- **Messaging:** a rounded chat bubble style, with sent messages in blue and received in `#E4E6EB`.

---

## 8. Accessibility and responsiveness (worth keeping)

- Aim for at least 4.5:1 contrast for body text. `#65676B` on white is near that line, so avoid going lighter for important text.
- Never rely on colour alone for status; pair colour with a word or icon.
- Keep touch targets at about 44px on mobile where practical.
- Collapse the sidebar below roughly 900px; stack the login layout on narrow screens.
- Consider offering a dark theme later. If you do, use deep grey surfaces (not pure black) and keep the same blue as the accent, slightly lightened.

---

## 9. Suggested naming for design tokens

If you use CSS variables, Tailwind config or a theme object, names like these tend to keep things tidy: `brand-blue`, `brand-blue-hover`, `brand-blue-tint`, `success-green`, `alert-red`, `warning-amber`, `bg-page`, `bg-card`, `bg-hover`, `bg-secondary`, `border-input`, `divider`, `text-primary`, `text-secondary`, `text-placeholder`. Centralising them in one place makes it easy to adjust the whole look later.

---

## 10. Using this guide

Feel free to ignore, tweak or extend any suggestion. The goal is simply a school system that feels as clean, familiar and approachable as Facebook: light surfaces, one confident blue, comfortable inputs and clear hierarchy. If a component library already offers a close equivalent, using it is perfectly fine.
