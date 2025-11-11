import { lookup } from "dns/promises";

// Allowlist of approved domains for resource metadata fetching
// Add new trusted domains here as needed
const ALLOWED_DOMAINS = [
  // Video platforms
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
  
  // Code/Interactive platforms
  "codepen.io",
  "www.codepen.io",
  "codesandbox.io",
  "www.codesandbox.io",
  "replit.com",
  "www.replit.com",
  "jsfiddle.net",
  "www.jsfiddle.net",
  
  // Documentation/Learning platforms
  "github.com",
  "www.github.com",
  "gitlab.com",
  "www.gitlab.com",
  "stackoverflow.com",
  "www.stackoverflow.com",
  "developer.mozilla.org",
  "docs.python.org",
  "nodejs.org",
  "www.nodejs.org",
  "reactjs.org",
  "www.reactjs.org",
  "w3schools.com",
  "www.w3schools.com",
  "freecodecamp.org",
  "www.freecodecamp.org",
  "medium.com",
  "www.medium.com",
  "dev.to",
  "www.dev.to",
  "geeksforgeeks.org",
  "www.geeksforgeeks.org",
  "tutorialspoint.com",
  "www.tutorialspoint.com",
  "udemy.com",
  "www.udemy.com",
  "coursera.org",
  "www.coursera.org",
  "edx.org",
  "www.edx.org",
  "khanacademy.org",
  "www.khanacademy.org",
];

/**
 * Check if a URL's domain is in the approved allowlist
 */
export function isAllowedResourceUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check exact match or subdomain match
    return ALLOWED_DOMAINS.some(allowedDomain => {
      return hostname === allowedDomain || hostname.endsWith(`.${allowedDomain}`);
    });
  } catch (error) {
    return false;
  }
}

/**
 * Check if an IP address is in a private/internal range
 */
export function isPrivateAddress(ip: string): boolean {
  // IPv4 checks
  if (ip.includes(".")) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return false;
    
    // Loopback: 127.0.0.0/8
    if (parts[0] === 127) return true;
    
    // Private networks (RFC1918)
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    
    // Link-local (AWS metadata): 169.254.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true;
    
    // Carrier-grade NAT: 100.64.0.0/10
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    
    // Zero address
    if (parts.every(p => p === 0)) return true;
    
    return false;
  }
  
  // IPv6 checks
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    
    // Loopback: ::1
    if (lower === "::1" || lower === "0000:0000:0000:0000:0000:0000:0000:0001") return true;
    
    // Link-local: fe80::/10
    if (lower.startsWith("fe80:")) return true;
    
    // Unique local: fc00::/7
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    
    // IPv4-mapped: ::ffff:127.0.0.1
    if (lower.includes("::ffff:127.")) return true;
    
    return false;
  }
  
  return false;
}

/**
 * Resolve hostname to IPs and validate none are private
 * Returns true if hostname resolves to only public IPs
 */
export async function resolveAndValidateHost(hostname: string): Promise<boolean> {
  try {
    // Resolve both IPv4 and IPv6
    const { address: ipv4 } = await lookup(hostname, { family: 4 }).catch(() => ({ address: null }));
    const { address: ipv6 } = await lookup(hostname, { family: 6 }).catch(() => ({ address: null }));
    
    const addresses = [ipv4, ipv6].filter(Boolean) as string[];
    
    if (addresses.length === 0) {
      return false; // Unable to resolve
    }
    
    // All resolved IPs must be public
    return addresses.every(ip => !isPrivateAddress(ip));
  } catch (error) {
    console.error(`DNS resolution failed for ${hostname}:`, error);
    return false;
  }
}

/**
 * Validate that a URL is safe to fetch (allowlist + IP validation)
 */
export async function validateResourceUrl(url: string): Promise<{ valid: boolean; reason?: string }> {
  // Check protocol
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return { valid: false, reason: "Invalid URL format" };
  }
  
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return { valid: false, reason: "Only HTTP and HTTPS protocols are allowed" };
  }
  
  // Check allowlist
  if (!isAllowedResourceUrl(url)) {
    return { valid: false, reason: "Domain not in approved allowlist" };
  }
  
  // Validate resolved IPs are public
  const hostname = parsedUrl.hostname;
  const isPublic = await resolveAndValidateHost(hostname);
  
  if (!isPublic) {
    return { valid: false, reason: "Domain resolves to private/internal address" };
  }
  
  return { valid: true };
}
