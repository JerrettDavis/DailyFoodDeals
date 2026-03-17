# Multi-location Deals Design

## Problem

DailyFoodDeals currently treats every deal as belonging to a single restaurant location. That works for neighborhood specials, but it breaks down for franchise and chain promotions that apply across many locations, such as app coupons or brand-wide limited-time offers. The product also needs a trustworthy way to mark some locations as non-participating, plus clearer UI treatment for sample/demo data.

## Decisions

- Extend the existing `Deal` model instead of creating a separate franchise-deal system.
- Add a parent `Brand` entity so multiple restaurant locations can belong to one chain.
- Support deal scopes for:
  - single-location deals
  - all-location/brand-wide deals
- Let admins and owners directly manage participation for specific locations.
- Let community members suggest participation changes through a review queue.
- Add record-level sample-data flags and badges, not just page-level demo notices.

## Architecture

The system keeps one core deal type and makes it more expressive. A deal can still point at a single restaurant location, or it can belong to a brand and apply to many locations. Each brand-wide deal resolves to a set of participating restaurant locations. Per-location participation overrides determine whether a specific location currently participates.

This approach keeps one search, browse, map, favorite, vote, and moderation model instead of duplicating the application around a second “franchise deal” concept. It also means location-based discovery can answer a practical question: “Which nearby restaurant actually honors this deal?”

## Data Model

### New entities

- `Brand`
  - parent chain/franchise grouping
  - owns many restaurants and many deals
- `BrandOwner`
  - links a user to a brand for management access
- `DealLocationParticipation`
  - stores trusted direct participation state for a location on a brand-wide deal
- `DealLocationParticipationReview`
  - stores community-submitted participation suggestions awaiting review

### Existing entity changes

- `Restaurant`
  - optional `brandId`
  - optional sample-data flag
- `Deal`
  - optional `brandId`
  - nullable `restaurantId`
  - scope such as `LOCATION` or `BRAND_ALL_LOCATIONS`
  - optional sample-data flag

## Public Experience

Browse results should show whether a deal is single-location or all-location. Brand-wide deals should surface a compact summary such as the number of participating locations and, when possible, the nearest valid location. Deal cards, detail pages, and map popovers should also show a `Sample data` badge when applicable.

The detail page should keep the current location module but expand it for all-location deals. Instead of a single restaurant card, the page should show:

- brand summary
- nearest participating location
- other participating locations
- optional muted non-participating locations when helpful

Maps should render one marker per participating location for brand-wide deals.

## Moderation and Trust

Admins and owners can directly mark locations as participating or non-participating. Community users can submit a suggested participation change, but that suggestion should create a review record instead of changing public data immediately.

Approved review items should write through to the trusted participation table. Rejected items should remain visible only in moderation history.

## Sample Data

Sample/demo data should be visible in two ways:

- page-level notices when sample data is present in the current experience
- record-level `Sample data` badges on cards, detail headers, map popovers, and relevant admin views

This ensures users can distinguish real community data from seeded or fallback demo data.

## Rollout

1. Add schema support for brands, scoped deals, participation overrides, reviews, and sample-data flags.
2. Update seed and fallback data with realistic chain-wide examples and at least one non-participating location.
3. Build a shared public resolver that returns participating locations and nearest-location metadata.
4. Update browse, card, detail, and map UI.
5. Add admin and owner management flows plus community participation suggestions.
6. Extend E2E coverage for chain-wide deals, moderation, and sample-data labeling.
