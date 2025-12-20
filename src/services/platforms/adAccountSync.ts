/**
 * adAccountSync.ts
 * 
 * Service to sync platform_connections with ad_accounts table.
 * This bridges the gap between organization-level platform connections
 * and client-level ad accounts.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Get or create an ad_account record for a platform_connection
 * @param platformConnectionId - The ID of the platform_connection
 * @param organizationId - The organization ID
 * @param clientId - Optional client ID. If not provided, uses the first client for the organization
 * @returns The ad_account ID
 */
export async function getOrCreateAdAccount(
  platformConnectionId: string,
  organizationId: string,
  clientId?: string
): Promise<string> {
  try {
    // First, try to find an existing ad_account linked to this platform_connection
    // We'll use a mapping approach: check if there's an ad_account with matching platform and organization
    const { data: platformConnection, error: pcError } = await supabase
      .from('platform_connections')
      .select('platform, account_id, account_name')
      .eq('id', platformConnectionId)
      .eq('organization_id', organizationId)
      .single();

    if (pcError || !platformConnection) {
      throw new Error(`Platform connection not found: ${pcError?.message || 'Unknown error'}`);
    }

    // Get or create a client for this organization
    let targetClientId = clientId;
    
    if (!targetClientId) {
      // Get the first client for this organization, or create a default one
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', organizationId)
        .limit(1);

      if (clientsError) {
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }

      if (!clients || clients.length === 0) {
        // Create a default client for this organization
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', organizationId)
          .single();

        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            organization_id: organizationId,
            name: `${orgData?.name || 'Default'} Client`
          })
          .select('id')
          .single();

        if (createError || !newClient) {
          throw new Error(`Failed to create default client: ${createError?.message || 'Unknown error'}`);
        }

        targetClientId = newClient.id;
      } else {
        targetClientId = clients[0].id;
      }
    }

    // Check if an ad_account already exists for this platform_connection
    // We'll match by platform, client_id, and account_id_on_platform (if available)
    const accountIdOnPlatform = platformConnection.account_id || platformConnectionId;
    
    const { data: existingAccount, error: accountError } = await supabase
      .from('ad_accounts')
      .select('id')
      .eq('client_id', targetClientId)
      .eq('platform', platformConnection.platform)
      .eq('account_id_on_platform', accountIdOnPlatform)
      .maybeSingle();

    if (accountError) {
      throw new Error(`Failed to check existing ad_account: ${accountError.message}`);
    }

    if (existingAccount) {
      return existingAccount.id;
    }

    // Create a new ad_account
    const { data: newAccount, error: createError } = await supabase
      .from('ad_accounts')
      .insert({
        client_id: targetClientId,
        platform: platformConnection.platform as any,
        account_name: platformConnection.account_name || `${platformConnection.platform} Account`,
        account_id_on_platform: accountIdOnPlatform,
        connected_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError || !newAccount) {
      throw new Error(`Failed to create ad_account: ${createError?.message || 'Unknown error'}`);
    }

    return newAccount.id;
  } catch (error) {
    console.error('Error in getOrCreateAdAccount:', error);
    throw error;
  }
}

/**
 * Get the ad_account_id for a platform_connection_id
 * @param platformConnectionId - The ID of the platform_connection
 * @param organizationId - The organization ID
 * @returns The ad_account ID, or null if not found
 */
export async function getAdAccountIdFromPlatformConnection(
  platformConnectionId: string,
  organizationId: string
): Promise<string | null> {
  try {
    const { data: platformConnection, error: pcError } = await supabase
      .from('platform_connections')
      .select('platform, account_id, organization_id')
      .eq('id', platformConnectionId)
      .eq('organization_id', organizationId)
      .single();

    if (pcError || !platformConnection) {
      return null;
    }

    // Get organization's clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', organizationId);

    if (clientsError || !clients || clients.length === 0) {
      return null;
    }

    const accountIdOnPlatform = platformConnection.account_id || platformConnectionId;

    // Search for matching ad_account across all clients in the organization
    for (const client of clients) {
      const { data: adAccount, error: accountError } = await supabase
        .from('ad_accounts')
        .select('id')
        .eq('client_id', client.id)
        .eq('platform', platformConnection.platform)
        .eq('account_id_on_platform', accountIdOnPlatform)
        .maybeSingle();

      if (!accountError && adAccount) {
        return adAccount.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in getAdAccountIdFromPlatformConnection:', error);
    return null;
  }
}

/**
 * Get the platform_connection_id for an ad_account_id
 * This is used when loading product briefs to map ad_account_id back to platform_connection.id
 * @param adAccountId - The ID of the ad_account
 * @returns The platform_connection ID, or null if not found
 */
export async function getPlatformConnectionIdFromAdAccount(
  adAccountId: string
): Promise<string | null> {
  try {
    const { data: adAccount, error: accountError } = await supabase
      .from('ad_accounts')
      .select('platform, account_id_on_platform, client_id, clients!inner(organization_id)')
      .eq('id', adAccountId)
      .single();

    if (accountError || !adAccount) {
      return null;
    }

    const organizationId = (adAccount.clients as any)?.organization_id;
    if (!organizationId) {
      return null;
    }

    // Try to find platform_connection by matching platform and account_id
    const { data: platformConnection, error: pcError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('platform', adAccount.platform)
      .or(`account_id.eq.${adAccount.account_id_on_platform},id.eq.${adAccount.account_id_on_platform}`)
      .maybeSingle();

    if (pcError || !platformConnection) {
      return null;
    }

    return platformConnection.id;
  } catch (error) {
    console.error('Error in getPlatformConnectionIdFromAdAccount:', error);
    return null;
  }
}

/**
 * Sync all platform_connections for an organization to ad_accounts
 * This is useful for backfilling existing connections
 * @param organizationId - The organization ID
 */
export async function syncOrganizationPlatformConnections(organizationId: string): Promise<void> {
  try {
    const { data: platformConnections, error: pcError } = await supabase
      .from('platform_connections')
      .select('id, platform, account_id, account_name, organization_id')
      .eq('organization_id', organizationId)
      .eq('connected', true);

    if (pcError) {
      throw new Error(`Failed to fetch platform connections: ${pcError.message}`);
    }

    if (!platformConnections || platformConnections.length === 0) {
      return;
    }

    // Sync each platform connection
    for (const connection of platformConnections) {
      try {
        await getOrCreateAdAccount(connection.id, organizationId);
      } catch (error) {
        console.error(`Failed to sync platform connection ${connection.id}:`, error);
        // Continue with other connections
      }
    }
  } catch (error) {
    console.error('Error in syncOrganizationPlatformConnections:', error);
    throw error;
  }
}
