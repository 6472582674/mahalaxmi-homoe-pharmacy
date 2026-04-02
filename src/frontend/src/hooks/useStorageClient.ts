import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

let storageClientInstance: StorageClient | null = null;
let storageClientPromise: Promise<StorageClient> | null = null;

async function getOrCreateStorageClient(): Promise<StorageClient> {
  if (storageClientInstance) return storageClientInstance;
  if (storageClientPromise) return storageClientPromise;

  storageClientPromise = loadConfig().then((config) => {
    const agent = new HttpAgent({
      host: config.backend_host,
    });
    const client = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    storageClientInstance = client;
    return client;
  });

  return storageClientPromise;
}

export function useStorageClient() {
  const [client, setClient] = useState<StorageClient | null>(
    storageClientInstance,
  );

  useEffect(() => {
    if (storageClientInstance) {
      setClient(storageClientInstance);
      return;
    }
    getOrCreateStorageClient()
      .then(setClient)
      .catch((err) => {
        console.error("Failed to initialize StorageClient", err);
      });
  }, []);

  return client;
}

export { getOrCreateStorageClient };
