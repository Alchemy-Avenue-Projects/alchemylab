# Schema Alignment Notes

## Issue: Platform Connections vs Ad Accounts Mismatch

### Current State

1. **Code Usage**: The application uses `platform_connections` table to store OAuth connections
   - Location: `src/contexts/PlatformsContext.tsx`
   - OAuth callbacks store connections in `platform_connections` table
   - Product brief UI uses `PlatformConnection` type from `platform_connections`

2. **Schema Definition**: The database has both tables:
   - `platform_connections`: Stores OAuth tokens and connection metadata (organization-level)
   - `ad_accounts`: Stores ad account details with foreign key to `clients` table
   - `product_brief_accounts`: Links product briefs to ad accounts via `ad_account_id` → `ad_accounts.id`

3. **The Mismatch**:
   - `product_brief_accounts.ad_account_id` references `ad_accounts.id` (FK constraint)
   - But code stores `platform_connections.id` in `product.selectedAccounts`
   - When saving, `saveProductAccounts()` tries to insert `platform_connections.id` as `ad_account_id`
   - This will fail if `platform_connections.id` doesn't exist in `ad_accounts` table

### Files Affected

- `src/components/settings/product-brief/api/productBriefApi.ts` (line 89): Uses `platform_connections.id` as `ad_account_id`
- `src/components/settings/product-brief/utils/productBriefUtils.ts` (line 86): Maps `platform_connections.id` to selected accounts
- `src/components/settings/product-brief/AccountSelectionList.tsx`: Uses `PlatformConnection` from `platform_connections`

### Recommended Solutions

#### Option 1: Create Ad Accounts from Platform Connections (Recommended)
When a platform connection is established, automatically create corresponding `ad_accounts` records:
- Create a migration or trigger to sync `platform_connections` → `ad_accounts`
- Map `platform_connections.id` to `ad_accounts.id` (or create new records)
- Update foreign key in `product_brief_accounts` to reference the correct table

#### Option 2: Change Schema to Reference Platform Connections
- Update `product_brief_accounts` foreign key to reference `platform_connections.id` instead
- Rename `ad_account_id` to `platform_connection_id` for clarity
- Requires migration to update existing data

#### Option 3: Use Ad Accounts Table Directly
- Refactor OAuth callbacks to store in `ad_accounts` instead of `platform_connections`
- Update all code references from `platform_connections` to `ad_accounts`
- More invasive but aligns with schema

### Current Workaround

The code currently assumes `platform_connections.id` can be used as `ad_account_id`, which will fail at the database level if:
- The IDs don't match between tables
- The foreign key constraint is enforced

### Next Steps

1. **Immediate**: Add error handling in `saveProductAccounts()` to catch foreign key violations
2. **Short-term**: Decide on alignment strategy (Option 1, 2, or 3)
3. **Long-term**: Implement chosen solution with proper migrations and data migration scripts

## Edge Function State Parameter Inconsistency

### Issue
- `generateOAuthUrl()` sends encoded JSON state: `{ userId, jwt, timestamp, nonce }`
- `oauth-callback` edge function expects `state` to be platform name (line 201)
- `facebook-oauth-callback` correctly decodes JSON state

### Impact
- `oauth-callback` function will fail for platforms using it (non-Facebook)
- Facebook OAuth works because it uses dedicated callback function

### Solution
- Update `oauth-callback/index.ts` to decode JSON state like `facebook-oauth-callback` does
- Extract platform from state or pass it separately
- Ensure consistent state handling across all OAuth functions

