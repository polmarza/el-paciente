import { Portal } from "@portalsdk/core";

const apiKey = import.meta.env.VITE_PORTAL_API_KEY as string | undefined;

/**
 * Cliente único de Portal para toda la app. Sin token: todo el mundo entra anónimo,
 * que es una decisión de producto — el anonimato es lo que alimenta la dinámica
 * vándalo/cuidador. Portal mantiene una identidad anónima estable entre recargas.
 */
export const portalClient = apiKey ? new Portal({ apiKey }) : null;
